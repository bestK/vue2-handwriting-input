<template>
    <div class="handwriting-input">
        <div class="select-bar" ref="selectBar">
            <div
                v-for="(option, index) in textOptions"
                :key="index"
                :class="{ selected: selectedIndex === index }"
                @click="selectText(option, index)"
            >
                {{ option }}
            </div>
        </div>
        <canvas
            ref="canvas"
            class="ink-canvas"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
        ></canvas>
        <div class="controls" v-if="showControls">
            <button @click="clearCanvas" class="clear-btn">清除</button>
            <button @click="getSelectedText" class="get-text-btn">获取文字</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HandwritingInput',
    props: {
        width: {
            type: [String, Number],
            default: '100%',
        },
        height: {
            type: [String, Number],
            default: 300,
        },
        showControls: {
            type: Boolean,
            default: true,
        },
        language: {
            type: String,
            default: 'zh_CN',
        },
        apiUrl: {
            type: String,
            default: 'https://inputtools.google.com/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8',
        },
        showGrid: {
            type: Boolean,
            default: true,
        },
        gridColor: {
            type: String,
            default: '#e0e0e0',
        },
    },
    data() {
        return {
            text: '',
            inkColor: '#000',
            inkPoints: [],
            inkMove: false,
            textOptions: [],
            selectedIndex: 0,
            ctx: null,
        };
    },
    mounted() {
        this.initCanvas();
        this.setupColorScheme();
        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
    },
    watch: {
        showGrid() {
            this.redrawCanvas();
        },
        gridColor() {
            this.redrawCanvas();
        },
    },
    methods: {
        initCanvas() {
            const canvas = this.$refs.canvas;
            this.ctx = canvas.getContext('2d');
            this.setCanvasSize();
        },
        setCanvasSize() {
            const canvas = this.$refs.canvas;
            canvas.width = canvas.parentElement.offsetWidth * 2;
            canvas.height = (typeof this.height === 'number' ? this.height : 300) * 2;
            this.drawGrid();
        },
        setupColorScheme() {
            const mqList = window.matchMedia('(prefers-color-scheme: dark)');
            this.inkColor = mqList.matches ? '#FFF' : '#000';
            mqList.addEventListener('change', event => {
                this.inkColor = event.matches ? '#FFF' : '#000';
            });
        },
        handleResize() {
            this.setCanvasSize();
            this.clearCanvas();
        },
        drawGrid() {
            if (!this.showGrid || !this.ctx) return;

            const canvas = this.$refs.canvas;
            const width = canvas.width;
            const height = canvas.height;

            // 保存当前绘图状态
            this.ctx.save();

            // 计算网格大小 - 田字格通常是正方形，留一些边距
            const margin = 40;
            const availableWidth = width - margin * 2;
            const availableHeight = height - margin * 2;
            const gridSize = Math.min(availableWidth, availableHeight);

            // 计算居中偏移
            const offsetX = (width - gridSize) / 2;
            const offsetY = (height - gridSize) / 2;

            // 绘制外边框（较粗的线条）
            this.ctx.strokeStyle = this.gridColor;
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = 0.8;
            this.ctx.setLineDash([]);
            this.ctx.beginPath();
            this.ctx.rect(offsetX, offsetY, gridSize, gridSize);
            this.ctx.stroke();

            // 绘制田字格的十字线（中等粗细）
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.7;

            // 垂直中线
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX + gridSize / 2, offsetY);
            this.ctx.lineTo(offsetX + gridSize / 2, offsetY + gridSize);
            this.ctx.stroke();

            // 水平中线
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, offsetY + gridSize / 2);
            this.ctx.lineTo(offsetX + gridSize, offsetY + gridSize / 2);
            this.ctx.stroke();

            // 绘制对角线（虚线，较细）
            this.ctx.setLineDash([8, 4]);
            this.ctx.lineWidth = 1.5;
            this.ctx.globalAlpha = 0.5;

            // 左上到右下的对角线
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, offsetY);
            this.ctx.lineTo(offsetX + gridSize, offsetY + gridSize);
            this.ctx.stroke();

            // 右上到左下的对角线
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX + gridSize, offsetY);
            this.ctx.lineTo(offsetX, offsetY + gridSize);
            this.ctx.stroke();

            // 恢复绘图状态
            this.ctx.restore();
        },
        onPointerDown(e) {
            e.preventDefault();
            this.inkPoints.push([[], []]);
            this.inkMove = true;
            this.ctx.beginPath();
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 2;
            this.ctx.strokeStyle = this.ctx.shadowColor = this.inkColor;
            this.ctx.moveTo(e.offsetX * 2, e.offsetY * 2);
        },
        onPointerMove(e) {
            if (!this.inkMove) return;
            const currentStroke = this.inkPoints[this.inkPoints.length - 1];
            currentStroke[0].push(e.offsetX);
            currentStroke[1].push(e.offsetY);
            this.ctx.lineTo(e.offsetX * 2, e.offsetY * 2);
            this.ctx.stroke();
        },
        onPointerUp() {
            this.inkMove = false;
            this.recognizeHandwriting();
        },
        async recognizeHandwriting() {
            if (this.inkPoints.length === 0) return;

            const canvas = this.$refs.canvas;
            const data = JSON.stringify({
                options: 'enable_pre_space',
                requests: [
                    {
                        writing_guide: {
                            writing_area_width: canvas.offsetWidth,
                            writing_area_height: canvas.offsetHeight,
                        },
                        ink: this.inkPoints,
                        language: this.language,
                    },
                ],
            });

            try {
                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    body: data,
                    headers: { 'content-type': 'application/json' },
                });
                const result = await response.json();

                if (result && result[1] && result[1][0] && result[1][0][1]) {
                    this.textOptions = result[1][0][1];
                    this.selectedIndex = 0;
                    this.text = this.textOptions[0] || '';
                    this.$emit('text-recognized', this.textOptions);
                    this.$emit('text-selected', this.text);
                }
            } catch (error) {
                console.error('手写识别失败:', error);
                this.$emit('error', error);
            }
        },
        selectText(text, index) {
            this.text = text;
            this.selectedIndex = index;
            this.$emit('text-selected', text);
        },
        redrawCanvas() {
            if (!this.ctx) return;

            const canvas = this.$refs.canvas;
            // 清除整个canvas
            this.ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 重新绘制网格
            this.drawGrid();

            // 重新绘制用户的笔画
            this.redrawStrokes();
        },
        redrawStrokes() {
            if (!this.ctx || this.inkPoints.length === 0) return;

            this.ctx.save();
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 2;
            this.ctx.strokeStyle = this.ctx.shadowColor = this.inkColor;

            for (let i = 0; i < this.inkPoints.length; i++) {
                const stroke = this.inkPoints[i];
                if (stroke[0].length > 0) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(stroke[0][0] * 2, stroke[1][0] * 2);
                    for (let j = 1; j < stroke[0].length; j++) {
                        this.ctx.lineTo(stroke[0][j] * 2, stroke[1][j] * 2);
                    }
                    this.ctx.stroke();
                }
            }

            this.ctx.restore();
        },
        clearCanvas() {
            const canvas = this.$refs.canvas;
            this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.drawGrid();
            this.inkPoints = [];
            this.textOptions = [];
            this.text = '';
            this.selectedIndex = 0;
            this.$emit('cleared');
        },
        getSelectedText() {
            this.$emit('get-text', this.text);
            return this.text;
        },
    },
};
</script>

<style scoped>
.handwriting-input {
    display: flex;
    flex-direction: column;
    background-color: #f0f0f0;
    font-family: sans-serif;
}

.select-bar {
    display: flex;
    gap: 8px;
    padding: 8px;
    background-color: #fff;
    border-bottom: 1px solid #ccc;
    overflow-x: auto;
    min-height: 40px;
}

.select-bar div {
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    background-color: #fafafa;
    white-space: nowrap;
    user-select: none;
}

.select-bar div.selected {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
}

.select-bar div:hover {
    background-color: #e9ecef;
}

.select-bar div.selected:hover {
    background-color: #0056b3;
}

.ink-canvas {
    display: block;
    width: 100%;
    background-color: white;
    touch-action: none;
    cursor: crosshair;
}

.controls {
    display: flex;
    gap: 8px;
    padding: 8px;
    background-color: #fff;
    border-top: 1px solid #ccc;
}

.clear-btn,
.get-text-btn {
    padding: 6px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #fff;
    cursor: pointer;
    font-size: 14px;
}

.clear-btn:hover,
.get-text-btn:hover {
    background-color: #f8f9fa;
}

.clear-btn {
    color: #dc3545;
    border-color: #dc3545;
}

.clear-btn:hover {
    background-color: #f5c6cb;
}

.get-text-btn {
    color: #007bff;
    border-color: #007bff;
}

.get-text-btn:hover {
    background-color: #d1ecf1;
}
</style>

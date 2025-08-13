<template>
    <div class="app">
        <h1>Vue2 手写输入组件示例</h1>

        <!-- 基础用法（带田字格） -->
        <div class="example-section">
            <h2>基础用法（带田字格）</h2>
            <HandwritingInput
                @text-selected="onTextSelected"
                @text-recognized="onTextRecognized"
                @error="onError"
                @get-text="onGetText"
            />
            <p>选中的文字: {{ selectedText }}</p>
        </div>

        <!-- 自定义尺寸 -->
        <div class="example-section">
            <h2>自定义尺寸</h2>
            <HandwritingInput
                ref="customCanvas"
                :height="200"
                :show-controls="false"
                @text-selected="onTextSelected2"
                @get-text="onGetText"
            />
            <p>选中的文字: {{ selectedText2 }}</p>
            <button @click="clearCustomCanvas">清除画布</button>
        </div>

        <!-- 田字格开关示例 -->
        <div class="example-section">
            <h2>田字格开关控制</h2>
            <div class="controls">
                <label> <input type="checkbox" v-model="showGrid" /> 显示田字格 </label>
                <label style="margin-left: 20px">
                    网格颜色:
                    <input type="color" v-model="gridColor" />
                </label>
            </div>
            <HandwritingInput
                :showGrid="showGrid"
                :gridColor="gridColor"
                :height="300"
                @text-selected="onTextSelected3"
                @get-text="onGetText"
            />
            <p>选中的文字: {{ selectedText3 }}</p>
        </div>

        <!-- 获取所有识别结果 -->
        <div class="example-section">
            <h2>所有识别结果</h2>
            <div v-if="allOptions.length > 0">
                <p>识别到的所有选项:</p>
                <ul>
                    <li v-for="(option, index) in allOptions" :key="index">{{ option }}</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import HandwritingInput from './components/HandwritingInput.vue';

export default {
    name: 'App',
    components: {
        HandwritingInput,
    },
    data() {
        return {
            selectedText: '',
            selectedText2: '',
            selectedText3: '',
            allOptions: [],
            showGrid: true,
            gridColor: '#e0e0e0',
        };
    },
    methods: {
        onTextSelected(text) {
            this.selectedText = text;
            console.log('选中文字:', text);
        },
        onTextSelected2(text) {
            this.selectedText2 = text;
        },
        onTextSelected3(text) {
            this.selectedText3 = text;
        },
        onGetText(text) {
            console.log('获取文字:', text);
            if (text) {
                // 尝试复制到剪贴板
                if (navigator.clipboard) {
                    navigator.clipboard
                        .writeText(text)
                        .then(() => {
                            alert(`文字已复制到剪贴板: ${text}`);
                        })
                        .catch(() => {
                            alert(`获取的文字: ${text}`);
                        });
                } else {
                    alert(`获取的文字: ${text}`);
                }
            } else {
                alert('没有识别到文字，请先手写一些内容');
            }
        },
        onTextRecognized(options) {
            this.allOptions = options;
            console.log('识别结果:', options);
        },
        onError(error) {
            console.error('识别错误:', error);
            alert('手写识别失败，请重试');
        },
        clearCustomCanvas() {
            this.$refs.customCanvas?.clearCanvas();
        },
    },
};
</script>

<style>
.app {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.example-section {
    margin-bottom: 40px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
}

.example-section h2 {
    margin-top: 0;
    color: #333;
}

button {
    padding: 8px 16px;
    margin: 8px 0;
    border: 1px solid #007bff;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}

.controls {
    margin-bottom: 15px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #e9ecef;
}

.controls label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    color: #495057;
}

.controls input[type='checkbox'] {
    margin: 0;
}

.controls input[type='color'] {
    border: none;
    width: 30px;
    height: 25px;
    border-radius: 3px;
    cursor: pointer;
}
</style>

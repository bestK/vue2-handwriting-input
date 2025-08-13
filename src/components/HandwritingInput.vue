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
  name: "HandwritingInput",
  props: {
    width: {
      type: [String, Number],
      default: "100%",
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
      default: "zh_CN",
    },
    apiUrl: {
      type: String,
      default:
        "https://inputtools.google.com/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8",
    },
  },
  data() {
    return {
      text: "",
      inkColor: "#000",
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
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.canvas;
      this.ctx = canvas.getContext("2d");
      this.setCanvasSize();
    },
    setCanvasSize() {
      const canvas = this.$refs.canvas;
      canvas.width = canvas.parentElement.offsetWidth * 2;
      canvas.height = (typeof this.height === "number" ? this.height : 300) * 2;
    },
    setupColorScheme() {
      const mqList = window.matchMedia("(prefers-color-scheme: dark)");
      this.inkColor = mqList.matches ? "#FFF" : "#000";
      mqList.addEventListener("change", (event) => {
        this.inkColor = event.matches ? "#FFF" : "#000";
      });
    },
    handleResize() {
      this.setCanvasSize();
      this.clearCanvas();
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
        options: "enable_pre_space",
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
          method: "POST",
          body: data,
          headers: { "content-type": "application/json" },
        });
        const result = await response.json();

        if (result && result[1] && result[1][0] && result[1][0][1]) {
          this.textOptions = result[1][0][1];
          this.selectedIndex = 0;
          this.text = this.textOptions[0] || "";
          this.$emit("text-recognized", this.textOptions);
          this.$emit("text-selected", this.text);
        }
      } catch (error) {
        console.error("手写识别失败:", error);
        this.$emit("error", error);
      }
    },
    selectText(text, index) {
      this.text = text;
      this.selectedIndex = index;
      this.$emit("text-selected", text);
    },
    clearCanvas() {
      const canvas = this.$refs.canvas;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.inkPoints = [];
      this.textOptions = [];
      this.text = "";
      this.selectedIndex = 0;
      this.$emit("cleared");
    },
    getSelectedText() {
      this.$emit("get-text", this.text);
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

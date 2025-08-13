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
      :style="{ height: canvasHeight }"
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
      default: '100%'
    },
    height: {
      type: [String, Number],
      default: 300
    },
    showControls: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'zh_CN'
    },
    apiUrl: {
      type: String,
      default: 'https://inputtools.linkof.link/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8'
    },
    strokeWidth: {
      type: Number,
      default: 3
    },
    strokeColor: {
      type: String,
      default: 'auto' // 'auto' 表示自动根据主题切换
    }
  },
  data() {
    return {
      text: '',
      inkColor: '#000',
      inkPoints: [],
      inkMove: false,
      textOptions: [],
      selectedIndex: 0,
      ctx: null
    }
  },
  computed: {
    canvasHeight() {
      return typeof this.height === 'number' ? `${this.height}px` : this.height
    }
  },
  mounted() {
    this.initCanvas()
    this.setupColorScheme()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  watch: {
    strokeColor: {
      handler(newColor) {
        if (newColor !== 'auto') {
          this.inkColor = newColor
        }
      },
      immediate: true
    }
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.canvas
      this.ctx = canvas.getContext('2d')
      this.setCanvasSize()
    },
    setCanvasSize() {
      const canvas = this.$refs.canvas
      canvas.width = canvas.parentElement.offsetWidth * 2
      canvas.height = (typeof this.height === 'number' ? this.height : 300) * 2
    },
    setupColorScheme() {
      if (this.strokeColor === 'auto') {
        const mqList = window.matchMedia('(prefers-color-scheme: dark)')
        this.inkColor = mqList.matches ? '#FFF' : '#000'
        mqList.addEventListener('change', (event) => {
          if (this.strokeColor === 'auto') {
            this.inkColor = event.matches ? '#FFF' : '#000'
          }
        })
      }
    },
    handleResize() {
      this.setCanvasSize()
      this.clearCanvas()
    },
    onPointerDown(e) {
      e.preventDefault()
      this.inkPoints.push([[], []])
      this.inkMove = true
      this.ctx.beginPath()
      this.ctx.lineWidth = this.strokeWidth
      this.ctx.shadowBlur = 2
      this.ctx.strokeStyle = this.ctx.shadowColor = this.inkColor
      this.ctx.moveTo(e.offsetX * 2, e.offsetY * 2)
    },
    onPointerMove(e) {
      if (!this.inkMove) return
      const currentStroke = this.inkPoints[this.inkPoints.length - 1]
      currentStroke[0].push(e.offsetX)
      currentStroke[1].push(e.offsetY)
      this.ctx.lineTo(e.offsetX * 2, e.offsetY * 2)
      this.ctx.stroke()
    },
    onPointerUp() {
      this.inkMove = false
      this.recognizeHandwriting()
    },
    async recognizeHandwriting() {
      if (this.inkPoints.length === 0) return

      const canvas = this.$refs.canvas
      const data = JSON.stringify({
        options: 'enable_pre_space',
        requests: [
          {
            writing_guide: {
              writing_area_width: canvas.offsetWidth,
              writing_area_height: canvas.offsetHeight
            },
            ink: this.inkPoints,
            language: this.language
          }
        ]
      })

      try {
        this.$emit('recognizing', true)
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          body: data,
          headers: { 'content-type': 'application/json' }
        })
        const result = await response.json()
        
        if (result && result[1] && result[1][0] && result[1][0][1]) {
          this.textOptions = result[1][0][1]
          this.selectedIndex = 0
          this.text = this.textOptions[0] || ''
          this.$emit('text-recognized', this.textOptions)
          this.$emit('text-selected', this.text)
        }
      } catch (error) {
        console.error('手写识别失败:', error)
        this.$emit('error', error)
      } finally {
        this.$emit('recognizing', false)
      }
    },
    selectText(text, index) {
      this.text = text
      this.selectedIndex = index
      this.$emit('text-selected', text)
    },
    clearCanvas() {
      const canvas = this.$refs.canvas
      this.ctx.clearRect(0, 0, canvas.width, canvas.height)
      this.inkPoints = []
      this.textOptions = []
      this.text = ''
      this.selectedIndex = 0
      this.$emit('cleared')
    },
    getSelectedText() {
      this.$emit('get-text', this.text)
      return this.text
    },
    // 公开方法供外部调用
    getText() {
      return this.text
    },
    getOptions() {
      return this.textOptions
    }
  }
}
</script>

<style scoped>
.handwriting-input {
  display: flex;
  flex-direction: column;
  background-color: #f0f0f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.select-bar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  overflow-x: auto;
  min-height: 48px;
  align-items: center;
}

.select-bar::-webkit-scrollbar {
  height: 4px;
}

.select-bar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.select-bar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.select-bar div {
  padding: 6px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  cursor: pointer;
  background-color: #fafafa;
  white-space: nowrap;
  user-select: none;
  transition: all 0.2s ease;
  font-size: 14px;
  min-width: 32px;
  text-align: center;
}

.select-bar div.selected {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.3);
}

.select-bar div:hover:not(.selected) {
  background-color: #f0f0f0;
  border-color: #b0b0b0;
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
  padding: 12px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
}

.clear-btn,
.get-text-btn {
  padding: 8px 16px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background-color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.clear-btn:hover,
.get-text-btn:hover {
  background-color: #f8f9fa;
}

.clear-btn {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.clear-btn:hover {
  background-color: #fff2f0;
}

.get-text-btn {
  color: #1890ff;
  border-color: #1890ff;
}

.get-text-btn:hover {
  background-color: #f0f8ff;
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .handwriting-input {
    background-color: #1f1f1f;
  }
  
  .select-bar,
  .controls {
    background-color: #2d2d2d;
    border-color: #404040;
  }
  
  .select-bar div {
    background-color: #3d3d3d;
    border-color: #505050;
    color: #fff;
  }
  
  .select-bar div:hover:not(.selected) {
    background-color: #4d4d4d;
  }
  
  .ink-canvas {
    background-color: #2d2d2d;
  }
  
  .clear-btn,
  .get-text-btn {
    background-color: #3d3d3d;
    border-color: #505050;
    color: #fff;
  }
}
</style>
<template>
  <div class="app">
    <h1>Vue2 手写输入组件示例</h1>
    
    <!-- 基础用法 -->
    <div class="example-section">
      <h2>基础用法</h2>
      <HandwritingInput
        @text-selected="onTextSelected"
        @text-recognized="onTextRecognized"
        @error="onError"
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
      />
      <p>选中的文字: {{ selectedText2 }}</p>
      <button @click="clearCustomCanvas">清除画布</button>
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
import HandwritingInput from './components/HandwritingInput.vue'

export default {
  name: 'App',
  components: {
    HandwritingInput
  },
  data() {
    return {
      selectedText: '',
      selectedText2: '',
      allOptions: []
    }
  },
  methods: {
    onTextSelected(text) {
      this.selectedText = text
      console.log('选中文字:', text)
    },
    onTextSelected2(text) {
      this.selectedText2 = text
    },
    onTextRecognized(options) {
      this.allOptions = options
      console.log('识别结果:', options)
    },
    onError(error) {
      console.error('识别错误:', error)
      alert('手写识别失败，请重试')
    },
    clearCustomCanvas() {
      // 可以通过ref调用组件方法
      this.$refs.customCanvas?.clearCanvas()
    }
  }
}
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
</style>
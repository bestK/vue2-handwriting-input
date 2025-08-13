# Vue2 手写输入组件

一个基于Vue2的手写输入识别组件，支持中文手写识别。

## 特性

- 🖊️ 支持手写输入识别
- 🎯 多候选词选择
- 🎨 自定义样式配置
- 📱 移动端友好
- 🌙 暗色主题支持
- 🔧 TypeScript 类型支持

## 安装

```bash
npm install vue2-handwriting-input
```

## 使用方法

### 全局注册

```javascript
import Vue from 'vue'
import HandwritingInput from 'vue2-handwriting-input'

Vue.use(HandwritingInput)
```

### 局部注册

```javascript
import { HandwritingInput } from 'vue2-handwriting-input'

export default {
  components: {
    HandwritingInput
  }
}
```

### 基础用法

```vue
<template>
  <div>
    <HandwritingInput
      @text-selected="onTextSelected"
      @text-recognized="onTextRecognized"
    />
  </div>
</template>

<script>
export default {
  methods: {
    onTextSelected(text) {
      console.log('选中的文字:', text)
    },
    onTextRecognized(options) {
      console.log('识别结果:', options)
    }
  }
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| width | 画布宽度 | String/Number | '100%' |
| height | 画布高度 | String/Number | 300 |
| showControls | 是否显示控制按钮 | Boolean | true |
| language | 识别语言 | String | 'zh_CN' |
| apiUrl | 识别API地址 | String | 默认API |
| strokeWidth | 笔画宽度 | Number | 3 |
| strokeColor | 笔画颜色 | String | 'auto' |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| text-selected | 用户选择文字时触发 | (text: string) |
| text-recognized | 识别完成时触发 | (options: string[]) |
| error | 识别失败时触发 | (error: Error) |
| cleared | 清除画布时触发 | - |
| recognizing | 识别状态变化 | (isRecognizing: boolean) |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| clearCanvas | 清除画布 | - | - |
| getText | 获取当前选中文字 | - | string |
| getOptions | 获取所有识别选项 | - | string[] |

## 示例

### 自定义样式

```vue
<template>
  <HandwritingInput
    :height="400"
    :stroke-width="5"
    stroke-color="#ff6b6b"
    @text-selected="handleTextSelected"
  />
</template>
```

### 禁用控制按钮

```vue
<template>
  <HandwritingInput
    :show-controls="false"
    @text-selected="handleTextSelected"
  />
</template>
```

### 通过ref调用方法

```vue
<template>
  <div>
    <HandwritingInput ref="handwriting" />
    <button @click="clearInput">清除</button>
    <button @click="getCurrentText">获取文字</button>
  </div>
</template>

<script>
export default {
  methods: {
    clearInput() {
      this.$refs.handwriting.clearCanvas()
    },
    getCurrentText() {
      const text = this.$refs.handwriting.getText()
      console.log('当前文字:', text)
    }
  }
}
</script>
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run serve

# 构建库
npm run build:lib

# 发布到私服
npm publish
```

## 许可证

MIT
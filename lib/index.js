import HandwritingInput from './HandwritingInput.vue'

// 定义 install 函数，接收 Vue 作为参数
const install = function (Vue) {
  if (install.installed) return
  install.installed = true
  Vue.component('HandwritingInput', HandwritingInput)
}

// 判断是否是直接引入文件，如果是，就不用调用 Vue.use()
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

// 导出的对象必须具有 install，才能被 Vue.use() 方法安装
export default {
  install,
  HandwritingInput
}

// 支持单独导入组件
export { HandwritingInput }
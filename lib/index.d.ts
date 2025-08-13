import { VueConstructor } from 'vue'

export interface HandwritingInputProps {
  width?: string | number
  height?: string | number
  showControls?: boolean
  language?: string
  apiUrl?: string
  strokeWidth?: number
  strokeColor?: string
}

export interface HandwritingInputEvents {
  'text-selected': (text: string) => void
  'text-recognized': (options: string[]) => void
  'error': (error: Error) => void
  'cleared': () => void
  'recognizing': (isRecognizing: boolean) => void
  'get-text': (text: string) => void
}

export interface HandwritingInputMethods {
  clearCanvas(): void
  getText(): string
  getOptions(): string[]
  getSelectedText(): string
}

declare const HandwritingInput: {
  install(Vue: VueConstructor): void
  HandwritingInput: VueConstructor
}

export { HandwritingInput }
export default HandwritingInput
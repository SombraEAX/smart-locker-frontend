<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

interface ButtonParams {
  caption?: string
  flex?: number | string
}

const props = defineProps<{
  row1?: string
  row2?: string
  row3?: string
  row4?: string
  row5?: string
  row6?: string
  row7?: string
  row8?: string
  row9?: string
  row10?: string
  backspace?: string
  clear?: string
  width?: string
  minWidth?: string
  maxWidth?: string
  height?: string
  minHeight?: string
  maxHeight?: string
  fontSize?: string
  margin?: string
  background?: string
  textcolor?: string
  buttonsParams?: Record<string, ButtonParams>
  activeBackground?: string
  activeTextcolor?: string
}>()

const emit = defineEmits<{
  mouseup: []
  mousedown: []
  input: [value: string | undefined]
  clear: []
  backspace: []
}>()

const activeButton = ref<string | null>(null)

const rowKeys = [
  'row1', 'row2', 'row3', 'row4', 'row5',
  'row6', 'row7', 'row8', 'row9', 'row10',
] as const

const rows = computed(() => {
  const result: string[][] = []
  for (const key of rowKeys) {
    const data = props[key]
    if (!data) break
    result.push(data.split(/ +/))
  }
  return result
})

const keyboardStyle = computed(() => ({
  width: props.width,
  height: props.height,
  'min-height': props.minHeight,
  'min-width': props.minWidth,
  'max-height': props.maxHeight,
  'max-width': props.maxWidth,
}))

function handleMouseUp() {
  activeButton.value = null
  emit('mouseup')
}

onMounted(() => {
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mouseup', handleMouseUp)
})

function getButtonParams(item: string): ButtonParams {
  return props.buttonsParams?.[item] || {}
}

function buttonCaption(item: string) {
  if (item === 'clear') return props.clear
  if (item === 'backspace') return props.backspace
  return getButtonParams(item).caption || item
}

function buttonStyle(item: string) {
  const params = getButtonParams(item)
  const isActive = activeButton.value === item
  const style: Record<string, any> = {
    'font-size': props.fontSize,
    margin: props.margin,
    flex: params.flex,
  }
  if (isActive && props.activeBackground) {
    style.background = props.activeBackground
  } else if (props.background) {
    style.background = props.background
  }
  if (isActive && props.activeTextcolor) {
    style.color = props.activeTextcolor
  } else if (props.textcolor) {
    style.color = props.textcolor
  }
  return style
}

function onClick(item: string, event: Event) {
  if (item === 'clear') return emit('clear')
  if (item === 'backspace') return emit('backspace')
  emit('input', (event.target as HTMLElement).dataset.value)
}

function onMouseDown(item: string) {
  emit('mousedown')
  activeButton.value = item
}
</script>

<template>
  <div class="keyboard" :style="keyboardStyle">
    <div class="keyboard-row" v-for="(row, ri) in rows" :key="ri">
      <button
        class="keyboard-button"
        v-for="item in row"
        :key="item"
        :data-value="item"
        :style="buttonStyle(item)"
        @click="onClick(item, $event)"
        @mousedown="onMouseDown(item)"
      >
        {{ buttonCaption(item) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.keyboard {
  display: flex;
  flex-direction: column;
}
.keyboard-row {
  display: flex;
  flex: 1;
}
.keyboard-button {
  flex: 1;
  border: 0;
  border-radius: 5px;
  background: #000099;
  color: #fff;
}
.keyboard-button:active {
  background: #000077;
}
</style>

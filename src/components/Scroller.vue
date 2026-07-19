<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, type Component } from 'vue'
import type { Ui } from '../types'

const ANIM_INTERVAL = 10
const ANIM_STEP = 30

interface PageModule {
  default: Component
}

const pages: Record<string, () => Promise<PageModule>> = {
	BadCode:           () => import('../pages/BadCode.vue'),
	CompleteSuccess:   () => import('../pages/CompleteSuccess.vue'),
	Confirm:           () => import('../pages/Confirm.vue'),
	ExtendSuccess:     () => import('../pages/CompleteSuccess.vue'),
	Info:              () => import('../pages/passForStorage/Info.vue'),
	InputCode:         () => import('../pages/InputCode.vue'),
	InputPhone:        () => import('../pages/InputPhone.vue'),
	InternalError:     () => import('../pages/InternalError.vue'),
	LastConfirm:       () => import('../pages/LastConfirm.vue'),
	MainMenu:          () => import('../pages/MainMenu.vue'),
	NotEnoughMoney:    () => import('../pages/NotEnoughMoney.vue'),
	OpenCell:          () => import('../pages/passForStorage/OpenCell.vue'),
	Pay:               () => import('../pages/passForStorage/Pay.vue'),
	PayMethod:         () => import('../pages/passForStorage/PayMethod.vue'),
	Penalty:           () => import('../pages/Penalty.vue'),
	Scan:              () => import('../pages/Scan.vue'),
	SelectCell:        () => import('../pages/SelectCell.vue'),
	SelectTimeStorage: () => import('../pages/passForStorage/SelectTimeStorage.vue'),
	SizeCell:          () => import('../pages/passForStorage/SizeCell.vue'),
	Success:           () => import('../pages/passForStorage/Success.vue'),
	Timeout:           () => import('../pages/Timeout.vue'),
	TimeoutSuccessPay: () => import('../pages/TimeoutSuccessPay.vue'),
	Warning:           () => import('../pages/Warning.vue'),
	e1001:             () => import('../pages/1001.vue'),
}

async function resolvePage(name: string): Promise<Component> {
	const loader = pages[name]
	if (!loader) throw new Error(`Unknown page: ${name}`)
	return (await loader()).default
}

interface PageInstance {
  run?: () => void
}

const props = defineProps<{ content: string; ui: Ui }>()

const main = ref<HTMLElement | null>(null)
const pageA = ref<PageInstance | null>(null)
const pageB = ref<PageInstance | null>(null)
const curComponent = ref<Component | null>(null)
const targetComponent = ref<Component | null>(null)
const targetDirection = ref<string | null>(null)
const offset = ref(0)
const containerWidth = ref(0)

const componentA = ref<Component | null>(null)
const componentB = ref<Component | null>(null)
const active = ref<'a' | 'b'>('a')

const aTransform = computed(() => {
	if (!targetDirection.value || !containerWidth.value) return undefined
	const w = containerWidth.value
	const o = offset.value
	const isIncoming = active.value === 'a'
	if (isIncoming) {
		return targetDirection.value === 'left' ? `translateX(${w - o}px)` : `translateX(${-w + o}px)`
	}
	return targetDirection.value === 'left' ? `translateX(${-o}px)` : `translateX(${o}px)`
})

const bTransform = computed(() => {
	if (!targetDirection.value || !containerWidth.value) return undefined
	const w = containerWidth.value
	const o = offset.value
	const isIncoming = active.value === 'b'
	if (isIncoming) {
		return targetDirection.value === 'left' ? `translateX(${w - o}px)` : `translateX(${-w + o}px)`
	}
	return targetDirection.value === 'left' ? `translateX(${-o}px)` : `translateX(${o}px)`
})

let animTimerId: ReturnType<typeof setInterval> | null = null
let animResolvers: (() => void)[] = []

function cancelAnim() {
	if (animTimerId !== null) {
		clearInterval(animTimerId)
		animTimerId = null
	}
	for (const resolve of animResolvers) resolve()
	animResolvers = []
}

function startAnim(fn: () => boolean): Promise<void> {
	cancelAnim()
	return new Promise<void>(resolve => {
		animResolvers.push(resolve)
		animTimerId = setInterval(() => {
			if (fn()) {
				cancelAnim()
				resolve()
			}
		}, ANIM_INTERVAL)
	})
}

function raf(): Promise<void> {
	return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

async function jump(component: string, direction?: string) {
	if (!direction) {
		curComponent.value = await resolvePage(component)
		componentA.value = curComponent.value
		componentB.value = null
		active.value = 'a'
		nextTick(() => (active.value === 'a' ? pageA.value : pageB.value)?.run?.())
		return
	}

	const newComponent = await resolvePage(component)
	targetComponent.value = newComponent
	targetDirection.value = direction

	if (active.value === 'a') {
		componentB.value = newComponent
		active.value = 'b'
	} else {
		componentA.value = newComponent
		active.value = 'a'
	}

	await nextTick()
	await raf()

	containerWidth.value = main.value!.clientWidth

	await startAnim(() => {
		offset.value = Math.min(offset.value + ANIM_STEP, containerWidth.value)
		return offset.value >= containerWidth.value
	})

	await raf()

	curComponent.value = targetComponent.value!
	targetComponent.value = null
	targetDirection.value = null
	offset.value = 0

	if (active.value === 'a') {
		componentB.value = null
	} else {
		componentA.value = null
	}

	nextTick(() => (active.value === 'a' ? pageA.value : pageB.value)?.run?.())
}

async function init() {
	try {
		curComponent.value = await resolvePage(props.content)
		componentA.value = curComponent.value

		nextTick(() => pageA.value?.run?.())
	} catch {
		props.ui.jump('InternalError')
	}
}

onMounted(() => {
	init()
})

onBeforeUnmount(() => {
	cancelAnim()
})

defineExpose({ jump })
</script>

<template>
	<div class="scroller-outer" ref="main">
		<div class="scroller-inner">
			<div v-if="componentA" class="scroller-page" :style="{ transform: aTransform, zIndex: active === 'a' ? 2 : 1 }">
				<component :is="componentA" :ui="ui" ref="pageA"/>
			</div>
			<div v-if="componentB" class="scroller-page" :style="{ transform: bTransform, zIndex: active === 'b' ? 2 : 1 }">
				<component :is="componentB" :ui="ui" ref="pageB"/>
			</div>
		</div>
	</div>
</template>

<style scoped>
.scroller-outer{
	flex:1;
	overflow: hidden;
	height:100%
}
.scroller-inner{
	position:relative;
	height:100%
}
.scroller-page{
	position:absolute;
	top:0;
	left:0;
	width:100%;
	height:100%
}
</style>

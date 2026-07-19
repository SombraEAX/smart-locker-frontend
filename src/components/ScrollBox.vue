<script setup lang="ts" generic="T">
import { computed, ref, onBeforeUnmount } from 'vue'
import Tile from './Tile.vue'

const ANIM_INTERVAL = 10
const ANIM_STEP = 30

interface ScrollItem {
	data: T
	disabled: boolean
}

const props = defineProps<{ items: ScrollItem[] }>()
const emit = defineEmits<{ click: [data: T] }>()

const current = ref(0)
const disabled = ref(false)
const isDestroyed = ref(false)
const container = ref<HTMLElement | null>(null)

const slides = computed(() => {
	const result: ScrollItem[][] = []
	let slide: ScrollItem[] = []

	props.items.forEach((item) => {
		if (slide.length === 4) {
			result.push(slide)
			slide = []
		}
		slide.push(item)
	})

	if (slide.length) result.push(slide)
	return result
})

onBeforeUnmount(() => {
	isDestroyed.value = true
})

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

async function left() {
	disabled.value = true
	const el = container.value!
	const w = el.clientWidth
	const final = el.scrollLeft - w

	current.value--

	while (!isDestroyed.value) {
		el.scrollLeft -= ANIM_STEP

		if (el.scrollLeft <= final + ANIM_STEP) {
			el.scrollLeft = final
			disabled.value = false
			return
		}

		await sleep(ANIM_INTERVAL)
	}
}

async function right() {
	disabled.value = true
	const el = container.value!
	const w = el.clientWidth
	const final = el.scrollLeft + w

	current.value++

	while (!isDestroyed.value) {
		el.scrollLeft += ANIM_STEP

		if (el.scrollLeft >= final - ANIM_STEP) {
			el.scrollLeft = final
			disabled.value = false
			return
		}

		await sleep(ANIM_INTERVAL)
	}
}
</script>

<template>
	<div class="sl-sb-wrapper">
		<div class="sl-sb-layer sl-sb-content-layer" ref="container">
			<div class="sl-sb-inner" :style="{width: slides.length * 100 + '%'}">
				<div class="sl-sb-slide" v-for="(slide, index) in slides" :key="index">
					<div class="sl-sb-p"></div>

					<div class="sl-sb-content">
						<div class="sl-sb-column">
							<div class="tilebox">
								<Tile
									color="black"
									class="tile"
									v-if="slide[0]"
									:disabled="slide[0].disabled"
									@click="emit('click', slide[0].data)"
								><slot :item="slide[0]"></slot></Tile>
							</div>
							<div class="sl-sb-placeholder"></div>
							<div class="tilebox">
								<Tile
									color="black"
									class="tile"
									v-if="slide[2]"
									:disabled="slide[2].disabled"
									@click="emit('click', slide[2].data)"
								><slot :item="slide[2]"></slot></Tile>
							</div>
						</div>
						<div class="sl-sb-placeholder"></div>
						<div class="sl-sb-column">
							<div class="tilebox">
								<Tile
									color="black"
									class="tile"
									v-if="slide[1]"
									:disabled="slide[1].disabled"
									@click="emit('click', slide[1].data)"
								><slot :item="slide[1]"></slot></Tile>
							</div>
							<div class="sl-sb-placeholder"></div>
							<div class="tilebox">
								<Tile
									color="black"
									class="tile"
									v-if="slide[3]"
									:disabled="slide[3].disabled"
									@click="emit('click', slide[3].data)"
								><slot :item="slide[3]"></slot></Tile>
							</div>
						</div>
					</div>

					<div class="sl-sb-p"></div>
				</div>
			</div>
		</div>

		<div class="sl-sb-button-wrapper sl-sb-button-wrapper-left">
			<button
				class="sl-sb-button sl-sb-button-left"
				v-if="current != 0"
				@click="left"
				:disabled="disabled"
			></button>
		</div>
		<div class="sl-sb-button-wrapper sl-sb-button-wrapper-right">
			<button
				class="sl-sb-button sl-sb-button-right"
				v-if="current < slides.length - 1"
				@click="right"
				:disabled="disabled"
			></button>
		</div>
	</div>
</template>

<style scoped>
.sl-sb-button-left{
	background-image:url(/img/left-arrow.png)
}
.sl-sb-button-right{
	background-image:url(/img/right-arrow.png)
}
.sl-sb-placeholder{
	width:10px;
	height:10px
}
.sl-sb-button-wrapper-left{
	left:0px;
}
.sl-sb-button-wrapper-right{
	right:0px;
}
.sl-sb-button-wrapper{
	display:flex;
	height:100%;
	z-index:200;
	top:0px;
	position:absolute
}
.sl-sb-content{
	display:flex;
	flex:1;
	height:100%
}
.tilebox{
	flex:1
}
.tile{
	width:100%;
	height:100%
}
.sl-sb-column{
	flex:1;
	display:flex;
	flex-direction:column
}
.sl-sb-content-layer{
	overflow-x:hidden;
	z-index:100
}
.sl-sb-inner{
	display:flex;
	height:100%
}
.sl-sb-slide{
	width:100%;
	height:100%;
	display:flex
}
.sl-sb-p,.sl-sb-button-wrapper{
	width:7vw;
}
.sl-sb-button{
	width:100%;
	height:100%;
	background-repeat:no-repeat;
	background-position:center;
	background-size:4vw;
	background-color:transparent;
	border:0px
}
.sl-sb-wrapper{
	position:relative;
	width:100%;
	flex:1;
}
.sl-sb-layer {
	position:absolute;
	left:0px;
	top:0px;
	bottom:0px;
	right:0px
}
</style>

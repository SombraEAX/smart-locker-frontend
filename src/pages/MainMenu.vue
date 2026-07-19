<template>
	<padding-box style="height:100%">
		<div class="sl-mp-global" v-if="status == 'done'">
			<div class="sl-mp-l">
				<Tile
					color="accent"
					class="sl-mp-mt"
					@click="passForStorage"
					:disabled="!freeCells"
				>
					<div class="sl-mp-mt1">{{freeCells}}</div>
					<div class="sl-mp-mt2">FREE CELLS</div>
				<div class="u-flex-1"></div>
				<div class="sl-mp-mt3">Rent<br/>a cell</div>
			</Tile>
		</div>
		<div class="sl-mp-r" v-if="occupied">
			<Tile color="black" class="sl-mp-tile u-mb-half" @click="extend">
				<div class="u-flex-1"></div>
				<div>Extend<br/>rental</div>
			</Tile>
			<Tile color="black" class="sl-mp-tile u-mt-half" @click="complete">
				<div class="u-flex-1"></div>
					<div>Open<br/>cell</div>
				</Tile>
			</div>
		</div>
		<div class="sl-mp-error" v-else>
			<div class="sl-mp-error-inner">{{statusText}}</div>
		</div>
	</padding-box>
</template>
<style scoped>
	.sl-mp-error{
		width:100%;
		height:100%;
		display:flex;
		text-align:center;
	}
	.sl-mp-error-inner{
		text-align:center;
		margin:auto;
		font-size:20px		
	}
	.sl-mp-mt{
		width:100%;
		height:100%;
		display:flex;
		flex-direction:column;
		text-align:left
	}

	.sl-mp-mt1{
		font-size:5vw
	}

	.sl-mp-mt2{
		font-size:1.8vw
	}
	
	.sl-mp-mt3{
		font-size:5vw
	}
	
	.sl-mp-tile{
		flex:1;
		width:100%;
		display:flex;
		flex-direction:column;
		text-align:left;
	}
	
	.sl-mp-global{
		width:100%;
		height:95%;
		display:flex
	}

	.sl-mp-r{
		flex:1;
		display:flex;
		flex-direction:column;
		padding-left:1vw
	}
	
	.sl-mp-l{
		flex:1
	}
</style>
<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Tile from '../components/Tile.vue'
import PaddingBox from '../components/PaddingBox.vue'
import * as api from '../api'
import { useAppStore } from '../store'
import { log } from '../logger'
import type { Ui } from '../types'

const LOAD_TIMEOUT = 10000
const POLL_INTERVAL = 1000

type PageStatus = 'loading' | 'done' | 'error'

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

let _timer: ReturnType<typeof setInterval> | null = null
let _stepRunning = false

const freeCells = ref<number | null>(null)
const occupied = ref<boolean | null>(null)
const status = ref<PageStatus>('loading')
const startTime = ref<number | null>(null)

const statusText = computed(() => {
	if (status.value === 'error') return 'Internal service error'
	return 'Loading...'
})

onMounted(() => {
	startTime.value = Date.now()
	if (store.mainpage) {
		freeCells.value = store.mainpage.freeCells
		occupied.value = store.mainpage.occupied
		status.value = 'done'
	}
})

onBeforeUnmount(() => {
	if (_timer) clearInterval(_timer)
})

async function step() {
	if (_stepRunning) return
	_stepRunning = true
	try {
		const [occupiedList, freeCount] = await Promise.all([
			api.getOccupiedCellsList(),
			api.getFreeCellsCount(),
		])
		freeCells.value = freeCount
		occupied.value = occupiedList.length > 0
		status.value = 'done'

		store.mainpage = {
			occupied: occupied.value ?? false,
			freeCells: freeCells.value ?? 0,
		}
	} catch (e) {
		log('warn', 'MainMenu step() failed', { error: String(e) })
		const delta = Date.now() - startTime.value!
		if (delta < LOAD_TIMEOUT) {
			status.value = 'loading'
		} else {
			status.value = 'error'
		}
	} finally {
		_stepRunning = false
	}
}

async function run() {
	step()
	_timer = setInterval(() => step(), POLL_INTERVAL)
}

defineExpose({ run })

async function passForStorage() {
	if (_timer) clearInterval(_timer)
	store.text = 'Place your items and close the cell'
	props.ui?.jump('SizeCell', 'left')
}

async function extend() {
	if (_timer) clearInterval(_timer)
	props.ui?.jump('SelectCell', 'left')
	store.action = 'extend'
}

async function complete() {
	if (_timer) clearInterval(_timer)
	props.ui?.jump('SelectCell', 'left')
	store.action = 'complete'
}
</script>

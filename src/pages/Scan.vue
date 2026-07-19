<template>
  <page-body class="sl-info-body">
    <padding-box>
      <page-header title="Scan receipt"/>
    </padding-box>
    <padding-box style="height:100%">
		<div class="sl-info-box">
			<div class="sl-info-left">
				<div class="sl-info-text">
					<div>
						Place the receipt on the scanner
					</div>
				</div>
				<div class="sl-info-buttons">
    				<small-button @click="back" class="u-mr-10">Exit</small-button>
				</div>
			</div>
			<div class="sl-info-right"></div>
		</div>
    </padding-box>
  </page-body>  
</template>
<style scoped lang="scss">
@use '../assets/css/info-page';
.sl-info-right{
	background-image:url(/img/barcode.png)
}
</style>
<script lang="ts" setup>
import { onBeforeUnmount } from 'vue'
import SmallButton from '../components/SmallButton.vue'
import PageBody from '../components/PageBody.vue'
import PageHeader from '../components/PageHeader.vue'
import PaddingBox from '../components/PaddingBox.vue'
import { useAppStore } from '../store'
import { startScan, stopScan, scan, checkCode } from '../api'
import { log } from '../logger'
import next from '../next'
import type { Ui } from '../types'

const POLL_INTERVAL = 1000

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

let _timer: ReturnType<typeof setInterval> | null = null
let _stepRunning = false

onBeforeUnmount(() => {
	if (_timer) clearInterval(_timer)
})

async function back() {
	if (_timer) clearInterval(_timer)
	await stopScan()
	props.ui?.jump('MainMenu', 'right')
}

async function step() {
	if (_stepRunning) return
	_stepRunning = true
	try {
		const code = await scan()
		if (code) {
			if (_timer) clearInterval(_timer)
			await stopScan()
			done(code)
		}
	} catch (e) {
		log('error', 'scan() failed', { error: String(e) })
		if (_timer) clearInterval(_timer)
		await stopScan()
		props.ui?.jump('InternalError')
	} finally {
		_stepRunning = false
	}
}

async function done(code: string) {
	try {
		const { status, cell } = await checkCode(code)

		switch (status) {
			case 'error':
				return props.ui?.jump('InternalError')
			case 'not found':
				return props.ui?.jump('BadCode')
			case 'timeout':
				store.cellid = cell
				return props.ui?.jump('Timeout', 'left')
			case 'ok':
				store.cellid = cell
				if (props.ui) await next(props.ui)
		}
	} catch (e) {
		log('error', 'checkCode failed', { code, error: String(e) })
		props.ui?.jump('InternalError')
	}
}

async function run() {
	try {
		await startScan()
		_timer = setInterval(() => step(), POLL_INTERVAL)
	} catch (e) {
		log('error', 'startScan failed', { error: String(e) })
		props.ui?.jump('InternalError')
	}
}

defineExpose({ run })
</script>

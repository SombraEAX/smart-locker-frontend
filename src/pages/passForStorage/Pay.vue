<template>
  <page-body class="sl-info-body">
    <padding-box>
      <page-header title="Card payment"/>
    </padding-box>
    <padding-box style="height:100%">
		<div class="sl-info-box">
			<div class="sl-info-left">
				<div class="sl-pay-info">
					<div>
						<div class="sl-pay-value">{{currency}}{{price}}</div>
						<div class="sl-pay-caption">Amount due</div>
					</div>
				</div>
				<div class="sl-info-text">
					<div>
						Insert your card into the terminal or tap it for PayPass
					</div>
				</div>
			</div>
			<div class="sl-info-right"></div>
		</div>
    </padding-box>
  </page-body>
</template>
<style scoped lang="scss">
@use '../../assets/css/info-page';
.sl-info-right{
	background-image:url(/img/card.png)
}
</style>
<script lang="ts" setup>
import { ref, onBeforeUnmount } from 'vue'
import PageBody from '../../components/PageBody.vue'
import PageHeader from '../../components/PageHeader.vue'
import PaddingBox from '../../components/PaddingBox.vue'
import { useAppStore } from '../../store'
import {
	invoice,
	isPaid,
	sendSms,
	getCellData,
	extend,
	endStorage
} from '../../api'
import { log } from '../../logger'
import type { Ui } from '../../types'
import { currency } from '../../config'

const POLL_INTERVAL = 1000
const PAYMENT_TIMEOUT = 300000

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

let _timer: ReturnType<typeof setInterval> | null = null
let _pollStartTime = 0
let _stepRunning = false

const price = ref(0)
const order = ref<number | null>(null)

onBeforeUnmount(() => {
	if (_timer) clearInterval(_timer)
})

function goToError() {
	if (_timer) clearInterval(_timer)
	props.ui?.jump('InternalError')
}

async function step() {
	if (_stepRunning) return
	_stepRunning = true
	try {
		if (Date.now() - _pollStartTime >= PAYMENT_TIMEOUT) {
			goToError()
			return
		}
		if (order.value === null) {
			goToError()
			return
		}
		const res = await isPaid(order.value)
		if (res === 'wait') return
		if (res === 'success') return success()
		goToError()
	} catch (e) {
		log('error', 'isPaid() failed', { order: order.value, error: String(e) })
		goToError()
	} finally {
		_stepRunning = false
	}
}

async function success() {
	if (_timer) clearInterval(_timer!)

	try {
		switch (store.action) {
			case 'begin': {
				props.ui?.jump('Success', 'left')
				break
			}
			case 'complete': {
				if (store.cellid === null) {
					goToError()
					return
				}
				const { phone } = await getCellData(store.cellid)
				const text = price.value + ` paid, storage completed`

				try {
					await sendSms({ phone, text })
				} catch (e) {
					log('error', 'sendSms failed (complete)', { phone, error: String(e) })
					props.ui?.jump('e1001')
					return
				}

				await endStorage(store.cellid)
				props.ui?.jump('CompleteSuccess', 'left')
				break
			}
			case 'extend': {
				const { cellid, time } = store
				if (cellid === null || time === null) {
					goToError()
					return
				}
				const { phone } = await getCellData(cellid)
				const text = `$${price.value} paid, cell ${cellid} rental extended by ${time} hours.`

				try {
					await sendSms({ phone, text })
				} catch (e) {
					log('error', 'sendSms failed (extend)', { phone, error: String(e) })
					props.ui?.jump('e1001')
					return
				}

				await extend({ cellid, time })
				props.ui?.jump('ExtendSuccess', 'left')
				break
			}
		}
	} catch (e) {
		log('error', 'Pay success() failed', { action: store.action, error: String(e) })
		goToError()
	}
}

async function run() {
	price.value = store.priceTotal

	if (store.time === null || store.size === null) {
		goToError()
		return
	}

	try {
		order.value = await invoice(store.time, store.size)
		_pollStartTime = Date.now()
		_timer = setInterval(() => step(), POLL_INTERVAL)
	} catch (e) {
		log('error', 'invoice() failed', { time: store.time, size: store.size, error: String(e) })
		goToError()
	}
}

defineExpose({ run })
</script>

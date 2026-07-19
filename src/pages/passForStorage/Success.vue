<template>
  <page-body class="sl-info-body">
    <padding-box>
      <page-header title="Payment successful"/>
    </padding-box>
    <padding-box style="height:100%">
		<div class="sl-info-box">
			<div class="sl-info-left">
				<div class="sl-pay-info">
					<div>
						<div class="sl-pay-value">{{cell}}</div>
						<div class="sl-pay-caption">An SMS with your cell opening code has been sent to you</div>
					</div>
				</div>
				<div class="sl-pay-info">
					<div>
						<div class="sl-pay-value">{{time}}</div>
						<div class="sl-pay-caption">Tariff</div>
					</div>
				</div>
				<div class="sl-info-buttons">
    				<small-button
    					@click="ui?.jump('OpenCell','left')"
    					style="margin-right:10px"
    					:disabled="disabled"
    				>Next</small-button>
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
	background-image:url(/img/receipt.png)
}
</style>
<script lang="ts" setup>
import { ref } from 'vue'
import SmallButton from '../../components/SmallButton.vue'
import PageBody from '../../components/PageBody.vue'
import PageHeader from '../../components/PageHeader.vue'
import PaddingBox from '../../components/PaddingBox.vue'
import { useAppStore } from '../../store'
import * as api from '../../api'
import { log } from '../../logger'
import { phonePrefix } from '../../config'
import type { Ui } from '../../types'

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

const cell = ref<number | null>(null)
const time = ref<string | null>(null)
const disabled = ref(true)

async function run() {
	time.value = store.caption.toUpperCase()
	const CODE_MIN = 1000
	const CODE_MAX = 9999
	const range = CODE_MAX - CODE_MIN + 1
	const buf = new Uint32Array(1)
	crypto.getRandomValues(buf)
	const code = String((buf[0] % range) + CODE_MIN)

	if (store.size === null) {
		props.ui?.jump('InternalError')
		return
	}

	const freeCellId = await api.getFreeCellId(store.size)
	if (freeCellId === undefined) {
		props.ui?.jump('InternalError')
		return
	}
	const cellid = store.cellid = freeCellId
	const phone = phonePrefix + store.phone
	const text = `Your cell: ${cellid}, opening code: ${code}`
	const t = store.time

	try {
		await api.sendSms({ phone, text })
	} catch (e) {
		log('error', 'sendSms failed', { phone, error: String(e) })
		props.ui?.jump('e1001')
		return
	}

	try {
		await api.beginStorage({ phone, cellid, code, time: t as number | string })
	} catch (e) {
		log('error', 'beginStorage failed', { cellid, error: String(e) })
		props.ui?.jump('InternalError')
		return
	}

	disabled.value = false
}

defineExpose({ run })
</script>

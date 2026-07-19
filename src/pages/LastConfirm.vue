<template>
  <page-body class="sl-info-body">
    <padding-box>
      <page-header title="Attention"/>
    </padding-box>
    <padding-box style="height:100%">
		<div class="sl-info-box">
			<div class="sl-info-left">
				<div class="sl-pay-info">
					<div>
						<div class="sl-pay-caption">
							The cell was rented less than {{gracePeriod}} minutes ago.
						</div>
					</div>
				</div>
				<div class="sl-info-buttons">
    				<small-button @click="back" style="margin-right:10px">Cancel</small-button>
			    	<small-button @click="next" :primary="true">Open</small-button>
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
	background-image:url(/img/question.png)
}
</style>
<script lang="ts" setup>
import { useAppStore } from '../store'
import * as api from '../api'
import { gracePeriod } from '../config'
import { log } from '../logger'
import SmallButton from '../components/SmallButton.vue'
import PageBody from '../components/PageBody.vue'
import PageHeader from '../components/PageHeader.vue'
import PaddingBox from '../components/PaddingBox.vue'
import type { Ui } from '../types'

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

function back() {
	props.ui?.jump('MainMenu', 'right')
}

async function next() {
	if (store.cellid === null) {
		props.ui?.jump('InternalError')
		return
	}
	try {
		const cell = await api.getCellData(store.cellid)
		const start = cell.start.getTime()
		const end = cell.end.getTime()
		const now = Date.now()
		const size = api.fsize(cell as api.HardwareCell)
		const price = await api.getPrice(size)

		if (now - start < gracePeriod * 60 * 1000) {
			await api.endStorage(store.cellid)
			props.ui?.jump('OpenCell', 'left')
		} else if (now > end) {
			store.time = Math.ceil((now - end) / 1000 / 60 / 60)
			store.priceTotal = price * (store.time as number)
			store.size = size
			props.ui?.jump('Penalty', 'left')
		} else {
			await api.endStorage(store.cellid)
			props.ui?.jump('OpenCell', 'left')
		}
	} catch (e) {
		log('error', 'LastConfirm next() failed', { cellid: store.cellid, error: String(e) })
		props.ui?.jump('InternalError')
	}
}
</script>

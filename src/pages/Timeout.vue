<template>
  <page-body class="sl-info-body">
    <padding-box>
      <page-header title="Attention"/>
    </padding-box>
    <padding-box style="height:100%">
		<div class="sl-info-box">
			<div class="sl-info-left">
				<div class="sl-info-text">
					<div>
						Storage time exceeded by {{timeout}}.<br/>
						Pay {{currency}}{{penalty}} to continue.
					</div>
				</div>
				<div class="sl-info-buttons">
    				<small-button @click="ui?.jump('MainMenu','right')" style="margin-right:10px">Exit</small-button>
			    	<small-button @click="next" :primary="true">Pay</small-button>
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
	background-image:url(/img/warning.png)
}
</style>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import SmallButton from '../components/SmallButton.vue'
import PageBody from '../components/PageBody.vue'
import PageHeader from '../components/PageHeader.vue'
import PaddingBox from '../components/PaddingBox.vue'
import { useAppStore } from '../store'
import { getPenaltyInfo } from '../api'
import { log } from '../logger'
import type { Ui } from '../types'
import { currency } from '../config'

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

const penalty = ref<number | null>(null)
const timeout = ref<string | null>(null)

async function init() {
	if (store.cellid === null) {
		props.ui?.jump('InternalError')
		return
	}
	try {
		const { timeout: t, penalty: p } = await getPenaltyInfo(store.cellid)
		timeout.value = t.replace(/(\d+)h/, '$1 hours').replace(/(\d+)m/, '$1 minutes')
		store.priceTotal = penalty.value = p
	} catch (e) {
		log('error', 'getPenaltyInfo failed', { cellid: store.cellid, error: String(e) })
		props.ui?.jump('InternalError')
	}
}

function next() {
	store.back = "Timeout"
	props.ui?.jump('Pay', 'left')
}

onMounted(() => {
	init()
})
</script>

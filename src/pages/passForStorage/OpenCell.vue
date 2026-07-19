<template>
  <page-body class="sl-info-body">
    <padding-box>
      <page-header title="Cell opened"/>
    </padding-box>
    <padding-box style="height:100%">
		<div class="sl-info-box">
			<div class="sl-info-left">
				<div class="sl-pay-info">
					<div>
						<div class="sl-pay-caption">Cell #: <span class="sl-pay-value">{{cell}}</span></div>
						<div class="sl-pay-caption">{{text}}</div>
					</div>
				</div>
				<div class="sl-info-buttons">
    				<small-button @click="ui?.jump('MainMenu','right')" style="margin-right:10px">Exit</small-button>
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
	background-image:url(/img/info.png)
}
</style>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import SmallButton from '../../components/SmallButton.vue'
import PageBody from '../../components/PageBody.vue'
import PageHeader from '../../components/PageHeader.vue'
import PaddingBox from '../../components/PaddingBox.vue'
import { useAppStore } from '../../store'
import * as api from '../../api'
import { log } from '../../logger'
import type { Ui } from '../../types'

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

const cell = ref<number | null>(null)
const text = ref('')

onMounted(() => {
	cell.value = store.cellid
	text.value = store.text
})

async function run() {
	text.value = store.text
	if (store.cellid === null) {
		props.ui?.jump('InternalError')
		return
	}
	try {
		await api.open(store.cellid)
	} catch (e) {
		log('error', 'open() failed', { cellid: store.cellid, error: String(e) })
		props.ui?.jump('InternalError')
	}
}

defineExpose({ run })
</script>

<script setup lang="ts">
import { computed } from 'vue'
import SmallButton from '../components/SmallButton.vue'
import PageBody from '../components/PageBody.vue'
import PageHeader from '../components/PageHeader.vue'
import PaddingBox from '../components/PaddingBox.vue'
import { useAppStore } from '../store'
import type { Ui } from '../types'

defineProps<{ ui?: Ui }>()
const store = useAppStore()

const isExtend = computed(() => store.action === 'extend')
const caption = computed(() =>
	isExtend.value ? 'Storage extended successfully' : 'Storage paid successfully'
)
const nextLabel = computed(() => isExtend.value ? 'OK' : 'Next')
const nextTarget = computed(() => isExtend.value ? 'MainMenu' : 'OpenCell')
const nextDirection = computed(() => isExtend.value ? 'right' : 'left')

async function run() {
	// cellid is already in store
}

defineExpose({ run })
</script>

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
						<div class="sl-pay-value">{{store.cellid}}</div>
						<div class="sl-pay-caption">{{caption}}</div>
					</div>
				</div>
				<div class="sl-info-buttons">
    				<small-button @click="ui?.jump(nextTarget, nextDirection)" style="margin-right:10px">{{nextLabel}}</small-button>
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
	background-image:url(/img/receipt.png)
}
</style>

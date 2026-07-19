<template>
  <page-body class="sl-info-body">
    <padding-box>
      <page-header title="Information"/>
    </padding-box>
    <padding-box style="height:100%">
		<div class="sl-info-box">
			<div class="sl-info-left">
				<div class="sl-info-text">
					<div>
						Within {{springPeriod}} minutes of payment, you can add more items to the cell.
						After that you will have only ONE opening.
					</div>
				</div>
				<div class="sl-info-buttons">
    				<small-button @click="back" style="margin-right:10px">Exit</small-button>
			    	<small-button @click="next" :primary="true">Agree</small-button>
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
	background-image:url(/img/free-icon-clock-3936558.png)
}
</style>
<script lang="ts" setup>
import SmallButton from '../../components/SmallButton.vue'
import PageBody from '../../components/PageBody.vue'
import PageHeader from '../../components/PageHeader.vue'
import PaddingBox from '../../components/PaddingBox.vue'
import { useAppStore } from '../../store'
import { springPeriod } from '../../config'
import type { Ui } from '../../types'

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

function next() {
	switch (store.action) {
		case 'begin': return props.ui?.jump('InputPhone', 'left')
	}
}

function back() {
	switch (store.action) {
		case 'begin': return props.ui?.jump('SelectTimeStorage', 'right')
	}
}
</script>

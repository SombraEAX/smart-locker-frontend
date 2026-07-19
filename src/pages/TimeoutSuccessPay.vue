<script setup lang="ts">
import SmallButton from '../components/SmallButton.vue'
import PageBody from '../components/PageBody.vue'
import PageHeader from '../components/PageHeader.vue'
import PaddingBox from '../components/PaddingBox.vue'
import next from '../next'
import type { Ui } from '../types'

const props = defineProps<{ ui?: Ui }>()

function onNext() {
	if (!props.ui) return
	next(props.ui)
}
</script>

<template>
  <page-body class="sl-info-body">
    <padding-box>
      <page-header title="Successfully paid"/>
    </padding-box>
    <padding-box style="height:100%">
		<div class="sl-info-box">
			<div class="sl-info-left">
				<div class="sl-info-text">
					<div>
						Excess storage time has been successfully paid
					</div>
				</div>
				<div class="sl-info-buttons">
    				<small-button @click="onNext" :primary="true" style="margin-right:10px">Next</small-button>
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
	background-image:url(/img/like.png)
}
</style>

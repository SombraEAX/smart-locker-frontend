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
							Storage time exceeded by {{time}} hours.<br>
							You need to pay {{currency}}{{priceTotal}}.
						</div>
					</div>
				</div>
				<div class="sl-info-buttons">
    				<small-button @click="back" style="margin-right:10px">Cancel</small-button>
			    	<small-button @click="next" :primary="true">Next</small-button>
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
	background-image:url(/img/info.png)
}
</style>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import SmallButton from '../components/SmallButton.vue'
import PageBody from '../components/PageBody.vue'
import PageHeader from '../components/PageHeader.vue'
import PaddingBox from '../components/PaddingBox.vue'
import { useAppStore } from '../store'
import type { Ui } from '../types'
import { currency } from '../config'

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

const time = ref<string | number>('')
const priceTotal = ref<string | number>('')

onMounted(() => {
	time.value = store.time as string | number
	priceTotal.value = store.priceTotal
})

function back() {
	props.ui?.jump('MainMenu', 'right')
}

function next() {
	props.ui?.jump('Pay', 'left')
}
</script>

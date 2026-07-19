<template>
  <page-body class="sl-select-time">
    <padding-box>
      <page-header title="Select cell"/>
    </padding-box>
	<ScrollBox :items="buttons" @click="click">
		<template #default="{ item }">
			<div class="sl-select-time-button">
				<div class="sl-select-time-placeholder"></div>
				<div class="sl-select-time-bottom">
					<div class="sl-select-time-time">
						<div class="sl-select-time-placeholder"></div>
						<div style="font-size:4vw">{{ item.data }}</div>
					</div>
					<div class="sl-select-time-placeholder"></div>
					<div class="sl-select-time-price"></div>
				</div>
			</div>
		</template>
	</ScrollBox>
    <padding-box class="u-mt-20">
    	<small-button @click="back">Back</small-button>
    </padding-box>
  </page-body>  
</template>
<style scoped>
.sl-select-time{
	text-align:left
}
.sl-select-time-button{
	display:flex;
	flex-direction:column;
	width:100%;
	height:100%
}
.sl-select-time-placeholder{
	flex:1
}
.sl-select-time-bottom{
	display:flex
}
.sl-select-time-time{
	font-size:2vw;
	display:flex;
	flex-direction:column
}
</style>
<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import SmallButton from '../components/SmallButton.vue'
import PageBody from '../components/PageBody.vue'
import PageHeader from '../components/PageHeader.vue'
import ScrollBox from '../components/ScrollBox.vue'
import PaddingBox from '../components/PaddingBox.vue'
import { useAppStore } from '../store'
import * as api from '../api'
import { log } from '../logger'
import type { Ui } from '../types'

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

const cells = ref<number[]>([])

const buttons = computed(() => {
	return cells.value.map(cellid => ({
		data: cellid,
		disabled: false
	}))
})

onMounted(() => {
	init()
})

async function init() {
	try {
		cells.value = await api.getOccupiedCellsList()
	} catch (e) {
		log('error', 'getOccupiedCellsList failed', { error: String(e) })
		props.ui?.jump('InternalError')
	}
}

function click(cellid: number) {
	store.cellid = cellid
	props.ui?.jump('InputCode', 'left')
}

function back() {
	props.ui?.jump('MainMenu', 'right')
}
</script>

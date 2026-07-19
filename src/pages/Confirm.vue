<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SmallButton from '../components/SmallButton.vue'
import PageBody from '../components/PageBody.vue'
import PageHeader from '../components/PageHeader.vue'
import PaddingBox from '../components/PaddingBox.vue'
import { useAppStore } from '../store'
import * as api from '../api'
import { springPeriod } from '../config'
import { log } from '../logger'
import type { Ui } from '../types'
import type { CellData } from '../api'

type RentalStatus = 'withinGracePeriod' | 'overdue' | 'active'

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

const cell = ref<CellData | null>(null)
const status = ref<RentalStatus | null>(null)

const isOverdueOrActive = computed(() => {
	return status.value === 'overdue' || status.value === 'active'
})

onMounted(() => {
	init()
})

async function init() {
	if (store.cellid === null) {
		props.ui?.jump('InternalError')
		return
	}
	try {
		cell.value = await api.getCellData(store.cellid)
		const now = Date.now()
		const start = cell.value.start.getTime()

		if (now - start < springPeriod * 60 * 1000) {
			status.value = 'withinGracePeriod'
		} else if (now > cell.value.end.getTime()) {
			status.value = 'overdue'
		} else {
			status.value = 'active'
		}
	} catch (e) {
		log('error', 'getCellData failed', { cellid: store.cellid, error: String(e) })
		props.ui?.jump('InternalError')
	}
}

function back() {
	props.ui?.jump('MainMenu', 'right')
}

function addItems() {
	store.text = 'You can add items'
	props.ui?.jump('OpenCell', 'left')
}

async function next() {
	if (store.cellid === null) {
		props.ui?.jump('InternalError')
		return
	}
	try {
		store.text = 'Take your items'

		if (status.value === 'overdue' && cell.value) {
			const now = Date.now()
			const end = cell.value.end.getTime()
			const size = api.fsize(cell.value as api.HardwareCell)
			const price = await api.getPrice(size)

			store.time = Math.ceil((now - end) / 1000 / 60 / 60)
			store.priceTotal = price * (store.time as number)
			store.size = size
			props.ui?.jump('Penalty', 'left')
		} else {
			await api.endStorage(store.cellid)
			props.ui?.jump('OpenCell', 'left')
		}
	} catch (e) {
		log('error', 'Confirm next() failed', { cellid: store.cellid, error: String(e) })
		props.ui?.jump('InternalError')
	}
}
</script>

<template>
  <page-body class="sl-info-body sl-confirm-page">
    <padding-box>
      <page-header title="Attention"/>
    </padding-box>
    <padding-box>
		<div class="sl-confirm-global">
			<div class="sl-confirm-top">
				<div class="sl-confirm-caption" v-if="status === 'withinGracePeriod'">
					Cell was rented less than {{springPeriod}} minutes ago.<br/>
					Do you want to add items or take them and end storage?
				</div>
				<div class="sl-confirm-caption" v-if="isOverdueOrActive">
					If you open the cell, the rental will be terminated.<br/>
					Open the cell?
				</div>
				<div class="sl-confirm-image" v-if="status !== null"></div>
			</div>
			<div class="sl-confirm-buttons" v-if="status === 'withinGracePeriod'">
				<small-button :primary="true" @click="addItems" class="btn">
					Add items
				</small-button>
				<small-button @click="next" class="btn">
					Take and end rental
				</small-button>
				<small-button @click="back" class="btn">Cancel</small-button>
			</div>
			<div class="sl-confirm-buttons" v-if="isOverdueOrActive">
				<small-button @click="back" class="btn">Cancel</small-button>
				<small-button @click="next" :primary="true" class="btn">Open</small-button>
			</div>
		</div>
    </padding-box>
  </page-body>
</template>

<style scoped>
.sl-info-body {
	text-align: left;
}
.sl-confirm-page{
	height:100%
}
.sl-confirm-caption{
	padding-top:10vh;
	font-size:3vh
}
.btn{
	margin-right:15px
}
.sl-confirm-global{
	height:80vh;
	display:flex;
	flex-direction:column;
}
.sl-confirm-top{
	flex:1;
	display:flex;
	flex-direction:row
}
.sl-confirm-image{
	flex:2;
	background-image:url(/img/question.png);
	background-size:80%;
	background-position:center;
	background-repeat:no-repeat
}
</style>

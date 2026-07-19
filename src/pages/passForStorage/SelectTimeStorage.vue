<template>
  <page-body class="sl-select-time">
    <padding-box>
      <page-header title="Select storage time"/>
    </padding-box>
	<ScrollBox :items="buttons" @click="click">
		<template #default="{ item }">
			<div class="sl-select-time-button">
				<div class="sl-select-time-placeholder"></div>
				<div class="sl-select-time-bottom">
					<div class="sl-select-time-time">
						<div class="sl-select-time-placeholder"></div>
						<div>{{ item.data.caption }}</div>
					</div>
					<div class="sl-select-time-placeholder"></div>
					<div class="sl-select-time-price">{{currency}}{{ item.data.price }}</div>
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
import SmallButton from '../../components/SmallButton.vue'
import PageBody from '../../components/PageBody.vue'
import PageHeader from '../../components/PageHeader.vue'
import ScrollBox from '../../components/ScrollBox.vue'
import PaddingBox from '../../components/PaddingBox.vue'
import { useAppStore } from '../../store'
import { getPrice } from '../../api'
import { log } from '../../logger'
import type { Ui } from '../../types'
import { currency } from '../../config'

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

const times = ref([
	{ time: 1,    caption: '1 hour' },
	{ time: 3,    caption: '3 hours' },
	{ time: 6,    caption: '6 hours' },
	{ time: 8,    caption: '8 hours' },
	{ time: 10,   caption: '10 hours' },
	{ time: 12,   caption: '12 hours' },
	{ time: 15,   caption: '15 hours' },
	{ time: 20,   caption: '20 hours' },
	{ time: 24,   caption: '24 hours' },
	{ time: '2d' as string | number, caption: '2 days' },
	{ time: '3d' as string | number, caption: '3 days' },
	{ time: '4d' as string | number, caption: '4 days' },
	{ time: '5d' as string | number, caption: '5 days' }
])
const price = ref<number | null>(null)

const buttons = computed(() => {
	return times.value.map(({ time, caption }) => {
		let hours: string | number = time
		if (typeof time === 'string' && /^[0-9]+d$/.test(time)) {
			hours = parseInt(time) * 24
		}
		return {
			data: { time, caption, price: (hours as number) * price.value! },
			disabled: false
		}
	})
})

onMounted(() => {
	init()
})

async function init() {
	if (store.size === null) {
		props.ui?.jump('InternalError')
		return
	}
	try {
		props.ui?.setFooter?.('Storage time from 1 hour to 5 days')
		price.value = await getPrice(store.size)
	} catch (e) {
		log('error', 'getPrice failed', { size: store.size, error: String(e) })
		props.ui?.jump('InternalError')
	}
}

function click({ time, caption, price: p }: { time: string | number, caption: string, price: number }) {
	store.time = time
	store.priceTotal = p
	store.caption = caption

	switch (store.action) {
		case 'begin': return props.ui?.jump('Info', 'left')
		case 'extend': return props.ui?.jump('Pay', 'left')
	}
}

function back() {
	switch (store.action) {
		case 'begin': return props.ui?.jump('SizeCell', 'right')
		case 'extend': return props.ui?.jump('InputCode', 'right')
	}
}
</script>

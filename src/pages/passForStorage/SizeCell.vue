<template>
  <page-body class="sl-size-cell-main">
    <padding-box>
      <page-header title="Select cell type"/>
    </padding-box>
	<ScrollBox :items="buttons" @click="click">
		<template #default="{ item }">
			<div class="sl-size-button-wrapper">
				<div class="sl-size-button-size">{{ item.data.id }}</div>
				<div class="sl-size-button-placeholder"></div>
				<div class="sl-size-button-bottom">
					<div class="sl-size-button-symbol"></div>
					<div class="sl-size-button-placeholder"></div>
					<div class="sl-size-button-price">{{currency}}{{ item.data.price }}</div>
				</div>
			</div>
		</template>
	</ScrollBox>
    <padding-box class="u-mt-20">
    	<small-button @click="ui?.jump('MainMenu','right')">Back</small-button>
    </padding-box>
  </page-body>  
</template>
<style scoped>
.sl-size-cell-main{
	text-align:left
}
.sl-size-button-wrapper{
	width:100%;
	height:100%;
	display:flex;
	flex-direction:column
}
.sl-size-button-size{
	font-size:4vw;
	text-align:left
}
.sl-size-button-placeholder{
	flex:1
}
.sl-size-button-bottom{
	display:flex;
	flex-direction:row;
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
import * as api from '../../api'
import { log } from '../../logger'
import type { SizeKey } from '../../api'
import type { Ui } from '../../types'
import { currency } from '../../config'

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

const sizes = ref<{ available: boolean; price: number; id: SizeKey }[] | null>(null)

const buttons = computed(() => {
	if (!sizes.value) return []
	return sizes.value.map(data => ({
		data,
		disabled: !data.available
	}))
})

onMounted(() => {
	init()
})

async function init() {
	try {
		const freeSizes = await api.getFreeSizes()
		const [xlPrice, lPrice, mPrice] = await Promise.all([
			api.getPrice('XL'),
			api.getPrice('L'),
			api.getPrice('M'),
		])
		sizes.value = [
			{ available: freeSizes.XL, price: xlPrice, id: 'XL' },
			{ available: freeSizes.L, price: lPrice, id: 'L' },
			{ available: freeSizes.M, price: mPrice, id: 'M' },
		]
	} catch (e) {
		log('error', 'getFreeSizes/getPrice failed', { error: String(e) })
		props.ui?.jump('InternalError')
	}
}

async function click(event: { id: SizeKey; price: number; available: boolean }) {
	store.size = event.id
	store.action = 'begin'
	props.ui?.jump('SelectTimeStorage', 'left')
}
</script>

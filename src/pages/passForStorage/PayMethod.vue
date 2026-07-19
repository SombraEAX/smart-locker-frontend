<template>
	<page-body>
	<padding-box class="sl-pb">
		<div class="sl-mp-global">
			<div class="sl-mp-l">
			<Tile
				class="sl-mp-mt"
				color="black"
				:disabled="true"
			>
				<div class="u-flex-1"></div>
				<div class="sl-mp-mt3">Pay with<br/>cash</div>
			</Tile>
		</div>
		<div class="sl-mp-r">
			<Tile color="accent" class="sl-mp-tile u-mb-half" @click="ui?.jump('Pay','left')"> 
				<div class="u-flex-1"></div>
				<div>Pay with<br/>card</div>
			</Tile>
			<Tile color="black" class="sl-mp-tile u-mt-half" :disabled="true">
				<div class="u-flex-1"></div>
					<div>Pay with<br/>AliPay</div>
				</Tile>
			</div>
		</div>
		<div class="sl-pm-bottom">
    		<small-button @click="back" class="u-mr-10">Back</small-button>
		</div>
	</padding-box>
	</page-body>
</template>
<style scoped>
	.sl-pm-bottom{
		text-align:left;
		padding-top:20px;
		padding-bottom:0px
	}
	.sl-pb{
		height:100%;
		display:flex;
		flex-direction:column	
	}
	
	.sl-mp-mt{
		width:100%;
		height:100%;
		display:flex;
		flex-direction:column;
		text-align:left
	}

	.sl-mp-mt3{
		font-size:5vw
	}
	
	.sl-mp-tile{
		flex:1;
		width:100%;
		display:flex;
		flex-direction:column;
		text-align:left;
	}
	
	.sl-mp-global{
		width:100%;
		height:80%;
		display:flex
	}

	.sl-mp-r{
		flex:1;
		display:flex;
		flex-direction:column;
		padding-left:1vw
	}
	
	.sl-mp-l{
		width:55%;
	}
</style>
<script lang="ts" setup>
import Tile from '../../components/Tile.vue'
import PaddingBox from '../../components/PaddingBox.vue'
import SmallButton from '../../components/SmallButton.vue'
import PageBody from '../../components/PageBody.vue'
import { useAppStore } from '../../store'
import type { Ui } from '../../types'

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

function back() {
	props.ui?.jump(store.back, 'right')
}
</script>

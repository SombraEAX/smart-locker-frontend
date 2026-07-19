<script setup lang="ts">
import { ref } from 'vue'
import Scroller from './Scroller.vue'
import type { Ui } from '../types'

defineProps<{ content: string }>()

const footer = ref<string | null>(null)
const scroller = ref<InstanceType<typeof Scroller> | null>(null)

function setFooter(text: string) {
	footer.value = text
}

function jump(component: string, direction: string) {
	footer.value = ''
	scroller.value?.jump(component, direction)
}

defineExpose<Ui>({ jump, setFooter })
</script>

<template>
	<div class="sl-global">
		<div class="sl-main" ref="main">
			<Scroller
				:content="content"
				ref="scroller"
				:ui="{setFooter,jump}"
			/>
		</div>
		<div class="sl-info" v-if="footer">{{footer}}</div>
	</div>
</template>

<style scoped>
.sl-global{
	height:100%;
	background:#fff;
	color:#000;
	display:flex;
	flex-direction:column
}
.sl-main{
	flex:1;
	padding-top:5vh;
}
.sl-info{
	background:#000099;
	text-align:center;
	font-size:3vh;
	padding:1.5vh;
	color:#fff;
	position:fixed;
	left:0px;
	bottom:0px;
	right:0px;
	font-style:italic
}
</style>

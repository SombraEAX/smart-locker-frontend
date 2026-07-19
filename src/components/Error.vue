<template>
	<div class="sl-error">
		<div class="sl-error-message">
			<div>
				<slot></slot>
			</div>
		</div>
		<div class="sl-error-footer">
			<SmallButton :primary="true" @click="goback">Back</SmallButton>
		</div>
	</div>
</template>
<style scoped>
	.sl-error{
		width:100%;
		height:100%;
		display:flex;
		flex-direction:column
	}
	.sl-error-message{
		display:flex;
		flex:1
	}
	.sl-error-message>div{
		margin:auto;
		text-align:center;
		font-size:3vw
	}
	.sl-error-footer{
		text-align:center;
		padding:5vw
	}
</style>
<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue'
import SmallButton from './SmallButton.vue'
import type { Ui } from '../types'

const props = defineProps<{ back?: string; ui?: Ui }>()

let _autoTimer: ReturnType<typeof setTimeout> | null = null

function goback() {
	if (_autoTimer) clearTimeout(_autoTimer)
	if (props.back && props.ui) props.ui.jump(props.back, 'right')
}

onMounted(() => {
	_autoTimer = setTimeout(
		() => goback(),
		5000
	)
})

onBeforeUnmount(() => {
	if (_autoTimer) clearTimeout(_autoTimer)
})
</script>

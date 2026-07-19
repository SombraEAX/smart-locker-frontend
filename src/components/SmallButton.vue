<template>
	<button class="sl-small-button" :class="{primary}" @click="emit('click')" :disabled="disabled">
		<slot></slot>
	</button>
</template>
<style scoped>
	.sl-small-button{
		border-radius:10px;
		font-size:2.4vw;
		padding-left:2vw;
		padding-right:2vw;
		padding-top:1vw;
		padding-bottom:1vw;
		border:1px solid;
		color:#000;
		background:transparent
	}
	
	.sl-small-button:active{
		color:red	
	}

	.sl-small-button.primary{
		background:#000099;
		border:0px;
		color:#fff
	}

	.sl-small-button.primary:active{
		background:#000077
	}

	.sl-small-button[disabled]{
		background:#ccc;
		border:0px;
		color:#fff
	}
</style>
<script lang="ts" setup>
defineProps<{ primary?: boolean; disabled?: boolean }>()
const emit = defineEmits<{ click: [] }>()
</script>

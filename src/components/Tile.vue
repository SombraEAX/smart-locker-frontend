<script setup lang="ts">
defineProps<{ color?: string; disabled?: boolean }>()
const emit = defineEmits<{ click: [] }>()
</script>

<template>
	<button class="sl-tile" :class="color" :disabled="disabled" @click="emit('click')">
		<slot></slot>
	</button>
</template>

<style scoped>
.sl-tile{
	border-radius:10px;
	border:0px;
	color:#fff;
	font-size:3vw;
	box-sizing:border-box;
	padding:2vw
}

.black{
	background: #000099;
	background: linear-gradient(222deg, #000099 0%, #0000ff 35%, #000099 100%); 
}

.black:active{
	background: #000055;
	background: linear-gradient(222deg, #000055 0%, #0000cc 35%, #000055 100%); 
}

.accent{
	background: #800080;
	background: linear-gradient(222deg, #800080 0%, #ff00ff 35%, #800080 100%); 
}

.accent:active{
	background: #aa00aa;
	background: linear-gradient(222deg, #800080 0%, #aa00aa 35%, #800080 100%); 
}

.sl-tile[disabled]{
	background:grey !important
}
</style>

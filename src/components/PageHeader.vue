<template>
	<div class="sl-title"><slot>{{title}}</slot></div>
</template>
<style scoped>
	.sl-title{
		font-size:5vw;
	}
</style>
<script lang="ts" setup>
defineProps<{ title?: string }>()
</script>

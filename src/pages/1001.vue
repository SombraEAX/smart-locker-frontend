<template>
	<ErrorComponent :ui="ui" back="MainMenu">
		<h1>Error 1001</h1>
		<div>Please contact the service department</div>
	</ErrorComponent>
</template>
<script lang="ts" setup>
import ErrorComponent from '../components/Error.vue'
import type { Ui } from '../types'

defineProps<{ ui?: Ui }>()
</script>

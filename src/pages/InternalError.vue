<template>
	<ErrorComponent :ui="ui" back="MainMenu">
		A service error has occurred.<br/>
		Try again later.
	</ErrorComponent>
</template>
<script lang="ts" setup>
import ErrorComponent from '../components/Error.vue'
import type { Ui } from '../types'

defineProps<{ ui?: Ui }>()
</script>

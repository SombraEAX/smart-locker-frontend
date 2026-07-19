<template>
	<ErrorComponent :ui="ui" back="InputCode">
		Invalid code
	</ErrorComponent>
</template>
<script lang="ts" setup>
import ErrorComponent from '../components/Error.vue'
import type { Ui } from '../types'

defineProps<{ ui?: Ui }>()
</script>

<template>
	<ErrorComponent :ui="ui" :back="back">
		Insufficient funds for this operation
	</ErrorComponent>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import ErrorComponent from '../components/Error.vue'
import { useAppStore } from '../store'
import type { Ui } from '../types'

defineProps<{ ui?: Ui }>()
const store = useAppStore()

const back = ref<string | undefined>(undefined)

onMounted(() => {
	back.value = store.back
})
</script>

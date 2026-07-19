<template>
  <numeric-input
    title="Enter phone number:"
    :displayValue="title"
    cancelTarget="Info"
    :complete="complete"
    :ui="ui"
    @input="input"
    @backspace="backspace"
    @clear="clear"
    @next="next"
  />
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import NumericInput from '../components/NumericInput.vue'
import { useAppStore } from '../store'
import { phonePrefix } from '../config'
import type { Ui } from '../types'

const PHONE_LENGTH = 10

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

const phone = ref('')

const complete = computed(() => phone.value.length === PHONE_LENGTH)

const title = computed(() => {
	const v = phone.value
	return phonePrefix + ' '
		+ (v[0] ? '(' + v[0] : '')
		+ (v[1] || '')
		+ (v[2] ? v[2] + ') ' : '')
		+ (v[3] || '')
		+ (v[4] || '')
		+ (v[5] || '')
		+ (v[6] ? '-' + v[6] : '')
		+ (v[7] || '')
		+ (v[8] ? '-' + v[8] : '')
		+ (v[9] || '')
})

function next() {
	store.phone = phone.value
	props.ui?.jump('Pay', 'left')
}

function input(value: string | undefined) {
	if (phone.value.length === PHONE_LENGTH || !value) return
	phone.value += value
}

function backspace() {
	phone.value = phone.value.slice(0, -1)
}

function clear() {
	phone.value = ''
}
</script>

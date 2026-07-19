<template>
  <numeric-input
    title="Enter code:"
    :displayValue="code"
    cancelTarget="SelectCell"
    :complete="complete"
    :centered="true"
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
import * as api from '../api'
import { log } from '../logger'
import type { Ui } from '../types'

const CODE_LENGTH = 4

const props = defineProps<{ ui?: Ui }>()
const store = useAppStore()

const code = ref('')

const complete = computed(() => code.value.length === CODE_LENGTH)

async function next() {
	try {
		const { status, cell } = await api.checkCode(code.value)
		if (status === 'ok') {
			store.cellid = cell
			if (store.action === 'extend') {
				store.size = await api.getSizeByCellId(store.cellid)
				props.ui?.jump('SelectTimeStorage', 'left')
			} else {
				await api.getCellData(store.cellid)
				props.ui?.jump('Confirm', 'left')
			}
		} else if (status === 'not found') {
			props.ui?.jump('BadCode', 'left')
		} else {
			props.ui?.jump('InternalError', 'left')
		}
	} catch (e) {
		log('error', 'checkCode failed', { code: code.value, error: String(e) })
		props.ui?.jump('InternalError', 'left')
	}
}

function input(value: string | undefined) {
	if (code.value.length === CODE_LENGTH || !value) return
	code.value += value
}

function backspace() {
	code.value = code.value.slice(0, -1)
}

function clear() {
	code.value = ''
}
</script>

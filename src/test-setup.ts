import { beforeEach } from 'vitest'
import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

config.global.stubs = {}

beforeEach(() => {
  setActivePinia(createPinia())
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import InputPhone from '../InputPhone.vue'

function makeUi() {
  return { jump: vi.fn(), setFooter: vi.fn() }
}

describe('InputPhone', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  function mountPage(ui = makeUi()) {
    return mount(InputPhone, { props: { ui } })
  }

  it('renders title', () => {
    const wrapper = mountPage()
    expect(wrapper.text()).toContain('Enter phone number:')
  })

  it('renders phone prefix', () => {
    const wrapper = mountPage()
    expect(wrapper.text()).toContain('+7')
  })

  it('renders cancel and next buttons', () => {
    const wrapper = mountPage()
    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Next')
  })

  it('next button is disabled when phone is incomplete', () => {
    const wrapper = mountPage()
    const nextBtn = wrapper.findAll('button').find(b => b.text().includes('Next'))!
    expect(nextBtn.attributes('disabled')).toBeDefined()
  })

  it('input appends to phone', async () => {
    const wrapper = mountPage()
    const vm = wrapper.vm as any
    vm.input('9')
    vm.input('0')
    vm.input('0')
    await wrapper.vm.$nextTick()
    expect(vm.phone).toBe('900')
  })

  it('input ignores after 10 digits', async () => {
    const wrapper = mountPage()
    const vm = wrapper.vm as any
    for (let i = 0; i < 12; i++) vm.input(String(i))
    await wrapper.vm.$nextTick()
    expect(vm.phone).toHaveLength(10)
  })

  it('backspace removes last digit', async () => {
    const wrapper = mountPage()
    const vm = wrapper.vm as any
    vm.input('1')
    vm.input('2')
    vm.backspace()
    await wrapper.vm.$nextTick()
    expect(vm.phone).toBe('1')
  })

  it('clear resets phone', async () => {
    const wrapper = mountPage()
    const vm = wrapper.vm as any
    vm.input('1')
    vm.input('2')
    vm.clear()
    await wrapper.vm.$nextTick()
    expect(vm.phone).toBe('')
  })

  it('next button enabled when 10 digits entered', async () => {
    const wrapper = mountPage()
    const vm = wrapper.vm as any
    for (let i = 0; i < 10; i++) vm.input(String(i))
    await wrapper.vm.$nextTick()
    const nextBtn = wrapper.findAll('button').find(b => b.text().includes('Next'))!
    expect(nextBtn.attributes('disabled')).toBeUndefined()
  })

  it('formats phone number with prefix and parentheses', async () => {
    const wrapper = mountPage()
    const vm = wrapper.vm as any
    vm.input('9')
    vm.input('0')
    vm.input('5')
    vm.input('1')
    vm.input('2')
    vm.input('3')
    vm.input('4')
    vm.input('5')
    vm.input('6')
    vm.input('7')
    await wrapper.vm.$nextTick()
    expect(vm.title).toBe('+7 (905) 123-45-67')
  })

  it('saves phone to store and navigates on next', async () => {
    const ui = makeUi()
    const wrapper = mountPage(ui)
    const vm = wrapper.vm as any

    for (let i = 0; i < 10; i++) vm.input(String(i))
    await vm.next()

    const store = (await import('../../store')).useAppStore()
    expect(store.phone).toBe('0123456789')
    expect(ui.jump).toHaveBeenCalledWith('Pay', 'left')
  })

  it('navigates to Info on cancel', async () => {
    const ui = makeUi()
    const wrapper = mountPage(ui)
    const cancelBtn = wrapper.findAll('button').find(b => b.text().includes('Cancel'))!
    await cancelBtn.trigger('click')
    expect(ui.jump).toHaveBeenCalledWith('Info', 'right')
  })
})

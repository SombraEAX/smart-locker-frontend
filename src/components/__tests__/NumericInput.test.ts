import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NumericInput from '../NumericInput.vue'

function makeUi() {
  return { jump: vi.fn(), setFooter: vi.fn() }
}

describe('NumericInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent(props = {}) {
    return mount(NumericInput, {
      props: {
        title: 'Test Title',
        displayValue: '123',
        cancelTarget: 'MainMenu',
        complete: false,
        ui: makeUi(),
        ...props,
      },
    })
  }

  it('renders title', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Test Title')
  })

  it('renders displayValue', () => {
    const wrapper = mountComponent({ displayValue: '456' })
    expect(wrapper.find('.sl-ip-phone').text()).toBe('456')
  })

  it('renders cancel and next buttons', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Next')
  })

  it('next button is disabled when complete is false', () => {
    const wrapper = mountComponent({ complete: false })
    const nextBtn = wrapper.findAll('button').find(b => b.text().includes('Next'))!
    expect(nextBtn.attributes('disabled')).toBeDefined()
  })

  it('next button is enabled when complete is true', () => {
    const wrapper = mountComponent({ complete: true })
    const nextBtn = wrapper.findAll('button').find(b => b.text().includes('Next'))!
    expect(nextBtn.attributes('disabled')).toBeUndefined()
  })

  it('emits input event', async () => {
    const wrapper = mountComponent()
    const keyboard = wrapper.findComponent({ name: 'NewKeyboard' })
    keyboard.vm.$emit('input', '5')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('input')).toBeTruthy()
  })

  it('emits backspace event', async () => {
    const wrapper = mountComponent()
    const keyboard = wrapper.findComponent({ name: 'NewKeyboard' })
    keyboard.vm.$emit('backspace')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('backspace')).toBeTruthy()
  })

  it('emits clear event', async () => {
    const wrapper = mountComponent()
    const keyboard = wrapper.findComponent({ name: 'NewKeyboard' })
    keyboard.vm.$emit('clear')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('clear')).toBeTruthy()
  })

  it('emits next event on Next button click', async () => {
    const wrapper = mountComponent({ complete: true })
    const nextBtn = wrapper.findAll('button').find(b => b.text().includes('Next'))!
    await nextBtn.trigger('click')
    expect(wrapper.emitted('next')).toBeTruthy()
  })

  it('navigates to cancelTarget on Cancel click', async () => {
    const ui = makeUi()
    const wrapper = mountComponent({ ui, cancelTarget: 'MainMenu' })
    const cancelBtn = wrapper.findAll('button').find(b => b.text().includes('Cancel'))!
    await cancelBtn.trigger('click')
    expect(ui.jump).toHaveBeenCalledWith('MainMenu', 'right')
  })

  it('applies centered style when centered prop is true', () => {
    const wrapper = mountComponent({ centered: true })
    const phone = wrapper.find('.sl-ip-phone')
    expect(phone.attributes('style')).toContain('text-align: center')
  })

  it('applies left style when centered prop is false', () => {
    const wrapper = mountComponent({ centered: false })
    const phone = wrapper.find('.sl-ip-phone')
    expect(phone.attributes('style')).toContain('text-align: left')
  })
})

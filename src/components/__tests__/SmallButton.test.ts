import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SmallButton from '../SmallButton.vue'

describe('SmallButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(SmallButton, { slots: { default: 'Click me' } })
    expect(wrapper.text()).toBe('Click me')
  })

  it('emits click on click', async () => {
    const wrapper = mount(SmallButton, { slots: { default: 'OK' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('applies primary class when primary prop is true', () => {
    const wrapper = mount(SmallButton, { props: { primary: true } })
    expect(wrapper.find('button').classes()).toContain('primary')
  })

  it('does not apply primary class by default', () => {
    const wrapper = mount(SmallButton)
    expect(wrapper.find('button').classes()).not.toContain('primary')
  })

  it('disables button when disabled prop is true', () => {
    const wrapper = mount(SmallButton, { props: { disabled: true } })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(SmallButton, { props: { disabled: true }, slots: { default: 'No' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('button is enabled by default', () => {
    const wrapper = mount(SmallButton)
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })
})

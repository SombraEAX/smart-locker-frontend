import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PaddingBox from '../PaddingBox.vue'

describe('PaddingBox', () => {
  it('renders slot content', () => {
    const wrapper = mount(PaddingBox, { slots: { default: 'Content' } })
    expect(wrapper.text()).toBe('Content')
  })

  it('applies padding-box class', () => {
    const wrapper = mount(PaddingBox)
    expect(wrapper.find('.sl-padding-box').exists()).toBe(true)
  })

  it('renders nested children', () => {
    const wrapper = mount(PaddingBox, {
      slots: { default: '<div>Inner</div>' },
    })
    expect(wrapper.text()).toBe('Inner')
  })
})

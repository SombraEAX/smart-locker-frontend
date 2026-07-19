import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PageBody from '../PageBody.vue'

describe('PageBody', () => {
  it('renders slot content', () => {
    const wrapper = mount(PageBody, { slots: { default: 'Body content' } })
    expect(wrapper.text()).toBe('Body content')
  })

  it('applies global layout class', () => {
    const wrapper = mount(PageBody)
    expect(wrapper.find('.sl-p-global').exists()).toBe(true)
  })
})

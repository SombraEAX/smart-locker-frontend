import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Tile from '../Tile.vue'

describe('Tile', () => {
  it('renders slot content', () => {
    const wrapper = mount(Tile, { slots: { default: 'Hello' } })
    expect(wrapper.text()).toBe('Hello')
  })

  it('emits click on click', async () => {
    const wrapper = mount(Tile)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('applies color class', () => {
    const wrapper = mount(Tile, { props: { color: 'accent' } })
    expect(wrapper.find('button').classes()).toContain('accent')
  })

  it('applies black class', () => {
    const wrapper = mount(Tile, { props: { color: 'black' } })
    expect(wrapper.find('button').classes()).toContain('black')
  })

  it('has no color class by default', () => {
    const wrapper = mount(Tile)
    expect(wrapper.find('button').classes()).not.toContain('accent')
    expect(wrapper.find('button').classes()).not.toContain('black')
  })

  it('passes disabled to button', () => {
    const wrapper = mount(Tile, { props: { disabled: true } })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('renders multiple children in slot', () => {
    const wrapper = mount(Tile, {
      slots: {
        default: '<span>42</span><span>FREE</span>',
      },
    })
    expect(wrapper.text()).toContain('42')
    expect(wrapper.text()).toContain('FREE')
  })
})

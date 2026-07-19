import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Error from '../Error.vue'

describe('Error', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders slot content', () => {
    const wrapper = mount(Error, { slots: { default: 'Something went wrong' } })
    expect(wrapper.text()).toContain('Something went wrong')
  })

  it('renders back button', () => {
    const wrapper = mount(Error)
    expect(wrapper.text()).toContain('Back')
  })

  it('auto-navigates back after 5 seconds when back and ui props are provided', async () => {
    const ui = { jump: vi.fn(), setFooter: vi.fn() }
    mount(Error, {
      props: { back: 'MainMenu', ui },
    })

    expect(ui.jump).not.toHaveBeenCalled()

    vi.advanceTimersByTime(5000)

    expect(ui.jump).toHaveBeenCalledWith('MainMenu', 'right')
  })

  it('does not auto-navigate when back prop is missing', async () => {
    const ui = { jump: vi.fn(), setFooter: vi.fn() }
    mount(Error, { props: { ui } })

    vi.advanceTimersByTime(5000)

    expect(ui.jump).not.toHaveBeenCalled()
  })

  it('does not auto-navigate when ui prop is missing', async () => {
    mount(Error, { props: { back: 'MainMenu' } })

    vi.advanceTimersByTime(5000)
  })

  it('navigates back on button click', async () => {
    const ui = { jump: vi.fn(), setFooter: vi.fn() }
    const wrapper = mount(Error, {
      props: { back: 'MainMenu', ui },
    })

    await wrapper.find('button').trigger('click')

    expect(ui.jump).toHaveBeenCalledWith('MainMenu', 'right')
  })

  it('click clears auto-navigate timer', async () => {
    const ui = { jump: vi.fn(), setFooter: vi.fn() }
    const wrapper = mount(Error, {
      props: { back: 'MainMenu', ui },
    })

    await wrapper.find('button').trigger('click')
    vi.advanceTimersByTime(5000)

    expect(ui.jump).toHaveBeenCalledTimes(1)
  })
})

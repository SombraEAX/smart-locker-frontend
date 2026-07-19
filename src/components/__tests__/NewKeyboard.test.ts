import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NewKeyboard from '../NewKeyboard.vue'

describe('NewKeyboard', () => {
  function mountKeyboard(props = {}) {
    return mount(NewKeyboard, {
      props: {
        row1: '1 2 3',
        row2: '4 5 6',
        row3: '7 8 9',
        row4: 'backspace 0 clear',
        clear: 'X',
        backspace: '⌫',
        ...props,
      },
    })
  }

  it('renders correct number of rows', () => {
    const wrapper = mountKeyboard()
    const rows = wrapper.findAll('.keyboard-row')
    expect(rows).toHaveLength(4)
  })

  it('renders correct buttons per row', () => {
    const wrapper = mountKeyboard()
    const buttons = wrapper.findAll('.keyboard-button')
    expect(buttons).toHaveLength(12)
  })

  it('renders button labels from row props', () => {
    const wrapper = mountKeyboard()
    const buttons = wrapper.findAll('.keyboard-button')
    expect(buttons[0].text()).toBe('1')
    expect(buttons[1].text()).toBe('2')
    expect(buttons[2].text()).toBe('3')
  })

  it('renders custom clear and backspace labels', () => {
    const wrapper = mountKeyboard()
    const buttons = wrapper.findAll('.keyboard-button')
    expect(buttons[9].text()).toBe('⌫')
    expect(buttons[11].text()).toBe('X')
  })

  it('emits input with data-value on button click', async () => {
    const wrapper = mountKeyboard()
    await wrapper.findAll('.keyboard-button')[0].trigger('click')
    expect(wrapper.emitted('input')).toHaveLength(1)
    expect(wrapper.emitted('input')![0]).toEqual(['1'])
  })

  it('emits backspace on backspace click', async () => {
    const wrapper = mountKeyboard()
    await wrapper.findAll('.keyboard-button')[9].trigger('click')
    expect(wrapper.emitted('backspace')).toHaveLength(1)
  })

  it('emits clear on clear click', async () => {
    const wrapper = mountKeyboard()
    await wrapper.findAll('.keyboard-button')[11].trigger('click')
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('emits input for digit 0', async () => {
    const wrapper = mountKeyboard()
    await wrapper.findAll('.keyboard-button')[10].trigger('click')
    expect(wrapper.emitted('input')![0]).toEqual(['0'])
  })

  it('emits mousedown on button press', async () => {
    const wrapper = mountKeyboard()
    await wrapper.findAll('.keyboard-button')[0].trigger('mousedown')
    expect(wrapper.emitted('mousedown')).toHaveLength(1)
  })

  it('emits mouseup on window mouseup', async () => {
    const wrapper = mountKeyboard()
    window.dispatchEvent(new MouseEvent('mouseup'))
    expect(wrapper.emitted('mouseup')).toHaveLength(1)
  })

  it('supports buttonsParams with custom caption', () => {
    const wrapper = mountKeyboard({
      buttonsParams: { '1': { caption: 'One' } },
    })
    const buttons = wrapper.findAll('.keyboard-button')
    expect(buttons[0].text()).toBe('One')
  })

  it('supports buttonsParams with flex', () => {
    const wrapper = mountKeyboard({
      buttonsParams: { '0': { flex: 2 } },
    })
    const buttons = wrapper.findAll('.keyboard-button')
    const btn0 = buttons.find(b => b.text() === '0')!
    expect(btn0.attributes('style')).toContain('flex-grow: 2')
  })

  it('renders only defined rows', () => {
    const wrapper = mount(NewKeyboard, {
      props: {
        row1: 'a b',
        row2: 'c d',
      },
    })
    expect(wrapper.findAll('.keyboard-row')).toHaveLength(2)
  })

  it('splits rows by spaces correctly', () => {
    const wrapper = mount(NewKeyboard, {
      props: {
        row1: '1  2   3',
      },
    })
    const buttons = wrapper.findAll('.keyboard-button')
    expect(buttons).toHaveLength(3)
  })

  it('applies background and textcolor styles', () => {
    const wrapper = mountKeyboard({
      background: '#ff0000',
      textcolor: '#ffffff',
    })
    const button = wrapper.findAll('.keyboard-button')[0]
    const style = button.attributes('style')
    expect(style).toContain('background: #ff0000')
    expect(style).toContain('color: #ffffff')
  })

  it('applies active styles on mousedown', async () => {
    const wrapper = mountKeyboard({
      activeBackground: '#00ff00',
      activeTextcolor: '#000000',
    })
    await wrapper.findAll('.keyboard-button')[0].trigger('mousedown')
    const style = wrapper.findAll('.keyboard-button')[0].attributes('style')
    expect(style).toContain('background: #00ff00')
    expect(style).toContain('color: #000000')
  })

  it('applies custom fontSize', () => {
    const wrapper = mountKeyboard({ fontSize: '20px' })
    const button = wrapper.findAll('.keyboard-button')[0]
    expect(button.attributes('style')).toContain('font-size: 20px')
  })
})

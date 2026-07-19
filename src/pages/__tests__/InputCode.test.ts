import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import InputCode from '../InputCode.vue'
import * as api from '../../api'

vi.mock('../../api', () => ({
  checkCode: vi.fn(),
  getSizeByCellId: vi.fn(),
  getCellData: vi.fn(),
}))

const checkCodeMock = vi.mocked(api.checkCode)
const getSizeByCellIdMock = vi.mocked(api.getSizeByCellId)
const getCellDataMock = vi.mocked(api.getCellData)

function makeUi() {
  return { jump: vi.fn(), setFooter: vi.fn() }
}

describe('InputCode', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  function mountPage(ui = makeUi()) {
    return mount(InputCode, { props: { ui } })
  }

  it('renders title', () => {
    const wrapper = mountPage()
    expect(wrapper.text()).toContain('Enter code:')
  })

  it('renders empty code display initially', () => {
    const wrapper = mountPage()
    expect(wrapper.find('.sl-ip-phone').text()).toBe('')
  })

  it('renders cancel and next buttons', () => {
    const wrapper = mountPage()
    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Next')
  })

  it('next button is disabled when code is empty', () => {
    const wrapper = mountPage()
    const nextBtn = wrapper.findAll('button').find(b => b.text().includes('Next'))!
    expect(nextBtn.attributes('disabled')).toBeDefined()
  })

  it('input appends to code', async () => {
    const wrapper = mountPage()
    const vm = wrapper.vm as any
    vm.input('1')
    vm.input('2')
    vm.input('3')
    vm.input('4')
    await wrapper.vm.$nextTick()
    expect(vm.code).toBe('1234')
  })

  it('input ignores after 4 digits', async () => {
    const wrapper = mountPage()
    const vm = wrapper.vm as any
    vm.input('1')
    vm.input('2')
    vm.input('3')
    vm.input('4')
    vm.input('5')
    await wrapper.vm.$nextTick()
    expect(vm.code).toBe('1234')
  })

  it('backspace removes last digit', async () => {
    const wrapper = mountPage()
    const vm = wrapper.vm as any
    vm.input('1')
    vm.input('2')
    vm.backspace()
    await wrapper.vm.$nextTick()
    expect(vm.code).toBe('1')
  })

  it('clear resets code', async () => {
    const wrapper = mountPage()
    const vm = wrapper.vm as any
    vm.input('1')
    vm.input('2')
    vm.clear()
    await wrapper.vm.$nextTick()
    expect(vm.code).toBe('')
  })

  it('next button enabled when 4 digits entered', async () => {
    const wrapper = mountPage()
    const vm = wrapper.vm as any
    vm.input('1')
    vm.input('2')
    vm.input('3')
    vm.input('4')
    await wrapper.vm.$nextTick()
    const nextBtn = wrapper.findAll('button').find(b => b.text().includes('Next'))!
    expect(nextBtn.attributes('disabled')).toBeUndefined()
  })

  it('navigates to Confirm on successful code check in begin mode', async () => {
    const ui = makeUi()
    const wrapper = mountPage(ui)
    const vm = wrapper.vm as any

    checkCodeMock.mockResolvedValue({ status: 'ok', cell: 5 })
    getCellDataMock.mockResolvedValue({ phone: '123', start: new Date(), code: '5555', end: new Date() })

    vm.input('1')
    vm.input('2')
    vm.input('3')
    vm.input('4')
    await vm.next()

    expect(checkCodeMock).toHaveBeenCalledWith('1234')
    expect(ui.jump).toHaveBeenCalledWith('Confirm', 'left')
  })

  it('navigates to BadCode on not found status', async () => {
    const ui = makeUi()
    const wrapper = mountPage(ui)
    const vm = wrapper.vm as any

    checkCodeMock.mockResolvedValue({ status: 'not found', cell: 1 })

    vm.input('0')
    vm.input('0')
    vm.input('0')
    vm.input('0')
    await vm.next()

    expect(ui.jump).toHaveBeenCalledWith('BadCode', 'left')
  })

  it('navigates to InternalError on api error', async () => {
    const ui = makeUi()
    const wrapper = mountPage(ui)
    const vm = wrapper.vm as any

    checkCodeMock.mockRejectedValue(new Error('network'))

    vm.input('1')
    vm.input('2')
    vm.input('3')
    vm.input('4')
    await vm.next()

    expect(ui.jump).toHaveBeenCalledWith('InternalError', 'left')
  })

  it('navigates to SelectTimeStorage in extend mode', async () => {
    const ui = makeUi()
    const wrapper = mountPage(ui)
    const vm = wrapper.vm as any

    const store = (await import('../../store')).useAppStore()
    store.action = 'extend'

    checkCodeMock.mockResolvedValue({ status: 'ok', cell: 3 })
    getSizeByCellIdMock.mockResolvedValue('L')

    vm.input('1')
    vm.input('2')
    vm.input('3')
    vm.input('4')
    await vm.next()

    expect(getSizeByCellIdMock).toHaveBeenCalledWith(3)
    expect(ui.jump).toHaveBeenCalledWith('SelectTimeStorage', 'left')
  })

  it('navigates to SelectCell on cancel', async () => {
    const ui = makeUi()
    const wrapper = mountPage(ui)
    const cancelBtn = wrapper.findAll('button').find(b => b.text().includes('Cancel'))!
    await cancelBtn.trigger('click')
    expect(ui.jump).toHaveBeenCalledWith('SelectCell', 'right')
  })
})

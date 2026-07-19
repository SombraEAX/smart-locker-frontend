import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '../../store'
import Confirm from '../Confirm.vue'
import * as api from '../../api'

vi.mock('../../api', () => ({
  getCellData: vi.fn(),
  fsize: vi.fn(),
  getPrice: vi.fn(),
  endStorage: vi.fn(),
}))

const getCellDataMock = vi.mocked(api.getCellData)

function makeUi() {
  return { jump: vi.fn(), setFooter: vi.fn() }
}

describe('Confirm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useAppStore().cellid = 1
    vi.clearAllMocks()
  })

  function mountPage(ui = makeUi()) {
    return mount(Confirm, {
      props: { ui },
      global: {
        stubs: {
          PageBody: { template: '<div class="sl-info-body"><slot /></div>' },
          PageHeader: { template: '<div><slot /></div>' },
          PaddingBox: { template: '<div><slot /></div>' },
          SmallButton: {
            template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['primary', 'disabled'],
          },
        },
      },
    })
  }

  it('shows loading initially (no status yet)', () => {
    getCellDataMock.mockReturnValue(new Promise(() => {}))
    const wrapper = mountPage()
    expect(wrapper.find('.sl-confirm-caption').exists()).toBe(false)
  })

  it('shows grace period message when within grace period', async () => {
    const now = Date.now()
    getCellDataMock.mockResolvedValue({
      phone: '123',
      start: new Date(now - 2 * 60 * 1000),
      code: '5555',
      end: new Date(now + 3600000),
    })
    const wrapper = mountPage()

    await flushPromises()

    expect(wrapper.text()).toContain('less than')
    expect(wrapper.text()).toContain('minutes ago')
  })

  it('shows overdue message when overdue', async () => {
    const now = Date.now()
    getCellDataMock.mockResolvedValue({
      phone: '123',
      start: new Date(now - 30 * 60 * 1000),
      code: '5555',
      end: new Date(now - 100),
    })
    const wrapper = mountPage()

    await flushPromises()

    expect(wrapper.text()).toContain('rental will be terminated')
  })

  it('shows Add items and Take and end rental buttons in grace period', async () => {
    const now = Date.now()
    getCellDataMock.mockResolvedValue({
      phone: '123',
      start: new Date(now - 2 * 60 * 1000),
      code: '5555',
      end: new Date(now + 3600000),
    })
    const wrapper = mountPage()

    await flushPromises()

    expect(wrapper.text()).toContain('Add items')
    expect(wrapper.text()).toContain('Take and end rental')
  })

  it('shows Cancel and Open buttons when overdue', async () => {
    const now = Date.now()
    getCellDataMock.mockResolvedValue({
      phone: '123',
      start: new Date(now - 30 * 60 * 1000),
      code: '5555',
      end: new Date(now - 100),
    })
    const wrapper = mountPage()

    await flushPromises()

    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Open')
  })

  it('navigates to MainMenu on cancel', async () => {
    const ui = makeUi()
    const now = Date.now()
    getCellDataMock.mockResolvedValue({
      phone: '123',
      start: new Date(now - 2 * 60 * 1000),
      code: '5555',
      end: new Date(now + 3600000),
    })
    const wrapper = mountPage(ui)

    await flushPromises()

    const cancelBtn = wrapper.findAll('button').find(b => b.text() === 'Cancel')!
    await cancelBtn.trigger('click')

    expect(ui.jump).toHaveBeenCalledWith('MainMenu', 'right')
  })

  it('navigates to OpenCell on Add items in grace period', async () => {
    const ui = makeUi()
    const now = Date.now()
    getCellDataMock.mockResolvedValue({
      phone: '123',
      start: new Date(now - 2 * 60 * 1000),
      code: '5555',
      end: new Date(now + 3600000),
    })
    const wrapper = mountPage(ui)

    await flushPromises()

    const addBtn = wrapper.findAll('button').find(b => b.text() === 'Add items')!
    await addBtn.trigger('click')

    expect(ui.jump).toHaveBeenCalledWith('OpenCell', 'left')
  })

  it('navigates to InternalError on API failure', async () => {
    const ui = makeUi()
    getCellDataMock.mockRejectedValue(new Error('fail'))
    mountPage(ui)

    await flushPromises()

    expect(ui.jump).toHaveBeenCalledWith('InternalError')
  })

  it('sets store cellid from store', async () => {
    const ui = makeUi()
    const now = Date.now()
    getCellDataMock.mockResolvedValue({
      phone: '123',
      start: new Date(now - 2 * 60 * 1000),
      code: '5555',
      end: new Date(now + 3600000),
    })

    const store = (await import('../../store')).useAppStore()
    store.cellid = 7

    mountPage(ui)
    await flushPromises()

    expect(getCellDataMock).toHaveBeenCalledWith(7)
  })
})

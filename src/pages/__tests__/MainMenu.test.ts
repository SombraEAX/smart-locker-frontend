import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import MainMenu from '../MainMenu.vue'
import * as api from '../../api'

vi.mock('../../api', () => ({
  getOccupiedCellsList: vi.fn(),
  getFreeCellsCount: vi.fn(),
}))

const getOccupiedCellsListMock = vi.mocked(api.getOccupiedCellsList)
const getFreeCellsCountMock = vi.mocked(api.getFreeCellsCount)

function makeUi() {
  return { jump: vi.fn(), setFooter: vi.fn() }
}

describe('MainMenu', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function mountPage(ui = makeUi()) {
    return mount(MainMenu, {
      props: { ui },
      global: {
        stubs: {
          PaddingBox: { template: '<div class="stub-padding"><slot /></div>' },
          Tile: {
            template: '<button class="stub-tile" :class="color" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['color', 'disabled'],
          },
        },
      },
    })
  }

  it('shows loading status initially', () => {
    getOccupiedCellsListMock.mockReturnValue(new Promise(() => {}))
    getFreeCellsCountMock.mockReturnValue(new Promise(() => {}))
    const wrapper = mountPage()
    expect(wrapper.text()).toContain('Loading...')
  })

  it('loads data and shows free cells when run() is called', async () => {
    getOccupiedCellsListMock.mockResolvedValue([1, 2])
    getFreeCellsCountMock.mockResolvedValue(10)
    const wrapper = mountPage()

    const vm = wrapper.vm as any
    vm.run()
    await flushPromises()

    expect(wrapper.text()).toContain('10')
    expect(wrapper.text()).toContain('FREE CELLS')
  })

  it('shows Extend rental and Open cell tiles when occupied', async () => {
    getOccupiedCellsListMock.mockResolvedValue([1, 2])
    getFreeCellsCountMock.mockResolvedValue(5)
    const wrapper = mountPage()

    ;(wrapper.vm as any).run()
    await flushPromises()

    expect(wrapper.text()).toContain('Extend')
    expect(wrapper.text()).toContain('rental')
    expect(wrapper.text()).toContain('Open')
  })

  it('hides right panel when no occupied cells', async () => {
    getOccupiedCellsListMock.mockResolvedValue([])
    getFreeCellsCountMock.mockResolvedValue(10)
    const wrapper = mountPage()

    ;(wrapper.vm as any).run()
    await flushPromises()

    expect(wrapper.text()).not.toContain('Extend')
    expect(wrapper.text()).not.toContain('Open')
  })

  it('disables rent tile when no free cells', async () => {
    getOccupiedCellsListMock.mockResolvedValue([])
    getFreeCellsCountMock.mockResolvedValue(0)
    const wrapper = mountPage()

    ;(wrapper.vm as any).run()
    await flushPromises()

    const rentTile = wrapper.findAll('.stub-tile').find(t => t.text().includes('FREE CELLS'))
    expect(rentTile).toBeDefined()
    expect(rentTile!.attributes('disabled')).toBeDefined()
  })

  it('shows error after timeout', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    getOccupiedCellsListMock.mockRejectedValue(new Error('fail'))
    getFreeCellsCountMock.mockRejectedValue(new Error('fail'))

    const wrapper = mountPage()
    ;(wrapper.vm as any).run()

    await vi.advanceTimersByTimeAsync(11000)

    expect(wrapper.text()).toContain('Internal service error')
    wrapper.unmount()
  })

  it('navigates to SizeCell on rent click', async () => {
    getOccupiedCellsListMock.mockResolvedValue([])
    getFreeCellsCountMock.mockResolvedValue(5)
    const ui = makeUi()
    const wrapper = mountPage(ui)

    ;(wrapper.vm as any).run()
    await flushPromises()

    const rentTile = wrapper.findAll('.stub-tile').find(t => t.text().includes('FREE CELLS'))
    expect(rentTile).toBeDefined()
    await rentTile!.trigger('click')

    expect(ui.jump).toHaveBeenCalledWith('SizeCell', 'left')
  })

  it('uses cached mainpage data on mount', async () => {
    const { useAppStore } = await import('../../store')
    const store = useAppStore()
    store.mainpage = { occupied: true, freeCells: 42 }

    const wrapper = mountPage()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('42')
    expect(wrapper.text()).toContain('FREE CELLS')
  })

  it('stores API results to store', async () => {
    getOccupiedCellsListMock.mockResolvedValue([1])
    getFreeCellsCountMock.mockResolvedValue(7)
    const wrapper = mountPage()

    ;(wrapper.vm as any).run()
    await flushPromises()

    const store = (await import('../../store')).useAppStore()
    expect(store.mainpage).toEqual({ occupied: true, freeCells: 7 })
  })
})

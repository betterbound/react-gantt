import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import isBetween from 'dayjs/plugin/isBetween'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import debounce from 'lodash/debounce'
import find from 'lodash/find'
import throttle from 'lodash/throttle'
import { action, computed, observable, runInAction, toJS } from 'mobx'
import type React from 'react'
import { createRef } from 'react'
import { HEADER_HEIGHT, TOP_PADDING } from './constants'
import type { GanttLocale, GanttProps as GanttProperties } from './Gantt'
import { defaultLocale } from './Gantt'
import { Gantt } from './types'
import { convertBar, convertItem, flattenDeep, getChildrenCount, transverseData } from './utils'

dayjs.extend(weekday)
dayjs.extend(weekOfYear)
dayjs.extend(quarterOfYear)
dayjs.extend(advancedFormat)
dayjs.extend(isBetween)
dayjs.extend(isLeapYear)
export const ONE_DAY_MS = 86400000
// 视图日视图、周视图、月视图、季视图、年视图
export const getViewTypeList = locale => {
  return [
    {
      type: 'day',
      label: locale.day,
      value: Gantt.ESightValues.day,
    },
    {
      type: 'week',
      label: locale.week,
      value: Gantt.ESightValues.week,
    },
    {
      type: 'week_in_month',
      label: locale.week_in_month,
      value: Gantt.ESightValues.week_in_month,
    },
    {
      type: 'month',
      label: locale.month,
      value: Gantt.ESightValues.month,
    },
    {
      type: 'quarter',
      label: locale.quarter,
      value: Gantt.ESightValues.quarter,
    },
    {
      type: 'halfYear',
      label: locale.halfYear,
      value: Gantt.ESightValues.halfYear,
    },
  ] as Gantt.SightConfig[]
}
function isRestDay(date: string) {
  const calc = [0, 6]
  return calc.includes(dayjs(date).weekday())
}

class GanttStore {
  constructor({
    rowHeight,
    disabled = false,
    customSights,
    locale,
    tableSize
  }: {
    rowHeight: number
    disabled: boolean
    customSights: Gantt.SightConfig[]
    locale: GanttLocale
    tableSize: { minWidth?: number; maxWidth?: number }
  }) {
    this.width = 1320
    this.height = 418
    this.viewTypeList = customSights.length ? customSights : getViewTypeList(locale)
    const sightConfig = customSights.length ? customSights[0] : getViewTypeList(locale)[0]
    const translateX = dayjs(this.getStartDate()).valueOf() / (sightConfig.value * 1000)
    const bodyWidth = this.width
    const viewWidth = 704
    const tableWidth = 500
    this.viewWidth = viewWidth
    this.tableWidth = tableSize?.minWidth || tableWidth
    this.translateX = translateX
    this.sightConfig = sightConfig
    this.bodyWidth = bodyWidth
    this.rowHeight = rowHeight
    this.disabled = disabled
    this.locale = locale
  }

  locale = { ...defaultLocale }

  _wheelTimer: number | undefined

  scrollTimer: number | undefined

  @observable data: Gantt.Item[] = []

  @observable originData: Gantt.Record[] = []

  @observable columns: Gantt.Column[] = []

  @observable dependencies: Gantt.Dependence[] = []

  @observable scrolling = false

  @observable scrollTop = 0

  @observable collapse = false

  @observable tableWidth: number

  @observable viewWidth: number

  @observable width: number

  @observable height: number

  @observable bodyWidth: number

  @observable translateX: number

  @observable sightConfig: Gantt.SightConfig

  @observable showSelectionIndicator = false

  @observable selectionIndicatorTop = 0

  @observable dragging: Gantt.Bar | null = null

  @observable draggingType: Gantt.MoveType | null = null

  @observable disabled = false

  viewTypeList = getViewTypeList(this.locale)

  gestureKeyPress = false

  mainElementRef = createRef<HTMLDivElement>()

  chartElementRef = createRef<HTMLDivElement>()

  isPointerPress = false

  startDateKey = 'startDate'

  endDateKey = 'endDate'

  autoScrollPos = 0

  clientX = 0

  rowHeight: number

  onUpdate: GanttProperties['onUpdate'] = () => Promise.resolve(true)

  isRestDay = isRestDay

  getStartDate() {
    return dayjs().subtract(10, 'day').toString()
  }
 
  getFirstDayOfLastMonth() {
    return dayjs().subtract(1, 'month').startOf('month').toString()
  }

  setIsRestDay(function_: (date: string) => boolean) {
    this.isRestDay = function_ || isRestDay
  }

  @action
  setData(data: Gantt.Record[], startDateKey: string, endDateKey: string) {
    this.startDateKey = startDateKey
    this.endDateKey = endDateKey
    this.originData = data
    this.data = transverseData(data, startDateKey, endDateKey)
  }

  @action
  toggleCollapse() {
    if (this.tableWidth > 0) {
      this.tableWidth = 0
      this.viewWidth = this.width - this.tableWidth
    } else {
      this.initWidth()
    }
  }

  @action
  setRowCollapse(item: Gantt.Item, collapsed: boolean) {
    item.collapsed = collapsed
    // this.barList = this.getBarList();
  }

  @action
  setOnUpdate(onUpdate: GanttProperties['onUpdate']) {
    this.onUpdate = onUpdate
  }

  @action
  setColumns(columns: Gantt.Column[]) {
    this.columns = columns
  }

  @action
  setDependencies(dependencies: Gantt.Dependence[]) {
    this.dependencies = dependencies
  }

  @action
  setHideTable(isHidden = false) {
    if (isHidden) {
      this.tableWidth = 0
      this.viewWidth = this.width - this.tableWidth
    } else {
      this.initWidth()
    }
  }

  @action
  handlePanMove(translateX: number) {
    this.scrolling = true
    this.setTranslateX(translateX)
  }

  @action
  handlePanEnd() {
    this.scrolling = false
  }

  @action syncSize(size: { width?: number; height?: number }) {
    if (!size.height || !size.width) return

    const { width, height } = size
    if (this.height !== height) this.height = height

    if (this.width !== width) {
      this.width = width
      this.initWidth()
    }
  }

  @action handleResizeTableWidth(width: number) {
    const columnsWidthArr = this.columns.filter(column => column.width > 0)
    if (this.columns.length === columnsWidthArr.length) return
    
    // デバッグ用：tableWidthの変更を追跡
    console.log('store - tableWidth changing:', {
      from: this.tableWidth,
      to: width,
      timestamp: new Date().toISOString()
    })

    runInAction(() => {
      this.tableWidth = width
      this.viewWidth = this.width - this.tableWidth
      // Force update of columnsWidth
      this.columns = [...this.columns]
    })
  }

  @action initWidth() {
    this.tableWidth = this.totalColumnWidth || 250
    this.viewWidth = this.width - this.tableWidth
    // 图表宽度不能小于 200
    if (this.viewWidth < 200) {
      this.viewWidth = 200
      this.tableWidth = this.width - this.viewWidth
    }
  }

  @action
  setTranslateX(translateX: number) {
    this.translateX = Math.max(translateX, 0)
  }

  @action switchSight(type: Gantt.Sight) {
    const target = find(this.viewTypeList, { type })
    if (target) {
      this.sightConfig = target
      if(target.type === 'week_in_month')
        this.setTranslateX(dayjs(this.getFirstDayOfLastMonth()).valueOf() / (target.value * 5000))
      else
        this.setTranslateX(dayjs(this.getStartDate()).valueOf() / (target.value * 1000))
    }
  }

  @action scrollToToday() {
    const translateX = this.todayTranslateX - this.viewWidth / 2
    this.setTranslateX(translateX)
  }

  @action updateBarListOrder(newOrder: Gantt.Bar[]) {
    this.data = convertItem(newOrder)
  }

  getTranslateXByDate(date: string) {
    return dayjs(date).startOf('day').valueOf() / this.pxUnitAmp
  }

  @computed get todayTranslateX() {
    return dayjs().startOf('day').valueOf() / this.pxUnitAmp
  }

  @computed get scrollBarWidth() {
    const MIN_WIDTH = 30
    return Math.max((this.viewWidth / this.scrollWidth) * 160, MIN_WIDTH)
  }

  @computed get scrollLeft() {
    const rate = this.viewWidth / this.scrollWidth
    const currentDate = dayjs(this.translateAmp).toString()
    // 默认滚动条在中间
    const half = (this.viewWidth - this.scrollBarWidth) / 2
    const viewScrollLeft =
      half + rate * (this.getTranslateXByDate(currentDate) - this.getTranslateXByDate(this.getStartDate()))
    return Math.min(Math.max(viewScrollLeft, 0), this.viewWidth - this.scrollBarWidth)
  }

  @computed get scrollWidth() {
    // TODO 待研究
    // 最小宽度
    const init = this.viewWidth + 200
    return Math.max(Math.abs(this.viewWidth + this.translateX - this.getTranslateXByDate(this.getStartDate())), init)
  }

  // 内容区滚动高度
  @computed get bodyClientHeight() {
    // 1是边框
    return this.height - HEADER_HEIGHT - 1
  }

  @computed get getColumnsWidth(): number[] {
    if (this.columns.length === 1 && this.columns[0]?.width < 200) return [200]
    const totalColumnWidth = this.columns.reduce((width, item) => width + (item.width || 0), 0)
    const totalFlex = this.columns.reduce((total, item) => total + (item.width ? 0 : item.flex || 1), 0)
    const restWidth = this.tableWidth - totalColumnWidth
    return this.columns.map(column => {
      if (column.width) return column.width

      if (column.flex) return restWidth * (column.flex / totalFlex)

      return restWidth * (1 / totalFlex)
    })
  }

  @computed get totalColumnWidth(): number {
    return this.getColumnsWidth.reduce((width, item) => width + (item || 0), 0)
  }

  // 内容区滚动区域域高度
  @computed get bodyScrollHeight() {
    const totalChildrenCount = getChildrenCount(this.getBarList)
    let height = (this.getBarList.length + totalChildrenCount) * this.rowHeight + TOP_PADDING
    if (height < this.bodyClientHeight) height = this.bodyClientHeight

    return height
  }

  // 1px对应的毫秒数
  @computed get pxUnitAmp() {
    let pxUnit = this.sightConfig.value * 1000
    if(this.sightConfig.type === 'week_in_month') pxUnit = this.sightConfig.value * 5000

    return pxUnit
  }

  /** 当前开始时间毫秒数 */
  @computed get translateAmp() {
    const { translateX } = this
    return this.pxUnitAmp * translateX
  }

  getDurationAmp() {
    const clientWidth = this.viewWidth
    return this.pxUnitAmp * clientWidth
  }

  getWidthByDate = (startDate: Dayjs, endDate: Dayjs) => (endDate.valueOf() - startDate.valueOf()) / this.pxUnitAmp

  getMajorList(): Gantt.Major[] {
    const majorFormatMap: { [key in Gantt.Sight]: string } = {
      day: this.locale.majorFormat.day,
      week: this.locale.majorFormat.week,
      week_in_month: this.locale.majorFormat.week_in_month,
      month: this.locale.majorFormat.month,
      quarter: this.locale.majorFormat.quarter,
      halfYear: this.locale.majorFormat.halfYear,
    }
    const { translateAmp } = this
    const endAmp = translateAmp + this.getDurationAmp()
    const { type } = this.sightConfig
    const format = majorFormatMap[type]

    const getNextDate = (start: Dayjs) => {
      if (type === 'day' || type === 'week' || type === 'week_in_month') return start.add(1, 'month')

      return start.add(1, 'year')
    }

    const getStart = (date: Dayjs) => {
      if (type === 'day' || type === 'week' || type === 'week_in_month') return date.startOf('month')

      return date.startOf('year')
    }

    const getEnd = (date: Dayjs) => {
      if (type === 'day' || type === 'week' || type === 'week_in_month') return date.endOf('month')

      return date.endOf('year')
    }

    // 初始化当前时间
    let currentDate = dayjs(translateAmp)
    const dates: Gantt.MajorAmp[] = []

    // 对可视区域内的时间进行迭代
    while (currentDate.isBetween(translateAmp - 1, endAmp + 1)) {
      const majorKey = currentDate.format('YYYY/MM')

      let start = currentDate
      const end = getEnd(start)
      if (dates.length > 0) start = getStart(currentDate)

      dates.push({
        label: majorKey,
        startDate: start,
        endDate: end,
      })

      // 获取下次迭代的时间
      start = getStart(currentDate)
      currentDate = getNextDate(start)
    }

    return this.majorAmp2Px(dates)
  }

  majorAmp2Px(ampList: Gantt.MajorAmp[]) {
    const { pxUnitAmp } = this
    return ampList.map(item => {
      const { startDate } = item
      const { endDate } = item
      const { label } = item
      const left = startDate.valueOf() / pxUnitAmp
      const width = (endDate.valueOf() - startDate.valueOf()) / pxUnitAmp

      return {
        label,
        left,
        width,
        key: startDate.format('YYYY-MM-DD HH:mm:ss'),
      }
    })
  }

  getMinorList(): Gantt.Minor[] {
    const minorFormatMap = {
      day: this.locale.minorFormat.day,
      week: this.locale.minorFormat.week,
      week_in_month: this.locale.minorFormat.week_in_month,
      month: this.locale.minorFormat.month,
      quarter: this.locale.minorFormat.quarter,
      halfYear: this.locale.minorFormat.halfYear,
    }
    const fstHalfYear = new Set([0, 1, 2, 3, 4, 5])

    const startAmp = this.translateAmp
    const endAmp = startAmp + this.getDurationAmp()
    const format = minorFormatMap[this.sightConfig.type]

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getNextDate = (start: Dayjs) => {
      const map = {
        day() {
          return start.add(1, 'day')
        },
        week() {
          return start.add(1, 'week')
        },
        week_in_month() {
          return start.add(1, 'week')
        },
        month() {
          return start.add(1, 'month')
        },
        quarter() {
          return start.add(1, 'quarter')
        },
        halfYear() {
          return start.add(6, 'month')
        },
      }

      return map[this.sightConfig.type]()
    }
    const setStart = (date: Dayjs) => {
      const map = {
        day() {
          return date.startOf('day')
        },
        week() {
          return date.weekday(1).hour(0).minute(0).second(0)
        },
        week_in_month() {
          return date.weekday(1).hour(0).minute(0).second(0)
        },
        month() {
          return date.startOf('month')
        },
        quarter() {
          return date.startOf('quarter')
        },
        halfYear() {
          if (fstHalfYear.has(date.month())) return date.month(0).startOf('month')

          return date.month(6).startOf('month')
        },
      }

      return map[this.sightConfig.type]()
    }
    const setEnd = (start: Dayjs) => {
      const map = {
        day() {
          return start.endOf('day')
        },
        week() {
          return start.weekday(7).hour(23).minute(59).second(59)
        },
        week_in_month() {
          return start.weekday(7).hour(23).minute(59).second(59)
        },
        month() {
          return start.endOf('month')
        },
        quarter() {
          return start.endOf('quarter')
        },
        halfYear() {
          if (fstHalfYear.has(start.month())) return start.month(5).endOf('month')

          return start.month(11).endOf('month')
        },
      }

      return map[this.sightConfig.type]()
    }
    const getMinorKey = (date: Dayjs) => {
      if (this.sightConfig.type === 'halfYear')
        return date.format(format) + (fstHalfYear.has(date.month()) ? this.locale.firstHalf : this.locale.secondHalf)
      if (this.sightConfig.type === 'week_in_month') {
        // その月の最初の日を取得。
        const startOfMonth = dayjs(date).startOf('month')

        // その月の最初の月曜日を取得。Dayjsのday()メソッドは、日曜日を0として曜日の番号を返すため、1以下ならその日は月曜日または日曜日。
        // もしその日が月曜日（1）または日曜日（0）であれば、その日が最初の月曜日（日曜日の場合、その次の日が月曜日なので問題ない）。
        // もしその日が火曜日以降であれば、次の週の月曜日（add(1, 'week').day(1)によって取得）が最初の月曜日。
        const firstMonday = startOfMonth.day() <= 1 ? startOfMonth : startOfMonth.add(1, 'week').day(1)
        // date.diff(firstMonday, 'day')で対象の日付と最初の月曜日の間の日数を計算。その結果に1を足して7で割り、小数点を切り上げることで週の数を計算。
        // この計算により、例えば6月1日（木曜日）でも、その週が6月の1週目となる。
        const weekInMonth = Math.ceil((date.diff(firstMonday, 'day') + 1) / 7)

        return `${weekInMonth}w`
      }
      return date.format(format)
    }

    // 初始化当前时间
    let currentDate = dayjs(startAmp)
    const dates: Gantt.MinorAmp[] = []
    while (currentDate.isBetween(startAmp - 1, endAmp + 1)) {
      const minorKey = getMinorKey(currentDate)
      const start = setStart(currentDate)
      const end = setEnd(start)
      dates.push({
        label: minorKey.split('-').pop() as string,
        startDate: start,
        endDate: end,
      })
      currentDate = getNextDate(start)
    }

    return this.minorAmp2Px(dates)
  }

  startXRectBar = (startX: number) => {
    let date = dayjs(startX * this.pxUnitAmp)
    const dayRect = () => {
      const stAmp = date.startOf('day')
      const endAmp = date.endOf('day')
      // @ts-expect-error
      const left = stAmp / this.pxUnitAmp
      // @ts-expect-error
      const width = (endAmp - stAmp) / this.pxUnitAmp

      return {
        left,
        width,
      }
    }
    const weekRect = () => {
      if (date.weekday() === 0) date = date.add(-1, 'week')

      const left = date.weekday(1).startOf('day').valueOf() / this.pxUnitAmp
      const width = (7 * 24 * 60 * 60 * 1000 - 1000) / this.pxUnitAmp

      return {
        left,
        width,
      }
    }
    const monthRect = () => {
      const stAmp = date.startOf('month').valueOf()
      const endAmp = date.endOf('month').valueOf()
      const left = stAmp / this.pxUnitAmp
      const width = (endAmp - stAmp) / this.pxUnitAmp

      return {
        left,
        width,
      }
    }

    const map = {
      day: dayRect,
      week: weekRect,
      week_in_month: weekRect,
      month: weekRect,
      quarter: monthRect,
      halfYear: monthRect,
    }

    return map[this.sightConfig.type]()
  }

  minorAmp2Px(ampList: Gantt.MinorAmp[]): Gantt.Minor[] {
    const { pxUnitAmp } = this
    return ampList.map(item => {
      const { startDate } = item
      const { endDate } = item

      const { label } = item
      const left = startDate.valueOf() / pxUnitAmp
      const width = (endDate.valueOf() - startDate.valueOf()) / pxUnitAmp

      let isWeek = false
      if (this.sightConfig.type === 'day') isWeek = this.isRestDay(startDate.toString())

      return {
        label,
        left,
        width,
        isWeek,
        key: startDate.format('YYYY-MM-DD HH:mm:ss'),
      }
    })
  }

  getTaskBarThumbVisible(barInfo: Gantt.Bar) {
    const { width, translateX: barTranslateX, invalidDateRange } = barInfo
    if (invalidDateRange) return false

    const rightSide = this.translateX + this.viewWidth
    return barTranslateX + width < this.translateX || barTranslateX - rightSide > 0
  }

  scrollToBar(barInfo: Gantt.Bar, type: 'left' | 'right') {
    const { translateX: barTranslateX, width } = barInfo
    const translateX1 = this.translateX + this.viewWidth / 2
    const translateX2 = barTranslateX + width

    const diffX = Math.abs(translateX2 - translateX1)
    let translateX = this.translateX + diffX

    if (type === 'left') translateX = this.translateX - diffX

    this.setTranslateX(translateX)
  }

  @computed get getBarList(): Gantt.Bar[] {
    const { pxUnitAmp, data, rowHeight, disabled } = this

    const barList = convertBar({ data, pxUnitAmp, rowHeight, disabled })
    return observable(barList)
  }

  @action
    handleWheel = (event: WheelEvent) => {
      if (event.deltaX !== 0) {
        event.preventDefault()
        event.stopPropagation()
      }
      if (this._wheelTimer) clearTimeout(this._wheelTimer)
      // 水平滚动
      if (Math.abs(event.deltaX) > 0) {
        this.scrolling = true
        this.setTranslateX(this.translateX + event.deltaX)
      }
      this._wheelTimer = window.setTimeout(() => {
        this.scrolling = false
      }, 100)
    }

  handleScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const { scrollTop } = event.currentTarget
    this.scrollY(scrollTop)
  }

  scrollY = throttle((scrollTop: number) => {
    this.scrollTop = scrollTop
  }, 100)

  // 虚拟滚动
  @computed get getVisibleRows() {
    const visibleHeight = this.bodyClientHeight
    // 多渲染几个，减少空白
    const visibleRowCount = Math.ceil(visibleHeight / this.rowHeight) + 10

    const start = Math.max(Math.ceil(this.scrollTop / this.rowHeight) - 5, 0)
    return {
      start,
      count: visibleRowCount,
    }
  }

  handleMouseMove = debounce(event => {
    if (!this.isPointerPress) this.showSelectionBar(event)
  }, 5)

  handleMouseLeave() {
    this.showSelectionIndicator = false
  }

  @action
  showSelectionBar(event: MouseEvent) {
    const scrollTop = this.mainElementRef.current?.scrollTop || 0
    const { top } = this.mainElementRef.current?.getBoundingClientRect() || {
      top: 0,
    }
    const flattenBarList = flattenDeep(this.getBarList)

    // 内容区高度
    const contentHeight = flattenBarList.length * this.rowHeight
    const offsetY = event.clientY - top + scrollTop
    if (offsetY - contentHeight > TOP_PADDING) {
      this.showSelectionIndicator = false
    } else {
      const topValue = Math.floor((offsetY - TOP_PADDING) / this.rowHeight) * this.rowHeight + TOP_PADDING
      this.showSelectionIndicator = true
      this.selectionIndicatorTop = topValue
    }
  }

  getHovered = (top: number) => {
    const baseTop = top - (top % this.rowHeight)
    return this.selectionIndicatorTop >= baseTop && this.selectionIndicatorTop <= baseTop + this.rowHeight
  }

  @action
  handleDragStart(barInfo: Gantt.Bar, type: Gantt.MoveType) {
    this.dragging = barInfo
    this.draggingType = type
    barInfo.stepGesture = 'start'
    this.isPointerPress = true
  }

  @action
  handleDragEnd() {
    if (this.dragging) {
      this.dragging.stepGesture = 'end'
      this.dragging = null
    }
    this.draggingType = null
    this.isPointerPress = false
  }

  @action
  handleInvalidBarLeave() {
    this.handleDragEnd()
  }

  @action
  handleInvalidBarHover(barInfo: Gantt.Bar, left: number, width: number) {
    barInfo.translateX = left
    barInfo.width = width
    this.handleDragStart(barInfo, 'create')
  }

  @action
  handleInvalidBarDragStart(barInfo: Gantt.Bar) {
    barInfo.stepGesture = 'moving'
  }

  @action
  handleInvalidBarDragEnd(barInfo: Gantt.Bar, oldSize: { width: number; x: number }) {
    barInfo.invalidDateRange = false
    this.handleDragEnd()
    this.updateTaskDate(barInfo, oldSize, 'create')
  }

  @action
  updateBarSize(barInfo: Gantt.Bar, { width, x }: { width: number; x: number }) {
    barInfo.width = width
    barInfo.translateX = Math.max(x, 0)
    barInfo.stepGesture = 'moving'
  }

  getMovedDay(ms: number): number {
    return Math.round(ms / ONE_DAY_MS)
  }

  /** 更新时间 */
  @action
  async updateTaskDate(
    barInfo: Gantt.Bar,
    oldSize: { width: number; x: number },
    type: 'move' | 'left' | 'right' | 'create'
  ) {
    const { translateX, width, task, record } = barInfo
    const oldStartDate = barInfo.task.startDate
    const oldEndDate = barInfo.task.endDate
    let startDate = oldStartDate
    let endDate = oldEndDate

    if (type === 'move') {
      const moveTime = this.getMovedDay((translateX - oldSize.x) * this.pxUnitAmp)
      // 移动，只根据移动距离偏移
      startDate = dayjs(oldStartDate).add(moveTime, 'day').format('YYYY-MM-DD HH:mm:ss')
      endDate = dayjs(oldEndDate).add(moveTime, 'day').hour(23).minute(59).second(59).format('YYYY-MM-DD HH:mm:ss')
    } else if (type === 'left') {
      const moveTime = this.getMovedDay((translateX - oldSize.x) * this.pxUnitAmp)
      // 左侧移动，只改变开始时间
      startDate = dayjs(oldStartDate).add(moveTime, 'day').format('YYYY-MM-DD HH:mm:ss')
    } else if (type === 'right') {
      const moveTime = this.getMovedDay((width - oldSize.width) * this.pxUnitAmp)
      // 右侧移动，只改变结束时间
      endDate = dayjs(oldEndDate).add(moveTime, 'day').hour(23).minute(59).second(59).format('YYYY-MM-DD HH:mm:ss')
    } else if (type === 'create') {
      // 创建
      startDate = dayjs(translateX * this.pxUnitAmp).format('YYYY-MM-DD HH:mm:ss')
      endDate = dayjs((translateX + width) * this.pxUnitAmp)
        .subtract(1)
        .hour(23)
        .minute(59)
        .second(59)
        .format('YYYY-MM-DD HH:mm:ss')
    }
    if (startDate === oldStartDate && endDate === oldEndDate) return

    runInAction(() => {
      barInfo.loading = true
    })
    const success = await this.onUpdate(toJS(record), startDate, endDate)
    if (success) {
      runInAction(() => {
        task.startDate = startDate
        task.endDate = endDate
      })
    } else {
      barInfo.width = oldSize.width
      barInfo.translateX = oldSize.x
    }
  }

  isToday(key: string) {
    const now = dayjs().format('YYYY-MM-DD')
    const target = dayjs(key).format('YYYY-MM-DD')
    return target === now
  }
}


export default GanttStore

import type React from 'react'
import { createContext } from 'react'
import type GanttStore from './store'
import type { DefaultRecordType, Gantt } from './types'
import type { OrderedBarList } from './utils'

export interface GanttContext<RecordType = DefaultRecordType> {
  prefixCls: string
  store: GanttStore
  getBarColor?: (record: Gantt.Record<RecordType>) => {
    backgroundColor: string
    borderColor: string
  }
  showBackToday: boolean
  showUnitSwitch: boolean
  onRow?: {
    onClick: (record: Gantt.Record<RecordType>) => void
  }
  tableIndent: number
  barHeight: number
  expandIcon?: ({
    level,
    collapsed,
    onClick,
  }: {
    level: number
    collapsed: boolean
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  }) => React.ReactNode
  renderBar?: (barInfo: Gantt.Bar<RecordType>, { width, height }: { width: number; height: number }) => React.ReactNode
  renderInvalidBar?: (element: React.ReactNode, barInfo: Gantt.Bar<RecordType>) => React.ReactNode
  renderGroupBar?: (
    barInfo: Gantt.Bar<RecordType>,
    { width, height }: { width: number; height: number }
  ) => React.ReactNode
  renderBarThumb?: (item: Gantt.Record<RecordType>, type: 'left' | 'right') => React.ReactNode
  onBarClick?: (record: Gantt.Record<RecordType>) => void
  tableCollapseAble: boolean
  scrollTop: boolean | React.CSSProperties
  alwaysShowTaskBar?: boolean
  renderLeftText?: (barInfo: Gantt.Bar<RecordType>) => React.ReactNode
  renderRightText?: (barInfo: Gantt.Bar<RecordType>) => React.ReactNode
  renderDaysText?: (barInfo: Gantt.Bar<RecordType>) => React.ReactNode
  onExpand?: (record: Gantt.Record<RecordType>, collapsed: boolean) => void
  onTimeAxisClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  orderedBarList?: (barList: OrderedBarList) => void
  showChangeBarSize?: boolean
  canMoveBar?: boolean
  timeAxisMinorStyle?: {}
  allowAddBar?: boolean

  hideTable?: boolean
  tableSize?: {
    minWidth?: number
    maxWidth?: number
  }
}
const context = createContext<GanttContext>({} as GanttContext)
export default context

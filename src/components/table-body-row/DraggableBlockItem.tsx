import type { DraggableSyntheticListeners } from '@dnd-kit/core'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useContext } from 'react'
import Context from '../../context'
import type GanttStore from '../../store'
import type { Gantt } from '../../types'
import ObserverTableRows from '../table-body-rows'
import RowToggler from './RowToggler'

interface ExpandIconProps {
  bar: Gantt.Bar
  onExpand?: (record: Gantt.Record, collapsed: boolean) => void
  store: GanttStore
  expandIcon?: (props: {
    level: number
    collapsed: boolean
    onClick: (event: React.MouseEvent<HTMLDivElement>) => void
  }) => React.ReactNode
  prefixCls: string
}
interface DraggableBlockItemProps {
  bar: Gantt.Bar
  isActive?: boolean
  listeners?: DraggableSyntheticListeners
  transform?: { x: number; y: number }
  transition?: string
  setActivatorNodeRef?: (element: HTMLElement | null) => void
}

const ExpandIcon = observer(({ bar, onExpand, store, expandIcon, prefixCls }: ExpandIconProps) => {
  const handleClick = event => {
    event.stopPropagation()
    if (onExpand) onExpand(bar.task.record, !bar._collapsed)
    store.setRowCollapse(bar.task, !bar._collapsed)
  }

  return (
    <div>
      {expandIcon ? (
        expandIcon({
          level: bar._depth,
          collapsed: bar._collapsed,
          onClick: handleClick,
        })
      ) : (
        <RowToggler prefixCls={prefixCls} level={bar._depth} collapsed={bar._collapsed} onClick={handleClick} />
      )}
    </div>
  )
})

const DraggableBlockItem = ({
  bar,
  isActive,
  listeners,
  transform,
  transition,
  setActivatorNodeRef,
}: DraggableBlockItemProps) => {
  const { store, onRow, tableIndent, expandIcon, prefixCls, onExpand } = useContext(Context)
  const prefixClsTableBody = `${prefixCls}-table-body`
  const { columns, rowHeight, tableWidth } = store
  const columnsWidth = store.getColumnsWidth
  const style = {
    opacity: isActive ? 0.5 : 1,
    boxShadow: isActive ? '0 4px 8px rgba(0, 0, 0, 0.1)' : undefined,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    width: tableWidth,
  }

  if (!bar?.record) return null

  return (
    <div ref={setActivatorNodeRef} style={style}>
      <div
        role='none'
        className={classNames(`${prefixClsTableBody}-row`, bar.record.className)}
        onClick={() => {
          onRow?.onClick(bar.record)
        }}
      >
        {columns.map((column, index) => (
          <div
            key={column.name}
            className={`${prefixClsTableBody}-cell`}
            style={{
              width: columnsWidth[index],
              height: rowHeight,
              minWidth: column.minWidth,
              maxWidth: column.maxWidth,
              textAlign: column.align ? column.align : 'left',
              paddingLeft: index === 0 && tableIndent * (bar._depth + 1) + 10,
              ...column.style,
            }}
          >
            {column.name === 'dragButton' && column.render && column.render(bar.record) != null && (
              <button
                type='button'
                {...listeners}
                style={{
                  cursor: isActive ? 'grabbing' : 'grab',
                  pointerEvents: 'auto',
                  touchAction: 'none',
                }}
              >
                {column.render(bar.record)}
              </button>
            )}
            {index === 0 && bar._childrenCount > 0 && (
              <ExpandIcon bar={bar} onExpand={onExpand} store={store} expandIcon={expandIcon} prefixCls={prefixCls} />
            )}
            {column.name !== 'dragButton' && (
              <span className={`${prefixClsTableBody}-ellipsis`}>
                {column.render ? column.render(bar.record) : bar.record[column.name]}
              </span>
            )}
          </div>
        ))}
      </div>
      {/*
        MEMO: ガントチャート側は _collapsed: true の時はデータから削除しているが（デフォルトの仕様）、タイトル側は _collapsed の値で表示・非表示のコントロールしてデータ自体は存在させる。
        Drag & Drop でソートしたデータで上書きする時、_collapsed: true でデータが存在しない状態で上書きすると、childrenのデータがない状態で上書きされてしまうため。
       */}
      {!bar._collapsed && bar.children && bar.children.length > 0 && <ObserverTableRows barList={bar.children} />}
    </div>
  )
}

export default observer(DraggableBlockItem)

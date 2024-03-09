import React, { useCallback, useContext, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import classNames from 'classnames'
import Context from '../../context'
import { TOP_PADDING } from '../../constants'
import RowToggler from './RowToggler'
import './index.less'

import {
  DndContext, 
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

const SortableTableRows = ({bar, rowIndex, start, isLastChild, prefixClsTableBody, rowHeight, onRow,columns,columnsWidth,tableIndent,expandIcon, setRowCollapse, onExpand, prefixCls}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: bar.key})

  return (
    <div
      role='none'
      className={`${prefixClsTableBody}-row ${bar.record.className}`}
      style={{
        height: rowHeight,
        top: (rowIndex + start) * rowHeight + TOP_PADDING,
      }}
      onClick={() => {
        onRow?.onClick(bar.record)
      }}
      ref={setNodeRef}{...attributes} {...listeners}
    >
      {columns.map((column, index) => (
        <div
          key={column.name}
          className={`${prefixClsTableBody}-cell`}
          style={{
            width: columnsWidth[index],
            minWidth: column.minWidth,
            maxWidth: column.maxWidth,
            textAlign: column.align ? column.align : 'left',
            paddingLeft: index === 0 && tableIndent * (bar._depth + 1) + 10,
            ...column.style,
          }}
        >
          {index === 0 &&
            // eslint-disable-next-line unicorn/no-new-array
            new Array(bar._depth).fill(0).map((_, i) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className={classNames(`${prefixClsTableBody}-row-indentation`, {
                  [`${prefixClsTableBody}-row-indentation-hidden`]: isLastChild && i === bar._depth - 2,
                  [`${prefixClsTableBody}-row-indentation-both`]: i === bar._depth - 1,
                })}
                style={{
                  top: -(rowHeight / 2) + 1,
                  left: tableIndent * i + 15,
                  width: tableIndent * 1.5 + 5,
                }}
              />
            ))}
          {index === 0 && bar._childrenCount > 0 && (
            <div
              style={{
                position: 'absolute',
                left: tableIndent * bar._depth + 15,
                background: 'white',
                zIndex: 9,
                transform: 'translateX(-52%)',
                padding: 1,
              }}
            >
              {expandIcon ? (
                expandIcon({
                  level: bar._depth,
                  collapsed: bar._collapsed,
                  onClick: event => {
                    event.stopPropagation()
                    if (onExpand) onExpand(bar.task.record, !bar._collapsed)
                    setRowCollapse(bar.task, !bar._collapsed)
                  },
                })
              ) : (
                <RowToggler
                  prefixCls={prefixCls}
                  level={bar._depth}
                  collapsed={bar._collapsed}
                  onClick={event => {
                    event.stopPropagation()
                    if (onExpand) onExpand(bar.task.record, !bar._collapsed)
                    setRowCollapse(bar.task, !bar._collapsed)
                  }}
                />
              )}
            </div>
          )}
          <span className={`${prefixClsTableBody}-ellipsis`}>
            {column.render ? column.render(bar.record) : bar.record[column.name]}
          </span>
        </div>
      ))}
    </div>
  )
}

const TableRows = ({barList}) => {
  const { store, onRow, tableIndent, expandIcon, prefixCls, onExpand } = useContext(Context)
  const { columns, rowHeight } = store
  const columnsWidth = store.getColumnsWidth
  // const barList = store.getBarList

  const { count, start } = store.getVisibleRows
  const prefixClsTableBody = `${prefixCls}-table-body`
  if (barList.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          color: ' rgba(0,0,0,0.65)',
          marginTop: 30,
          fontSize: 14,
        }}
      >
        該当するデータがありません
      </div>
    )
  }
  console.log("barList",barList.slice(start, start + count))
  return (
    <>
      {barList.slice(start, start + count).map((bar, rowIndex) => {
        // 父元素如果是其最后一个祖先的子，要隐藏上一层的线
        const parent = bar._parent
        const parentItem = parent?._parent
        let isLastChild = false
        if (parentItem?.children && parentItem.children[parentItem.children.length - 1] === bar._parent)
          isLastChild = true

          return <SortableTableRows 
          bar={bar} 
          rowIndex={rowIndex}
          start={start}
          isLastChild={isLastChild}
           prefixClsTableBody={prefixClsTableBody}
           rowHeight={rowHeight}
           onRow={onRow}
          columns={columns}
          columnsWidth={columnsWidth}
          tableIndent={tableIndent}
          expandIcon={expandIcon}
           setRowCollapse={store.setRowCollapse}
           onExpand={onExpand}
           prefixCls={prefixCls}
          />

      })}
    </>
  )
}
const ObserverTableRows = observer(TableRows)
const TableBorders = () => {
  const { store, prefixCls } = useContext(Context)
  const { columns } = store
  const columnsWidth = store.getColumnsWidth
  const barList = store.getBarList
  if (barList.length === 0) return null

  const prefixClsTableBody = `${prefixCls}-table-body`
  return (
    <div role='none' className={`${prefixClsTableBody}-border_row`}>
      {columns.map((column, index) => (
        <div
          key={column.name}
          className={`${prefixClsTableBody}-cell`}
          style={{
            width: columnsWidth[index],
            minWidth: column.minWidth,
            maxWidth: column.maxWidth,
            textAlign: column.align ? column.align : 'left',
            ...column.style,
          }}
        />
      ))}
    </div>
  )
}
const ObserverTableBorders = observer(TableBorders)

const TableBody: React.FC = () => {
  const { store, prefixCls } = useContext(Context)

  const [barList, setBarList] = useState(store.getBarList)
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.persist()
      store.handleMouseMove(event)
    },
    [store]
  )
  const handleMouseLeave = useCallback(() => {
    store.handleMouseLeave()
  }, [store])
  const prefixClsTableBody = `${prefixCls}-table-body`

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    const oldIndex = barList.findIndex((item) => item.key === active.id)
    const newIndex = barList.findIndex((item) => item.key === over.id)

    if (active.id !== over.id) {
      console.log(active,over)
      setBarList((items) => 
      arrayMove(items, oldIndex, newIndex))
    }
  }

  useEffect(() => {
    setBarList(store.getBarList)
  }, [store.getBarList])

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div
        className={prefixClsTableBody}
        style={{
          width: store.tableWidth,
          height: store.bodyScrollHeight,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <ObserverTableBorders />
        <SortableContext items={barList.map(item => item.key)} strategy={verticalListSortingStrategy}>
          <ObserverTableRows barList={barList} />
        </SortableContext>
      </div>
    </DndContext>
  )
}
export default observer(TableBody)

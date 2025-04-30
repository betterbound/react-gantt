import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useContext, useState } from 'react'
import Context from '../../context'
import type { Gantt } from '../../types'
import ObserverTableRow from '../table-body-row'

interface Props {
  barList: Gantt.Bar[]
}

const updateBarListRecursively = (
  originalList: Gantt.Bar[],
  newOrder: Gantt.Bar[],
  newOrderKeys: string[]
): Gantt.Bar[] => {
  const updatedList: Gantt.Bar[] = []
  const remainingBars = [...originalList]

  newOrder.forEach(newBar => {
    const index = remainingBars.findIndex(bar => bar.key === newBar.key)
    if (index !== -1) {
      const [bar] = remainingBars.splice(index, 1)
      updatedList.push({
        ...newBar,
        children: updateBarListRecursively(bar.children, newOrder, newOrderKeys),
      })
    }
  })

  remainingBars.forEach(bar => {
    updatedList.push({
      ...bar,
      children: updateBarListRecursively(bar.children, newOrder, newOrderKeys),
    })
  })

  return updatedList
}

const ObserverTableRows = ({ barList }: Props) => {
  const { store, orderedBarList } = useContext(Context)
  const [activeId, setActiveId] = useState(null)
  const originalBarList = store.getBarList

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback(
    event => {
      const { active, over } = event

      if (!active || !over) {
        console.warn('Drag ended with incomplete data:', { active, over })
        return
      }

      const oldIndex = barList.findIndex(item => item.record.id === active.id)
      const newIndex = barList.findIndex(item => item.record.id === over.id)

      const activeItem = barList[oldIndex]
      const overItem = barList[newIndex]

      const isWithoutFractionalIndex =
        activeItem.record.fractionalIndex === undefined || overItem.record.fractionalIndex === undefined

      if (active.id !== over.id) {
        const newOrder = arrayMove(barList, oldIndex, newIndex)
        const newOrderKeys = newOrder.map(order => order.record.id)
        const updatedBarList = updateBarListRecursively(originalBarList, newOrder, newOrderKeys)

        const prevFractionalIndex = newIndex === 0 ? null : newOrder[newIndex - 1].record.fractionalIndex
        const nextFractionalIndex =
          newIndex === barList.length - 1 ? null : newOrder[newIndex + 1].record.fractionalIndex

        const newOrderIds = newOrder.map(order => order.record.id)

        // 自分は record.fractionalIndex を持っているが、次のアイテムは record.fractionalIndex を持っていないアイテムの index を取得する
        // isWithoutFractionalIndex の場合、fractionalIndex を持っていないアイテムに、
        // newOrder[transitionIndex].record.fractionalIndex の次から新しく fractionalIndex を設定するため
        const transitionIndex = newOrder.findIndex((item, index) => {
          // Current item has fractionalIndex, but next item doesn't
          const currentHasFractionalIndex = item.record.fractionalIndex !== undefined
          const isLastItem = index === newOrder.length - 1
          const nextHasNoFractionalIndex = !isLastItem && newOrder[index + 1].record.fractionalIndex === undefined

          return currentHasFractionalIndex && (isLastItem || nextHasNoFractionalIndex)
        })

        const slicedOrderIds = newOrderIds.slice(transitionIndex + 1, newIndex + 1)

        store.updateBarListOrder(updatedBarList)
        orderedBarList?.({
          id: active.id,
          ...(isWithoutFractionalIndex && slicedOrderIds.length > 0
            ? {
                slicedOrderItem: {
                  lastFractionalIndex: newOrder[transitionIndex]?.record.fractionalIndex,
                  slicedOrderIds,
                },
              }
            : {
                fractionalIndex: {
                  prev: prevFractionalIndex,
                  next: nextFractionalIndex,
                },
              }),
        })
      }
    },
    [barList, originalBarList, store, orderedBarList]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={event => setActiveId(event.active.id)}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={barList.map(bar => bar.record.id)} strategy={verticalListSortingStrategy}>
        {barList.map(bar => (
          <ObserverTableRow key={bar.key} bar={bar} />
        ))}
        <DragOverlay>
          {activeId ? (
            <ObserverTableRow key={activeId} bar={barList.find(bar => bar.record.id === activeId)} isActive />
          ) : null}
        </DragOverlay>
      </SortableContext>
    </DndContext>
  )
}

export default observer(ObserverTableRows)

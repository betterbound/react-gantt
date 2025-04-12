import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useContext, useState } from 'react'
import Context from '../../context'
import type { Gantt } from '../../types'
import { convertBarList } from '../../utils'
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

      if (active.id !== over.id) {
        const newOrder = arrayMove(barList, oldIndex, newIndex)
        const newOrderKeys = newOrder.map(order => order.record.id)
        const updatedBarList = updateBarListRecursively(originalBarList, newOrder, newOrderKeys)

        store.updateBarListOrder(updatedBarList)
        orderedBarList?.(convertBarList(newOrder, active.id, over.id))
      }
    },
    [barList, originalBarList, store, orderedBarList]
  )

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

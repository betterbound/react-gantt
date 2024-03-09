import dayjs from 'dayjs'
import RcGantt, { enUS } from 'rc-gantt'
import React, { useState } from 'react'

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
interface Data {
  id: number
  name: string
  startDate: string
  endDate: string
  className: string
  barItems?: {
    id: string
    icon: JSX.Element
    startDate: string
    endDate: string
  }[]
  children: any
}

function createData(len: number) {
  const result: Data[] = []
  for (let i = 0; i < len; i++) {
    result.push({
      id: i,
      name: `Title${i}`,
      startDate: dayjs().subtract(-i, 'day').format('YYYY-MM-DD'),
      endDate: dayjs().add(i, 'day').format('YYYY-MM-DD'),
      className: 'blue',
      children: [
        {
          id: i,
          name: `Title${i}`,
          startDate: dayjs().subtract(-i, 'day').format('YYYY-MM-DD'),
          endDate: dayjs().add(i, 'day').format('YYYY-MM-DD'),
          className: 'gray',
          children: [
            {
              id: i,
              name: `Title${i}`,
              startDate: dayjs().subtract(-i, 'day').format('YYYY-MM-DD'),
              endDate: dayjs().add(i, 'day').format('YYYY-MM-DD'),
              className: 'white',
              barItems: [
                {
                  id: `${i}-1`,
                  icon: <span>A</span>,
                  startDate: dayjs().subtract(-i, 'week').format('YYYY-MM-DD'),
                  endDate: dayjs().add(i, 'week').format('YYYY-MM-DD'),
                },
                {
                  id: `${i}-2`,
                  icon: <span>B</span>,
                  startDate: dayjs()
                    .subtract(-i - 1, 'week')
                    .format('YYYY-MM-DD'),
                  endDate: dayjs()
                    .add(i + 1, 'week')
                    .format('YYYY-MM-DD'),
                },
                {
                  id: `${i}-3`,
                  icon: <span>C</span>,
                  startDate: dayjs()
                    .subtract(-i - 3, 'week')
                    .format('YYYY-MM-DD'),
                  endDate: dayjs()
                    .add(i + 3, 'week')
                    .format('YYYY-MM-DD'),
                },
              ],
            },
          ],
        },
      ],
    })
  }
  return result
}

const SortableItem = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id})
  
  return (
    <div ref={setNodeRef}{...attributes} {...listeners}>
  アイテム{props.id}
    </div>
  )
}

const App = () => {
  const [data, setData] = useState(createData(3))
  console.log('data', data)
  const handleClick = (e) => {
    console.log(e, e.currentTarget.value, e.currentTarget.innerText)
  }

  const [items, setItems] = useState([1, 2, 3,4,5])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {

      setItems((items) => {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }


  return (
    <>
      <div style={{ width: '100%', height: 500 }}>
        <RcGantt<Data>
          data={data}
          columns={[
            {
              name: 'hotTopic',
              label: 'HT',
              width: 52,
              style: {
                padding: 0,
              },
            },
            {
              name: 'highPriority',
              label: 'HP',
              width: 52,
              style: {
                padding: 0,
              },
            },
            {
              name: 'title',
              label: 'OutputGanttToggleButtons',
              render: (record) =>{console.log(record.record)
               
                return (
                  <p>{record.name}</p>
                )},
              style: {
                padding: 0,
              },
            },
            {
              name: 'bookmark',
              label: 'B',
              width: 55,
              style: {
                padding: 0,
              },
            },
            {
              name: 'assignees',
              label: '',
              width: 100,
              style: {
                padding: 0,
              },
            },
            {
              name: 'status',
              label: '',
              width: 85,
              style: {
                padding: 0,
              },
            },
            {
              name: 'period',
              label: '',
              width: 85,
              style: {
                padding: 0,
              },
            },
          ]}
          // onExpand={}
          unit='week_in_month'
          showUnitSwitch={false}
          locale={enUS}
          onUpdate={async (row, startDate, endDate) => {
            // console.log('update', row, startDate, endDate)
            setData(prev => {
              const newList = [...prev]
              const index = newList.findIndex(val => val.id === row.id)
              newList[index] = {
                ...row,
                startDate: dayjs(startDate).format('YYYY-MM-DD'),
                endDate: dayjs(endDate).format('YYYY-MM-DD'),
              }
              return newList
            })
            return true
          }}
          onTimeAxisClick={handleClick}
          renderDaysText={() => ''}
          showChangeBarSize={false}
          canMoveBar={false}
          timeAxisMinorStyle={{ color: '#006ec8' }}
          tableSize={{
            minWidth: 684,
            maxWidth: 1080,
          }}
        />
      </div>
     <p>↓確認用</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((id) => (
            <SortableItem key={id} id={id} />
          ))}
        </SortableContext>
      </DndContext>
    </>

  )
}

export default App

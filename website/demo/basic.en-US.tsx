import dayjs from 'dayjs'
import RcGantt, { enUS } from 'rc-gantt'
import React, { useState } from 'react'

interface Data {
  id: number
  name: string
  startDate: string
  endDate: string
  fractionalIndex?: string
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
      id: 23 + i,
      name: `GOAL_${i}`,
      startDate: dayjs()
        .subtract(i + 2, 'day')
        .format('YYYY-MM-DD'),
      endDate: dayjs()
        .add(i + 2, 'day')
        .format('YYYY-MM-DD'),
      fractionalIndex: `a${i}`,
      className: 'blue',
      children: [
        {
          id: 234 + i,
          name: `ACTION_1_${i}`,
          startDate: dayjs()
            .subtract(i + 2, 'day')
            .format('YYYY-MM-DD'),
          endDate: dayjs()
            .add(i + 2, 'day')
            .format('YYYY-MM-DD'),
          fractionalIndex: 'a0',
          className: 'gray',
          children: [
            {
              id: 100,
              name: 'a0',
              startDate: dayjs()
                .subtract(i + 2, 'day')
                .format('YYYY-MM-DD'),
              endDate: dayjs()
                .add(i + 2, 'day')
                .format('YYYY-MM-DD'),
              fractionalIndex: 'a0',
              className: 'white',
              barItems: [
                {
                  id: `${i}-1`,
                  icon: <span>A</span>,
                  startDate: dayjs().subtract(i, 'week').format('YYYY-MM-DD'),
                  endDate: dayjs().add(i, 'week').format('YYYY-MM-DD'),
                },
              ],
            },
            // {
            //   id: 101,
            //   name: 'a1',
            //   startDate: dayjs()
            //     .subtract(i + 3, 'day')
            //     .format('YYYY-MM-DD'),
            //   endDate: dayjs()
            //     .add(i + 3, 'day')
            //     .format('YYYY-MM-DD'),
            //   fractionalIndex: 'a1',
            //   className: 'white',
            //   barItems: [
            //     {
            //       id: `${i}-2`,
            //       icon: <span>B</span>,
            //       startDate: dayjs()
            //         .subtract(i - 1, 'week')
            //         .format('YYYY-MM-DD'),
            //       endDate: dayjs()
            //         .add(i + 1, 'week')
            //         .format('YYYY-MM-DD'),
            //     },
            //     {
            //       id: `${i}-3`,
            //       icon: <span>C</span>,
            //       startDate: dayjs()
            //         .subtract(i - 3, 'week')
            //         .format('YYYY-MM-DD'),
            //       endDate: dayjs()
            //         .add(i + 3, 'week')
            //         .format('YYYY-MM-DD'),
            //     },
            //   ],
            // },
            // {
            //   id: 102,
            //   name: 'a2',
            //   startDate: dayjs()
            //     .subtract(i + 6, 'day')
            //     .format('YYYY-MM-DD'),
            //   endDate: dayjs()
            //     .add(i + 6, 'day')
            //     .format('YYYY-MM-DD'),
            //   fractionalIndex: 'a2',
            //   className: 'white',
            //   barItems: [
            //     {
            //       id: `${i}-1`,
            //       icon: <span>A</span>,
            //       startDate: dayjs().subtract(i, 'week').format('YYYY-MM-DD'),
            //       endDate: dayjs().add(i, 'week').format('YYYY-MM-DD'),
            //     },
            //     {
            //       id: `${i}-2`,
            //       icon: <span>B</span>,
            //       startDate: dayjs()
            //         .subtract(i - 2, 'week')
            //         .format('YYYY-MM-DD'),
            //       endDate: dayjs()
            //         .add(i + 1, 'week')
            //         .format('YYYY-MM-DD'),
            //     },
            //     {
            //       id: `${i}-3`,
            //       icon: <span>C</span>,
            //       startDate: dayjs()
            //         .subtract(i - 3, 'week')
            //         .format('YYYY-MM-DD'),
            //       endDate: dayjs()
            //         .add(i + 3, 'week')
            //         .format('YYYY-MM-DD'),
            //     },
            //   ],
            // },
            {
              id: 103,
              name: `TASK_103_${i}`,
              startDate: dayjs()
                .subtract(i + 6, 'day')
                .format('YYYY-MM-DD'),
              endDate: dayjs()
                .add(i + 6, 'day')
                .format('YYYY-MM-DD'),
              className: 'white',
              barItems: [
                {
                  id: `${i}-1`,
                  icon: <span>A</span>,
                  startDate: dayjs().subtract(i, 'week').format('YYYY-MM-DD'),
                  endDate: dayjs().add(i, 'week').format('YYYY-MM-DD'),
                },
                {
                  id: `${i}-2`,
                  icon: <span>B</span>,
                  startDate: dayjs()
                    .subtract(i - 2, 'week')
                    .format('YYYY-MM-DD'),
                  endDate: dayjs()
                    .add(i + 1, 'week')
                    .format('YYYY-MM-DD'),
                },
                {
                  id: `${i}-3`,
                  icon: <span>C</span>,
                  startDate: dayjs()
                    .subtract(i - 3, 'week')
                    .format('YYYY-MM-DD'),
                  endDate: dayjs()
                    .add(i + 3, 'week')
                    .format('YYYY-MM-DD'),
                },
              ],
            },
            {
              id: 104,
              name: `TASK_104_${i}`,
              startDate: dayjs()
                .subtract(i + 6, 'day')
                .format('YYYY-MM-DD'),
              endDate: dayjs()
                .add(i + 6, 'day')
                .format('YYYY-MM-DD'),
              className: 'white',
              barItems: [
                {
                  id: `${i}-1`,
                  icon: <span>A</span>,
                  startDate: dayjs().subtract(i, 'week').format('YYYY-MM-DD'),
                  endDate: dayjs().add(i, 'week').format('YYYY-MM-DD'),
                },
                {
                  id: `${i}-2`,
                  icon: <span>B</span>,
                  startDate: dayjs()
                    .subtract(i - 2, 'week')
                    .format('YYYY-MM-DD'),
                  endDate: dayjs()
                    .add(i + 1, 'week')
                    .format('YYYY-MM-DD'),
                },
                {
                  id: `${i}-3`,
                  icon: <span>C</span>,
                  startDate: dayjs()
                    .subtract(i - 3, 'week')
                    .format('YYYY-MM-DD'),
                  endDate: dayjs()
                    .add(i + 3, 'week')
                    .format('YYYY-MM-DD'),
                },
              ],
            },
            {
              id: 105,
              name: `TASK_105_${i}`,
              startDate: dayjs()
                .subtract(i + 6, 'day')
                .format('YYYY-MM-DD'),
              endDate: dayjs()
                .add(i + 6, 'day')
                .format('YYYY-MM-DD'),
              className: 'white',
              barItems: [
                {
                  id: `${i}-1`,
                  icon: <span>A</span>,
                  startDate: dayjs().subtract(i, 'week').format('YYYY-MM-DD'),
                  endDate: dayjs().add(i, 'week').format('YYYY-MM-DD'),
                },
                {
                  id: `${i}-2`,
                  icon: <span>B</span>,
                  startDate: dayjs()
                    .subtract(i - 2, 'week')
                    .format('YYYY-MM-DD'),
                  endDate: dayjs()
                    .add(i + 1, 'week')
                    .format('YYYY-MM-DD'),
                },
                {
                  id: `${i}-3`,
                  icon: <span>C</span>,
                  startDate: dayjs()
                    .subtract(i - 3, 'week')
                    .format('YYYY-MM-DD'),
                  endDate: dayjs()
                    .add(i + 3, 'week')
                    .format('YYYY-MM-DD'),
                },
              ],
            },
          ],
        },
        {
          id: 286 + i,
          name: `ACTION_2_${i}`,
          startDate: dayjs()
            .subtract(i + 4, 'day')
            .format('YYYY-MM-DD'),
          endDate: dayjs()
            .add(i + 4, 'day')
            .format('YYYY-MM-DD'),
          fractionalIndex: 'a1',
          className: 'gray',
          children: [
            {
              id: 200,
              name: `TASK_200_${i}`,
              // name: ``,
              startDate: dayjs()
                .subtract(i + 2, 'day')
                .format('YYYY-MM-DD'),
              endDate: dayjs()
                .add(i + 2, 'day')
                .format('YYYY-MM-DD'),
              className: 'white',
              barItems: [
                {
                  id: `${i}-3`,
                  icon: <span>C</span>,
                  startDate: dayjs()
                    .subtract(i - 3, 'week')
                    .format('YYYY-MM-DD'),
                  endDate: dayjs()
                    .add(i + 3, 'week')
                    .format('YYYY-MM-DD'),
                },
              ],
            },
            {
              id: 201,
              name: `TASK_201_${i}`,
              // name: ``,
              startDate: dayjs()
                .subtract(i + 2, 'day')
                .format('YYYY-MM-DD'),
              endDate: dayjs()
                .add(i + 2, 'day')
                .format('YYYY-MM-DD'),
              className: 'white',
              barItems: [
                {
                  id: `${i}-3`,
                  icon: <span>C</span>,
                  startDate: dayjs()
                    .subtract(i - 3, 'week')
                    .format('YYYY-MM-DD'),
                  endDate: dayjs()
                    .add(i + 3, 'week')
                    .format('YYYY-MM-DD'),
                },
              ],
            },
            {
              id: 202,
              name: `TASK_202_${i}`,
              // name: ``,
              startDate: dayjs()
                .subtract(i + 2, 'day')
                .format('YYYY-MM-DD'),
              endDate: dayjs()
                .add(i + 2, 'day')
                .format('YYYY-MM-DD'),
              className: 'white',
              barItems: [
                {
                  id: `${i}-3`,
                  icon: <span>C</span>,
                  startDate: dayjs()
                    .subtract(i - 3, 'week')
                    .format('YYYY-MM-DD'),
                  endDate: dayjs()
                    .add(i + 3, 'week')
                    .format('YYYY-MM-DD'),
                },
              ],
            },
            {
              id: 203,
              name: `TASK_203_${i}`,
              // name: ``,
              startDate: dayjs()
                .subtract(i + 2, 'day')
                .format('YYYY-MM-DD'),
              endDate: dayjs()
                .add(i + 2, 'day')
                .format('YYYY-MM-DD'),
              className: 'white',
              barItems: [
                {
                  id: `${i}-3`,
                  icon: <span>C</span>,
                  startDate: dayjs()
                    .subtract(i - 3, 'week')
                    .format('YYYY-MM-DD'),
                  endDate: dayjs()
                    .add(i + 3, 'week')
                    .format('YYYY-MM-DD'),
                },
              ],
            },
          ],
        },
        {
          id: 298 + i,
          name: `ACTION_3_${i}`,
          startDate: dayjs()
            .subtract(i + 5, 'day')
            .format('YYYY-MM-DD'),
          endDate: dayjs()
            .add(i + 5, 'day')
            .format('YYYY-MM-DD'),
          fractionalIndex: 'a2',
          className: 'gray',
          children: [
            {
              id: 3549 + i,
              name: `TASK_3_${i}`,
              startDate: dayjs()
                .subtract(i + 5, 'day')
                .format('YYYY-MM-DD'),
              endDate: dayjs()
                .add(i + 2, 'day')
                .format('YYYY-MM-DD'),
              fractionalIndex: 'a0',
              className: 'white',
            },
          ],
        },
        {
          id: 298 + i,
          name: `ACTION_3_${i}`,
          startDate: dayjs()
            .subtract(i + 5, 'day')
            .format('YYYY-MM-DD'),
          endDate: dayjs()
            .add(i + 5, 'day')
            .format('YYYY-MM-DD'),
          className: 'gray',
          children: [
            {
              id: 3549 + i,
              name: `TASK_3_${i}`,
              startDate: dayjs()
                .subtract(i + 5, 'day')
                .format('YYYY-MM-DD'),
              endDate: dayjs()
                .add(i + 2, 'day')
                .format('YYYY-MM-DD'),
              fractionalIndex: 'a0',
              className: 'white',
            },
          ],
        },
        {
          id: 298 + i,
          name: `ACTION_4_${i}`,
          startDate: dayjs()
            .subtract(i + 5, 'day')
            .format('YYYY-MM-DD'),
          endDate: dayjs()
            .add(i + 5, 'day')
            .format('YYYY-MM-DD'),
          className: 'gray',
          children: [
            {
              id: 3549 + i,
              name: `TASK_3_${i}`,
              startDate: dayjs()
                .subtract(i + 5, 'day')
                .format('YYYY-MM-DD'),
              endDate: dayjs()
                .add(i + 2, 'day')
                .format('YYYY-MM-DD'),
              fractionalIndex: 'a0',
              className: 'white',
            },
          ],
        },
        {
          id: 298 + i,
          name: `ACTION_5_${i}`,
          startDate: dayjs()
            .subtract(i + 5, 'day')
            .format('YYYY-MM-DD'),
          endDate: dayjs()
            .add(i + 5, 'day')
            .format('YYYY-MM-DD'),
          className: 'gray',
          children: [
            {
              id: 3549 + i,
              name: `TASK_3_${i}`,
              startDate: dayjs()
                .subtract(i + 5, 'day')
                .format('YYYY-MM-DD'),
              endDate: dayjs()
                .add(i + 2, 'day')
                .format('YYYY-MM-DD'),
              fractionalIndex: 'a0',
              className: 'white',
            },
          ],
        },
      ],
    })
  }
  return result
}

const App = () => {
  const [data, setData] = useState(createData(9))
  const handleClick = e => {
    console.log(e, e.currentTarget.value, e.currentTarget.innerText)
  }
  console.log(data)
  return (
    <>
      <div style={{ width: '100%', height: 500 }}>
        <RcGantt<Data>
          data={data}
          rowHeight={80}
          tableIndent={20}
          columns={[
            {
              name: 'dragButton',
              label: '並べ替え',
              width: 55,
              style: {
                padding: 0,
              },
              render: record => {
                return <>icon</>
              },
            },
            {
              name: 'title',
              label: 'OutputGanttToggleButtons',
              render: record => {
                return <>{record.name}</>
              },
            },
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
              width: 55,
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
          unit='week_in_month'
          showUnitSwitch={false}
          locale={enUS}
          onUpdate={async (row, startDate, endDate) => {
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
          orderedBarList={barList => {
            console.log(barList)
          }}
          renderDaysText={() => ''}
          showChangeBarSize={false}
          canMoveBar={false}
          timeAxisMinorStyle={{ color: '#006ec8' }}
          tableSize={{
            minWidth: 684,
            maxWidth: 2000,
          }}
        />
      </div>
    </>
  )
}

export default App

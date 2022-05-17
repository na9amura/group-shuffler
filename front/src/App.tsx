import { useState } from 'react';
import Spreadsheet, { CellBase, Matrix } from 'react-spreadsheet';
import { solve } from './lp';

const range = (n: number) => [...Array(n).keys()]
const createRow = (cols: number): CellBase[]=> range(cols).map((i) => ({ value: undefined }))
const dummyData = [
  [{ value: 1 }, { value: 'Aaron'   }, { value: 'leader' }, { value: '' }, { value: '' }],
  [{ value: 2 }, { value: 'Bob'     }, { value: 'member' }, { value: '' }, { value: '' }],
  [{ value: 3 }, { value: 'Chales'  }, { value: 'member' }, { value: '' }, { value: '' }],
  [{ value: 4 }, { value: 'Derrick' }, { value: 'member' }, { value: '' }, { value: '' }],
  [{ value: 5 }, { value: 'Eli'     }, { value: 'member' }, { value: '' }, { value: '' }],
  [{ value: 6 }, { value: 'Favre'   }, { value: 'leader' }, { value: '' }, { value: '' }],
  [{ value: 7 }, { value: 'Gathie'  }, { value: 'leader' }, { value: '' }, { value: '' }],
  [{ value: 8 }, { value: 'Hill'    }, { value: 'member' }, { value: '' }, { value: '' }],
  [{ value: 9 }, { value: 'Ingram'  }, { value: 'member' }, { value: '' }, { value: '' }],
]
const matrixToMemberList = (matrix: Matrix<CellBase>) => {
  return matrix.flatMap((row) => {
    return {
      id: row[0]?.value,
      role: row[2]?.value,
      prev: row[3]?.value,
    }
  })
}

const App = () => {
  const labels = ['ID', 'Name', 'Type', 'Previous Group', 'New Group']
  const [matrix, setMatrix] = useState<Matrix<CellBase>>(dummyData);

  const addRow = () => {
    const row = createRow(labels.length)
    setMatrix([...matrix, row])
  }

  const onSubmit = async () => {
    const members = matrixToMemberList(matrix)

    const result = await solve(
      members,
      ['A', 'B', 'C'],
      {
        leader: { ub: 1 },
        member: {},
      }
    )

    const _matrix = matrix.map((row) => {
      const [, group = ""] = result.find(([id]) => id === row[0]?.value) ?? []
      return [...row.slice(0, 4), { value: group }]
    })
    setMatrix(_matrix)
  }

  return (
    <>
      <button onClick={addRow}>Add Row</button>
      <div>
        <Spreadsheet data={matrix} onChange={(matrix) => setMatrix(matrix)} columnLabels={labels} />
      </div>
      <button onClick={onSubmit}>submit</button>
    </>
  )
};

export default App

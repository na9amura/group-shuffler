import { useEffect, useState } from 'react';
import Spreadsheet, { CellBase, Matrix } from 'react-spreadsheet';
import { solve } from './lp';

type Role = [string, { ub: string }]

const range = (n: number) => [...Array(n).keys()]
const createRow = (cols: number): CellBase[]=> range(cols).map((i) => ({ value: undefined }))
const dummyData = [
  [{ value: 'Aaron'   }, { value: 'leader' }, { value: '' }, { value: '' }],
  [{ value: 'Bob'     }, { value: 'member' }, { value: '' }, { value: '' }],
  [{ value: 'Chales'  }, { value: 'member' }, { value: '' }, { value: '' }],
  [{ value: 'Derrick' }, { value: 'member' }, { value: '' }, { value: '' }],
  [{ value: 'Eli'     }, { value: 'member' }, { value: '' }, { value: '' }],
  [{ value: 'Favre'   }, { value: 'leader' }, { value: '' }, { value: '' }],
  [{ value: 'Gathie'  }, { value: 'leader' }, { value: '' }, { value: '' }],
  [{ value: 'Hill'    }, { value: 'member' }, { value: '' }, { value: '' }],
  [{ value: 'Ingram'  }, { value: 'member' }, { value: '' }, { value: '' }],
]
const matrixToMemberList = (matrix: Matrix<CellBase>) => {
  return matrix.flatMap((row, i) => {
    return {
      id: i,
      role: row[1]?.value,
      prev: row[2]?.value,
    }
  })
}

const App = () => {
  const labels = ['Name', 'Role', 'Previous Group', 'New Group']
  const [matrix, setMatrix] = useState<Matrix<CellBase>>(dummyData);
  const [roles, setRoles] = useState<Role[]>([]);
  const [lowerBuffer, setLowerBuffer] = useState<string>('3');
  const [upperBuffer, setUpperBuffer] = useState<string>('3');

  useEffect(() => {
    const _roles = matrix
      .map((row) => row[1]?.value)
      .filter((v) => !!v)
      .filter((v, i, self) => self.indexOf(v) === i)
      .map<Role>((name) => [name, { ub: roles.find(([_name]) => _name === name)?.[1]?.ub ?? "" }])

    setRoles(_roles)
  }, [matrix])

  const addRow = () => {
    const row = createRow(labels.length)
    setMatrix([...matrix, row])
  }
  const setUb = (target: string, ub: string) => {
    const _roles = roles.map<Role>(([name, value]) => target === name ? [name, { ...value, ub }] : [name, value])
    setRoles(_roles)
  }

  const onSubmit = async () => {
    const members = matrixToMemberList(matrix)
    const numGroupSize = Math.round((Number(lowerBuffer) + Number(upperBuffer)) / 2)
    const numGroups = Math.round(members.length / numGroupSize)
    const groups = range(numGroups).map((i) => String.fromCharCode(65 + i))
    const roleConstraints = Object.fromEntries(
      roles
        .filter(([, { ub }]) => !!ub)
        .map(([name, { ub, ...value }]) => [name, { ...value, ub: Number(ub)}]))

    const result = await solve(
      members,
      roleConstraints,
      {
        list: groups,
        lb: Number(lowerBuffer),
        ub: Number(upperBuffer),
      }
    )

    const _matrix = matrix.map((row, i) => {
      const [, group = ""] = result.find(([id]) => id === i) ?? []
      return [...row.slice(0, 3), { value: group }]
    })
    setMatrix(_matrix)
  }

  return (
    <>
      <div>
        <h3>Members</h3>
        <div>
          <Spreadsheet data={matrix} onChange={(matrix) => setMatrix(matrix)} columnLabels={labels} />
        </div>
        <button onClick={addRow}>Add Row</button>
      </div>
      <div>
        <h3>Config</h3>
        {
          roles.map(([name, value]) => (
            <div key={name}>
              <label>Max {name} in a group: </label>
              <input type="number" min={9} max={100} value={value.ub} onChange={(e) => setUb(name, e.target.value)} />
            </div>
          ))
        }
        <div>
          <label>People in a group: </label>
          <input type="number" min={0} max={50} value={lowerBuffer} onChange={(e) => setLowerBuffer(e.target.value)} />
          <span> ~ </span>
          <input type="number" min={0}  max={50} value={upperBuffer} onChange={(e) => setUpperBuffer(e.target.value)} />
        </div>
      </div>
      <button onClick={onSubmit}>submit</button>
    </>
  )
};

export default App

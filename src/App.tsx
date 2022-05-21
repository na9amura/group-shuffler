import { useEffect, useState } from "react"
import Spreadsheet, { CellBase, Matrix } from "react-spreadsheet"
import { Members } from "./components/Members"
import { Options } from "./components/Options"
import { solve } from "./lp"

type Role = [string, { ub: string }]

const range = (n: number) => [...Array(n).keys()]
const createRow = (cols: number): CellBase[] =>
  range(cols).map(() => ({ value: undefined }))
const dummyData = [
  [{ value: "Aaron" }, { value: "leader" }, { value: "" }, { value: "" }],
  [{ value: "Bob" }, { value: "member" }, { value: "" }, { value: "" }],
  [{ value: "Chales" }, { value: "member" }, { value: "" }, { value: "" }],
  [{ value: "Derrick" }, { value: "member" }, { value: "" }, { value: "" }],
  [{ value: "Eli" }, { value: "member" }, { value: "" }, { value: "" }],
  [{ value: "Favre" }, { value: "leader" }, { value: "" }, { value: "" }],
  [{ value: "Gathie" }, { value: "leader" }, { value: "" }, { value: "" }],
  [{ value: "Hill" }, { value: "member" }, { value: "" }, { value: "" }],
  [{ value: "Ingram" }, { value: "member" }, { value: "" }, { value: "" }],
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
  const [matrix, setMatrix] = useState<Matrix<CellBase>>(dummyData)
  const [roles, setRoles] = useState<Role[]>([])
  const [lowerBuffer, setLowerBuffer] = useState<string>("3")
  const [upperBuffer, setUpperBuffer] = useState<string>("3")
  const [numGroups, setNumGroups] = useState<number>(0)

  useEffect(() => {
    const _roles = matrix
      .map((row) => row[1]?.value)
      .filter((v) => !!v)
      .filter((v, i, self) => self.indexOf(v) === i)
      .map<Role>((name) => [
        name,
        { ub: roles.find(([_name]) => _name === name)?.[1]?.ub ?? "" },
      ])

    setRoles(_roles)
  }, [matrix])

  useEffect(() => {
    const members = matrix.length
    const numGroupSize = Math.floor(
      (Number(lowerBuffer) + Number(upperBuffer)) / 2
    )
    const numGroups = Math.floor(members / numGroupSize)

    setNumGroups(numGroups)
  }, [lowerBuffer, upperBuffer, matrix])

  const addRow = (length: number) => {
    const row = createRow(length)
    setMatrix([...matrix, row])
  }

  const onSubmit = async () => {
    const members = matrixToMemberList(matrix)
    const groups = range(numGroups).map((i) => String.fromCharCode(65 + i))
    const roleConstraints = Object.fromEntries(
      roles
        .filter(([, { ub }]) => !!ub)
        .map(([name, { ub, ...value }]) => [name, { ...value, ub: Number(ub) }])
    )

    const result = await solve(members, roleConstraints, {
      list: groups,
      lb: Number(lowerBuffer),
      ub: Number(upperBuffer),
    })

    const _matrix = matrix.map((row, i) => {
      const [, group = ""] = result.find(([id]) => id === i) ?? []
      return [...row.slice(0, 3), { value: group }]
    })
    setMatrix(_matrix)
  }

  return (
    <div>
      <Members matrix={matrix} setMatrix={setMatrix} addRow={addRow} />
      <Options
        numGroups={numGroups}
        roles={roles}
        setRoles={setRoles}
        lowerBuffer={lowerBuffer}
        setLowerBuffer={setLowerBuffer}
        upperBuffer={upperBuffer}
        setUpperBuffer={setUpperBuffer}
      />
      <button onClick={onSubmit}>submit</button>
    </div>
  )
}

export default App

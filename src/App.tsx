import { useEffect, useState } from "react"
import { CellBase, Matrix } from "react-spreadsheet"
import { Members } from "./components/Members"
import { Options } from "./components/Options"
import { useSolver } from "./hooks/use-solver"
import "./App.css"

type Role = [string, { ub: string }]

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

const App = () => {
  const [matrix, setMatrix] = useState<Matrix<CellBase>>(dummyData)
  const [roles, setRoles] = useState<Role[]>([])
  const [lowerBuffer, setLowerBuffer] = useState<string>("3")
  const [upperBuffer, setUpperBuffer] = useState<string>("3")
  const [numGroups, setNumGroups] = useState<number>(0)
  const [_solve] = useSolver()
  const solve = async () => {
    const _matrix = await _solve(
      matrix,
      numGroups,
      roles,
      lowerBuffer,
      upperBuffer
    )
    setMatrix(_matrix)
  }

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

  return (
    <>
      <nav className="nav">
        <div className="nav-container">
          <h1 className="nav-title">Group shuffler</h1>
        </div>
      </nav>
      <div className="app-form">
        <Members className="app-members" matrix={matrix} setMatrix={setMatrix}>
          <button onClick={() => solve()}>Solve</button>
        </Members>
        <Options
          className="app-options"
          numGroups={numGroups}
          roles={roles}
          setRoles={setRoles}
          lowerBuffer={lowerBuffer}
          setLowerBuffer={setLowerBuffer}
          upperBuffer={upperBuffer}
          setUpperBuffer={setUpperBuffer}
        />
      </div>
    </>
  )
}

export default App

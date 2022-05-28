import { useEffect, useState } from "react"
import { Members } from "./components/Members"
import { Options } from "./components/Options"
import { useSolver } from "./hooks/use-solver"
import "./App.css"
import { Role } from "./utils/types/role"
import { Member } from "./utils/types/member"

const dummy: Member[] = [
  { name: "Aaron", role: "leader", previous: "", group: "" },
  { name: "Bob", role: "member", previous: "", group: "" },
  { name: "Chales", role: "member", previous: "", group: "" },
  { name: "Derrick", role: "member", previous: "", group: "" },
  { name: "Eli", role: "member", previous: "", group: "" },
  { name: "Favre", role: "leader", previous: "", group: "" },
  { name: "Gathie", role: "leader", previous: "", group: "" },
  { name: "Hill", role: "member", previous: "", group: "" },
  { name: "Ingram", role: "member", previous: "", group: "" },
]

const App = () => {
  const [members, setMembers] = useState<Member[]>(dummy)
  const [roles, setRoles] = useState<Role[]>([])
  const [lowerBuffer, setLowerBuffer] = useState<string>("3")
  const [upperBuffer, setUpperBuffer] = useState<string>("3")
  const [numGroups, setNumGroups] = useState<number>(0)
  const [_solve] = useSolver()

  const solve = async () => {
    const _members = await _solve(
      members,
      numGroups,
      roles,
      lowerBuffer,
      upperBuffer
    )
    setMembers(_members)
  }

  useEffect(() => {
    const _roles = members
      .map(({ role }) => role)
      .filter((v) => !!v)
      .filter((v, i, self) => self.indexOf(v) === i)
      .map<Role>((name) => [
        name,
        { ub: roles.find(([_name]) => _name === name)?.[1]?.ub ?? "" },
      ])

    setRoles(_roles)
  }, [members])

  useEffect(() => {
    const numGroupSize = Math.floor(
      (Number(lowerBuffer) + Number(upperBuffer)) / 2
    )
    const numGroups = Math.floor(members.length / numGroupSize)

    setNumGroups(numGroups)
  }, [lowerBuffer, upperBuffer, members])

  return (
    <>
      <nav className="nav">
        <div className="nav-container">
          <h1 className="nav-title">Group shuffler</h1>
        </div>
      </nav>
      <div className="app-form">
        <Members
          className="app-members"
          members={members}
          setMembers={setMembers}
        >
          <button onClick={() => solve()}>Shuffle</button>
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

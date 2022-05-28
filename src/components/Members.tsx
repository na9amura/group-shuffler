import { FC, ReactNode, useCallback, useEffect, useState } from "react"
import Spreadsheet, { CellBase, Matrix } from "react-spreadsheet"
import { Member } from "../utils/types/member"
import "./Members.css"

const labels = ["Name", "Role", "Previous Group", "New Group"]

export const Members: FC<{
  className: string
  children?: ReactNode
  members: Member[]
  setMembers: (members: Member[]) => void
}> = ({ className, members, setMembers, children }) => {
  const [matrix, setMatrix] = useState<Matrix<CellBase>>([])
  useEffect(() => {
    const matrix: Matrix<CellBase> = members.map(
      ({ name, role, previous, group }) =>
        [name, role, previous, group].map((value) => ({ value }))
    )
    setMatrix(matrix)
  }, [members])

  const onChange = useCallback(
    (matrix: Matrix<CellBase>) => {
      const members = matrix.map<Member>(([name, role, previous, group]) => ({
        name: name?.value,
        role: role?.value,
        previous: previous?.value,
        group: group?.value,
      }))
      setMembers(members)
    },
    [setMembers]
  )

  const onSort = useCallback(() => {
    const _members = [...members].sort(
      ({ group: a }, { group: b }) => a.charCodeAt(0) - b.charCodeAt(0)
    )
    setMembers(_members)
  }, [members])

  // const addRow = useCallback(
  //   (length: number) => {
  //     const row = range(length).map(() => ({ value: undefined }))
  //     setMatrix([...matrix, row])
  //   },
  //   [matrix, setMatrix]
  // )

  return (
    <div className={className}>
      <h3>Members</h3>
      <div>
        <Spreadsheet
          data={matrix}
          onChange={(matrix) => onChange(matrix)}
          columnLabels={labels}
        />
      </div>
      {/* <button onClick={() => addRow(labels.length)}>Add Row</button> */}
      <div className="members-control">
        {children}
        <button className="button button-outline" onClick={onSort}>
          Sort by group
        </button>
      </div>
    </div>
  )
}

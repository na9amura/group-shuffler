import { FC } from "react"
import Spreadsheet, { CellBase, Matrix } from "react-spreadsheet"

const labels = ["Name", "Role", "Previous Group", "New Group"]

export const Members: FC<{
  matrix: Matrix<CellBase>
  setMatrix: (matrix: Matrix<CellBase>) => void
  addRow: (length: number) => void
}> = ({ matrix, setMatrix, addRow }) => {
  return (
    <>
      <h3>Members</h3>
      <div>
        <Spreadsheet
          data={matrix}
          onChange={(matrix) => setMatrix(matrix)}
          columnLabels={labels}
        />
      </div>
      <button onClick={() => addRow(labels.length)}>Add Row</button>
    </>
  )
}

import { FC, useCallback } from "react"
import Spreadsheet, { CellBase, Matrix } from "react-spreadsheet"
import { range } from "../utils/range"

const labels = ["Name", "Role", "Previous Group", "New Group"]

export const Members: FC<{
  className: string
  matrix: Matrix<CellBase>
  setMatrix: (matrix: Matrix<CellBase>) => void
}> = ({ className, matrix, setMatrix }) => {
  const onSort = useCallback(() => {
    const _matrix = [...matrix].sort(
      ([, , , a], [, , , b]) => a?.value.charCodeAt(0) - b?.value.charCodeAt(0)
    )
    setMatrix(_matrix)
  }, [matrix])

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
          onChange={(matrix) => setMatrix(matrix)}
          columnLabels={labels}
        />
      </div>
      {/* <button onClick={() => addRow(labels.length)}>Add Row</button> */}
      <button onClick={onSort}>Sort by group</button>
    </div>
  )
}

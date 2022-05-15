import { useState } from "react";
import Spreadsheet, { CellBase, Matrix } from "react-spreadsheet";

const range = (n: number) => [...Array(n).keys()]
const createRow = (cols: number): CellBase[] => range(cols).map((i) => {
  return i === (cols - 1) ? { value: undefined, readOnly: true } : { value: undefined }
})

const App = () => {
  const labels = ['ID', 'Name', 'Type', 'Previous Group', 'New Group']
  const [matrix, setMatrix] = useState<Matrix<CellBase>>(range(5).map(() => createRow(labels.length)));

  const addRow = () => {
    const row = createRow(labels.length)
    setMatrix([...matrix, row])
  }

  const onSubmit = async () => {
    // TODO: send request
    // const res = await fetch('/', { method: 'post', body: JSON.stringify(matrix) })
    // const body: { id: string, group: string }[] = await res.json();
    const body = [{ id: "1", group: "A" }, { id: "4", group: "B" }]

    const _matrix = matrix.map((row) => {
      const match = body.find((resRow) => resRow.id === row[0]?.value)
      return [...row.slice(0, 4), { value: match?.group, readOnly: true }]
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

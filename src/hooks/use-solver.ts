import { CellBase, Matrix } from "react-spreadsheet"
import { solve } from "../lp"
import { range } from "../utils/range"

type Role = [string, { ub: string }]

const matrixToMemberList = (matrix: Matrix<CellBase>) => {
  return matrix.flatMap((row, i) => {
    return {
      id: i,
      role: row[1]?.value,
      prev: row[2]?.value,
    }
  })
}

export const useSolver = () => {
  const _solve = async (matrix: Matrix<CellBase>, numGroups: number, roles: Role[], lowerBuffer: string, upperBuffer: string): Promise<Matrix<CellBase>> => {
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

    return _matrix
  }

  return [_solve]
}
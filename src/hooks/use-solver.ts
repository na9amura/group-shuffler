import { solve } from "../lp"
import { range } from "../utils/range"

type Role = [string, { ub: string }]
type Member = { name: string; role: string; previous: string; group: string }

const convert = (members: Member[]) => {
  return members.map(({ role, previous }, i) => {
    return {
      id: i,
      role,
      previous,
    }
  })
}

export const useSolver = () => {
  const _solve = async (_members: Member[], numGroups: number, roles: Role[], lowerBuffer: string, upperBuffer: string): Promise<Member[]> => {
    const members = convert(_members)
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

    return _members.map((member, i) => {
      const [, group = ""] = result.find(([id]) => id === i) ?? []
      return { ...member, group }
    })
  }

  return [_solve]
}
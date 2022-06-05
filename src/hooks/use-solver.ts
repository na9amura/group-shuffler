import { solve } from "../utils/lp"
import { range } from "../utils/range"
import { Member } from "../utils/types/member"
import { Role } from "../utils/types/role"

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
  const _solve = async (
    _members: Member[],
    numGroups: number,
    roles: Role[],
    lowerBuffer: string,
    upperBuffer: string,
    maxOverlap: string
  ): Promise<Member[]> => {
    const members = convert(_members)
    const groups = range(numGroups).map((i) => String.fromCharCode(65 + i))
    const roleConstraints = Object.fromEntries(
      roles
        .filter(([, { ub }]) => !!ub)
        .map(([name, { ub, ...value }]) => [name, { ...value, ub: Number(ub) }])
    )
    const prevGroup = _members
      .filter(({ previous }) => !!previous)
      .map<[number, string]>(({ previous }, id) => [id, previous])
      .reduce<{ [key: string]: number[] }>(
        (a, [id, group]) => ({ ...a, [group]: [...(a[group] || []), id] }),
        {}
      )

    const result = await solve({
      members,
      roleConstraints,
      group: {
        list: groups,
        lb: Number(lowerBuffer),
        ub: Number(upperBuffer),
      },
      prevGroup: {
        list: Object.values(prevGroup),
        ub: Number(maxOverlap),
      },
    })

    return _members.map((member, i) => {
      const [, group = ""] = result.find(([id]) => id === i) ?? []
      return { ...member, group }
    })
  }

  return [_solve]
}

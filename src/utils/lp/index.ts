import { generateSolver } from "./generator"
import {
  GroupConstraintSource,
  Member,
  PrevGroupConstraintSource,
  RoleConstraint,
} from "./types"
import { varName } from "./var-name"

export const solve = async <R extends RoleConstraint>(
  _members: Member<keyof R>[],
  roleConstraints: R,
  group: GroupConstraintSource,
  prevGroup: PrevGroupConstraintSource
): Promise<[id: number, group: string][]> => {
  const members = _members.sort(() => Math.random() - 0.5)

  const solver = await generateSolver(
    members,
    roleConstraints,
    group,
    prevGroup
  )
  const { result } = await solver.solve()

  return members
    .flatMap((m) =>
      group.list.map<[number, string, number]>((g) => [
        m.id,
        g,
        result.vars[varName(m.id, g)],
      ])
    )
    .filter(([, , assign]) => assign === 1)
    .map(([id, group]) => [id, group])
}

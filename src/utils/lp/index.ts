import { generateSolver } from "./generator"
import { GeneratorParams } from "./types"
import { varName } from "./var-name"

export const solve = async ({
  members: _members,
  roleConstraints,
  group,
  prevGroup,
}: GeneratorParams): Promise<[id: number, group: string][]> => {
  const members = _members.sort(() => Math.random() - 0.5)

  const solver = await generateSolver({
    members,
    roleConstraints,
    group,
    prevGroup,
  })
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

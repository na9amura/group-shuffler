import factory, { GLPK, Result } from "glpk.js"
import { subjects } from "./subjects"
import {
  GLPK_Var,
  GroupConstraintSource,
  Member,
  PrevGroupConstraintSource,
  RoleConstraint,
} from "./types"
import { varName } from "./var-name"

export const generateSolver = async <R extends RoleConstraint>(
  members: Member<keyof R>[],
  roleConstraints: R,
  group: GroupConstraintSource,
  prevGroup: PrevGroupConstraintSource
): Promise<{ solve: () => Promise<Result> }> => {
  const X = members.flatMap((m) =>
    group.list.map<[[number, string], GLPK_Var]>((g) => [
      [m.id, g],
      { name: varName(m.id, g), coef: 1.0 },
    ])
  )
  const vars = X.map(([, v]) => v)
  const binaries = vars.map((v) => v.name)

  // @ts-expect-error ts(2349): The default export of "glpk.js" has .
  const glpk: GLPK = await factory()
  const params = {
    name: "LP",
    objective: {
      direction: glpk.GLP_MAX,
      name: "group",
      vars,
    },
    binaries,
    subjectTo: subjects(glpk, X, members, roleConstraints, group, prevGroup),
  }
  const options = {
    msglev: glpk.GLP_MSG_ALL,
    presol: true,
  }
  return {
    // @ts-ignore: ts(80007) `solve` returns Promise
    solve: async () => glpk.solve(params, options),
  }
}

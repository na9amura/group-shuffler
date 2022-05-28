import factory, { GLPK, LP } from "glpk.js"

type Member<Roles> = { id: number; role: Roles }
type RoleConstraint = { [key: string]: { ub?: number } }
type GLPK_Var = LP["objective"]["vars"][0]
type GLPK_Subject = LP["subjectTo"][0]

const subjects = <R extends RoleConstraint>(
  glpk: GLPK,
  X: [[number, string], GLPK_Var][],
  members: Member<keyof R>[],
  roleConstraints: R,
  group: { list: string[]; lb: number; ub: number },
  prevGroup: number[][]
): GLPK_Subject[] => {
  const subject1 = members.flatMap((m) => {
    const m_g = X.filter(([[mId]]) => mId === m.id).map(([, v]) => v)
    return {
      name: "member-should-be-assigned-to-one-group",
      vars: m_g,
      bnds: { type: glpk.GLP_FX, ub: 1.0, lb: 1.0 },
    }
  })

  const { lb, ub } = group
  const bnds =
    lb === ub ? { type: glpk.GLP_FX, ub, lb } : { type: glpk.GLP_DB, ub, lb }
  const subject2 = group.list.flatMap((g) => {
    const g_m = X.filter(([[, gId]]) => gId === g).map(([, v]) => v)
    return {
      name: "members-in-group-should-be-less-than-n",
      vars: g_m,
      bnds,
    }
  })

  const subject3: GLPK_Subject[] = !roleConstraints
    ? []
    : group.list.flatMap((g) => {
        return Object.entries(roleConstraints).map(([name, constraint]) => {
          const roleMembers = members
            .filter(({ role }) => role === name)
            .map(({ id }) => id)
          const g_m = X.filter(
            ([[mId, gId]]) => gId === g && roleMembers.includes(mId)
          ).map(([, v]) => v)
          const ub = constraint.ub ?? members.length
          return {
            name: `${name}-should-be-less-than-${ub}`,
            vars: g_m,
            bnds: { type: glpk.GLP_DB, ub, lb: 0.0 },
          }
        })
      })

  // If previous group were like this and upper bound were 1,
  // [
  //   [0, 6, 7], Aaron Gathie  Hill
  //   [1, 2, 3], Bob   Charles Derrick
  //   [4, 5, 8], Eli   Farve   Ingram
  // ]
  //
  // create constraint like this.
  //   Sum(X[[0, A]], X[[6, A]], X[[7, A]]) <= 1
  //   Sum(X[[0, B]], X[[6, B]], X[[7, B]]) <= 1
  //   Sum(X[[0, C]], X[[6, C]], X[[7, C]]) <= 1
  //   ...
  //   Sum(X[[4, C]], X[[5, C]], X[[8, C]]) <= 1
  //
  // And avoid same group assignment. There are only one former group-mate in the new group.
  // [
  //   Aaron Derrick Eli
  //   Hill Bob Farve
  //   Gathie Charles Ingram
  // ]
  const subject4: GLPK_Subject[] =
    prevGroup.length === 0
      ? []
      : // [A, B, C]
        group.list.flatMap((g) => {
          // [[0, 6, 7] [1, 2, 3], [4, 5, 8]]
          return members
            .map((m) => prevGroup.find((mates) => mates.includes(m.id)) ?? [])
            .map((prevMates) => {
              const prevMatesVar = X.filter(
                ([[mId, gId]]) => prevMates.includes(mId) && g === gId
              ).map(([, v]) => v)
              return {
                name: "prev-group-constraint",
                vars: prevMatesVar,
                bnds: { type: glpk.GLP_UP, lb: 0.0, ub: 2.0 },
              }
            })
        })

  return [...subject1, ...subject2, ...subject3, ...subject4]
}

const varName = (id: Member<[]>["id"], groupName: string) =>
  `${id}-${groupName}`

export const solve = async <R extends RoleConstraint>(
  _members: Member<keyof R>[],
  roleConstraints: R,
  group: { list: string[]; lb: number; ub: number },
  prevGroup: number[][]
): Promise<[id: number, group: string][]> => {
  const members = _members.sort(() => Math.random() - 0.5)

  const X = members.flatMap((m) =>
    group.list.map<[[number, string], GLPK_Var]>((g) => [
      [m.id, g],
      { name: varName(m.id, g), coef: 1.0 },
    ])
  )
  const vars = X.map(([, v]) => v)
  const binaries = vars.map((v) => v.name)

  // @ts-expect-error : 2349
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
  const { result } = await glpk.solve(params, options)

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

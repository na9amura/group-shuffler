import { SubjectGenerator } from "../types"

/**
 * Limit number of people in a group
 */
export const subject: SubjectGenerator = ({ glpk, X, group }) => {
  const { lb, ub } = group
  const bnds =
    lb === ub ? { type: glpk.GLP_FX, ub, lb } : { type: glpk.GLP_DB, ub, lb }

  // e.g. [A, B, C]
  return group.list.flatMap((g) => {
    // Get [A_0, A_1, A_2, ...]
    const g_m = X.filter(([[, gId]]) => gId === g).map(([, v]) => v)

    // Sum of [A_0, A_1, A_2, ...] should be between lb and ub
    return {
      name: "group-member-limit",
      vars: g_m,
      bnds,
    }
  })
}

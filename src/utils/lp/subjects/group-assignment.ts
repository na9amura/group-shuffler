import { SubjectGenerator } from "../types"

/**
 * Ensure all members are assigned to one group
 */
export const subject: SubjectGenerator = ({ glpk, X, members }) => {
  // e.g. [0, 1, 2, 3]
  return members.flatMap((m) => {
    // Get [A_0, B_0, C_0]
    const m_g = X.filter(([[mId]]) => mId === m.id).map(([, v]) => v)

    // Sum of [A_0, B_0, C_0] should be 1
    return {
      name: "group-assignment",
      vars: m_g,
      bnds: { type: glpk.GLP_FX, ub: 1.0, lb: 1.0 },
    }
  })
}

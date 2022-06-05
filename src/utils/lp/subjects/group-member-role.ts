import { SubjectGenerator } from "../types"

/**
 * Limit number of people in a group who has same role.
 *
 * Suppose
 * - role constraints are
 *   - role1: { ub: 1 },
 *   - role2: { ub: undefined }
 * - member IDs of role1 are [0, 2, 9]
 * - groups are [A, B, C]
 *
 * Then this procedure create these constraint
 * - Sum(A_0, A_2, A_9) <= 1
 * - Sum(B_0, B_2, B_9) <= 1
 * - Sum(C_0, C_2, C_9) <= 1
 *
 * Due to those constraints, ID:0, ID:2 and ID:9 won't be assigned same group.
 */
export const subject: SubjectGenerator = ({
  glpk,
  X,
  members,
  roleConstraints,
  group,
}) => {
  if (!roleConstraints) return []

  // e.g. [A, B, C]
  return group.list.flatMap((g) => {
    // e.g. { role_1: { ub: 1 }, role_2: { ub: 3 } }
    return Object.entries(roleConstraints).map(([name, constraint]) => {
      // Get member IDs of current role, such as [0, 2, 9]
      const roleMembers = members
        .filter(({ role }) => role === name)
        .map(({ id }) => id)

      // Extract LP vars current group and role members [A_0, A_2, A_9]
      const g_m = X.filter(
        ([[mId, gId]]) => gId === g && roleMembers.includes(mId)
      ).map(([, v]) => v)

      // Sum of [A_0, A_2, A_9] shuld be less than upper bound
      const ub = constraint.ub ?? members.length
      return {
        name: "group-role",
        vars: g_m,
        bnds: { type: glpk.GLP_DB, ub, lb: 0.0 },
      }
    })
  })
}

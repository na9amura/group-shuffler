import { GLPK_Subject, SubjectGenerator, SubjectParams } from "../types"

/**
 * Ensure all members are assigned to one group
 */
const groupAssignmentSubject: SubjectGenerator = ({ glpk, X, members }) => {
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

/**
 * Limit number of people in a group
 */
const groupMemberLimitSubject: SubjectGenerator = ({ glpk, X, group }) => {
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
const groupRoleSubject: SubjectGenerator = ({
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

/**
 * Constraint to avoid previous group-mate.
 *
 * If previous group were like this and upper bound were 1,
 * [
 *   [0, 6, 7],
 *   [1, 2, 3],
 *   [4, 5, 8],
 * ]
 *
 * create constraint like this.
 * - Sum(X[[0, A]], X[[6, A]], X[[7, A]]) <= 1
 * - Sum(X[[0, B]], X[[6, B]], X[[7, B]]) <= 1
 * - Sum(X[[0, C]], X[[6, C]], X[[7, C]]) <= 1
 * - ...
 * - Sum(X[[4, C]], X[[5, C]], X[[8, C]]) <= 1
 *
 * And avoid same group assignment. There are no former group-mate in the new group.
 * [
 *   [0, 3, 4],
 *   [7, 2, 5],
 *   [6, 2, 8],
 * ]
 */
const prevGroupSubject: SubjectGenerator = ({
  glpk,
  X,
  members,
  group,
  prevGroup,
}) => {
  if (prevGroup.list.length === 0) return []

  // [A, B, C]
  return group.list.flatMap((g) => {
    // [[0, 6, 7] [1, 2, 3], [4, 5, 8]]
    return members
      .map((m) => prevGroup.list.find((mates) => mates.includes(m.id)) ?? [])
      .map((prevMates) => {
        // Extract [A_0, A_6, A_7] in first loop
        const prevMatesVar = X.filter(
          ([[mId, gId]]) => prevMates.includes(mId) && g === gId
        ).map(([, v]) => v)

        // Sum of [A_0, A_6, A_7] should be less than upper bound
        return {
          name: "prev-group",
          vars: prevMatesVar,
          bnds: { type: glpk.GLP_UP, lb: 0.0, ub: prevGroup.ub },
        }
      })
  })
}

export const subjects = ({
  glpk,
  X,
  members,
  roleConstraints,
  group,
  prevGroup,
}: SubjectParams): GLPK_Subject[] => {
  const args = { glpk, X, members, roleConstraints, group, prevGroup }
  return [
    groupAssignmentSubject,
    groupMemberLimitSubject,
    groupRoleSubject,
    prevGroupSubject,
  ].flatMap((generator) => generator(args))
}

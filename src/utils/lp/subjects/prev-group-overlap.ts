import { SubjectGenerator } from "../types"

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
export const subject: SubjectGenerator = ({
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

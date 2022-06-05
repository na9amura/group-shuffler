import { GLPK_Subject, SubjectParams } from "../types"
import { subject as groupAssignmentSubject } from "./group-assignment"
import { subject as groupMemberLimitSubject } from "./group-member-limit"
import { subject as groupRoleMemberSubject } from "./group-member-role"
import { subject as prevGroupOverlapSubject } from "./prev-group-overlap"

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
    groupRoleMemberSubject,
    prevGroupOverlapSubject,
  ].flatMap((generator) => generator(args))
}

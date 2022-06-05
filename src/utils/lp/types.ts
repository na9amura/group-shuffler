import { GLPK, LP } from "glpk.js"

export type GLPK_Var = LP["objective"]["vars"][0]
export type GLPK_Subject = LP["subjectTo"][0]

export type Member<Roles> = { id: number; role: Roles }
export type RoleConstraint = { [key: string]: { ub?: number } }

export type GeneratorParams = {
  members: { id: number; role: keyof RoleConstraint }[]
  roleConstraints: RoleConstraint
  group: {
    list: string[]
    lb: number
    ub: number
  }
  prevGroup: {
    list: number[][]
    ub: number
  }
}

export type SubjectParams = {
  glpk: GLPK
  X: [[number, string], GLPK_Var][]
  members: { id: number; role: keyof RoleConstraint }[]
  roleConstraints: RoleConstraint
  group: {
    list: string[]
    lb: number
    ub: number
  }
  prevGroup: {
    list: number[][]
    ub: number
  }
}

export type SubjectGenerator = (params: SubjectParams) => GLPK_Subject[]

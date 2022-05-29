import { LP } from "glpk.js"

export type GLPK_Var = LP["objective"]["vars"][0]
export type GLPK_Subject = LP["subjectTo"][0]

export type Member<Roles> = { id: number; role: Roles }
export type RoleConstraint = { [key: string]: { ub?: number } }
export type XType = [[number, string], GLPK_Var][]
export type GroupConstraintSource = {
  list: string[]
  lb: number
  ub: number
}
export type PrevGroupConstraintSource = {
  list: number[][]
  ub: number
}

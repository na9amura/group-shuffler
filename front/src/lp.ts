import factory, { Options, GLPK, LP, Result } from 'glpk.js'

type Member<Roles> = { id: number, role: Roles }
type RoleConstraint = { [key: string]: { ub?: number } }
type GLPK_Var = LP["objective"]["vars"][0]
type GLPK_Subject = LP["subjectTo"][0]

const subjects = <R extends RoleConstraint> (
    glpk: GLPK,
    X: [[number, string], GLPK_Var][],
    members: Member<keyof R>[],
    groups: string[],
    roleConstraints: R
): GLPK_Subject[] => {
    const subject1 = members.flatMap((m) => {
        const m_g = X.filter(([[mId]]) => mId === m.id).map(([, v]) => v)
        return {
            name: 'member-should-be-assigned-to-one-group',
            vars: m_g,
            bnds: { type: glpk.GLP_FX, ub: 1.0, lb: 1.0 }
        }
    })

    const subject2 = groups.flatMap((g) => {
        const g_m = X.filter(([[, gId]]) => gId === g).map(([, v]) => v)
        return {
            name: 'members-in-group-should-be-less-than-n',
            vars: g_m,
            bnds: { type: glpk.GLP_DB, ub: 4.0, lb: 3.0 }
        }
    })

    const subject3: GLPK_Subject[] = !roleConstraints ? [] : (
        groups.flatMap((g) => {
            return Object.entries(roleConstraints).map(([name, constraint]) => {
                const roleMembers = members.filter(({ role }) => role === name).map(({ id }) => id)
                const g_m = X.filter(([[mId, gId]]) => gId === g && roleMembers.includes(mId)).map(([, v]) => v)
                const ub = constraint.ub ?? members.length
                return {
                    name: `${name}-should-be-less-than-${ub}`,
                    vars: g_m,
                    bnds: { type: glpk.GLP_DB, ub, lb: 0.0 }
                }
            })
        })
    )

    return [
        ...subject1,
        ...subject2,
        ...subject3,
    ]
}

const varName = (id: Member<{}>['id'], groupName: string) => `${id}-${groupName}`

export const solve = async <R extends RoleConstraint> (
    _members: Member<keyof R>[],
    groups: string[],
    roleConstraints: R
): Promise<[id: number, group: string][]> => {
    const members = _members.sort(() => Math.random() - 0.5)

    const X = members.flatMap((m) => groups.map<[[number, string], GLPK_Var]>((g) => [[m.id, g], { name: varName(m.id, g), coef: 1.0 }]))
    const vars = X.map(([, v]) => v)
    const binaries = vars.map((v) => v.name)

    const glpk: GLPK = await factory()
    const params = {
        name: 'LP',
        objective: {
            direction: glpk.GLP_MAX,
            name: 'group',
            vars,
        },
        binaries,
        subjectTo: subjects(glpk, X, members, groups, roleConstraints)
    }
    const options = {
        msglev: glpk.GLP_MSG_ALL,
        presol: true,
    }
    const { result } = await glpk.solve(params, options);

    return members
        .flatMap((m) => groups.map<[number, string, number]>((g) => [m.id, g, result.vars[varName(m.id, g)]]))
        .filter(([, , assign]) => assign === 1)
        .map(([id, group]) => [id, group])
}

import factory, { Options, GLPK, LP } from 'glpk.js'

type Member<R> = { id: number, role: R }
type RoleConstraint = { [key: string]: { ub: number } | {} }
type GLPK_Var = LP["objective"]["vars"][0]
type GLPK_Subject = LP["subjectTo"][0]

export const run = async <R extends RoleConstraint> (
    _members: Member<keyof R>[],
    groups: string[],
    roleConstraints?: R[]
) => {
    const members = _members.sort(() => Math.random() - 0.5)

    const X = members.flatMap((m) => groups.map<[[number, string], GLPK_Var]>((g) => [[m.id, g], { name: `${m.id}-${g}`, coef: 1.0 }]))
    const vars = X.map(([, v]) => v)
    const binaries = vars.map((v) => v.name)

    const glpk: GLPK = await factory()
    const options: Options = {
        msglev: glpk.GLP_MSG_ALL,
        presol: true,
    }

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

    let subject3: GLPK_Subject[] = []
    if (roleConstraints) {
        subject3 = groups.flatMap((g) => {
            return roleConstraints.map(({ name, ub }) => {
                const roleMembers = members.filter(({ role }) => role === name).map(({ id }) => id)
                const g_m = X.filter(([[mId, gId]]) => gId === g && roleMembers.includes(mId)).map(([, v]) => v)
                return {
                    name: `${name}-should-be-less-than-${ub}`,
                    vars: g_m,
                    bnds: { type: glpk.GLP_DB, ub, lb: 0.0 }
                }
            })
        })
    }

    const result = await glpk.solve({
        name: 'LP',
        objective: {
            direction: glpk.GLP_MAX,
            name: 'group',
            vars,
        },
        binaries,
        subjectTo: [
            ...subject1,
            ...subject2,
            ...subject3,
        ]
    }, options);

    console.log('---------------------------------------')
    console.log(result)
}
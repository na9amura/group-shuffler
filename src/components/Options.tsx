import { FC } from "react"

type Role = [string, { ub: string }]

export const Options: FC<{
  numGroups: number
  roles: Role[]
  setRoles: (roles: Role[]) => void
  lowerBuffer: string
  setLowerBuffer: (value: string) => void
  upperBuffer: string
  setUpperBuffer: (value: string) => void
}> = ({
  numGroups,
  roles,
  setRoles,
  lowerBuffer,
  setLowerBuffer,
  upperBuffer,
  setUpperBuffer,
}) => {
  const setUb = (target: string, ub: string) => {
    const _roles = roles.map<Role>(([name, value]) =>
      target === name ? [name, { ...value, ub }] : [name, value]
    )
    setRoles(_roles)
  }

  return (
    <div>
      <h3>Config</h3>
      {roles.map(([name, value]) => (
        <div key={name}>
          <label>Max {name} in a group: </label>
          <input
            type="number"
            min={9}
            max={100}
            value={value.ub}
            onChange={(e) => setUb(name, e.target.value)}
          />
        </div>
      ))}
      <div>
        <label>People in a group: </label>
        <input
          type="number"
          min={0}
          max={50}
          value={lowerBuffer}
          onChange={(e) => setLowerBuffer(e.target.value)}
        />
        <span> ~ </span>
        <input
          type="number"
          min={0}
          max={50}
          value={upperBuffer}
          onChange={(e) => setUpperBuffer(e.target.value)}
        />
        <span> Create {numGroups} groups </span>
      </div>
    </div>
  )
}

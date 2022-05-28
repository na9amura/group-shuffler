import { FC } from "react"
import { Role } from "../utils/types/role"
import "./Options.css"

export const Options: FC<{
  className: string
  numGroups: number
  roles: Role[]
  setRoles: (roles: Role[]) => void
  lowerBuffer: string
  setLowerBuffer: (value: string) => void
  upperBuffer: string
  setUpperBuffer: (value: string) => void
  maxOverlap: string
  setMaxOverlap: (value: string) => void
}> = ({
  className,
  numGroups,
  roles,
  setRoles,
  lowerBuffer,
  setLowerBuffer,
  upperBuffer,
  setUpperBuffer,
  maxOverlap,
  setMaxOverlap,
}) => {
  const setUb = (target: string, ub: string) => {
    const _roles = roles.map<Role>(([name, value]) =>
      target === name ? [name, { ...value, ub }] : [name, value]
    )
    setRoles(_roles)
  }

  return (
    <div className={className}>
      <h3>Shuffle optioin</h3>
      <div className="options-group">
        <h4>People in a group</h4>
        <div className="options-group-input">
          <div>
            <label>Min</label>
            <input
              type="number"
              min={0}
              max={50}
              value={lowerBuffer}
              onChange={(e) => setLowerBuffer(e.target.value)}
            />
          </div>
          <span> ~ </span>
          <div>
            <label>Max</label>
            <input
              type="number"
              min={0}
              max={50}
              value={upperBuffer}
              onChange={(e) => setUpperBuffer(e.target.value)}
            />
          </div>
        </div>
        <blockquote>
          <span>Create {numGroups} groups</span>
        </blockquote>
      </div>
      <div className="options-role">
        <h4>Role config</h4>
        {roles.map(([name, value]) => (
          <div key={name}>
            <label>Max {name} in a group</label>
            <input
              type="number"
              min={9}
              max={100}
              value={value.ub}
              onChange={(e) => setUb(name, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="options-prev-gropu">
        <h4>Allow previous group overlap</h4>
        <div>
          <label>Max number</label>
          <input
            type="number"
            min={9}
            max={100}
            value={maxOverlap}
            onChange={(e) => setMaxOverlap(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

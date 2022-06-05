type Member<Roles> = { id: number; role: Roles }

export const varName = (id: Member<[]>["id"], groupName: string) =>
  `${id}-${groupName}`

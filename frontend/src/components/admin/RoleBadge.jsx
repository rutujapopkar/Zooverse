import React from 'react'

export default function RoleBadge({ role }){
  return <span className={`status-badge role-${role}`}>{role}</span>
}

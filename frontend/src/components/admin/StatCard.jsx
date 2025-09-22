import React from 'react'

export default function StatCard({ icon, label, value, kind }){
  return (
    <div className={`stat-card ${kind||''}`}> 
      <div className="stat-card__icon" aria-hidden>{icon}</div>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
    </div>
  )
}

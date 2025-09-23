import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

function getRoleFromToken(token){
  try{ const payload = JSON.parse(atob(token.split('.')[1])); return payload && payload.role }catch{ return null }
}

export function RequireAuth({ children }){
  const token = localStorage.getItem('token')
  const location = useLocation()
  if(!token){
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

export function RequireAdmin({ children }){
  const token = localStorage.getItem('token')
  const location = useLocation()
  const role = token ? getRoleFromToken(token) : null
  if(!token || role !== 'admin'){
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

export function RequireVet({ children }){
  const token = localStorage.getItem('token')
  const location = useLocation()
  const role = token ? getRoleFromToken(token) : null
  if(!token || (role !== 'vet' && role !== 'admin')){
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

export function RequireStaff({ children }){
  const token = localStorage.getItem('token')
  const location = useLocation()
  const role = token ? getRoleFromToken(token) : null
  if(!token || (role !== 'staff' && role !== 'admin')){
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { label:'Dashboard', path:'/admin' },
  { label:'Animals', path:'/admin/animals' },
  { label:'Staff', path:'/admin/staff' },
  { label:'Tickets', path:'/admin/tickets' },
  // Removed: News & Reports, Feedback, Audit Log per request
]

export default function AdminLayout({ children, searchBar }){
  const nav = useNavigate()
  const loc = useLocation()
  return (
  <div className="admin-layout admin-has-global-nav">
      <aside className="admin-sidebar slideInLeft" aria-label="Admin navigation">
        <div className="admin-sidebar__brand">Admin Panel</div>
        <nav>
          {navItems.map(i => (
            <button key={i.path} onClick={()=>nav(i.path)} aria-current={loc.pathname===i.path? 'page': undefined} style={loc.pathname===i.path? {background:'#2f443c', color:'#fff'}:null}>{i.label}</button>
          ))}
        </nav>
      </aside>
      <main className="admin-main" id="main-content">
        {searchBar}
        {children}
      </main>
    </div>
  )
}

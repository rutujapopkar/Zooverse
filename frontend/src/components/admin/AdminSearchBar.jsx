import React, { useState } from 'react'

export default function AdminSearchBar({ onSearch }){
  const [q, setQ] = useState('')
  return (
    <div className="admin-searchbar-wrapper">
      <div className="admin-search" role="search">
        <form onSubmit={e=>{ e.preventDefault(); onSearch && onSearch(q) }}>
          <label htmlFor="admin-global-search" style={{display:'none'}}>Search</label>
          <input id="admin-global-search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search animals, staff, tickets..." />
        </form>
      </div>
    </div>
  )
}

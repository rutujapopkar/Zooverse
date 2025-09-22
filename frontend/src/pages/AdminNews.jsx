import React from 'react'
import AdminLayout from '../components/admin/AdminLayout'

export default function AdminNews(){
  return (
    <AdminLayout>
      <div className="fadeIn" style={{paddingTop:'1rem'}}>
        <h2>News & Reports (Placeholder)</h2>
        <p>Planned capabilities:</p>
        <ul>
          <li>Create conservation news articles.</li>
          <li>Attach hero image & category labels.</li>
          <li>Version history / quick edits.</li>
        </ul>
      </div>
    </AdminLayout>
  )
}

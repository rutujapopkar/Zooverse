import React from 'react'
import AdminLayout from '../components/admin/AdminLayout'

export default function AdminAudit(){
  return (
    <AdminLayout>
      <div className="fadeIn" style={{paddingTop:'1rem'}}>
        <h2>Audit Log (Placeholder)</h2>
        <p>The audit log will display sensitive administrative actions once backend support is added.</p>
        <ul>
          <li>Record animal CRUD operations.</li>
          <li>User role changes & ticket refunds.</li>
          <li>Filter by actor, action type, date range.</li>
        </ul>
      </div>
    </AdminLayout>
  )
}

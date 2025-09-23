import React from 'react'
import AdminLayout from '../components/admin/AdminLayout'

export default function AdminEvents(){
  return (
    <AdminLayout>
      <div className="fadeIn admin-placeholder-block">
        <h2>Events (Placeholder)</h2>
        <p>This section will let admins create, schedule, and publish zoo events. Upcoming enhancements planned:</p>
        <ul>
          <li>Create/Edit event with title, date range, description, banner image.</li>
          <li>Tag events for seasonal campaigns.</li>
          <li>Public visibility toggle & draft mode.</li>
        </ul>
      </div>
    </AdminLayout>
  )
}

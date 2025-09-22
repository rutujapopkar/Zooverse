import React from 'react'
import AdminLayout from '../components/admin/AdminLayout'

export default function AdminFeedback(){
  return (
    <AdminLayout>
      <div className="fadeIn" style={{paddingTop:'1rem'}}>
        <h2>Visitor Feedback (Placeholder)</h2>
        <p>Planned features:</p>
        <ul>
          <li>List user-submitted feedback & sentiment classification.</li>
          <li>Filtering by status (new, triaged, resolved).</li>
          <li>Export CSV & analytics summary.</li>
        </ul>
      </div>
    </AdminLayout>
  )
}

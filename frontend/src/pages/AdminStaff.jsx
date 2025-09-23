import React, { useEffect, useState } from 'react'
import { Box, Typography, Button, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Tooltip, Stack } from '@mui/material'
import axios from 'axios'
import { useSnackbar } from '../components/SnackbarProvider'

function StaffForm({ open, onClose, onSave, initial }){
  const [form, setForm] = useState(initial || { username:'', role:'staff', password:'' })
  useEffect(()=> setForm(initial || { username:'', role:'staff', password:'' }), [initial])
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{initial? 'Edit' : 'Create'} User</DialogTitle>
      <DialogContent>
        <TextField fullWidth label="Username" sx={{mt:1}} value={form.username||''} disabled={!!initial}
          onChange={e=>setForm({...form, username:e.target.value})} />
        <TextField select fullWidth label="Role" sx={{mt:2}} value={form.role||'staff'} onChange={e=>setForm({...form, role:e.target.value})}>
          <MenuItem value="admin">admin</MenuItem>
          <MenuItem value="vet">vet</MenuItem>
          <MenuItem value="staff">staff</MenuItem>
          <MenuItem value="customer">customer</MenuItem>
        </TextField>
        <TextField fullWidth type="password" label="Password" sx={{mt:2}} value={form.password||''} onChange={e=>setForm({...form, password:e.target.value})} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={()=>onSave(form)}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default function AdminStaff(){
  const [users, setUsers] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const token = localStorage.getItem('token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const { notify } = useSnackbar()

  function load(){ axios.get('/api/staff', { headers }).then(r=>setUsers(r.data)).catch(console.error) }
  useEffect(()=>{ load() }, [])

  function handleCreate(){ setEditing(null); setOpen(true) }
  function handleEdit(u){ setEditing(u); setOpen(true) }
  function handleDelete(u){ axios.delete(`/api/staff/${u.id}`, { headers }).then(()=>{ notify('Deleted user','success'); load() }).catch(e=>{ console.error(e); notify('Delete failed','error') }) }
  function handleSave(data){
    if(editing){
      axios.put(`/api/staff/${editing.id}`, data, { headers }).then(()=>{ setOpen(false); notify('Updated user','success'); load() }).catch(e=>{ console.error(e); notify('Update failed','error') })
    } else {
      axios.post('/api/staff', data, { headers }).then(()=>{ setOpen(false); notify('Created user','success'); load() }).catch(e=>{ console.error(e); notify('Create failed','error') })
    }
  }

  function changeRole(u, role){
    axios.put(`/api/admin/users/${u.id}`, { role }, { headers })
      .then(()=>{ notify(`Updated ${u.username} role to ${role}`, 'success'); load() })
      .catch(e=>{ console.error(e); notify('Role update failed','error') })
  }

  return (
    <Box sx={{mt:4}}>
      <Typography variant="h4" gutterBottom>Admin — Staff Management</Typography>
      <Button variant="contained" onClick={handleCreate} sx={{mb:2}}>Create User</Button>
      <Grid container spacing={2}>
        {users.map(u=> (
          <Grid item xs={12} md={6} key={u.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{u.username}</Typography>
                <Typography color="text.secondary" sx={{display:'flex', alignItems:'center', gap:1}}>Role: <span className={`status-badge role-${u.role}`}>{u.role}</span></Typography>
                <Box sx={{mt:2, display:'flex', flexDirection:'column', gap:1}}>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button size="small" onClick={()=>handleEdit(u)}>Edit</Button>
                    <Button size="small" color="error" onClick={()=>handleDelete(u)}>Delete</Button>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {u.role !== 'vet' && (
                      <Tooltip title="Grant veterinary (doctor) access">
                        <Button size="small" color="success" onClick={()=>changeRole(u,'vet')}>Make Vet</Button>
                      </Tooltip>) }
                    {u.role !== 'staff' && (
                      <Button size="small" onClick={()=>changeRole(u,'staff')}>Make Staff</Button>) }
                    {u.role !== 'customer' && (
                      <Button size="small" onClick={()=>changeRole(u,'customer')}>Demote Customer</Button>) }
                    {u.role !== 'admin' && (
                      <Button size="small" color="secondary" onClick={()=>changeRole(u,'admin')}>Make Admin</Button>) }
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <StaffForm open={open} onClose={()=>setOpen(false)} onSave={handleSave} initial={editing} />
    </Box>
  )
}

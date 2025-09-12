import React, {useEffect, useState} from 'react'
import { Box, Typography, Grid, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material'
import axios from 'axios'

function AnimalForm({open, onClose, onSave, initial}){
  const [form, setForm] = useState(initial || {})
  useEffect(()=> setForm(initial || {}), [initial])
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{initial? 'Edit' : 'Create'} Animal</DialogTitle>
      <DialogContent>
        <TextField fullWidth sx={{mt:1}} label="Name" value={form.name||''} onChange={e=>setForm({...form, name:e.target.value})} />
        <TextField fullWidth sx={{mt:2}} label="Species" value={form.species||''} onChange={e=>setForm({...form, species:e.target.value})} />
        <TextField fullWidth sx={{mt:2}} label="Habitat" value={form.habitat_id||''} onChange={e=>setForm({...form, habitat_id:e.target.value})} />
        <TextField fullWidth sx={{mt:2}} label="Photo URL" value={form.photo_url||''} onChange={e=>setForm({...form, photo_url:e.target.value})} />
        <TextField fullWidth sx={{mt:2}} label="Description" multiline rows={3} value={form.description||''} onChange={e=>setForm({...form, description:e.target.value})} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={()=>onSave(form)}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

export default function AdminAnimals(){
  const [animals, setAnimals] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const token = localStorage.getItem('token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  useEffect(()=>{
    fetchList()
  }, [])

  function fetchList(){
    axios.get('/api/animals', { headers }).then(r=>setAnimals(r.data)).catch(e=>console.error(e))
  }

  function handleCreate(){ setEditing(null); setOpen(true) }
  function handleEdit(a){ setEditing(a); setOpen(true) }
  function handleDelete(a){
    axios.delete(`/api/animals/${a.id}`, { headers }).then(()=>fetchList()).catch(e=>console.error(e))
  }
  function handleSave(data){
    if(editing){
      axios.put(`/api/animals/${editing.id}`, data, { headers }).then(()=>{ setOpen(false); fetchList() }).catch(e=>console.error(e))
    } else {
      axios.post('/api/animals', data, { headers }).then(()=>{ setOpen(false); fetchList() }).catch(e=>console.error(e))
    }
  }

  return (
    <Box sx={{mt:4}}>
      <Typography variant="h4" gutterBottom>Admin — Animals</Typography>
      <Button variant="contained" onClick={handleCreate} sx={{mb:2}}>Create Animal</Button>
      <Grid container spacing={2}>
        {animals.map(a=> (
          <Grid item xs={12} sm={6} md={4} key={a.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{a.name}</Typography>
                <Typography color="text.secondary">{a.species}</Typography>
                <Typography sx={{mt:1}}>{a.description}</Typography>
                <Box sx={{mt:2}}>
                  <Button size="small" onClick={()=>handleEdit(a)}>Edit</Button>
                  <Button size="small" color="error" onClick={()=>handleDelete(a)}>Delete</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <AnimalForm open={open} onClose={()=>setOpen(false)} onSave={handleSave} initial={editing} />
    </Box>
  )
}

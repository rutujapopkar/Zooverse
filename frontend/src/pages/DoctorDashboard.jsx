import React, { useEffect, useState } from 'react'
import { Box, Typography, Grid, Paper, List, ListItemButton, ListItemText, Divider, TextField, Button, Stack, CircularProgress } from '@mui/material'
import axios from 'axios'
import { normalizeList } from '../utils/normalize'

function useToken(){
  const token = localStorage.getItem('token')
  return token
}

export default function DoctorDashboard(){
  const token = useToken()
  const [animals, setAnimals] = useState([])
  const [filtered, setFiltered] = useState([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [records, setRecords] = useState([])
  const [form, setForm] = useState({ notes:'', diagnosis:'', treatment:'', date:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  useEffect(()=>{
    let alive = true
    setLoading(true); setError(null)
    axios.get('/api/animals')
      .then(r=> { if(!alive) return; const list = normalizeList(r.data); if(!Array.isArray(r.data?.data)) console.warn('Unexpected /api/animals shape (doctor):', r.data); setAnimals(list); setFiltered(list) })
      .catch(()=> { if(!alive) return; setError('Failed to load animals'); setAnimals([]); setFiltered([]) })
      .finally(()=> { if(alive) setLoading(false) })
    return ()=> { alive = false }
  }, [])

  // filter animals when query changes
  useEffect(()=>{
    const q = query.trim().toLowerCase()
    if(!q){ setFiltered(animals); return }
    setFiltered(animals.filter(a => (
      a.name?.toLowerCase().includes(q) ||
      a.species?.toLowerCase().includes(q) ||
      String(a.id).includes(q)
    )))
  }, [query, animals])

  useEffect(()=>{
    if(!selected) return
    axios.get(`/api/animals/${selected.id}/records`, { headers })
      .then(r=> setRecords(r.data||[]))
      .catch(()=> setRecords([]))
  }, [selected])

  const submit = ()=>{
    if(!selected) return
    axios.post(`/api/animals/${selected.id}/records`, form, { headers })
      .then(r=>{
        setRecords(prev=> [r.data, ...prev])
        setForm({ notes:'', diagnosis:'', treatment:'', date:'' })
      })
      .catch(()=>{})
  }

  const filteredList = Array.isArray(filtered)? filtered : []
  return (
    <Box sx={{mt:4}} className="fadeIn doctor-dashboard">
      <Typography variant='h4' gutterBottom>Doctor Dashboard</Typography>
      <Typography variant='body2' sx={{mb:2, opacity:.8}}>Review animals, add clinical notes & treatments. Use search to locate a patient.</Typography>
      <Box sx={{mb:2, maxWidth:420}}>
        <input
          className="doctor-search-bar"
          placeholder="Search animal by id, name or species..."
          value={query}
          onChange={e=>setQuery(e.target.value)}
          aria-label="Search animals"
        />
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Paper sx={{maxHeight:520, overflow:'auto', display:'flex', flexDirection:'column'}}>
            <Box sx={{p:1.2, borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
              <Typography variant='subtitle2' sx={{fontWeight:600}}>Animals ({filteredList.length})</Typography>
            </Box>
            <Box sx={{flex:1, overflow:'auto'}}>
              {loading && (
                <Box sx={{display:'flex', alignItems:'center', justifyContent:'center', py:3}}><CircularProgress size={28} /></Box>
              )}
              {(!loading && error) && (
                <Box sx={{p:2}}>
                  <Typography variant='body2' color='error'>{error}</Typography>
                  <Button size='small' sx={{mt:1}} onClick={()=>{
                    setLoading(true); setError(null);
                    axios.get('/api/animals')
                      .then(r=> { const list=normalizeList(r.data); setAnimals(list); setFiltered(list) })
                      .catch(()=> setError('Failed to load animals'))
                      .finally(()=> setLoading(false))
                  }}>Retry</Button>
                </Box>
              )}
              {!loading && !error && filteredList.length===0 && (
                <Box sx={{p:2}}>
                  <Typography variant='body2'>No animals match your search.</Typography>
                </Box>
              )}
              <List dense>
                {filteredList.map(a=> (
                  <ListItemButton key={a.id} selected={selected && selected.id===a.id} onClick={()=> setSelected(a)}>
                    <ListItemText primary={a.name || 'Unnamed'} secondary={a.species || 'Unknown species'} />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          {selected ? (
            <Paper sx={{p:2}}>
              <Typography variant='h6'>{selected.name} Records</Typography>
              <Box sx={{mt:2}}>
                <Stack direction={{xs:'column', sm:'row'}} spacing={2}>
                  <TextField label='Date (YYYY-MM-DD)' value={form.date} onChange={e=> setForm(f=>({...f,date:e.target.value}))} size='small' />
                  <TextField label='Notes' value={form.notes} onChange={e=> setForm(f=>({...f,notes:e.target.value}))} size='small' />
                  <TextField label='Diagnosis' value={form.diagnosis} onChange={e=> setForm(f=>({...f,diagnosis:e.target.value}))} size='small' />
                  <TextField label='Treatment' value={form.treatment} onChange={e=> setForm(f=>({...f,treatment:e.target.value}))} size='small' />
                  <Button variant='contained' onClick={submit}>Add</Button>
                </Stack>
              </Box>
              <Divider sx={{my:2}} />
              <Box sx={{maxHeight:300, overflow:'auto'}}>
                {records.length===0 && <Typography variant='body2'>No records yet.</Typography>}
                {records.map(r=> (
                  <Paper key={r.id} sx={{p:1, mb:1}} variant='outlined'>
                    <Typography variant='caption'>{r.date}</Typography>
                    <Typography variant='body2'>Notes: {r.notes}</Typography>
                    {r.diagnosis && <Typography variant='body2'>Dx: {r.diagnosis}</Typography>}
                    {r.treatment && <Typography variant='body2'>Tx: {r.treatment}</Typography>}
                  </Paper>
                ))}
              </Box>
            </Paper>
          ) : (
            <Paper sx={{p:4, textAlign:'center'}}>
              <Typography variant='h6' gutterBottom>Select an animal</Typography>
              <Typography variant='body2'>Choose an animal from the left panel to view or add medical records.</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

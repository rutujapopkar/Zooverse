import React, {useEffect, useState} from 'react'
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button, TextField, Stack } from '@mui/material'
import ImageWithFallback from '../components/ImageWithFallback'
import { sanitizeName } from '../utils/sanitizeName'
import axios from 'axios'

export default function AnimalsPage(){
  const [animals, setAnimals] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editDesc, setEditDesc] = useState('')
  const token = localStorage.getItem('token')
  let role = null
  try{ const payload = token && JSON.parse(atob(token.split('.')[1])); role = payload && payload.role }catch(e){}

  useEffect(()=>{
    axios.get('/api/animals')
      .then(r=>setAnimals(r.data))
      .catch(e=>console.error(e))
  }, [])

  return (
    <Box sx={{mt:4}}>
      <Typography variant="h4" gutterBottom>Animals</Typography>
      <Grid container spacing={2}>
        {animals.map(a=> (
          <Grid item key={a.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia>
                <ImageWithFallback
                  srcList={(() => { const slug = sanitizeName(a.name); return [
                    `/uploads/animals/${slug}.png`,
                    `/uploads/animals/${slug}.jpg`,
                    `/images/animals/${slug}.png`,
                    `/images/animals/${slug}.jpg`,
                    a.photo_url || `https://source.unsplash.com/featured/?${encodeURIComponent(a.species||a.name||'animal')}`
                  ]})()}
                  alt={a.name}
                  style={{width:'100%', height:140, objectFit:'cover'}}
                />
              </CardMedia>
              <CardContent>
                <Typography variant="h6">{a.name}</Typography>
                <Typography color="text.secondary">{a.species}</Typography>
                {editingId === a.id && role==='admin' ? (
                  <Stack direction={{xs:'column', sm:'row'}} spacing={1} sx={{mt:1}}>
                    <TextField fullWidth size="small" label="Description" value={editDesc} onChange={e=>setEditDesc(e.target.value)} />
                    <Button size="small" variant="contained" onClick={()=>{
                      const headers = token ? { Authorization: `Bearer ${token}` } : {}
                      axios.put(`/api/animals/${a.id}`, { description: editDesc }, { headers })
                        .then(()=>{
                          setAnimals(prev=> prev.map(x=> x.id===a.id ? { ...x, description: editDesc } : x))
                          setEditingId(null)
                        })
                        .catch(()=>{})
                    }}>Save</Button>
                    <Button size="small" onClick={()=>{ setEditingId(null); setEditDesc('') }}>Cancel</Button>
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{mt:1}}>{a.description}</Typography>
                )}
                {role==='admin' && editingId !== a.id && (
                  <Button size="small" sx={{mt:1}} onClick={()=>{ setEditingId(a.id); setEditDesc(a.description||'') }}>Edit Description</Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

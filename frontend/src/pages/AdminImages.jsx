import React, { useEffect, useState } from 'react'
import { Box, Typography, Paper, TextField, Button, Grid, Alert, Chip, Link as MuiLink } from '@mui/material'
import { sanitizeName } from '../utils/sanitizeName'
import { normalizeList } from '../utils/normalize'
import { useSnackbar } from '../components/SnackbarProvider'

export default function AdminImages(){
  const [file, setFile] = useState(null)
  const [target, setTarget] = useState('building.jpg')
  const [msg, setMsg] = useState(null)
  const [animals, setAnimals] = useState([])
  const [checks, setChecks] = useState({})

  const token = localStorage.getItem('token')
  const { notify } = useSnackbar()

  const upload = async (e) => {
    e.preventDefault()
    setMsg(null)
    if(!file){ setMsg({type:'error', text:'Choose a file first'}); return }
    try{
      const fd = new FormData()
      fd.append('file', file)
      fd.append('target', target)
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Authorization': token ? `Bearer ${token}` : undefined },
        body: fd
      })
      const data = await res.json()
      if(!res.ok){ throw new Error(data.msg || 'Upload failed') }
      setMsg({type:'success', text:`Uploaded. URL: ${data.url}`})
      notify('Image uploaded','success')
    }catch(err){
      setMsg({type:'error', text: String(err.message || err)})
      notify('Upload failed','error')
    }
  }

  // fetch animals
  useEffect(() => {
    fetch('/api/animals')
      .then(r=>r.json())
      .then(payload=> setAnimals(normalizeList(payload)))
      .catch(()=>{})
  }, [])

  // check image existence for each animal (uploads then images)
  useEffect(() => {
    const controller = new AbortController()
    async function doChecks(){
      const entries = await Promise.all((animals||[]).map(async a => {
        const slug = sanitizeName(a.name)
        const urls = [
          `/uploads/animals/${slug}.png`,
          `/uploads/animals/${slug}.jpg`,
          `/images/animals/${slug}.png`,
          `/images/animals/${slug}.jpg`,
        ]
        for (const u of urls){
          try{
            const res = await fetch(u, { method: 'HEAD', signal: controller.signal })
            if (res.ok) return [a.id, { exists: true, url: u }]
          }catch(_){/* ignore */}
        }
        return [a.id, { exists: false }]
      }))
      const obj = {}
      for (const [id, stat] of entries){ obj[id] = stat }
      setChecks(obj)
    }
    if (animals && animals.length){ doChecks() }
    return () => controller.abort()
  }, [animals])

  return (
    <Box sx={{mt:4}}>
      <Typography variant="h4" gutterBottom>Admin: Image Uploader</Typography>
      <Paper sx={{p:2}}>
        <form onSubmit={upload}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Target Path" fullWidth value={target} onChange={e=>setTarget(e.target.value)} helperText="e.g., building.jpg or animals/lion.jpg" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button variant="outlined" component="label" fullWidth>
                Choose Image
                <input type="file" hidden accept=".jpg,.jpeg,.png" onChange={e=>setFile(e.target.files?.[0]||null)} />
              </Button>
              {file && <Typography variant="body2" sx={{mt:1}}>Selected: {file.name}</Typography>}
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained">Upload</Button>
            </Grid>
          </Grid>
        </form>
        {msg && <Alert severity={msg.type} sx={{mt:2}}>{msg.text}</Alert>}
        <Box sx={{mt:3}}>
          <Typography variant="h6" gutterBottom>Animal Image Status</Typography>
          <Grid container spacing={1}>
            {(Array.isArray(animals)? animals : []).map(a => {
              const st = checks[a.id]
              return (
                <Grid item xs={12} sm={6} md={4} key={a.id}>
                  <Paper sx={{p:1, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <Box>
                      <Typography variant="body1">{a.name}</Typography>
                      {st?.exists && <MuiLink href={st.url} target="_blank" rel="noreferrer" variant="caption">{st.url}</MuiLink>}
                    </Box>
                    <Chip size="small" label={st?.exists? 'Found' : 'Missing'} color={st?.exists? 'success' : 'warning'} />
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        </Box>
        <Box sx={{mt:3}}>
          <Typography variant="subtitle1">Tips:</Typography>
          <ul>
            <li>To change the homepage banner: upload to <code>building.jpg</code>.</li>
            <li>To add an animal image: upload to <code>animals/&lt;animal-name-lowercase&gt;.jpg</code>, e.g., <code>animals/lion.jpg</code>.</li>
            <li>Max formats: .jpg, .jpeg, .png</li>
          </ul>
        </Box>
      </Paper>
    </Box>
  )
}

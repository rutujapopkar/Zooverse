import React, { useState } from 'react'
import { Box, Typography, Paper, TextField, Button, Grid, Alert } from '@mui/material'

export default function AdminImages(){
  const [file, setFile] = useState(null)
  const [target, setTarget] = useState('building.jpg')
  const [msg, setMsg] = useState(null)

  const token = localStorage.getItem('token')

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
    }catch(err){
      setMsg({type:'error', text: String(err.message || err)})
    }
  }

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

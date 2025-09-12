import React, { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material'
import axios from 'axios'
import { useSnackbar } from './SnackbarProvider'
import { useNavigate } from 'react-router-dom'

export default function AdminLoginDialog({ open, onClose }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { notify } = useSnackbar()
  const navigate = useNavigate()

  const submit = async () => {
    try{
      setLoading(true)
      const res = await axios.post('/api/login', { username, password })
      const token = res.data?.access_token
      if(!token){ throw new Error('No token') }
      let role = null
      try{ const payload = JSON.parse(atob(token.split('.')[1])); role = payload && payload.role }catch{}
      if(role !== 'admin'){
        notify('Not an admin account', 'error')
        setLoading(false)
        return
      }
      localStorage.setItem('token', token)
      notify('Welcome, admin', 'success')
      onClose && onClose()
      navigate('/admin')
    }catch(e){
      notify('Invalid credentials', 'error')
    }finally{
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Management Login</DialogTitle>
      <DialogContent>
        <TextField fullWidth label="Username" value={username} onChange={e=>setUsername(e.target.value)} sx={{mt:1}} />
        <TextField fullWidth label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} sx={{mt:2}} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={loading}>Login</Button>
      </DialogActions>
    </Dialog>
  )
}

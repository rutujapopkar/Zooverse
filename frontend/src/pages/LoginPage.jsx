import React, {useState} from 'react'
import { TextField, Button, Box, Typography } from '@mui/material'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function LoginPage(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const doLogin = async () => {
    try{
      const r = await axios.post('http://127.0.0.1:5000/api/login', { username, password })
      const token = r.data.access_token
      localStorage.setItem('token', token)
      navigate('/dashboard')
    }catch(e){
      alert('login failed')
    }
  }

  return (
    <Box sx={{maxWidth:480, mx:'auto', mt:8}}>
      <Typography variant="h4" gutterBottom>Smart Zoo Login</Typography>
      <TextField fullWidth label="Username" margin="normal" value={username} onChange={e=>setUsername(e.target.value)} />
      <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={e=>setPassword(e.target.value)} />
      <Button variant="contained" onClick={doLogin} sx={{mt:2}}>Login</Button>
    </Box>
  )
}

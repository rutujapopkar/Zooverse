import React, {useState} from 'react'
import { TextField, Button, Box, Typography, Link } from '@mui/material'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const doRegister = async () => {
    try{
      await axios.post('/api/register', { username, password })
      alert('registered, please login')
      navigate('/login')
    }catch(e){
      alert('register failed')
    }
  }

  return (
    <Box sx={{maxWidth:480, mx:'auto', mt:8}}>
      <Typography variant="h4" gutterBottom>Register</Typography>
      <TextField fullWidth label="Username" margin="normal" value={username} onChange={e=>setUsername(e.target.value)} />
      <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={e=>setPassword(e.target.value)} />
      <Button variant="contained" onClick={doRegister} sx={{mt:2}}>Register</Button>
      <Box sx={{mt:2}}>
        <Link href="/login">Already have an account? Login</Link>
      </Box>
    </Box>
  )
}

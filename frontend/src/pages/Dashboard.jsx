import React, {useEffect, useState} from 'react'
import { Typography, Box, Button } from '@mui/material'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Dashboard(){
  const [me, setMe] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(!token) return navigate('/')
    axios.get('http://127.0.0.1:5000/api/animals')
      .then(r=>{
        // noop: just ensure API reachable
        console.log('animals', r.data)
      })
  }, [])

  const doLogout = ()=>{ localStorage.removeItem('token'); navigate('/') }

  return (
    <Box sx={{mt:4}}>
      <Typography variant="h4">Dashboard</Typography>
      <Button variant="outlined" onClick={doLogout} sx={{mt:2}}>Logout</Button>
    </Box>
  )
}

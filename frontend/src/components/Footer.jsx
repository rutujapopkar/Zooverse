import React, { useState } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AdminLoginDialog from './AdminLoginDialog'

export default function Footer(){
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const token = localStorage.getItem('token')
  let role = null
  try{ const payload = token && JSON.parse(atob(token.split('.')[1])); role = payload && payload.role }catch(e){}
  const isAdmin = role === 'admin'
  return (
    <Box component="footer" sx={{py:4, textAlign:'center', mt:6, bgcolor:'#e8f5e9'}}>
      <Typography variant="body2">© {new Date().getFullYear()} Zooverse - Smart Zoo Management</Typography>
      <Box sx={{mt:1}}>
        <Button size="small" variant="text" onClick={()=> isAdmin ? nav('/admin') : setOpen(true)}>Management</Button>
      </Box>
      <AdminLoginDialog open={open} onClose={()=>setOpen(false)} />
    </Box>
  )
}

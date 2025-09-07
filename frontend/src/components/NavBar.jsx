import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function NavBar(){
  const nav = useNavigate()
  const token = localStorage.getItem('token')
  let role = null
  try{ const payload = token && JSON.parse(atob(token.split('.')[1])); role = payload && payload.role }catch(e){}
  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        <Box sx={{flexGrow:1, cursor:'pointer'}} onClick={()=>nav('/') }>
          <Typography variant='h6'>Zooverse</Typography>
        </Box>
        <Button color='inherit' onClick={()=>nav('/animals')}>Animals</Button>
        <Button color='inherit' onClick={()=>nav('/bookings')}>Book</Button>
        <Button color='inherit' onClick={()=>nav('/tickets')}>My Tickets</Button>
        <Button color='inherit' onClick={()=>nav('/admin')}>Admin</Button>
        {role === 'admin' && (
          <Button color='inherit' onClick={()=>nav('/admin/animals')}>Manage Animals</Button>
        )}
        <Button color='inherit' onClick={()=>nav('/login')}>Login</Button>
      </Toolbar>
    </AppBar>
  )
}

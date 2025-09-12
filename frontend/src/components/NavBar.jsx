import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function NavBar(){
  const nav = useNavigate()
  const token = localStorage.getItem('token')
  // Minimal navbar per request: Only Animals + auth actions
  const handleLogout = () => {
    localStorage.removeItem('token')
    nav('/')
  }
  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        <Box sx={{flexGrow:1, cursor:'pointer'}} onClick={()=>nav('/') }>
          <Typography variant='h6'>Zooverse</Typography>
        </Box>
        <Button color='inherit' onClick={()=>nav('/animals')}>Animals</Button>
        {!token ? (
          <>
            <Button color='inherit' onClick={()=>nav('/login')}>Login</Button>
            <Button color='inherit' onClick={()=>nav('/register')}>Register</Button>
          </>
        ) : (
          <Button color='inherit' onClick={handleLogout}>Logout</Button>
        )}
      </Toolbar>
    </AppBar>
  )
}

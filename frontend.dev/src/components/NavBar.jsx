import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import GlobalSearchBar from './GlobalSearchBar'
import { useNavigate } from 'react-router-dom'

export default function NavBar(){
  const nav = useNavigate()
  const token = localStorage.getItem('token')
  let role = null
  try { role = token && JSON.parse(atob(token.split('.')[1])).role } catch {}
  const handleLogout = () => { localStorage.removeItem('token'); nav('/') }
  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        <Box sx={{display:'flex', alignItems:'center', gap:2, flexGrow:1}}>
          <Box sx={{cursor:'pointer', display:'flex', alignItems:'center'}} onClick={()=>nav('/') }>
            <Typography variant='h6' sx={{fontWeight:700}}>Zooverse</Typography>
          </Box>
          <GlobalSearchBar onSelect={(item)=>{
            if(item.type==='animal') nav(`/animals`)
          }} />
        </Box>
        <Button color='inherit' onClick={()=>nav('/events')}>Events</Button>
        <Button color='inherit' onClick={()=>nav('/news')}>News</Button>
        <Button color='inherit' onClick={()=>nav('/map')}>Map</Button>
        <Button color='inherit' onClick={()=>nav('/faq')}>FAQ</Button>
        <Button color='inherit' onClick={()=>nav('/bookings')}>Book Tickets</Button>
        {role && (role==='vet' || role==='admin') && (
          <Button color='inherit' onClick={()=>nav('/doctor')}>Doctor</Button>
        )}
        {role==='admin' && (
          <Button color='inherit' onClick={()=>nav('/admin')}>Admin</Button>
        )}
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

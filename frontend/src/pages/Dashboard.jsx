import React, {useEffect, useState} from 'react'
import { Typography, Box, Button, Stack, Card, CardContent, Chip } from '@mui/material'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Dashboard(){
  const [bookings, setBookings] = useState([])
  const navigate = useNavigate()

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(!token) return navigate('/')
    // fetch my bookings (past visits)
    axios.get('/api/bookings', { headers: { Authorization: `Bearer ${token}` }})
      .then(r=> setBookings(r.data || []))
      .catch(()=> setBookings([]))
  }, [])

  const doLogout = ()=>{ localStorage.removeItem('token'); navigate('/') }

  return (
    <Box sx={{mt:4}}>
      <Typography variant="h4">Dashboard</Typography>
      <Stack direction="row" spacing={2} sx={{mt:2}}>
        <Button variant="contained" onClick={()=>navigate('/animals')}>Animals</Button>
        <Button variant="contained" onClick={()=>navigate('/bookings')}>Book Tickets</Button>
        <Button variant="outlined" onClick={doLogout}>Logout</Button>
      </Stack>
      <Box sx={{mt:4}}>
        <Typography variant="h6" gutterBottom>My Visits</Typography>
        <Stack spacing={2}>
          {bookings.length === 0 && (
            <Typography variant="body1">No visits yet. Book your first visit!</Typography>
          )}
          {bookings.map(b => (
            <Card key={b.id} variant="outlined">
              <CardContent>
                <Stack direction={{xs:'column', sm:'row'}} spacing={2} alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle1">{new Date(b.date).toDateString()} • {b.time_slot}</Typography>
                    <Typography variant="body2">Adults: {b.num_adults} • Children: {b.num_children}</Typography>
                    <Typography variant="body2">Amount: ₹{Math.round((b.price_cents||0)/100).toLocaleString('en-IN')} {b.currency||'INR'}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    {b.paid ? <Chip color="success" label="Paid"/> : <Chip color="warning" label="Unpaid"/>}
                    <Button size="small" variant="text" onClick={()=>navigate('/tickets')}>View QR</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

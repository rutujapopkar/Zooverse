import React, {useEffect, useState} from 'react'
import { Typography, Box, Button, Stack, Card, CardContent, Chip, Alert } from '@mui/material'
import axios from 'axios'
import { normalizeList } from '../utils/normalize'
import { useNavigate } from 'react-router-dom'

export default function Dashboard(){
  const [bookings, setBookings] = useState([])
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(!token){
      navigate('/')
      return
    }
    setLoading(true)
    setError(null)
    axios.get('/api/bookings') // auth header injected by interceptor
      .then(r=> {
        const arr = normalizeList(r.data)
        if(!Array.isArray(arr)) console.warn('Unexpected /api/bookings payload:', r.data)
        setBookings(arr)
      })
      .catch(err=>{
        if(err?.response?.status === 401){
          setError('Session expired. Please log in again.')
        } else {
          setError('Failed to load bookings')
        }
        setBookings([])
      })
      .finally(()=> setLoading(false))
  }, [navigate])

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
          {loading && <Typography variant="body2">Loading bookings...</Typography>}
          {error && <Alert severity={error.startsWith('Session')? 'warning':'error'}>{error}</Alert>}
          {!loading && !error && bookings.length === 0 && (
            <Typography variant="body1">No visits yet. Book your first visit!</Typography>
          )}
          {(Array.isArray(bookings) ? bookings : []).map(b => (
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

import React, {useEffect, useState} from 'react'
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function MyTickets(){
  const [tickets, setTickets] = useState([])
  const navigate = useNavigate()

  useEffect(()=>{
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    axios.get('/api/bookings', { headers })
      .then(r=>setTickets(r.data))
      .catch(e=>{
        if (e?.response?.status === 401) navigate('/login')
        else console.error(e)
      })
  }, [])

  const downloadQR = (b) => {
    if(!b.qr_code_b64) return
    const link = document.createElement('a')
    link.href = `data:image/png;base64,${b.qr_code_b64}`
    link.download = `booking-${b.id}.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <Box sx={{mt:4}}>
      <Typography variant="h4" gutterBottom>My Tickets</Typography>
      <Grid container spacing={2}>
        {tickets.map(b=> (
          <Grid item xs={12} sm={6} md={4} key={b.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">Booking #{b.id}</Typography>
                <Typography color="text.secondary">Date: {b.date} • {b.time_slot}</Typography>
                <Typography>Adults: {b.num_adults} • Children: {b.num_children}</Typography>
                {b.qr_code_b64 && (
                  <Box sx={{mt:2, textAlign:'center'}}>
                    <img src={`data:image/png;base64,${b.qr_code_b64}`} alt="qr" style={{maxWidth:'100%'}} />
                    <Button variant="outlined" sx={{mt:1}} onClick={()=>downloadQR(b)}>Download QR</Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

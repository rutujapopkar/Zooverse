import React from 'react'
import { Box, Typography, Button, Grid, Card, CardContent, CardMedia } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const demoAnimals = [
  { id: 1, name: 'Lion', img: 'https://source.unsplash.com/featured/?lion' },
  { id: 2, name: 'Elephant', img: 'https://source.unsplash.com/featured/?elephant' },
  { id: 3, name: 'Giraffe', img: 'https://source.unsplash.com/featured/?giraffe' }
]

export default function HomePage(){
  const nav = useNavigate()
  return (
    <Box sx={{py:6}}>
      <Box sx={{textAlign:'center', mb:4}}>
        <Typography variant="h3">Welcome to the Smart Zoo</Typography>
        <Typography variant="h6" color="text.secondary" sx={{mt:2}}>Discover animals, book tickets, and explore our facilities.</Typography>
        <Box sx={{mt:3}}>
          <Button variant="contained" onClick={()=>nav('/login')} sx={{mr:2}}>Login</Button>
          <Button variant="outlined" onClick={()=>nav('/register')}>Register</Button>
        </Box>
      </Box>

      <Typography variant="h5" sx={{mb:2}}>Featured Animals</Typography>
      <Grid container spacing={2}>
        {demoAnimals.map(a=> (
          <Grid item key={a.id} xs={12} sm={4}>
            <Card>
              <CardMedia component="img" height="180" image={a.img} alt={a.name} />
              <CardContent>
                <Typography variant="h6">{a.name}</Typography>
                <Typography color="text.secondary">Meet our amazing {a.name}s in their naturalistic habitats.</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{mt:6, textAlign:'center'}}>
        <Typography variant="h5">Plan your visit</Typography>
        <Typography color="text.secondary" sx={{mb:2}}>Opening hours: 9:00 AM - 6:00 PM daily</Typography>
        <Button variant="contained" onClick={()=>nav('/bookings')}>Book Tickets</Button>
      </Box>
    </Box>
  )
}

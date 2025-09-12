import React from 'react'
import { Box, Typography, Button, Grid, Card, CardContent, CardMedia } from '@mui/material'
import ImageWithFallback from '../components/ImageWithFallback'
import { sanitizeName } from '../utils/sanitizeName'
import { useNavigate } from 'react-router-dom'

const demoAnimals = [
  { id: 1, name: 'Lion', local: '/images/animals/lion.jpg', fallback: 'https://source.unsplash.com/featured/?lion' },
  { id: 2, name: 'Elephant', local: '/images/animals/elephant.jpg', fallback: 'https://source.unsplash.com/featured/?elephant' },
  { id: 3, name: 'Giraffe', local: '/images/animals/giraffe.jpg', fallback: 'https://source.unsplash.com/featured/?giraffe' }
]

export default function HomePage(){
  const nav = useNavigate()
  return (
    <Box sx={{py:6}}>
      <Box sx={{mb:4}}>
        <ImageWithFallback
          srcList={[
            '/uploads/building.png',
            '/uploads/building.jpg',
            '/images/building.png',
            '/images/building.jpg',
            'https://source.unsplash.com/1600x400/?zoo,building'
          ]}
          alt="Zoo Building"
          style={{ width:'100%', height: 240, objectFit:'cover', borderRadius: 8 }}
        />
      </Box>
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
              <CardMedia>
                <ImageWithFallback
                  srcList={(() => { const slug = sanitizeName(a.name); return [
                    `/uploads/animals/${slug}.png`,
                    `/uploads/animals/${slug}.jpg`,
                    `/images/animals/${slug}.png`,
                    `/images/animals/${slug}.jpg`,
                    a.local,
                    a.fallback
                  ]})()}
                  alt={a.name}
                  style={{width:'100%', height:180, objectFit:'cover'}}
                />
              </CardMedia>
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

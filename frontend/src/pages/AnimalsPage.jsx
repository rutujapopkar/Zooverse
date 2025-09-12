import React, {useEffect, useState} from 'react'
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button } from '@mui/material'
import ImageWithFallback from '../components/ImageWithFallback'
import axios from 'axios'

export default function AnimalsPage(){
  const [animals, setAnimals] = useState([])

  useEffect(()=>{
    axios.get('/api/animals')
      .then(r=>setAnimals(r.data))
      .catch(e=>console.error(e))
  }, [])

  return (
    <Box sx={{mt:4}}>
      <Typography variant="h4" gutterBottom>Animals</Typography>
      <Grid container spacing={2}>
        {animals.map(a=> (
          <Grid item key={a.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia>
                <ImageWithFallback
                  srcList={[
                    `/uploads/animals/${(a.name||'').toLowerCase()}.jpg`,
                    `/images/animals/${(a.name||'').toLowerCase()}.jpg`,
                    a.photo_url || `https://source.unsplash.com/featured/?${encodeURIComponent(a.species||a.name||'animal')}`
                  ]}
                  alt={a.name}
                  style={{width:'100%', height:140, objectFit:'cover'}}
                />
              </CardMedia>
              <CardContent>
                <Typography variant="h6">{a.name}</Typography>
                <Typography color="text.secondary">{a.species}</Typography>
                <Typography variant="body2" sx={{mt:1}}>{a.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

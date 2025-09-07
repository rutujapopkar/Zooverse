import React, {useEffect, useState} from 'react'
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button } from '@mui/material'
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
              {a.photo_url && <CardMedia component="img" height="140" image={a.photo_url} alt={a.name} />}
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

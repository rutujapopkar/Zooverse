import React from 'react'
import { Box, Typography } from '@mui/material'

// Kudal Sindhudurg coordinates approximate
// Using Google Maps embed (can replace with dynamic API later)
const MAP_EMBED = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3921.501004938927!2d73.6825!3d16.0125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc0500b4b6f9f07%3A0x0000000000000000!2sKudal%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v0000000000000'

export default function MapPage(){
  return (
    <Box sx={{mt:4}}>
      <Typography variant='h4' gutterBottom>Zoo Map & Location</Typography>
      <Typography variant='body2' sx={{mb:2}}>Located near Kudal, Sindhudurg district, Maharashtra, India.</Typography>
      <Box sx={{position:'relative', pt:'56.25%', borderRadius:2, overflow:'hidden', boxShadow:3}}>
        <iframe
          title='Kudal Sindhudurg Map'
          src={MAP_EMBED}
          style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', border:0}}
          loading='lazy'
          referrerPolicy='no-referrer-when-downgrade'
          allowFullScreen
        />
      </Box>
    </Box>
  )
}

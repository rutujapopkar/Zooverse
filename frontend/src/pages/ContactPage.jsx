import React from 'react'
import { Box, Typography, Grid, TextField, Button } from '@mui/material'

export default function ContactPage(){
  return (
    <Box sx={{mt:4, mb:8}}>
      <Typography variant='h4' gutterBottom>Contact Us</Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant='h6' gutterBottom>ZooVerse Headquarters</Typography>
          <Typography variant='body2'>Kudal, Sindhudurg District<br/>Maharashtra, India 416520</Typography>
          <Typography variant='body2' sx={{mt:1}}>Phone: +91-98765-43210</Typography>
          <Typography variant='body2'>Email: info@zooverse.example</Typography>
          <Typography variant='body2' sx={{mt:2}}>Follow us on social media (coming soon).</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant='h6' gutterBottom>Send a Message</Typography>
          <TextField fullWidth label='Your Name' margin='normal' size='small' />
            <TextField fullWidth label='Email' margin='normal' size='small' />
            <TextField fullWidth label='Message' margin='normal' size='small' multiline minRows={4} />
            <Button variant='contained' sx={{mt:1}} disabled>Submit (Disabled Placeholder)</Button>
        </Grid>
      </Grid>
    </Box>
  )
}

import React, { useState } from 'react'
import { Box, Typography, Button, Grid, IconButton } from '@mui/material'
import PlaceIcon from '@mui/icons-material/Place'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import YouTubeIcon from '@mui/icons-material/YouTube'
import { useNavigate } from 'react-router-dom'
import AdminLoginDialog from './AdminLoginDialog'

export default function Footer(){
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const token = localStorage.getItem('token')
  let role = null
  try{ const payload = token && JSON.parse(atob(token.split('.')[1])); role = payload && payload.role }catch(e){}
  const isAdmin = role === 'admin'
  return (
    <Box component="footer" sx={{py:6, mt:8, bgcolor:'#e8f5e9', borderTop:'1px solid #d5e6d5'}}>
      <Grid container spacing={4} sx={{maxWidth:1200, mx:'auto', px:2}}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{mb:1}}>Zooverse</Typography>
          <Typography variant="body2" color="text.secondary">Smart Zoo Management platform focused on conservation, education and visitor experience.</Typography>
          <Box sx={{mt:2}}>
            <Button size="small" variant="text" onClick={()=> isAdmin ? nav('/admin') : setOpen(true)}>Management</Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{mb:1}}>Contact</Typography>
          <Box sx={{display:'flex', alignItems:'flex-start', mb:1}}>
            <PlaceIcon fontSize='small' sx={{mr:1, mt:0.2}} />
            <Typography variant='body2'>Kudal, Sindhudurg District<br/>Maharashtra, India 416520</Typography>
          </Box>
            <Box sx={{display:'flex', alignItems:'center', mb:1}}>
              <PhoneIcon fontSize='small' sx={{mr:1}} />
              <Typography variant='body2'>+91-98765-43210</Typography>
            </Box>
            <Box sx={{display:'flex', alignItems:'center', mb:1}}>
              <EmailIcon fontSize='small' sx={{mr:1}} />
              <Typography variant='body2'>info@zooverse.example</Typography>
            </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{mb:1}}>Follow Us</Typography>
          <Typography variant='body2' color='text.secondary'>Social channels coming soon.</Typography>
          <Box sx={{mt:1, display:'flex', gap:1}}>
            <IconButton size='small' disabled><FacebookIcon fontSize='small' /></IconButton>
            <IconButton size='small' disabled><InstagramIcon fontSize='small' /></IconButton>
            <IconButton size='small' disabled><YouTubeIcon fontSize='small' /></IconButton>
          </Box>
        </Grid>
      </Grid>
      <Box sx={{textAlign:'center', mt:4}}>
        <Typography variant="caption">© {new Date().getFullYear()} Zooverse. All rights reserved.</Typography>
      </Box>
      <AdminLoginDialog open={open} onClose={()=>setOpen(false)} />
    </Box>
  )
}

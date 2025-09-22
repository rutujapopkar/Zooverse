import React from 'react'
import { Box, Typography, Grid, Button, Paper } from '@mui/material'
import GlobalSearchBar from '../components/GlobalSearchBar'
import { useNavigate } from 'react-router-dom'

export default function CustomerDashboard(){
  const nav = useNavigate()
  return (
    <Box id="main-content" sx={{mt:4, pb:8}}>
      {/* Hero Section */}
      <Paper elevation={3} sx={{position:'relative', borderRadius:3, overflow:'hidden', mb:4, p:{xs:4, md:6}, background:'linear-gradient(120deg,#0f422c,#143b4a)'}} className="anim-fade-in-up">
        <Box sx={{position:'relative', zIndex:2, textAlign:'center', maxWidth:'760px', mx:'auto'}}>
          <Typography variant='h3' component='h1' sx={{fontWeight:700, mb:2, fontSize:{xs:'2rem', md:'2.6rem'}, color:'#fff'}}>
            Welcome to Zooverse
          </Typography>
          <Typography variant='body1' sx={{color:'rgba(255,255,255,0.85)', fontSize:{xs:'.9rem', md:'1rem'}, lineHeight:1.4, mb:3}}>
            Plan your visit, explore animals, manage your tickets, and engage with conservation impact in one streamlined customer hub.
          </Typography>
          <Box sx={{display:'flex', justifyContent:'center', mb:3}}>
            <GlobalSearchBar width={360} onSelect={(opt)=>{
              if(opt.type==='animal') nav(`/animals/${opt.id}`)
              // future: events/news route handling
            }} />
          </Box>
          <Box sx={{display:'flex', flexWrap:'wrap', gap:2, justifyContent:'center'}}>
            <Button variant='contained' color='success' onClick={()=>nav('/bookings')}>Book Tickets</Button>
            <Button variant='outlined' onClick={()=>nav('/animals')}>Browse Animals</Button>
            <Button variant='outlined' onClick={()=>nav('/tickets')}>My Tickets</Button>
            <Button variant='outlined' onClick={()=>nav('/profile')}>Profile</Button>
          </Box>
        </Box>
        <Box sx={{position:'absolute', inset:0, background:'radial-gradient(circle at 30% 40%, rgba(255,255,255,.15), transparent 60%)'}}/>
      </Paper>

      {/* Quick Feature Panels */}
      <Grid container spacing={3} className='anim-fade-in-up' style={{animationDelay:'120ms'}}>
        {[{
          title:'Interactive Map', desc:'Preview key habitats, rest zones and wayfinding layers.', action:'Open Map', onClick:()=>nav('/map')
        },{
          title:'Upcoming Events', desc:'Keeper talks, planting drives, education sessions.', action:'View Events', onClick:()=>nav('/programs')
        },{
          title:'Feedback & Reviews', desc:'Share your visit insights to help us improve.', action:'Give Feedback', onClick:()=>nav('/feedback')
        },{
          title:'Support Conservation', desc:'Learn how membership & donations drive impact.', action:'Learn More', onClick:()=>nav('/impact')
        }].map((card,i)=>(
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Paper variant='outlined' sx={{p:2, height:'100%', display:'flex', flexDirection:'column', borderRadius:3, position:'relative', overflow:'hidden',
              '&:hover':{boxShadow:'0 6px 22px -8px rgba(0,0,0,.35)', transform:'translateY(-4px)'}, transition:'all .25s ease'}}>
              <Typography variant='subtitle1' sx={{fontWeight:600, mb:.5}}>{card.title}</Typography>
              <Typography variant='body2' sx={{flexGrow:1, fontSize:'.75rem', color:'text.secondary', lineHeight:1.3}}>{card.desc}</Typography>
              <Button size='small' sx={{mt:2, alignSelf:'flex-start'}} onClick={card.onClick}>{card.action} →</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Map Preview Stub */}
      <Box sx={{mt:6}} className='anim-fade-in-up' style={{animationDelay:'240ms'}}>
        <Typography variant='h5' gutterBottom>Zoo Map Preview</Typography>
        <Box sx={{position:'relative', borderRadius:3, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 4px 18px -6px rgba(0,0,0,.45)'}}>
          <iframe
            title='Zoo Map'
            src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.5983383371305!2d72.877655!3d19.168913!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63b8d9bf3ff%3A0xdeb4881fae4d9c6!2sNational%20Park!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'
            width='100%'
            height='340'
            style={{border:0, filter:'grayscale(.15) contrast(1.05) brightness(.95)'}}
            loading='lazy'
            referrerPolicy='no-referrer-when-downgrade'
          />
        </Box>
      </Box>
    </Box>
  )
}

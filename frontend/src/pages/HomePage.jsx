import React from 'react'
import { Box, Typography, Button, Grid, Card, CardContent, CardMedia, Paper, Stack, Divider } from '@mui/material'
import Reveal from '../components/Reveal'
import ImageWithFallback from '../components/ImageWithFallback'
import { imageCandidatesForAnimal } from '../utils/imageCandidates'
import { useNavigate } from 'react-router-dom'
import NewsSection from '../components/home/NewsSection'
import EventsSection from '../components/home/EventsSection'
import LiveGlimpsesStrip from '../components/home/LiveGlimpsesStrip'
import { titleImageCandidates } from '../utils/titleImageCandidates'

// Temporary featured sample; real list could come from /api/animals?per_page=3
const demoAnimals = [
  { id: 1, name: 'Giraffe' },
  { id: 2, name: 'Crocodile' },
  { id: 3, name: 'Tiger' }
]

export default function HomePage(){
  const nav = useNavigate()
  return (
    <Box sx={{py:4}} className="layout-shell">
      {/* Hero Section full-bleed with internal shell */}
  <Box className='full-bleed' sx={{mb:6}}>
    <Box sx={{position:'relative', height:{xs:340, sm:480}, borderRadius:0, overflow:'hidden'}}>
     <Box component='video' className='hero-video'
       src={'/Videos/Background1.mp4'}
             autoPlay
             muted
             loop
             playsInline
             preload='metadata'
             aria-hidden='true'
       sx={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.6)', zIndex:0, background:'#000'}}
        />
        {/* Gradient overlay for extra contrast */}
        <Box sx={{position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.55) 100%)', zIndex:1}} />
        <Box className='layout-shell' sx={{position:'relative', zIndex:2, display:'flex', alignItems:'center', justifyContent:'center', height:'100%', px:2}}>
          <Paper elevation={6} sx={{p:{xs:2, sm:3}, maxWidth:560, textAlign:'center', bgcolor:'rgba(0,0,0,0.45)', color:'#fff', backdropFilter:'blur(4px)', borderRadius:3}}>
            <Typography variant='h3' sx={{fontWeight:700, fontSize:{xs:26, sm:40}, letterSpacing:'.5px'}}>Discover Zooverse</Typography>
            <Typography variant='body1' sx={{mt:1, mb:3, opacity:0.95}}>Where conservation, education, and innovation meet for a sustainable wildlife future.</Typography>
            <Stack direction={{xs:'column', sm:'row'}} spacing={2} justifyContent='center'>
              <Button variant='contained' color='primary' size='large' onClick={()=>nav('/bookings')}>Book Tickets</Button>
              <Button variant='outlined' color='inherit' size='large' onClick={()=>nav('/map')}>Find Us</Button>
            </Stack>
          </Paper>
        </Box>
    </Box>
  </Box>

      {/* Zoo Information Intro Band */}
      <Box sx={{mb:8}}>
        <Typography variant='h3' align='center'>Our Mission</Typography>
        <Typography variant='h6' align='center' color='text.secondary' sx={{mt:2, maxWidth:900, mx:'auto'}}>Zooverse advances animal welfare, public engagement, and data-driven conservation impact across India.</Typography>
  <Grid container spacing={3} sx={{mt:4}} component={Reveal} cascade>
          {[{title:'Conservation Focus', desc:'Supporting breeding programs, habitat restoration & biodiversity research.'},
            {title:'Learning & Outreach', desc:'Interactive exhibits, guided tours, and digital exploration experiences.'},
            {title:'Ethical Wellbeing', desc:'Enrichment-first care, monitoring health metrics with vet technology.'}].map((b,i)=>
              <Grid item xs={12} md={4} key={i}>
                <Paper sx={{p:3, height:'100%', transition:'all .3s', '&:hover':{boxShadow:6, transform:'translateY(-4px)'}}}>
                  <Typography variant='h6'>{b.title}</Typography>
                  <Typography variant='body2' sx={{mt:1}}>{b.desc}</Typography>
                </Paper>
              </Grid>
          )}
        </Grid>
      </Box>

      {/* Zoo Information Middle Section */}
      <Box sx={{mb:10}}>
        <Box sx={{maxWidth:860, mx:'auto', textAlign:'center', mb:5}}>
          <Typography variant='h4' sx={{fontWeight:650, mb:2}}>Why Zooverse Matters</Typography>
          <Typography variant='body1' color='text.secondary' sx={{fontSize:{xs:14, sm:15}, lineHeight:1.5}}>
            We operate as a modern conservation campus: combining ethical animal care, ecological restoration, community engagement, open research, and immersive learning. Every visit directly supports habitat resilience, veterinary innovation, and grassroots education programs extending beyond our perimeter.
          </Typography>
        </Box>
  <Grid container spacing={3} component={Reveal} cascade>
          {[{
            k:'care', t:'Accredited Welfare', d:'Evidence-based nutrition, enrichment, and welfare metrics reviewed quarterly.'
          },{
            k:'impact', t:'Measured Impact', d:'Program outcomes tracked with transparent conservation & education indicators.'
          },{
            k:'open', t:'Open Data', d:'Select research and biodiversity observations shared with partner networks.'
          },{
            k:'access', t:'Inclusive Access', d:'Tiered pricing & community days reduce barriers for local families.'
          }].map((item,i)=>(
            <Grid item xs={12} sm={6} md={3} key={item.k}>
              <Paper variant='outlined'
                sx={{
                  p:2.4,
                  height:'100%',
                  display:'flex', flexDirection:'column', gap:1,
                  borderLeft: theme => `4px solid ${theme.palette.secondary.main}`,
                  backgroundColor:'background.paper',
                  transition:'box-shadow .25s, transform .25s',
                  '&:hover':{ boxShadow:6, transform:'translateY(-4px)' }
                }}>
                <Typography variant='subtitle2' sx={{fontSize:12, fontWeight:600, letterSpacing:.5, textTransform:'uppercase', color:'secondary.main'}}>
                  {item.t}
                </Typography>
                <Typography variant='body2' sx={{fontSize:12.5, lineHeight:1.4, color:'text.secondary'}}>
                  {item.d}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Live Glimpses full-bleed for edge alignment */}
      <Box className='full-bleed'>
        <Box className='layout-shell'>
          <LiveGlimpsesStrip />
        </Box>
      </Box>

      {/* Featured Animals Card */}
      <Box sx={{mb:8}}>
        <Paper sx={{p:3, borderRadius:3, position:'relative', overflow:'hidden'}}>
          <Typography variant='h5' sx={{mb:2, fontWeight:600}}>Featured Animals</Typography>
          <Grid container spacing={2} component={Reveal} cascade>
            {demoAnimals.map(a=>
              <Grid item key={a.id} xs={12} sm={4}>
                <Card sx={{borderRadius:2, overflow:'hidden', position:'relative', cursor:'pointer', '&:hover .feat-overlay, &:focus-within .feat-overlay':{opacity:1}}}>
                  <CardMedia sx={{position:'relative'}}>
                    <ImageWithFallback
                      srcList={[...imageCandidatesForAnimal(a.name)]}
                      alt={a.name}
                      noTint
                      /* Switched from cover (which cropped) to contain so full image shows */
                      fit='contain'
                      aspectRatio='5/4' /* slightly taller to reduce empty bars */
                      style={{width:'100%', background:'#fff'}}
                    />
                    <Box className='feat-overlay'
                      sx={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.55))', color:'#fff', fontWeight:600, letterSpacing:.5, fontSize:20, textTransform:'uppercase', opacity:0, transition:'opacity .35s ease'}}
                    >{a.name}</Box>
                  </CardMedia>
                  {/* Removed descriptive tagline per request */}
                </Card>
              </Grid>
            )}
          </Grid>
          <Box sx={{textAlign:'center', mt:3}}>
            <Button onClick={()=>nav('/animals')} variant='outlined'>Explore All Animals</Button>
          </Box>
        </Paper>
      </Box>

      {/* News then Events stacked */}
      <Box sx={{mb:8}}>
        <Box sx={{mb:6}}>
          <NewsSection flush forceLoop />
        </Box>
        <Box>
          <EventsSection flush forceLoop />
        </Box>
      </Box>

      {/* Events & Campaigns dynamic placeholder */}
      <Box sx={{mb:8}}>
        <Typography variant='h5' gutterBottom>Events & Campaigns</Typography>
        <Typography color='text.secondary' sx={{mb:3}}>Seasonal programs, feeding shows, conservation drives and interactive learning coming soon.</Typography>
  <Grid container spacing={3} component={Reveal} cascade>
          {[{title:'Monsoon Wetland Walk', desc:'Guided exploration of migratory bird habitats.'},
            {title:'Big Cat Awareness Week', desc:'Talks on predator ecology & enrichment.'},
            {title:'Sustainable Safari Initiative', desc:'Promoting low-impact visitor practices.'}].map((c,i)=> {
              const imgCandidates = titleImageCandidates(c.title, 'campaigns', { includeWebp:false })
              return (
                <Grid key={i} item xs={12} md={4}>
                  <Paper sx={{overflow:'hidden', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between', transition:'0.3s', '&:hover':{boxShadow:5, transform:'translateY(-4px)'}}}>
                    <Box>
                      <Box sx={{position:'relative'}}>
                        <ImageWithFallback srcList={imgCandidates} alt={c.title} aspectRatio='16/9' fit='cover' />
                      </Box>
                      <Box sx={{p:3, pt:2}}>
                        <Typography variant='h6'>{c.title}</Typography>
                        <Typography variant='body2' sx={{mt:1}}>{c.desc}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{px:3, pb:2}}>
                      <Button size='small' disabled>Details Soon</Button>
                    </Box>
                  </Paper>
                </Grid>
              )
            })}
        </Grid>
      </Box>

      {/* Visit Planning CTA */}
      <Box sx={{mb:4, textAlign:'center'}}>
        <Typography variant='h5'>Plan Your Visit</Typography>
        <Typography color='text.secondary' sx={{mb:2}}>Open daily 9:00 AM - 6:00 PM • Educational group bookings available</Typography>
        <Button variant='contained' onClick={()=>nav('/bookings')}>Book Tickets</Button>
      </Box>
    </Box>
  )
}

import React, { useEffect, useState, useRef } from 'react'
import { Box, Typography, Grid, Paper } from '@mui/material'

// A lightweight video strip showing short looping clips from public /Videos, lazy-loaded when scrolled into view.
const clips = [
  { id:'lion', src:'/Videos/Lion.mp4', label:'Lion' },
  { id:'deer', src:'/Videos/Deer.mp4', label:'Deer' },
  { id:'nilgai', src:'/Videos/nilgai video.mp4', label:'Nilgai' }
]

export default function LiveGlimpsesStrip(){
  const ref = useRef(null)
  const [active, setActive] = useState(false)

  useEffect(()=>{
    const el = ref.current
    if(!el) return
    const observer = new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){
        setActive(true)
        observer.disconnect()
      }
    }, { threshold:0.25 })
    observer.observe(el)
    return () => observer.disconnect()
  },[])

  return (
    <Box ref={ref} sx={{mb:10}}>
      <Typography variant='h5' sx={{mb:2}}>Live Glimpses</Typography>
      <Grid container spacing={2}>
        {clips.map(c=> (
          <Grid key={c.id} item xs={12} sm={4}>
            <Paper
              sx={{
                p:0,
                borderRadius:2,
                overflow:'hidden',
                position:'relative',
                aspectRatio:'16 / 9',
                cursor:'pointer',
                '&:hover .clip-overlay, &:focus-within .clip-overlay': { opacity:1 }
              }}
            >
              {active ? (
                <video
                  src={c.src}
                  aria-label={c.label}
                  style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
                  autoPlay muted loop playsInline
                />
              ) : (
                <Box sx={{width:'100%', height:'100%', bgcolor:'#222'}} />
              )}
              <Box className='clip-overlay'
                sx={{
                  position:'absolute', inset:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background:'linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.55))',
                  color:'#fff', fontWeight:600, letterSpacing:.5,
                  fontSize:18, textTransform:'uppercase',
                  opacity:0, transition:'opacity .35s ease'
                }}
              >{c.label}</Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

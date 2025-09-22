import React, { useRef, useEffect, useState } from 'react'
import { Box, Typography, Card, CardContent, CardMedia } from '@mui/material'
import ImageWithFallback from '../../components/ImageWithFallback'
import { titleImageCandidates } from '../../utils/titleImageCandidates'

// Placeholder events - to be made dynamic later
const events = [
  { id:1, title:'Night Safari Pilot', date:'2025-02-02', time:'19:00', desc:'Guided limited group exploration after hours.' },
  { id:2, title:'Vet Q&A Session', date:'2025-02-10', time:'11:30', desc:'Interactive discussion on animal wellness.' },
  { id:3, title:'Enrichment Workshop', date:'2025-02-15', time:'14:00', desc:'Hands-on session designing enrichment objects.' },
  { id:4, title:'Kids Conservation Quiz', date:'2025-02-22', time:'10:00', desc:'Fun learning challenge with prizes.' }
]

export default function EventsSection({ autoLoop=true, speed=25, flush=false, forceLoop=false, hoverSlowFactor=0.25 }){ // speed = px/sec
  const trackRef = useRef(null)
  const containerRef = useRef(null)
  const [isPaused, setPaused] = useState(false)
  const [loopEnabled, setLoopEnabled] = useState(false)
  const [dupCount, setDupCount] = useState(1)
  const [hovering, setHovering] = useState(false)

  useEffect(()=>{
    const track = trackRef.current
    const container = containerRef.current
    if(!track || !container) return
    const itemEl = track.querySelector('div[data-item]')
    const itemWidth = itemEl?.offsetWidth || 0
    const itemsCount = events.length
    const neededWidth = itemWidth * itemsCount
    const containerWidth = container.offsetWidth
    if(!forceLoop && neededWidth <= containerWidth){
      setLoopEnabled(false)
      setDupCount(1)
    } else {
      const minTotal = containerWidth * 2
      const repeats = Math.ceil(minTotal / neededWidth) + 1
      setDupCount(repeats)
      setLoopEnabled(true)
    }
  }, [autoLoop, forceLoop])

  useEffect(()=>{
    if(!autoLoop || !loopEnabled) return
    const track = trackRef.current
    if(!track) return
  let start = performance.now()
    let x = 0
    let frame
    track.style.transform = 'translateX(0)'
    const originalsWidth = track.scrollWidth / dupCount
    const step = (ts) => {
      if(isPaused){
        start = ts - (x / speed*1000)
      } else {
        const dt = ts - start
        const effSpeed = speed * (hovering ? hoverSlowFactor : 1)
        x = (dt/1000) * effSpeed
        const totalWidth = originalsWidth
        const offset = x % totalWidth
        track.style.transform = `translateX(-${offset}px)`
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [autoLoop, speed, isPaused, loopEnabled, dupCount, hovering, hoverSlowFactor])

  const pause = () => setPaused(true)
  const resume = () => setPaused(false)
  const onEnter = () => setHovering(true)
  const onLeave = () => setHovering(false)

  const renderItems = []
  for(let r=0; r<dupCount; r++){
    for(const ev of events){
      renderItems.push({ ...ev, _dup:r })
    }
  }

  return (
  <Box sx={{mt:6}} id='events'>
      <Typography variant='h5' sx={{mb:2, fontWeight:600}}>Upcoming Events</Typography>
      <Box ref={containerRef} onMouseEnter={onEnter} onMouseLeave={onLeave} onFocus={pause} onBlur={resume}
        className={flush ? 'flush-horizontal' : undefined}
        style={{position:'relative', overflow:'hidden', paddingBottom:'4px'}}
        aria-label='Upcoming events auto scrolling list' role='list'
      >
        <Box ref={trackRef} sx={{ display:'flex', gap:2, willChange: loopEnabled ? 'transform' : 'auto', px: flush ? 0 : undefined }}>
          {renderItems.map((ev,i)=>{
            const imgCandidates = titleImageCandidates(ev.title, 'events', { includeWebp:false })
            return (
              <Card key={i+'-'+ev.id+'-'+ev._dup} role='listitem' tabIndex={0} data-item
                aria-label={`${ev.title} on ${ev.date} at ${ev.time}`}
                sx={{minWidth:260, flex:'0 0 auto', display:'flex', flexDirection:'column', outline:'none', '&:focus':{boxShadow:6}}}
              >
                <CardMedia>
                  <ImageWithFallback srcList={imgCandidates} alt={ev.title} aspectRatio='16/9' fit='cover' />
                </CardMedia>
                <CardContent sx={{flexGrow:1}}>
                  <Typography variant='caption' color='text.secondary'>{ev.date} • {ev.time}</Typography>
                  <Typography variant='subtitle1' sx={{fontWeight:600}}>{ev.title}</Typography>
                  <Typography variant='body2' color='text.secondary'>{ev.desc}</Typography>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
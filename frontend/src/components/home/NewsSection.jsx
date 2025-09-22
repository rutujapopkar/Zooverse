import React, { useRef, useEffect, useState } from 'react'
import { Box, Typography, Card, CardContent, Stack, CardMedia } from '@mui/material'
import ImageWithFallback from '../../components/ImageWithFallback'
import { titleImageCandidates } from '../../utils/titleImageCandidates'

// Placeholder data - later to be fetched from backend (admin-manageable)
const newsItems = [
  { id:1, title:'New Giraffe Enclosure Opens', date:'2025-01-05', summary:'Expanded habitat improves enrichment and visitor viewing.' },
  { id:2, title:'Conservation Talk Series', date:'2025-01-12', summary:'Weekly expert sessions on Western Ghats biodiversity.' },
  { id:3, title:'Tiger Health Milestone', date:'2025-01-18', summary:'Routine check shows excellent recovery after enrichment changes.' }
]

export default function NewsSection({ autoLoop=true, speed=30, flush=false, forceLoop=false, hoverSlowFactor=0.25 }){ // speed = px/sec
  const trackRef = useRef(null)
  const containerRef = useRef(null)
  const [isPaused, setPaused] = useState(false)
  const [loopEnabled, setLoopEnabled] = useState(false)
  const [dupCount, setDupCount] = useState(1)
  const [hovering, setHovering] = useState(false)

  // Determine if we need looping & duplication based on width
  useEffect(()=>{
    const track = trackRef.current
    const container = containerRef.current
    if(!track || !container) return
    // Temporarily render single set to measure
    const itemWidth = track.querySelector('div[data-item]')?.offsetWidth || 0
    const itemsCount = newsItems.length
    const neededWidth = itemWidth * itemsCount
    const containerWidth = container.offsetWidth
    if(!forceLoop && neededWidth <= containerWidth){
      setLoopEnabled(false)
      setDupCount(1)
    } else {
      // compute duplication so that scrollWidth >= 2 * containerWidth for smooth loop
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
    // ensure starting at zero
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
    for(const n of newsItems){
      renderItems.push({ ...n, _dup:r })
    }
  }

  return (
  <Box sx={{mt:4}} id="news">
      <Typography variant='h5' sx={{mb:2, fontWeight:600}}>Latest News</Typography>
      <Box ref={containerRef} onMouseEnter={onEnter} onMouseLeave={onLeave} onFocus={pause} onBlur={resume}
        className={flush ? 'flush-horizontal' : undefined}
        style={{position:'relative', overflow:'hidden', paddingBottom:'4px'}}
        aria-label='Latest news auto scrolling list' role='list'
      >
        <Stack ref={trackRef} direction='row' spacing={2} sx={{ willChange: loopEnabled ? 'transform' : 'auto', px: flush ? 0 : 2 }}>
          {renderItems.map((n,i)=>{
            const imgCandidates = titleImageCandidates(n.title, 'news', { includeWebp:false })
            return (
              <Card key={i+'-'+n.id+'-'+n._dup} role='listitem' data-item
                tabIndex={0}
                aria-label={`${n.title} – ${n.summary}`}
                sx={{width:280, flex:'0 0 auto', display:'flex', flexDirection:'column', outline:'none', '&:focus':{boxShadow:6}}}
              >
                <CardMedia>
                  <ImageWithFallback srcList={imgCandidates} alt={n.title} aspectRatio='16/9' fit='cover' />
                </CardMedia>
                <CardContent sx={{flexGrow:1}}>
                  <Typography variant='caption' color='text.secondary'>{n.date}</Typography>
                  <Typography variant='subtitle1' sx={{fontWeight:600}}>{n.title}</Typography>
                  <Typography variant='body2' color='text.secondary'>{n.summary}</Typography>
                </CardContent>
              </Card>
            )
          })}
        </Stack>
      </Box>
    </Box>
  )
}
import React, { useEffect, useState, useRef } from 'react'
import { Box, IconButton } from '@mui/material'
import { heroMedia } from './mediaManifest'

function Slide({ item, active }){
  const commonStyle = {
    position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover',
    opacity: active ? 1 : 0, transition: 'opacity 1s ease'
  }
  if(item.type === 'video'){
    return (
      <video
        key={item.id}
        style={commonStyle}
        src={item.src}
        poster={item.poster}
        autoPlay={active}
        muted
        loop
        playsInline
      />
    )
  }
  return <img key={item.id} src={item.src} alt={item.alt} style={commonStyle} />
}

export default function HeroSlider({ interval=6000 }){
  const [index, setIndex] = useState(0)
  const timerRef = useRef()

  useEffect(()=>{
    if(timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(()=>{
      setIndex(i => (i + 1) % heroMedia.length)
    }, interval)
    return () => clearTimeout(timerRef.current)
  }, [index, interval])

  if(!heroMedia.length) return null

  return (
    <Box sx={{position:'relative', width:'100%', height:{xs:220, sm:300, md:360}, borderRadius:2, overflow:'hidden', bgcolor:'#000'}}>
      {heroMedia.map((m,i)=>(<Slide key={m.id} item={m} active={i===index} />))}
      <Box sx={{position:'absolute', bottom:8, left:0, right:0, display:'flex', justifyContent:'center', gap:1}}>
        {heroMedia.map((_,i)=>(
          <IconButton key={i} size="small" onClick={()=>setIndex(i)} sx={{p:0.5, bgcolor: i===index ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)'}} />
        ))}
      </Box>
    </Box>
  )
}

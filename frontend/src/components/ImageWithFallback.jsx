import React, { useState, useMemo } from 'react'

// fit: 'cover' | 'contain'
// Sequentially attempts srcList items. Automatically appends placeholder SVG if not already included.
export default function ImageWithFallback({ srcList = [], alt = '', placeholder = 'Image not available', style, fit='contain', aspectRatio='16/10', addPlaceholder=true, noTint=false, ...rest }){
  const finalList = useMemo(()=>{
    const list = Array.isArray(srcList) ? srcList.filter(Boolean) : []
    if(addPlaceholder){
      const hasPlaceholder = list.some(s => s && s.includes('placeholder-banner'))
      if(!hasPlaceholder){
        list.push('/images/placeholder-banner.svg')
      }
    }
    return list
  }, [srcList, addPlaceholder])
  const [idx, setIdx] = useState(0)
  const onError = () => {
    if (idx < finalList.length - 1) {
      const failed = finalList[idx]
      // Lightweight diagnostic; can be silenced later
      if(process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[ImageWithFallback] failed image, trying next candidate', { failed, next: finalList[idx+1] })
      }
      setIdx(i => i + 1)
    }
  }
  const src = finalList[idx]
  // If aspectRatio is falsy (null/undefined/''), we render without the aspect ratio spacer div
  let paddingTop = null
  if(aspectRatio){
    const [w,h] = aspectRatio.split('/')
    paddingTop = (h && w) ? `${(parseFloat(h)/parseFloat(w))*100}%` : '62.5%'
  }
  const baseBg = noTint ? 'transparent' : '#142b18'
  const baseFilter = noTint ? 'none' : 'brightness(0.95)'
  return (
    <div style={{ position:'relative', width:'100%', background:baseBg, overflow:'hidden', borderRadius:8 }}>
      {paddingTop !== null && <div style={{ width:'100%', paddingTop }} />}
      {src ? (
        <img
          src={src}
          alt={alt}
          onError={onError}
          style={{ position: paddingTop !== null ? 'absolute' : 'relative', top:0, left:0, width:'100%', height: paddingTop !== null ? '100%' : 'auto', objectFit:fit, objectPosition:'center', display:'block', transition:'transform .45s ease, filter .45s ease', filter:baseFilter , ...(style||{}) }}
          {...rest}
        />
      ) : (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#888', fontSize:12 }}>{placeholder}</div>
      )}
    </div>
  )
}

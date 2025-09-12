import React, { useState } from 'react'

export default function ImageWithFallback({ srcList = [], alt = '', placeholder = 'Image not available', style, ...rest }){
  const [idx, setIdx] = useState(0)
  const onError = () => {
    if (idx < srcList.length - 1) setIdx(i => i + 1)
  }
  const src = srcList[idx]
  if (!src) {
    return <div style={{ background:'#f0f0f0', color:'#888', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:4, ...(style||{}), width: rest.width || '100%', height: rest.height || 180 }}>{placeholder}</div>
  }
  return <img src={src} alt={alt} onError={onError} style={style} {...rest} />
}

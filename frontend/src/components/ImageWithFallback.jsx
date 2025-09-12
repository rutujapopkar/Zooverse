import React, { useState } from 'react'

export default function ImageWithFallback({ srcList = [], alt = '', ...rest }){
  const [idx, setIdx] = useState(0)
  const onError = () => {
    if (idx < srcList.length - 1) setIdx(i => i + 1)
  }
  const src = srcList[idx]
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img src={src} alt={alt} onError={onError} {...rest} />
  )
}

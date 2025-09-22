import React, { useEffect, useRef, useState } from 'react'

/**
 * Reveal component
 * Props:
 *  - as: element type wrapper (default 'div')
 *  - delay: base delay in ms
 *  - duration: animation duration ms (default 600)
 *  - threshold: IntersectionObserver threshold (default 0.15)
 *  - translate: initial translateY value (default 18)
 *  - once: whether to animate only first time (default true)
 *  - cascade: if children should get staggered delays
 */
export default function Reveal({
  as:Tag='div',
  delay=0,
  duration=600,
  threshold=0.15,
  translate=18,
  once=true,
  cascade=false,
  style={},
  className='',
  children
}){
  const ref = useRef(null)
  const [shown,setShown] = useState(false)

  useEffect(()=>{
    if (shown && once) return
    const node = ref.current
    if(!node) return
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      setShown(true)
      return
    }
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry => {
        if(entry.isIntersecting){
          setShown(true)
          if(once) io.disconnect()
        } else if(!once){
          setShown(false)
        }
      })
    }, { threshold })
    io.observe(node)
    return () => io.disconnect()
  }, [shown, once, threshold])

  // Cascade support: wrap direct children with staggered inline styles
  let renderedChildren = children
  if (cascade && Array.isArray(children)){
    renderedChildren = children.map((child,i)=>{
      if(!React.isValidElement(child)) return child
      const extra = {
        style:{
          ...(child.props.style||{}),
          transitionDelay: `${delay + i*80}ms`
        }
      }
      return React.cloneElement(child, extra)
    })
  }

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        '--_dur': `${duration}ms`,
        '--_delay': `${delay}ms`,
        '--_translate': `${translate}px`,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translateY(var(--_translate))`,
        transition: 'opacity var(--_dur) cubic-bezier(.2,.9,.3,1), transform var(--_dur) cubic-bezier(.2,.9,.3,1)',
        willChange: 'opacity, transform'
      }}
    >
      {renderedChildren}
    </Tag>
  )
}

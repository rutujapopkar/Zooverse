import React from 'react'
import ImageWithFallback from './ImageWithFallback'

/**
 * ZooCard – interactive hover card for animals (image-only idle; overlay on hover/focus)
 * Props:
 *  - title (string)
 *  - subtitle (string) optional (species)
 *  - description (string) short text (will be clamped)
 *  - srcList (string[]) ordered image candidate URLs
 *  - onClick (function) optional – invoked when card activated
 *  - adminOverlay (ReactNode) optional – rendered top-right (e.g., Edit button)
 */
export default function ZooCard({ title, subtitle, description, srcList=[], onClick, adminOverlay }) {
  return (
    <div className="zoo-card" role={onClick? 'button': undefined} tabIndex={0}
         onClick={onClick}
         onKeyDown={e=>{ if(onClick && (e.key==='Enter' || e.key===' ')){ e.preventDefault(); onClick(); }}}
         aria-label={subtitle? `${title} – ${subtitle}` : title}>
      <div className="zoo-card__media">
        <ImageWithFallback srcList={srcList} alt={title} aspectRatio='4/5' fit='cover' addPlaceholder={false} />
      </div>
      <div className="zoo-card__overlay" aria-hidden="true" />
      <div className="zoo-card__content">
        <h3 className="zoo-card__title" title={title}>{title}</h3>
        {subtitle && <p className="zoo-card__subtitle" title={subtitle}>{subtitle}</p>}
        {description && <p className="zoo-card__desc" title={description}>{description || ''}</p>}
        <span className="zoo-card__cta">View Profile →</span>
      </div>
      {adminOverlay && <div className="zoo-card__admin" aria-hidden="false">{adminOverlay}</div>}
    </div>
  )
}

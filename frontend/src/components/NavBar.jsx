import React, { useState, useEffect, useCallback, useRef } from 'react'
import GlobalSearchBar from './GlobalSearchBar'
import { useNavigate, useLocation } from 'react-router-dom'

/* Redesigned NavBar: semantic structure, improved accessibility, scroll elevation, new class system */
export default function NavBar({ variant='light' }) {
  const nav = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [elevated, setElevated] = useState(false)
  const [compact, setCompact] = useState(false)
  const token = localStorage.getItem('token')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef(null)
  let role = null
  try { role = token && JSON.parse(atob(token.split('.')[1])).role } catch {}

  const links = [
    { label: 'Home', path: '/' },
    { label: 'News', path: '/news' },
    { label: 'Map', path: '/map' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Book Tickets', path: '/bookings' }
  ]

  const isActive = useCallback((p) => location.pathname === p, [location.pathname])

  const handleLogout = () => { localStorage.removeItem('token'); nav('/'); setMobileOpen(false) }
  const go = (p) => { nav(p); setMobileOpen(false) }

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setElevated(y > 8)
      setCompact(y > 140)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Command palette style shortcut Ctrl+K / Cmd+K opens search
  useEffect(() => {
    const onKey = (e) => {
      const mod = navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
        setTimeout(() => {
          const el = document.querySelector('#global-search-input')
          if (el) el.focus()
        }, 30)
      } else if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen])

  const rootClasses = [
    'nav',
    variant === 'light' ? 'nav--light' : 'nav--dark',
  elevated ? 'nav--elevated' : '',
  compact ? 'nav--compact' : '',
    mobileOpen ? 'nav--open' : ''
  ].filter(Boolean).join(' ')

  return (
    <header className={rootClasses}>
      <a href="#main" className="nav-skip">Skip to content</a>
      <div className="nav__inner">
        <div className="nav__brand" onClick={() => go('/')}>Zooverse</div>
        <nav className="nav__primary" aria-label="Primary" style={{flex:1}}>
          <ul className="nav__list">
            {links.map(l => (
              <li key={l.path}>
                <button
                  className={`nav__link ${isActive(l.path) ? 'is-active' : ''}`}
                  onClick={() => go(l.path)}
                >{l.label}</button>
              </li>
            ))}
            {role && (role === 'vet' || role === 'admin') && (
              <li><button className={`nav__link ${isActive('/doctor') ? 'is-active' : ''}`} onClick={() => go('/doctor')}>Doctor</button></li>
            )}
            {role === 'admin' && (
              <li><button className={`nav__link ${isActive('/admin') ? 'is-active' : ''}`} onClick={() => go('/admin')}>Admin</button></li>
            )}
          </ul>
        </nav>

        <div className="nav__search" role="search">
          <GlobalSearchBar width={420} onSelect={(item) => { if (item.type === 'animal') { go('/animals') } }} />
        </div>

        <button
          className="nav__searchToggle"
          aria-label="Open search"
          onClick={() => { setSearchOpen(true); setTimeout(() => { const el = document.querySelector('#global-search-input'); if (el) el.focus() }, 40) }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
          <span className="nav__searchHint">Ctrl+K</span>
        </button>

        <div className="nav__actions">
          {!token ? (
            <>
              <button className={`nav__action ${isActive('/login') ? 'is-active' : ''}`} onClick={() => go('/login')}>Login</button>
              <button className={`nav__action ${isActive('/register') ? 'is-active' : ''}`} onClick={() => go('/register')}>Register</button>
            </>
          ) : (
            <button className='nav__action' onClick={handleLogout}>Logout</button>
          )}
        </div>

        <button
          className="nav__toggle"
          aria-label="Menu"
          aria-expanded={mobileOpen}
          aria-controls="nav-drawer"
          onClick={() => setMobileOpen(o => !o)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {mobileOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>

      </div>

      {/* Mobile drawer */}
      <div id="nav-drawer" className="nav__drawer" aria-hidden={!mobileOpen}>
        <div className="nav__drawerInner">
          <div className="nav__drawerSearch" role="search">
            <GlobalSearchBar width={320} onSelect={(item) => { if (item.type === 'animal') { go('/animals') } }} />
          </div>
          <ul className="nav__drawerList" aria-label="Primary mobile">
            {links.map(l => (
              <li key={l.path}><button className={`nav__drawerLink ${isActive(l.path) ? 'is-active' : ''}`} onClick={() => go(l.path)}>{l.label}</button></li>
            ))}
            {role && (role === 'vet' || role === 'admin') && (
              <li><button className={`nav__drawerLink ${isActive('/doctor') ? 'is-active' : ''}`} onClick={() => go('/doctor')}>Doctor</button></li>
            )}
            {role === 'admin' && (
              <li><button className={`nav__drawerLink ${isActive('/admin') ? 'is-active' : ''}`} onClick={() => go('/admin')}>Admin</button></li>
            )}
          </ul>
          <div className="nav__drawerActions">
            {!token ? (
              <>
                <button className={`nav__drawerAction ${isActive('/login') ? 'is-active' : ''}`} onClick={() => go('/login')}>Login</button>
                <button className={`nav__drawerAction ${isActive('/register') ? 'is-active' : ''}`} onClick={() => go('/register')}>Register</button>
              </>
            ) : (
              <button className='nav__drawerAction' onClick={handleLogout}>Logout</button>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen search overlay */}
      {searchOpen && (
        <div className="navSearchOverlay" role="dialog" aria-modal="true" aria-label="Global search">
          <div className="navSearchOverlay__backdrop" onClick={() => setSearchOpen(false)} />
          <div className="navSearchOverlay__panel">
            <div className="navSearchOverlay__header">
              <p className="navSearchOverlay__title">Search</p>
              <button className="navSearchOverlay__close" aria-label="Close search" onClick={() => setSearchOpen(false)}>
                <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"><path d="M6 18 18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="navSearchOverlay__body">
              <GlobalSearchBar width={640} onSelect={(item) => { if(item.type==='animal'){ go('/animals'); setSearchOpen(false) } }} />
              <p className="navSearchOverlay__hint">Press Esc to close • Ctrl+K to reopen</p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

import React, {useEffect, useState} from 'react'
import { Box, Typography, Grid, Button, TextField, Stack, CircularProgress, Alert } from '@mui/material'
// ZooCard removed from gallery for reliability; using plain img tiles
// imageCandidatesForAnimal removed: we now rely solely on the stored photo_url
import axios from 'axios'

export default function AnimalsPage(){
  const [animals, setAnimals] = useState([])
  const [gallery, setGallery] = useState([])
  const [loadingGallery, setLoadingGallery] = useState(true)
  const [showAnimals, setShowAnimals] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editDesc, setEditDesc] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [fetchingMore, setFetchingMore] = useState(false)
  const token = localStorage.getItem('token')
  let role = null
  try{ const payload = token && JSON.parse(atob(token.split('.')[1])); role = payload && payload.role }catch(e){}

  const perPage = 24 // show more animals immediately

  const loadPage = (p=1, append=false) => {
    if(append) setFetchingMore(true); else setLoading(true)
    axios.get(`/api/animals?page=${p}&per_page=${perPage}`)
      .then(r=>{
        const data = r.data?.data || []
        const meta = r.data?.meta || {}
        setAnimals(prev => append ? [...prev, ...data] : data)
        setHasMore(meta.page < meta.pages)
        setError(null)
      })
      .catch(e=>{ console.error(e); setError('Failed to load animals'); })
      .finally(()=>{ setLoading(false); setFetchingMore(false) })
  }

  useEffect(()=>{ loadPage(1,false) }, [])
  useEffect(()=>{
    axios.get('/api/animals/gallery')
      .then(r=>{ setGallery(r.data?.images || []) })
      .catch(e=> console.error('gallery_failed', e))
      .finally(()=> setLoadingGallery(false))
  },[])

  // Static fallback list of known animal image filenames (found in /images/animals/) used
  // when the backend gallery endpoint is unavailable or returns empty.
  const staticAnimalImages = [
    'Tiger.jpg',
    'Tiger1.jpeg',
    'Giraffe.jpg',
    'Crocodile.jpg',
    'Crocodile1 (Mugger).jpeg',
    'Asiatic Lion.jpeg',
    'Indian Elephant.jpeg',
    'Sloth Bear.jpeg',
    'Leopard.jpeg',
    'Great Hornbill.jpeg',
    'Gaur (Indian Bison).jpeg',
    'Nilgai (Blue Bull).jpeg',
    'Indian Rock Python.jpeg',
    'Spotted Deer (Chital).jpeg',
    'Indian Peafowl (Peacock).jpeg',
    'Indian Wolf.jpeg',
    'Indian Rhinoceros.jpeg',
    'Blackbuck.jpeg',
    'King Cobra.jpeg',
    'Gharial.jpeg',
    'Rhesus Macaque.jpeg',
    'Sarus Crane.jpeg'
  ]
  const usingStatic = !(gallery && gallery.length>0)
  const effectiveGallery = usingStatic ? staticAnimalImages.map(f=>({ file:f, url:`/images/animals/${f}` })) : gallery

  return (
    <Box sx={{mt:4, pb:6}}>
      <Stack direction={{xs:'column', sm:'row'}} spacing={2} alignItems={{xs:'flex-start', sm:'center'}} justifyContent='space-between' sx={{mb:2}}>
        <Typography variant="h4" gutterBottom sx={{mb:0}}>Animals</Typography>
        <Stack direction='row' spacing={1}>
          <Button variant='contained' size='small' disabled={loadingGallery} onClick={()=> setShowAnimals(s=>!s)}>
            {showAnimals ? 'Hide Animal Records' : 'Show Animal Records'}
          </Button>
          {loadingGallery && <Box sx={{fontSize:12, px:1, py:0.5}}>Loading images…</Box>}
          {!loadingGallery && gallery.length>0 && (
            <Box component='span' sx={{fontSize:12, background:'var(--color-border)', color:'text.secondary', px:1, py:0.5, borderRadius:1}}>
              {gallery.length} images
            </Box>
          )}
        </Stack>
      </Stack>
      {loading && <Box sx={{display:'flex', justifyContent:'center', py:6}}><CircularProgress /></Box>}
      {error && !loading && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}
      {/* Primary gallery grid (auto-loaded) */}
      <Grid container spacing={2} sx={{mb: showAnimals ? 4 : 0}}>
        {effectiveGallery.map(g => {
          const baseName = g.file.replace(/\.[^.]+$/,'')
          const shortTitle = baseName.replace(/\s*\([^)]*\)/g,'').trim()
          return (
            <Grid item key={'gallery-'+g.file} xs={6} sm={4} md={3} lg={2}>
              <Box sx={{position:'relative', border:'1px solid var(--color-border)', borderRadius:2, overflow:'hidden', background:'#142b18', cursor:'pointer', '&:hover .hover-name, &:focus-visible .hover-name':{opacity:1, transform:'translateY(0)'}}}>
                <Box sx={{position:'relative', pt:'125%', overflow:'hidden'}}>
                  <img src={g.url} alt={shortTitle} style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover'}} onError={(e)=>{ e.currentTarget.src='/images/placeholder-banner.svg' }} />
                  <Box className='hover-name' sx={{position:'absolute', left:0, right:0, bottom:0, p:0.75, background:'linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.65) 85%)', color:'#e9f5ef', fontSize:12, fontWeight:600, letterSpacing:.4, textShadow:'0 1px 3px rgba(0,0,0,.7)', opacity:0, transform:'translateY(8%)', transition:'opacity .35s ease, transform .35s ease'}}>
                    {shortTitle}
                  </Box>
                </Box>
              </Box>
            </Grid>
          )
        })}
      </Grid>
  {showAnimals && !loadingGallery && (
        <>
        <Typography variant='h6' sx={{mt:2, mb:1}}>Animal Records</Typography>
        <Grid container spacing={2}>
        {[...animals].sort((a,b)=>{
          const priority = name=> (name.toLowerCase()==='tiger'||name.toLowerCase()==='crocodile') ? 0 : 1
          return priority(a.name)-priority(b.name)
        }).map(a=> {
          // Only use the explicit photo_url (seeded or edited) plus a deterministic placeholder.
          const imgList = [
            ...(a.photo_url ? [a.photo_url] : []),
            `/api/placeholder/animal/${encodeURIComponent(a.name)}.svg`
          ]
          const adminOverlay = (role==='admin' && editingId !== a.id) ? (
            <Button size="small" variant="contained" onClick={()=>{ setEditingId(a.id); setEditDesc(a.description||'') }} sx={{fontSize:'.65rem', lineHeight:1, py:0.5, px:1}}>Edit</Button>
          ) : null
          return (
            <Grid item key={a.id} xs={12} sm={6} md={4} lg={3}>
              {editingId === a.id && role==='admin' ? (
                <Box sx={{p:1.2, border:'1px solid var(--color-border)', borderRadius:2, background:'rgba(20,27,24,.65)'}}>
                  <Typography variant="subtitle2" sx={{fontWeight:600, mb:.5}}>{a.name}</Typography>
                  <TextField fullWidth size="small" label="Description" multiline rows={3} value={editDesc} onChange={e=>setEditDesc(e.target.value)} />
                  <Stack direction="row" spacing={1} sx={{mt:1, justifyContent:'flex-end'}}>
                    <Button size="small" variant="contained" onClick={()=>{
                      const headers = token ? { Authorization: `Bearer ${token}` } : {}
                      axios.put(`/api/animals/${a.id}`, { description: editDesc }, { headers })
                        .then(()=>{
                          setAnimals(prev=> prev.map(x=> x.id===a.id ? { ...x, description: editDesc } : x))
                          setEditingId(null)
                        })
                        .catch(()=>{})
                    }}>Save</Button>
                    <Button size="small" onClick={()=>{ setEditingId(null); setEditDesc('') }}>Cancel</Button>
                  </Stack>
                </Box>
              ) : (
                <ZooCard
                  title={a.name}
                  subtitle={a.species}
                  description={a.description || 'No description yet.'}
                  srcList={imgList}
                  onClick={()=>{ /* future navigation to detail: currently card is static; could nav(`/animals/${a.id}`) */ }}
                  adminOverlay={adminOverlay}
                />
              )}
            </Grid>
          )
        })}
        {/* Raw gallery images without Animal records (or duplicates) */}
        </Grid>
        </>
      )}
      <Box sx={{textAlign:'center', mt:4}}>
        {hasMore && !loading && (
          <Button disabled={fetchingMore} variant='contained' onClick={()=>{ const next = page+1; setPage(next); loadPage(next, true) }}>
            {fetchingMore ? 'Loading...' : 'Load More'}
          </Button>
        )}
        {!hasMore && !loading && animals.length>0 && (
          <Typography variant='body2' color='text.secondary'>All animals loaded.</Typography>
        )}
        {animals.length===0 && !loading && (
          <Typography variant='body2' color='text.secondary'>Animal records not available (backend offline?). Images shown from static list.</Typography>
        )}
      </Box>
    </Box>
  )
}

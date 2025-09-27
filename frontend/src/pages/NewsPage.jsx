import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Grid, Paper, Chip, Skeleton, Alert, Link as MuiLink, Pagination } from '@mui/material'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { normalizeList } from '../utils/normalize'

export default function NewsPage(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    axios.get('/api/news')
      .then(r => { if(!mounted) return; const data = r.data; setItems(normalizeList(data)); if (data && data.meta) setMeta(data.meta) })
      .catch(e => { if(!mounted) return; setError('Failed to load news') })
      .finally(() => { if(mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const pageSize = meta?.per_page || 10
  const totalPages = meta?.pages || Math.ceil((items?.length || 0) / pageSize) || 1
  const pagedItems = useMemo(() => {
    if(meta?.pages){
      // If backend provided meta, we could use server-side pagination; fallback to client-slice
    }
    const arr = Array.isArray(items) ? items : []
    const start = (page - 1) * pageSize
    return arr.slice(start, start + pageSize)
  }, [items, page, pageSize, meta])

  return (
    <Box sx={{mt:4}}>
      <Typography variant="h4" gutterBottom>News</Typography>
      {loading && (
        <Grid container spacing={2}>
          {Array.from({length:6}).map((_,i)=> (
            <Grid key={i} item xs={12} md={6}><Skeleton variant="rounded" height={120} /></Grid>
          ))}
        </Grid>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <Grid container spacing={2}>
          {(Array.isArray(pagedItems)? pagedItems : []).map(n => (
            <Grid item xs={12} md={6} key={n.id}>
              <Paper sx={{p:2}}>
                <Typography variant="h6">{n.title || n.headline || `News #${n.id}`}</Typography>
                {n.id && (
                  <MuiLink component={Link} to={`/news/${n.id}`} underline="hover" sx={{display:'inline-block', mt:0.5}}>
                    Read more
                  </MuiLink>
                )}
                {n.publish_date && <Chip size="small" label={new Date(n.publish_date).toDateString()} sx={{mt:1}} />}
                {n.created_at && <Chip size="small" label={new Date(n.created_at).toDateString()} sx={{mt:1}} />}
                {n.summary && <Typography variant="body2" sx={{mt:1}}>{n.summary}</Typography>}
                {!n.summary && n.body && <Typography variant="body2" sx={{mt:1}}>{String(n.body).slice(0,140)}{String(n.body).length>140?'…':''}</Typography>}
              </Paper>
            </Grid>
          ))}
          {(!items || items.length===0) && (
            <Grid item xs={12}><Typography variant="body2">No news available.</Typography></Grid>
          )}
        </Grid>
      )}
      {!loading && !error && items && items.length>0 && (
        <Box sx={{display:'flex', justifyContent:'center', mt:3}}>
          <Pagination count={totalPages} page={page} onChange={(_,p)=>setPage(p)} color="primary" />
        </Box>
      )}
    </Box>
  )
}

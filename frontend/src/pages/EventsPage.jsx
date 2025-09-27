import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Grid, Paper, Chip, Skeleton, Alert, Link as MuiLink, Pagination } from '@mui/material'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { normalizeList } from '../utils/normalize'

export default function EventsPage(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    axios.get('/api/events')
      .then(r => { if(!mounted) return; const data = r.data; setItems(normalizeList(data)); if (data && data.meta) setMeta(data.meta) })
      .catch(e => { if(!mounted) return; setError('Failed to load events') })
      .finally(() => { if(mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const pageSize = meta?.per_page || 10
  const totalPages = meta?.pages || Math.ceil((items?.length || 0) / pageSize) || 1
  const pagedItems = useMemo(() => {
    if(meta?.pages){
      // If backend provided meta, ideally we’d request ?page= but public endpoint is simple; fallback to client-slice
    }
    const arr = Array.isArray(items) ? items : []
    const start = (page - 1) * pageSize
    return arr.slice(start, start + pageSize)
  }, [items, page, pageSize, meta])

  return (
    <Box sx={{mt:4}}>
      <Typography variant="h4" gutterBottom>Events</Typography>
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
          {(Array.isArray(pagedItems)? pagedItems : []).map(ev => (
            <Grid item xs={12} md={6} key={ev.id}>
              <Paper sx={{p:2}}>
                <Typography variant="h6">{ev.title || ev.name || `Event #${ev.id}`}</Typography>
                {ev.id && (
                  <MuiLink component={Link} to={`/events/${ev.id}`} underline="hover" sx={{display:'inline-block', mt:0.5}}>
                    View details
                  </MuiLink>
                )}
                {ev.start_date && <Chip size="small" label={new Date(ev.start_date).toDateString()} sx={{mt:1}} />}
                {ev.start_date && ev.end_date && (
                  <Chip size="small" label={`${new Date(ev.start_date).toDateString()} - ${new Date(ev.end_date).toDateString()}`} sx={{mt:1, ml:1}} />
                )}
                {ev.description && <Typography variant="body2" sx={{mt:1}}>{ev.description}</Typography>}
              </Paper>
            </Grid>
          ))}
          {(!items || items.length===0) && (
            <Grid item xs={12}><Typography variant="body2">No events available.</Typography></Grid>
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

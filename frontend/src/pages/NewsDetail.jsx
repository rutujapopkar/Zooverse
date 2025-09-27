import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, Chip, Skeleton, Alert, Paper } from '@mui/material'
import axios from 'axios'

export default function NewsDetail(){
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    axios.get(`/api/news/${id}`)
      .then(r => { if(!mounted) return; setItem(r.data) })
      .catch(() => { if(!mounted) return; setError('News item not found') })
      .finally(() => { if(mounted) setLoading(false) })
    return () => { mounted = false }
  }, [id])

  if(loading){
    return <Skeleton variant="rounded" height={180} />
  }
  if(error){
    return <Alert severity="error">{error}</Alert>
  }
  if(!item){
    return <Alert severity="info">No data.</Alert>
  }

  return (
    <Box sx={{mt:4}}>
      <Paper sx={{p:3}}>
        <Typography variant="h4" gutterBottom>{item.title || `News #${item.id}`}</Typography>
        <Box sx={{display:'flex', gap:1, flexWrap:'wrap'}}>
          {item.publish_date && <Chip label={new Date(item.publish_date).toDateString()} />}
          {item.created_at && <Chip label={`Created: ${new Date(item.created_at).toLocaleString()}`} />}
        </Box>
        {item.summary && <Typography variant="subtitle1" sx={{mt:2}}>{item.summary}</Typography>}
        {item.body && <Typography sx={{mt:2, whiteSpace:'pre-wrap'}}>{item.body}</Typography>}
      </Paper>
    </Box>
  )
}

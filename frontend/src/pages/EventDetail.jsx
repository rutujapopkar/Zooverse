import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, Chip, Skeleton, Alert, Paper } from '@mui/material'
import axios from 'axios'

export default function EventDetail(){
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    axios.get(`/api/events/${id}`)
      .then(r => { if(!mounted) return; setItem(r.data) })
      .catch(() => { if(!mounted) return; setError('Event not found') })
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
        <Typography variant="h4" gutterBottom>{item.title || `Event #${item.id}`}</Typography>
        <Box sx={{display:'flex', gap:1, flexWrap:'wrap'}}>
          {item.date && <Chip label={new Date(item.date).toDateString()} />}
          {item.start_date && <Chip label={`Starts: ${new Date(item.start_date).toDateString()}`} />}
          {item.end_date && <Chip label={`Ends: ${new Date(item.end_date).toDateString()}`} />}
          {item.start_time && <Chip label={`Start: ${item.start_time}`} />}
          {item.end_time && <Chip label={`End: ${item.end_time}`} />}
          {item.location && <Chip label={item.location} />}
        </Box>
        {item.description && <Typography sx={{mt:2}}>{item.description}</Typography>}
      </Paper>
    </Box>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { Autocomplete, TextField, InputAdornment, Box, CircularProgress } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import axios from 'axios'

// Global search hitting backend /api/search combining animals, doctors, events, news
let globalSearchCounter = 0
export default function GlobalSearchBar({ width = 320, onSelect, inputId }){
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState([])
  const [debounceTimer, setDebounceTimer] = useState(null)
  // Stable auto-generated id if caller doesn't supply one
  const autoIdRef = useRef(null)
  if(autoIdRef.current === null){
    globalSearchCounter += 1
    autoIdRef.current = `global-search-input-${globalSearchCounter}`
  }
  const resolvedId = inputId || autoIdRef.current

  const buildOptions = (data) => {
    const out = []
    data.animals?.forEach(a=> out.push({ type:'animal', id:a.id, label:a.name }))
    data.doctors?.forEach(d=> out.push({ type:'doctor', id:d.id, label:`Dr. ${d.username}` }))
    data.events?.forEach(ev=> out.push({ type:'event', id:ev.id, label:`Event: ${ev.title}` }))
    data.news?.forEach(n=> out.push({ type:'news', id:n.id, label:`News: ${n.title}` }))
    return out
  }

  const runSearch = (q) => {
    if(!q){ setOptions([]); return }
    setLoading(true)
    axios.get('/api/search', { params:{ q } }).then(r=>{
      setOptions(buildOptions(r.data || {}))
    }).catch(()=> setOptions([])).finally(()=> setLoading(false))
  }

  useEffect(()=>{
    if(debounceTimer) clearTimeout(debounceTimer)
    const t = setTimeout(()=> runSearch(query), 300)
    setDebounceTimer(t)
    return ()=> clearTimeout(t)
  }, [query])

  return (
    <Box sx={{width, position:'relative'}} className='global-search-wrapper'>
      <Autocomplete
        size='small'
        options={options}
        loading={loading}
        getOptionLabel={(o)=>o.label}
        noOptionsText={query ? 'No matches' : 'Type to search'}
        slotProps={{
          popper: {
            modifiers: [
              { name: 'zIndex', enabled: true, phase: 'write', fn: ({ state }) => { state.styles.popper.zIndex = 1300 } }
            ]
          },
          paper: { sx: { zIndex:1300 } }
        }}
        onChange={(_, val)=>{ if(val && onSelect) onSelect(val) }}
        renderInput={(params)=>(
          <TextField
            {...params}
            placeholder='Search animals, doctors, events, news...'
            onChange={e=> setQuery(e.target.value)}
            inputProps={{ ...params.inputProps, id: resolvedId }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress color='inherit' size={16} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
      />
    </Box>
  )
}

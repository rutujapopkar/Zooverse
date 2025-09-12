import React, { createContext, useContext, useState, useCallback } from 'react'
import { Snackbar, Alert } from '@mui/material'

const SnackCtx = createContext({ notify: () => {} })

export function useSnackbar(){ return useContext(SnackCtx) }

export default function SnackbarProvider({ children }){
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState('')
  const [severity, setSeverity] = useState('info')
  const notify = useCallback((text, sev='info') => { setMsg(text); setSeverity(sev); setOpen(true) }, [])
  return (
    <SnackCtx.Provider value={{ notify }}>
      {children}
      <Snackbar open={open} autoHideDuration={3000} onClose={()=>setOpen(false)} anchorOrigin={{ vertical:'bottom', horizontal:'right' }}>
        <Alert onClose={()=>setOpen(false)} severity={severity} sx={{ width: '100%' }}>{msg}</Alert>
      </Snackbar>
    </SnackCtx.Provider>
  )
}

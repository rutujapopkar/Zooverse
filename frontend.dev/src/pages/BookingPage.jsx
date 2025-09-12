import React, {useState} from 'react'
import { Box, TextField, Button, Typography, MenuItem } from '@mui/material'
import axios from 'axios'

export default function BookingPage(){
  const [date, setDate] = useState('')
  const [time_slot, setTimeSlot] = useState('09:00-11:00')
  const [num_adults, setAdults] = useState(1)
  const [num_children, setChildren] = useState(0)
  const userLang = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-IN'
  const defaultCurrency = /in|india/i.test(userLang) ? 'INR' : 'INR' // prefer INR for this app
  const [currency, setCurrency] = useState(defaultCurrency)

  const PRICING = {
    INR: { adult: 200, child: 100 }
  }

  const unit = PRICING[currency] || PRICING.INR
  const total = (Number(num_adults||0) * unit.adult) + (Number(num_children||0) * unit.child)

  const formatCurrency = (amount, cur) => {
    try{
      const locale = cur === 'INR' ? 'en-IN' : 'en-US'
      return new Intl.NumberFormat(locale, { style: 'currency', currency: cur }).format(amount)
    }catch(e){
      return `${cur} ${amount}`
    }
  }

  const doBook = async ()=>{
    try{
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const price_cents = Math.round(total * 100)
  await axios.post('/api/bookings', { date, time_slot, num_adults, num_children, price_cents, currency }, { headers })
      alert('booking created')
    }catch(e){
      alert('booking failed')
    }
  }

  return (
    <Box sx={{maxWidth:480, mx:'auto', mt:8}}>
      <Typography variant="h4" gutterBottom>Book Tickets</Typography>
      <TextField fullWidth label="Date (YYYY-MM-DD)" margin="normal" value={date} onChange={e=>setDate(e.target.value)} />
      <TextField fullWidth label="Time slot" margin="normal" value={time_slot} onChange={e=>setTimeSlot(e.target.value)} />
      <TextField select fullWidth label="Currency" margin="normal" value={currency} onChange={e=>setCurrency(e.target.value)}>
        <MenuItem value="INR">Indian Rupee (INR)</MenuItem>
      </TextField>
      <TextField fullWidth label="Adults" type="number" margin="normal" value={num_adults} onChange={e=>setAdults(Math.max(0, Number(e.target.value)))} />
      <TextField fullWidth label="Children" type="number" margin="normal" value={num_children} onChange={e=>setChildren(Math.max(0, Number(e.target.value)))} />
      <Box sx={{mt:2}}>
        <Typography>Unit price — Adult: {formatCurrency(unit.adult, currency)} • Child: {formatCurrency(unit.child, currency)}</Typography>
        <Typography variant="h6" sx={{mt:1}}>Total: {formatCurrency(total, currency)}</Typography>
      </Box>
      <Button variant="contained" onClick={doBook} sx={{mt:2}}>Book</Button>
    </Box>
  )
}

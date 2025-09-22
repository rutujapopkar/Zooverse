import React, { useState } from 'react'
import { Box, TextField, Button, Typography, MenuItem, Grid, Paper, Stack } from '@mui/material'
import axios from 'axios'

// Booking page styled per customer dashboard spec (grid + focus states + payment placeholders)
export default function BookingPage(){
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('09:00-11:00')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const userLang = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-IN'
  const defaultCurrency = /in|india/i.test(userLang) ? 'INR' : 'INR'
  const [currency, setCurrency] = useState(defaultCurrency)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const PRICING = { INR: { adult: 200, child: 100 } }
  const unit = PRICING[currency] || PRICING.INR
  const total = (Number(adults||0) * unit.adult) + (Number(children||0) * unit.child)

  const formatCurrency = (amount, cur) => {
    try{ const locale = cur === 'INR' ? 'en-IN' : 'en-US'; return new Intl.NumberFormat(locale, { style:'currency', currency:cur }).format(amount) }catch(e){ return `${cur} ${amount}` }
  }

  const doBook = async () => {
    setLoading(true); setError(null); setSuccess(false)
    try {
      if(!date) throw new Error('Date required')
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const price_cents = Math.round(total * 100)
      await axios.post('/api/bookings', { date, time_slot: timeSlot, num_adults: adults, num_children: children, price_cents, currency }, { headers })
      setSuccess(true)
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Booking failed')
    } finally { setLoading(false) }
  }

  return (
    <Box id="main-content" sx={{mt:6, pb:10}}>
      <Typography variant='h4' gutterBottom>Book Tickets</Typography>
      <Paper elevation={3} sx={{p:{xs:3, md:4}, borderRadius:3}}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Date (YYYY-MM-DD)' value={date} onChange={e=>setDate(e.target.value)} placeholder='2025-12-31' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Time Slot' value={timeSlot} onChange={e=>setTimeSlot(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label='Currency' value={currency} onChange={e=>setCurrency(e.target.value)}>
              <MenuItem value='INR'>Indian Rupee (INR)</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} sm={4}>
            <TextField fullWidth label='Adults' type='number' value={adults} onChange={e=>setAdults(Math.max(0, Number(e.target.value)))} />
          </Grid>
            <Grid item xs={6} sm={4}>
            <TextField fullWidth label='Children' type='number' value={children} onChange={e=>setChildren(Math.max(0, Number(e.target.value)))} />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{display:'flex', flexWrap:'wrap', gap:2, alignItems:'center'}}>
              <Typography variant='body2'>Adult: {formatCurrency(unit.adult, currency)}</Typography>
              <Typography variant='body2'>Child: {formatCurrency(unit.child, currency)}</Typography>
              <Typography variant='h6' sx={{ml:'auto'}}>Total: {formatCurrency(total, currency)}</Typography>
            </Box>
          </Grid>
          {error && <Grid item xs={12}><Typography color='error' variant='body2'>{error}</Typography></Grid>}
          {success && <Grid item xs={12}><Typography color='success.main' variant='body2'>Booking created. You can view it under My Tickets.</Typography></Grid>}
          <Grid item xs={12}>
            <Button disabled={loading} variant='contained' color='success' onClick={doBook} sx={{px:4, py:1.2}}>{loading? 'Processing...' : 'Confirm Booking'}</Button>
          </Grid>
        </Grid>
        {/* Payment Integration Placeholder */}
        <Box sx={{mt:5}}>
          <Typography variant='subtitle1' sx={{fontWeight:600, mb:1}}>Choose Payment Method</Typography>
          <Stack direction={{xs:'column', sm:'row'}} spacing={2}>
            <Button variant='outlined' className='payment-btn' disabled>Razorpay (Coming Soon)</Button>
            <Button variant='outlined' className='payment-btn' disabled>PayPal (Coming Soon)</Button>
            <Button variant='outlined' className='payment-btn' disabled>UPI (Coming Soon)</Button>
          </Stack>
          <Typography variant='caption' sx={{display:'block', mt:1, color:'text.secondary'}}>Payment gateway integration pending. For now booking records are created directly.</Typography>
        </Box>
      </Paper>
    </Box>
  )
}

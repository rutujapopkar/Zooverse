import React, { useEffect, useState } from 'react'
import { Box, Typography, Paper, TextField, Button, Grid, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import axios from 'axios'

export default function AdminTickets(){
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [edit, setEdit] = useState(null)
  const [saleOpen, setSaleOpen] = useState(false)
  const [saleData, setSaleData] = useState({ ticket_type_id:'', quantity_adults:0, quantity_children:0 })
  const [summary, setSummary] = useState(null)

  const fetchTypes = ()=>{
    setLoading(true)
    axios.get('/api/ticket-types', auth()).then(r=> setTypes(r.data||[])).finally(()=>setLoading(false))
  }
  const fetchSummary = ()=>{
    axios.get('/api/ticket-sales/summary', auth()).then(r=> setSummary(r.data)).catch(()=>{})
  }
  useEffect(()=>{ fetchTypes(); fetchSummary() },[])

  const auth = () => ({ headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }})

  const startCreate = ()=> setEdit({ name:'', description:'', adult_price_cents:0, child_price_cents:0, group_size:'', active:true })
  const startEdit = (tt)=> setEdit({...tt})
  const closeEdit = ()=> setEdit(null)
  const saveEdit = ()=>{
    const payload = { ...edit }
    const req = edit.id ? axios.put(`/api/ticket-types/${edit.id}`, payload, auth()) : axios.post('/api/ticket-types', payload, auth())
    req.then(()=>{ fetchTypes(); closeEdit(); fetchSummary() })
  }
  const deleteType = (tt)=>{ if(window.confirm('Delete ticket type?')) axios.delete(`/api/ticket-types/${tt.id}`, auth()).then(()=>{ fetchTypes(); fetchSummary() }) }

  const openSale = (tt)=>{ setSaleData({ ticket_type_id:tt.id, quantity_adults:0, quantity_children:0 }); setSaleOpen(true) }
  const recordSale = ()=>{
    axios.post('/api/ticket-sales', saleData, auth()).then(()=>{ setSaleOpen(false); fetchSummary() })
  }

  return (
    <Box sx={{mt:4}}>
      <Typography variant='h4' gutterBottom>Ticket Types & Manual Sales</Typography>
      {summary && (
        <Typography variant='body2' sx={{mb:2}}>Total Revenue: ₹{Math.round((summary.total_revenue_cents||0)/100)} | Sales Count: {summary.sales_count}</Typography>
      )}
      <Paper sx={{p:2, mb:3}}>
        <Box sx={{display:'flex', justifyContent:'space-between', mb:2}}>
          <Typography variant='h6'>Ticket Types</Typography>
          <Button startIcon={<AddIcon />} variant='contained' onClick={startCreate}>New Type</Button>
        </Box>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Adult (₹)</TableCell>
              <TableCell>Child (₹)</TableCell>
              <TableCell>Group Size</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {types.map(tt=> (
              <TableRow key={tt.id} hover>
                <TableCell>{tt.name}</TableCell>
                <TableCell>{Math.round(tt.adult_price_cents/100)}</TableCell>
                <TableCell>{Math.round(tt.child_price_cents/100)}</TableCell>
                <TableCell>{tt.group_size || '-'}</TableCell>
                <TableCell>{tt.active? 'Yes':'No'}</TableCell>
                <TableCell align='right'>
                  <IconButton size='small' onClick={()=>startEdit(tt)}><EditIcon fontSize='small' /></IconButton>
                  <Button size='small' onClick={()=>openSale(tt)}>Sale</Button>
                  <Button size='small' color='error' onClick={()=>deleteType(tt)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={!!edit} onClose={closeEdit} maxWidth='sm' fullWidth>
        <DialogTitle>{edit?.id? 'Edit Ticket Type':'New Ticket Type'}</DialogTitle>
        <DialogContent dividers>
          {edit && (
            <Grid container spacing={2} sx={{mt:0}}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label='Name' value={edit.name} onChange={e=>setEdit({...edit, name:e.target.value})} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label='Group Size' value={edit.group_size || ''} onChange={e=>setEdit({...edit, group_size:e.target.value})} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={2} label='Description' value={edit.description||''} onChange={e=>setEdit({...edit, description:e.target.value})} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label='Adult Price (₹)' type='number' value={Math.round(edit.adult_price_cents/100)} onChange={e=>setEdit({...edit, adult_price_cents: parseInt(e.target.value||'0')*100})} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label='Child Price (₹)' type='number' value={Math.round(edit.child_price_cents/100)} onChange={e=>setEdit({...edit, child_price_cents: parseInt(e.target.value||'0')*100})} />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch checked={!!edit.active} onChange={e=>setEdit({...edit, active:e.target.checked})} />} label='Active' />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button variant='contained' onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={saleOpen} onClose={()=>setSaleOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Record Manual Sale</DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth select SelectProps={{native:true}} label='Ticket Type' sx={{mt:1}} value={saleData.ticket_type_id} onChange={e=>setSaleData({...saleData, ticket_type_id:e.target.value})}>
            <option value=''>-- select --</option>
            {types.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
          </TextField>
          <TextField fullWidth type='number' label='Adults' sx={{mt:2}} value={saleData.quantity_adults} onChange={e=>setSaleData({...saleData, quantity_adults:e.target.value})} />
            <TextField fullWidth type='number' label='Children' sx={{mt:2}} value={saleData.quantity_children} onChange={e=>setSaleData({...saleData, quantity_children:e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setSaleOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={recordSale}>Record</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
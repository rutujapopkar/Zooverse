import React from 'react'
import { Box, Typography, Grid, Paper, List, ListItem, ListItemText, Button, Stack } from '@mui/material'
import AdminLayout from '../components/admin/AdminLayout'
import StatCard from '../components/admin/StatCard'
import AdminSearchBar from '../components/admin/AdminSearchBar'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Weekly ticket sales supplied by user. Assumption: values map Mon->Sun; when fewer values provided, repeating last known value for remaining days.
const salesData = [
  { name: 'Mon', sales: 0 },
  { name: 'Tue', sales: 150 },
  { name: 'Wed', sales: 300 },
  { name: 'Thu', sales: 450 },
  { name: 'Fri', sales: 600 },
  { name: 'Sat', sales: 600 },
  { name: 'Sun', sales: 600 }
]

const inrFmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

export default function AdminDashboard(){
  const nav = useNavigate()
  const stats = [
    { key:'animals', label:'Animals', icon:'🦁', value:128 },
    { key:'tickets', label:'Tickets Sold (Week)', icon:'🎟️', value:3140 },
    { key:'doctors', label:'Doctors', icon:'👨‍⚕️', value:6 },
    { key:'revenue', label:'Revenue (Week)', icon:'💰', value: inrFmt.format(865000) }
  ]
  return (
    <AdminLayout searchBar={<AdminSearchBar onSearch={(q)=>console.log('admin search', q)} />}> 
    <div className="fadeIn">
  <Typography variant="h4" sx={{mb:1, color:'#fff'}}>Dashboard Overview</Typography>
      <p className="small-muted" style={{margin:0}}>Operational snapshot – figures auto-refresh planned in future iteration.</p>
      <div className="admin-stats">
        {stats.map(s => (<StatCard key={s.key} icon={s.icon} label={s.label} value={s.value} kind={s.key} />))}
      </div>
      <Stack direction="row" spacing={1} sx={{my:2}}>
        <Button variant="contained" color="success" onClick={()=>nav('/admin/animals')} sx={{color:'#fff'}}>Manage Animals</Button>
        <Button variant="outlined" onClick={()=>nav('/admin/staff')}
          sx={{color:'#fff', borderColor:'rgba(255,255,255,0.6)', '&:hover':{borderColor:'#fff', background:'rgba(255,255,255,0.08)'}}}>Manage Staff</Button>
        <Button variant="outlined" onClick={()=>nav('/admin/images')}
          sx={{color:'#fff', borderColor:'rgba(255,255,255,0.6)', '&:hover':{borderColor:'#fff', background:'rgba(255,255,255,0.08)'}}}>Manage Images</Button>
        <Button variant="outlined" onClick={()=>nav('/admin/tickets')}
          sx={{color:'#fff', borderColor:'rgba(255,255,255,0.6)', '&:hover':{borderColor:'#fff', background:'rgba(255,255,255,0.08)'}}}>Tickets</Button>
      </Stack>
      <Grid container spacing={2} sx={{mt:1}}>
        <Grid item xs={12} md={8}>
          <Paper sx={{p:2}} className="fadeIn">
            <Typography variant="h6">Ticket Sales (This week)</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{background:'rgba(0,0,0,.85)', border:'none', borderRadius:6, color:'#fff'}} />
                <Line type="monotone" dataKey="sales" stroke="#2e7d32" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{p:2}} className="fadeIn" style={{animationDelay:'80ms'}}>
            <Typography variant="h6">Key Metrics</Typography>
            <List>
              <ListItem>
                <ListItemText primary={`Today's Sales: ${inrFmt.format(420)}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary={`Visitors: ${new Intl.NumberFormat('en-IN').format(1230)}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary={`Revenue: ${inrFmt.format(3200)}`} />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </div>
    </AdminLayout>
  )
}

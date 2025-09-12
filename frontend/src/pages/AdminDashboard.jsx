import React from 'react'
import { Box, Typography, Grid, Paper, List, ListItem, ListItemText, Button, Stack } from '@mui/material'
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
  return (
    <Box sx={{display:'flex', gap:2, mt:4}}>
      <Paper sx={{width:220, p:2}} elevation={1}>
        <Typography variant="h6">Admin</Typography>
        <List>
          <ListItem button onClick={()=>nav('/admin')}>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={()=>nav('/admin/animals')}>
            <ListItemText primary="Animal Management" />
          </ListItem>
          <ListItem button onClick={()=>nav('/admin/staff')}>
            <ListItemText primary="Staff Management" />
          </ListItem>
          <ListItem button onClick={()=>nav('/admin/images')}>
            <ListItemText primary="Images" />
          </ListItem>
        </List>
      </Paper>
      <Box sx={{flex:1}}>
        <Typography variant="h4">Analytics Overview</Typography>
        <Stack direction="row" spacing={1} sx={{my:2}}>
          <Button variant="contained" color="success" onClick={()=>nav('/admin/animals')}>Manage Animals</Button>
          <Button variant="outlined" onClick={()=>nav('/admin/staff')}>Manage Staff</Button>
          <Button variant="outlined" onClick={()=>nav('/admin/images')}>Manage Images</Button>
        </Stack>
        <Grid container spacing={2} sx={{mt:2}}>
          <Grid item xs={12} md={8}>
            <Paper sx={{p:2}}>
              <Typography variant="h6">Ticket Sales (This week)</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#2e7d32" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{p:2}}>
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
      </Box>
    </Box>
  )
}

import React from 'react'
import { Box, Typography, Grid, Paper, List, ListItem, ListItemText } from '@mui/material'
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
  return (
    <Box sx={{display:'flex', gap:2, mt:4}}>
      <Paper sx={{width:220, p:2}} elevation={1}>
        <Typography variant="h6">Admin</Typography>
        <List>
          <ListItem button component="a" href="#">
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button component="a" href="#">
            <ListItemText primary="Animal Management" />
          </ListItem>
          <ListItem button component="a" href="#">
            <ListItemText primary="Staff Management" />
          </ListItem>
        </List>
      </Paper>
      <Box sx={{flex:1}}>
        <Typography variant="h4">Analytics Overview</Typography>
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

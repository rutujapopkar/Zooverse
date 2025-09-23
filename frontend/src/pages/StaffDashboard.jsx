import React from 'react'
import { Box, Typography, Paper, Stack } from '@mui/material'

export default function StaffDashboard(){
  return (
    <Box sx={{mt:4}}>
      <Typography variant="h4" gutterBottom>Staff Dashboard</Typography>
      <Typography variant="body1" sx={{mb:2}}>Welcome. Future panels will include shift assignments, visitor flow alerts, and operational notices.</Typography>
      <Stack spacing={2}>
        <Paper sx={{p:2}}>
          <Typography variant="subtitle1">Getting Started</Typography>
          <Typography variant="body2">Use the Animals and Tickets sections (if permission granted) or contact an admin to expand staff tools.</Typography>
        </Paper>
        <Paper sx={{p:2}}>
          <Typography variant="subtitle1">Next Planned Features</Typography>
          <ul style={{marginTop:8, marginBottom:0}}>
            <li>Daily task list</li>
            <li>Escalation feed (urgent alerts)</li>
            <li>Shift handover notes</li>
          </ul>
        </Paper>
      </Stack>
    </Box>
  )
}

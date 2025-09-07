import React from 'react'
import { Box, Typography } from '@mui/material'

export default function Footer(){
  return (
    <Box component="footer" sx={{py:4, textAlign:'center', mt:6, bgcolor:'#e8f5e9'}}>
      <Typography variant="body2">© {new Date().getFullYear()} Zooverse - Smart Zoo Management</Typography>
    </Box>
  )
}

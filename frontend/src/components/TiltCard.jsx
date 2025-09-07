import React from 'react'
import './tilt.css'
import { Card, CardContent, CardMedia, Typography } from '@mui/material'

export default function TiltCard({img, title, subtitle}){
  return (
    <div className="tilt-root">
      <Card className="tilt-card">
        <CardMedia component="img" height="160" image={img} alt={title} />
        <CardContent>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        </CardContent>
      </Card>
    </div>
  )
}

import React from 'react'
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const faqs = [
  { q: 'What are the zoo timings?', a: 'Open daily 9:00 AM to 6:00 PM (last entry 5:30 PM).' },
  { q: 'Can I book tickets online?', a: 'Yes, use the Book Tickets section after logging in.' },
  { q: 'Are outside foods allowed?', a: 'Light snacks yes; full meals are restricted to designated areas.' },
  { q: 'Is there parking available?', a: 'Yes, paid parking for cars and two-wheelers.' }
]

export default function FaqPage(){
  return (
    <Box sx={{mt:4, mb:6}}>
      <Typography variant='h4' gutterBottom>Frequently Asked Questions</Typography>
      {faqs.map((f,i)=>(
        <Accordion key={i}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant='subtitle1'>{f.q}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant='body2'>{f.a}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

import React, { useMemo, useState } from 'react'
import { Fab, Box, Paper, Typography, IconButton, TextField } from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'

const faq = [
  { q: /hello|hi|hey/i, a: 'Hello! How can I help you with your visit today?' },
  { q: /hour|time|open|closing/i, a: 'We are open daily from 9:00 AM to 6:00 PM.' },
  { q: /price|ticket|cost|inr/i, a: 'Standard prices start from ₹200 for adults and ₹100 for children. Final price depends on date/time (dynamic pricing).' },
  { q: /book|booking|ticket/i, a: 'You can book tickets on the Bookings page. After payment, your QR code ticket appears in My Tickets.' },
  { q: /refund|cancel/i, a: 'Please contact support at support@zoo.example for refund/cancellation policies.' },
  { q: /direction|address|where/i, a: 'We are located at Smart Zoo, City Center. Parking is available on-site.' },
]

function replyFor(input){
  const hit = faq.find(f => f.q.test(input))
  if (hit) return hit.a
  return "I'm not sure, but a human will help soon. Try asking about hours, pricing, or booking."
}

export default function ChatBot(){
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m Zoo Assistant. Ask me about hours, pricing, or bookings.' }
  ])

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setMessages(m => [...m, { role: 'user', text }])
    setInput('')
    try{
      const res = await fetch('/api/chat', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ message: text }) })
      const data = await res.json()
      if(!res.ok || !data.reply) throw new Error('bad response')
      setMessages(m => [...m, { role: 'bot', text: data.reply }])
    }catch(err){
      const bot = replyFor(text)
      setMessages(m => [...m, { role: 'bot', text: bot }])
    }
  }

  return (
    <>
      <Fab color="primary" aria-label="chat" onClick={() => setOpen(o=>!o)}
           sx={{ position:'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
        <ChatIcon />
      </Fab>
      {open && (
        <Paper elevation={6} sx={{ position:'fixed', bottom: 96, right: 24, width: 340, maxHeight: 440, display:'flex', flexDirection:'column', zIndex: 1200 }}>
          <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', p:1, borderBottom:'1px solid #eee' }}>
            <Typography variant="subtitle1" sx={{pl:1}}>Zoo Assistant</Typography>
            <IconButton onClick={()=>setOpen(false)} size="small"><CloseIcon fontSize="small"/></IconButton>
          </Box>
          <Box sx={{ p:1, overflowY:'auto', flex:1 }}>
            {messages.map((m, i) => (
              <Box key={i} sx={{ mb:1, textAlign: m.role==='user'?'right':'left' }}>
                <Typography variant="body2" sx={{ display:'inline-block', px:1, py:0.5, borderRadius:1, bgcolor: m.role==='user'?'primary.light':'grey.100', color: m.role==='user'?'primary.contrastText':'inherit' }}>
                  {m.text}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ p:1, display:'flex', gap:1 }}>
            <TextField size="small" fullWidth value={input} onChange={e=>setInput(e.target.value)} placeholder="Type your message" onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); handleSend(); } }} />
            <Fab color="primary" size="small" onClick={handleSend} aria-label="send">
              <ChatIcon fontSize="small" />
            </Fab>
          </Box>
        </Paper>
      )}
    </>
  )
}

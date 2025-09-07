import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CssBaseline, Container } from '@mui/material'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'

function App(){
  return (
    <BrowserRouter>
      <CssBaseline />
      <Container>
        <Routes>
          <Route path="/" element={<LoginPage/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
        </Routes>
      </Container>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)

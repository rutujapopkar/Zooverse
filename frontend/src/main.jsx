import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CssBaseline, Container } from '@mui/material'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import AnimalsPage from './pages/AnimalsPage'
import BookingPage from './pages/BookingPage'
import MyTickets from './pages/MyTickets'
import AdminAnimals from './pages/AdminAnimals'
import AnimalDetail from './pages/AnimalDetail'
import { ThemeProvider } from '@mui/material/styles'
import theme from './theme'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import AdminDashboard from './pages/AdminDashboard'

function App(){
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <CssBaseline />
        <NavBar />
        <Container>
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/register" element={<RegisterPage/>} />
            <Route path="/dashboard" element={<Dashboard/>} />
            <Route path="/animals" element={<AnimalsPage/>} />
            <Route path="/animals/:id" element={<AnimalDetail/>} />
            <Route path="/admin" element={<AdminDashboard/>} />
            <Route path="/admin/animals" element={<AdminAnimals/>} />
            <Route path="/bookings" element={<BookingPage/>} />
            <Route path="/tickets" element={<MyTickets/>} />
          </Routes>
        </Container>
        <Footer />
      </BrowserRouter>
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(<App />)

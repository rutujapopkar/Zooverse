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
import { RequireAuth, RequireAdmin } from './components/RequireAuth'
import Footer from './components/Footer'
import AdminDashboard from './pages/AdminDashboard'
import AdminImages from './pages/AdminImages'
import AdminStaff from './pages/AdminStaff'
import ChatBot from './components/ChatBot'
import SnackbarProvider from './components/SnackbarProvider'

function App(){
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
      <BrowserRouter>
        <CssBaseline />
        <NavBar />
        <Container>
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/register" element={<RegisterPage/>} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard/></RequireAuth>} />
            <Route path="/animals" element={<AnimalsPage/>} />
            <Route path="/animals/:id" element={<AnimalDetail/>} />
            <Route path="/admin" element={<RequireAdmin><AdminDashboard/></RequireAdmin>} />
            <Route path="/admin/animals" element={<RequireAdmin><AdminAnimals/></RequireAdmin>} />
            <Route path="/admin/images" element={<RequireAdmin><AdminImages/></RequireAdmin>} />
            <Route path="/admin/staff" element={<RequireAdmin><AdminStaff/></RequireAdmin>} />
            <Route path="/bookings" element={<RequireAuth><BookingPage/></RequireAuth>} />
            <Route path="/tickets" element={<RequireAuth><MyTickets/></RequireAuth>} />
          </Routes>
        </Container>
        <Footer />
        <ChatBot />
      </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(<App />)

import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CssBaseline, Container } from '@mui/material'
import HomePage from './pages/HomePage'
// Tailwind experimental homepage (animated) - swap route element to test
import ProgramDetail from './pages/ProgramDetail'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import AnimalsPage from './pages/AnimalsPage'
import BookingPage from './pages/BookingPage'
import MyTickets from './pages/MyTickets'
import AdminAnimals from './pages/AdminAnimals'
import AnimalDetail from './pages/AnimalDetail'
import { ThemeProvider } from '@mui/material/styles'
// Tailwind base styles (processed via PostCSS + Tailwind build pipeline)
// Tailwind fully removed; using semantic CSS only.
import './styles/semantic/global.css' // new semantic stylesheet
import './styles/admin.css'
import theme from './theme'
// Ensure axios interceptors are registered early
import './utils/axiosSetup'
import NavBar from './components/NavBar'
import { RequireAuth, RequireAdmin, RequireVet } from './components/RequireAuth'
import DoctorDashboard from './pages/DoctorDashboard'
import ErrorBoundary from './components/ErrorBoundary'
import Footer from './components/Footer'
import AdminDashboard from './pages/AdminDashboard'
import AdminImages from './pages/AdminImages'
import AdminStaff from './pages/AdminStaff'
import AdminTickets from './pages/AdminTickets'
import AdminEvents from './pages/AdminEvents'
import AdminNews from './pages/AdminNews'
import AdminFeedback from './pages/AdminFeedback'
import AdminAudit from './pages/AdminAudit'
import ChatBot from './components/ChatBot'
import SnackbarProvider from './components/SnackbarProvider'
import FaqPage from './pages/FaqPage'
import MapPage from './pages/MapPage'
import ContactPage from './pages/ContactPage'
import CustomerDashboard from './pages/CustomerDashboard'

function App(){
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
      <BrowserRouter>
        <CssBaseline />
  {/* Skip link removed per user request */}
        <NavBar />
        <Routes>
          {/* MUI-based home restored as primary landing page */}
          <Route path="/" element={<Container><HomePage/></Container>} />
          {/* Routes needing standard padding wrapped in Container */}
          <Route path="/login" element={<Container><LoginPage/></Container>} />
          <Route path="/register" element={<Container><RegisterPage/></Container>} />
          <Route path="/dashboard" element={<RequireAuth><Container><Dashboard/></Container></RequireAuth>} />
          <Route path="/customer" element={<RequireAuth><Container><CustomerDashboard/></Container></RequireAuth>} />
          <Route path="/animals" element={<Container><AnimalsPage/></Container>} />
          <Route path="/animals/:id" element={<Container><AnimalDetail/></Container>} />
          <Route path="/admin" element={<RequireAdmin><AdminDashboard/></RequireAdmin>} />
          <Route path="/admin/animals" element={<RequireAdmin><ErrorBoundary><AdminAnimals/></ErrorBoundary></RequireAdmin>} />
          <Route path="/admin/images" element={<RequireAdmin><ErrorBoundary><AdminImages/></ErrorBoundary></RequireAdmin>} />
          <Route path="/admin/staff" element={<RequireAdmin><AdminStaff/></RequireAdmin>} />
          <Route path="/admin/tickets" element={<RequireAdmin><AdminTickets/></RequireAdmin>} />
          <Route path="/admin/events" element={<RequireAdmin><AdminEvents/></RequireAdmin>} />
          <Route path="/admin/news" element={<RequireAdmin><AdminNews/></RequireAdmin>} />
          <Route path="/admin/feedback" element={<RequireAdmin><AdminFeedback/></RequireAdmin>} />
          <Route path="/admin/audit" element={<RequireAdmin><AdminAudit/></RequireAdmin>} />
          <Route path="/doctor" element={<RequireVet><Container><ErrorBoundary><DoctorDashboard/></ErrorBoundary></Container></RequireVet>} />
          <Route path="/bookings" element={<RequireAuth><Container><BookingPage/></Container></RequireAuth>} />
          <Route path="/tickets" element={<RequireAuth><Container><MyTickets/></Container></RequireAuth>} />
          <Route path="/faq" element={<Container><FaqPage/></Container>} />
          <Route path="/map" element={<Container><MapPage/></Container>} />
          <Route path="/contact" element={<Container><ContactPage/></Container>} />
          <Route path="/program/:slug" element={<Container><ProgramDetail/></Container>} />
        </Routes>
        <Footer />
        <ChatBot />
      </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(<App />)

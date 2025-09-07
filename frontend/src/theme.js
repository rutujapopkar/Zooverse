import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // green
    },
    secondary: {
      main: '#8d6e63', // brownish
    },
    background: {
      default: '#f6fbf6'
    }
  },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 }
  }
})

export default theme

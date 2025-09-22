import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1600
    }
  },
  components: {
    MuiContainer: {
      defaultProps: {
        maxWidth: 'xl'
      },
      styleOverrides: {
        root: {
          // Slightly tighter default horizontal padding; rely on layout-shell for custom spacing
          paddingLeft: '16px',
          paddingRight: '16px'
        }
      }
    }
  },
  palette: {
    primary: {
      main: '#2A4B42', // brand primary
      dark: '#1e322c',
      light: '#3a6054'
    },
    secondary: {
      main: '#77A353', // accent
      dark: '#6a9449',
      light: '#8cb86b'
    },
    success: { main: '#28A745' },
    warning: { main: '#FFC107' },
    error: { main: '#DC3545' },
    info: { main: '#3B4C9B' },
    background: {
      default: '#F4F1EB',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1C1C1C',
      secondary: '#4E534F'
    }
  },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 }
  }
})

export default theme

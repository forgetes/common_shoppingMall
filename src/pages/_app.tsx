import { Fragment, useReducer } from 'react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import '../styles/globals.css'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { MainProvider } from '../context/MainContext'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={darkTheme}>
      <MainProvider>
        <Header />
        <Component {...pageProps} />
        <Footer />
      </MainProvider>
    </ThemeProvider>
  )
}

export default MyApp

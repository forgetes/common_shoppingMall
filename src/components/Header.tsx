import { AppBar, Container, Toolbar, Typography } from "@mui/material";
import Head from "next/head";
import React from "react";
import AdbIcon from '@mui/icons-material/Adb';

const Header = () => {
    return (
        <>
            <Head>
              <title>Market Designers</title>
              <meta name="description" content="Generated by create next app" />
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <header>
              <Container maxWidth="lg">
                <AppBar position="static" color="primary">
                  <Toolbar disableGutters>
                    <AdbIcon sx={{ display: { md: 'flex' }, mr: 1, ml: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                        mr: 2,
                        display: { md: 'flex' },
                        flexGrow: 1,
                        fontWeight: 700,
                        letterSpacing: '.2rem',
                        color: 'inherit',
                        textDecoration: 'none',
                        }}
                    >
                        Market Designers
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Container>      
            </header>
        </>
    )
}

export {Header};
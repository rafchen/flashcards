import Image from "next/image";
import getStripe from "@/utils/get-stripe";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { AppBar, Button, Container, Toolbar, Typography, Box, Grid } from '@mui/material'; // Added Grid import
import Head from 'next/head';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Head>
        <title>Flashcard SaaS</title>
        <meta name="description" content="Create flashcards from your text" />
      </Head>
      <AppBar position="static">
        <Toolbar style={{ justifyContent: "space-between" }}>
          <Typography variant="h6">Flashcard SaaS</Typography>
          <div>
            <SignedOut>
              <Button color="inherit">Login</Button>
              <Button color="inherit">Signup</Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </Toolbar>
      </AppBar>

      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h2">Welcome to Flashcard AI</Typography>
        <Typography variant="h5">
          The easiest way to make flashcards from scratch
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Get Started
        </Button>
      </Box>

      <Box sx={{ my: 6 }}>
      <Typography variant="h4" textAlign={'center'} > {}
          Features
        </Typography>
        <Grid container spacing={4}> {}
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Easy text input</Typography>
            <Typography variant="body1">
              Simply input your text and let our software do the rest. Creating
              flashcards has never been easier.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Easy text input</Typography>
            <Typography variant="body1">
              Simply input your text and let our software do the rest. Creating
              flashcards has never been easier.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Smart Flashcards</Typography>
            <Typography variant="body1">
              Our AI intelligently breaks down your text into concise flashcards, perfect for studying
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box sx ={{my: 6, textAlign: 'center'}}>
      <Typography variant="h4"> 
          Pricing
        </Typography>
        <Grid container spacing={4}> {}
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Easy text input</Typography>
            <Typography variant="body1">
              Simply input your text and let our software do the rest. Creating
              flashcards has never been easier.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Easy text input</Typography>
            <Typography variant="body1">
              Simply input your text and let our software do the rest. Creating
              flashcards has never been easier.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Smart Flashcards</Typography>
            <Typography variant="body1">
              Our AI intelligently breaks down your text into concise flashcards, perfect for studying
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box sx ={{my: 6, textAlign: 'center'}}>
      </Box>
    </Container>
  );
}

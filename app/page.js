'use client'
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import getStripe from "@/utils/get-stripe";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { AppBar, Button, Container, Toolbar, Typography, Box, Grid } from '@mui/material';
import { Router, useRouter } from "next/navigation";
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const handleGetStarted = () => {
    router.push('/generate');
  };

  const handleSubmit = async () => {
    try {
        const checkoutSession = await fetch('/api/checkout_sessions', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const checkoutSessionJson = await checkoutSession.json();

        if (checkoutSession.status === 500) {
            console.error(checkoutSessionJson.message);
            return;
        }

        const stripe = await getStripe();
        const { error } = await stripe.redirectToCheckout({
            sessionId: checkoutSessionJson.id  
        });

        if (error) {
            console.warn(error.message);
        }
    } catch (error) {
        console.error('Error during checkout:', error);
    }
};

  return (
    <Container maxWidth="100vw">
      <Head>
        <title>Flashcard SaaS</title>
        <meta name="description" content="Create flashcards from your text" />
      </Head>
      <AppBar position="static">
        <Toolbar style={{ justifyContent: "space-between" }}>
          <Typography variant="h6">Flashcard SaaS</Typography>
          <div>
            <SignedOut>
              <Button color="inherit" href="/sign-in">Login</Button>
              <Button color="inherit" href="/sign-up">Signup</Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </Toolbar>
      </AppBar>

      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h2" gutterBottom>Welcome to Flashcard AI</Typography>
        <Typography variant="h5" gutterBottom>
          The easiest way to make flashcards from scratch
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleGetStarted}>
          Get Started
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', my: 6 }}>
        <Typography variant="h4" gutterBottom>Features</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Easy Text Input</Typography>
            <Typography variant="body1">
              Simply input your text and let our software do the rest. Creating flashcards has never been easier.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Smart Flashcards</Typography>
            <Typography variant="body1">
              Our AI intelligently breaks down your text into concise flashcards, perfect for studying.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Accessible Anywhere</Typography>
              <Typography variant="body1">
                Access your flashcards from any device, at any time. Study on the go with ease.
              </Typography>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Pricing</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom>Basic</Typography>
              <Typography variant="h6" gutterBottom>$5/month</Typography>
              <Typography variant="body1">
                Access to basic features and limited storage.
              </Typography>
              <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit}>
                Choose Basic
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom>Premium</Typography>
              <Typography variant="h6" gutterBottom>$10/month</Typography>
              <Typography variant="body1">
                Access to all features with unlimited storage and priority support.
              </Typography>
              <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit}>
                Choose Premium
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom>Enterprise</Typography>
              <Typography variant="h6" gutterBottom>Contact Us</Typography>
              <Typography variant="body1">
                Custom solutions for large teams and organizations.
              </Typography>
              <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                Contact Sales
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

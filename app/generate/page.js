'use client';

import { useState, useEffect } from "react";
import { collection, doc, getDoc, writeBatch } from "firebase/firestore";
import { db } from "@/firebase";
import { Box, Container, Paper, TextField, Typography, Button, Grid, CardActionArea, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useUser, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function Generate() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState({});
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!isLoaded || !isSignedIn) {
            return;
        }
    }, [isLoaded, isSignedIn]);

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Flashcards response:", data);

            if (Array.isArray(data.flashcards)) {
                setFlashcards(data.flashcards);
            } else {
                console.error("Unexpected API response format:", data);
            }
        } catch (error) {
            console.error("Error fetching flashcards:", error);
        }
    };

    const handleCardClick = (index) => {
        setFlipped((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const handleOpen = () => setOpen(true);

    const handleClose = () => setOpen(false);

    const saveFlashcards = async () => {
        if (!name.trim()) {
            alert('Please enter a name for your flashcard set.');
            return;
        }
    
        if (!user || !user.id) {
            alert('User not authenticated.');
            return;
        }
    
        try {
            const batch = writeBatch(db);
            const userId = user.id;

            const userDocRef = doc(collection(db, 'users'), userId);
            const userDocSnap = await getDoc(userDocRef);

            const flashcardSets = userDocSnap.exists() ? userDocSnap.data().flashcardSets || [] : [];
            const updatedSets = [...flashcardSets, { name }];

            if (userDocSnap.exists()) {
                batch.update(userDocRef, { flashcardSets: updatedSets });
            } else {
                batch.set(userDocRef, { flashcardSets: updatedSets });
            }

            const setDocRef = doc(collection(db, 'users', userId, 'flashcardSets'), name);
            batch.set(setDocRef, { flashcards });

            await batch.commit();

            alert('Flashcards saved successfully!');
            handleClose();
            setName('');
        } catch (error) {
            console.error('Error saving flashcards:', error);
            alert('An error occurred while saving flashcards. Please try again.');
        }
    };

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    mt: 4,
                    mb: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h4">Generate Flashcards</Typography>
                <Paper sx={{ p: 4, width: '100%' }}>
                    <TextField
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        label="Enter text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <Button
                        variant='contained'
                        color='primary'
                        fullWidth
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </Paper>
            </Box>

            <SignedIn>
                {Array.isArray(flashcards) && flashcards.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant='h5'>Your Flashcards</Typography>
                        <Grid container spacing={3}>
                            {flashcards.map((flashcard, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card>
                                        <CardActionArea onClick={() => handleCardClick(index)}>
                                            <CardContent
                                                sx={{
                                                    height: '200px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        perspective: '1000px',
                                                        width: '100%',
                                                        height: '100%',
                                                        '& > div': {
                                                            transition: 'transform 0.6s',
                                                            transformStyle: 'preserve-3d',
                                                            position: 'relative',
                                                            width: '100%',
                                                            height: '100%',
                                                            boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                                                            transform: flipped[index]
                                                                ? 'rotateY(180deg)'
                                                                : 'rotateY(0deg)',
                                                        },
                                                        '& > div > div': {
                                                            position: 'absolute',
                                                            width: '100%',
                                                            height: '100%',
                                                            backfaceVisibility: 'hidden',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            padding: 2,
                                                            boxSizing: 'border-box',
                                                            overflow: 'auto',
                                                            maxHeight: '100%',
                                                        },
                                                        '& > div > div:nth-of-type(2)': {
                                                            transform: 'rotateY(180deg)',
                                                        },
                                                    }}
                                                >
                                                    <div>
                                                        <div>
                                                            <Typography
                                                                variant="h5"
                                                                component="div"
                                                                sx={{
                                                                    overflow: 'auto',
                                                                    maxHeight: '100%',
                                                                }}
                                                            >
                                                                {flashcard.front}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography
                                                                variant="h5"
                                                                component="div"
                                                                sx={{
                                                                    overflow: 'auto',
                                                                    maxHeight: '100%',
                                                                }}
                                                            >
                                                                {flashcard.back}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </Box>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Button variant='contained' color="secondary" onClick={handleOpen}>
                                Save
                            </Button>
                        </Box>
                    </Box>
                )}
            </SignedIn>
            
            <SignedOut>
                <Typography variant="h6" sx={{ mt: 4 }}>
                    Please sign in to save and view your flashcards.
                </Typography>
                <SignInButton />
            </SignedOut>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Save Flashcard Set</DialogTitle>
                <DialogContent>
                    Please enter a name for your flashcards collection:
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Collection Name"
                        type="text"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={saveFlashcards}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

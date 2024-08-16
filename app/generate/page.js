'use client';
import { useState } from "react";
import { collection, doc, getDoc, writeBatch, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Box, Container, Paper, TextField, Typography, Button, Grid, CardActionArea, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

export default function Generate() {
    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [open, setOpen] = useState(false);

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

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleOpen = () => setOpen(true);

    const handleClose = () => setOpen(false);

    const saveFlashcards = async () => {
        if (!name.trim()) {
            alert('Please enter a name for your flashcard set.');
            return;
        }

        try {
            const batch = writeBatch(db);

            // Replace with a valid user ID
            const userId = "fixedUserId"; // Update this as needed
            const userDocRef = doc(collection(db, 'users'), userId);
            const userDocSnap = await getDoc(userDocRef);

            // Create a reference for the flashcard set
            const flashcardSetRef = doc(collection(userDocRef, 'flashcardSets'), name);

            // Create flashcards as documents within the flashcard set
            flashcards.forEach((flashcard, index) => {
                const flashcardDocRef = doc(collection(flashcardSetRef, 'flashcards'));
                batch.set(flashcardDocRef, {
                    front: flashcard.front,
                    back: flashcard.back
                });
            });

            // Commit the batch
            await batch.commit();

            alert('Flashcards saved successfully!');
            handleClose();
            setName('');
            setFlashcards([]);
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
                                                height: '200px', // Adjust height as needed
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
                                                        overflow: 'auto', // Enable scrolling if needed
                                                        maxHeight: '100%', // Ensure scrolling if content overflows
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
                                                                maxHeight: '100%', // Ensure text area is scrollable
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
                                                                maxHeight: '100%', // Ensure text area is scrollable
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
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Save Flashcard Set</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Set Name"
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

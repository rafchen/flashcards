'use client';

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation"; 
import { useState } from "react";
import { collection, doc, getDoc, writeBatch, db } from "firebase/firestore";
import { Box, Container, Paper, TextField, Typography, Button, Grid } from "@mui/material";

export default function Generate() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [open, setOpen] = useState(false);
    const router = useRouter(); 

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            const data = await response.json();
            setFlashcards(data);
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
            const userDocRef = doc(collection(db, 'users'), user.id);
            const userDocSnap = await getDoc(userDocRef);

            const batch = writeBatch(db);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const updatedSets = [...(userData.flashcardSets || []), { name }];
                batch.update(userDocRef, { flashcardSets: updatedSets });
            } else {
                batch.set(userDocRef, { flashcardSets: [{ name }] });
            }

            const setDocRef = doc(collection(userDocRef, 'flashcardSets'), name);
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
                <Paper sx = {{p: 4, width: '100%'}}>
                    <TextField value ={text}
                    onChange = {(e) => setText(e.target.value)}
                    label = "Enter text"
                    fullWidth
                    multiline
                    rows={4}
                    variant = "outlined"
                    sx={{
                        mb: 2,
                    }}
                    >
                    </TextField>
                    <Button variant = 'contained' color = 'primary'
                    fullWidth
                    onCLick = {handleSubmit}>
                        Submit                  
                    </Button>
                </Paper>
            </Box>

            {flashcards.length > 0 && <Box sx={{mt: 4}}>
                    <Typography variant = 'h5'></Typography>
                    <Grid container spacing = {3}>
                        {flashcards.map((flashcard, index))}
                    </Grid>
                    Flashcards Preview
                     </Box>}
        </Container>
    );
}

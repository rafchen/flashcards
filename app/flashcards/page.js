'use client';

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";
import { Card, CardActionArea, CardContent, Container, Grid, Typography } from "@mui/material";

export default function Flashcards() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [flashcardSets, setFlashcardSets] = useState([]);
    const router = useRouter();

    useEffect(() => {
        async function getFlashcardSets() {
            if (!user) return;
            
            try {
                const docRef = doc(collection(db, 'users'), user.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const sets = docSnap.data().flashcardSets || [];
                    const validatedSets = sets.map((set, index) => ({
                        id: set.id || `set_${index}`, 
                        name: set.name || `Unnamed Set ${index}`, 
                        ...set 
                    }));
                    setFlashcardSets(validatedSets);
                } else {
                    console.log('No flashcard sets found.');
                }
            } catch (error) {
                console.error('Error fetching flashcard sets:', error);
            }
        }
        getFlashcardSets();
    }, [user]);

    if (!isLoaded || !isSignedIn) {
        return <Typography variant="h6" sx={{ textAlign: 'center', width: '100%' }}>Loading...</Typography>;
    }

    const handleCardClick = (setName) => {
        if (setName) {
            const encodedName = encodeURIComponent(setName);
            router.push(`/flashcards/${encodedName}`);
        } else {
            console.error("Flashcard set name is missing.");
        }
    };

    return (
        <Container maxWidth="lg">
            <Grid container spacing={3} sx={{ mt: 4 }}>
                {flashcardSets.length === 0 ? (
                    <Typography variant="h6" sx={{ textAlign: 'center', width: '100%' }}>
                        No flashcard sets found.
                    </Typography>
                ) : (
                    flashcardSets.map((set) => (
                        <Grid item xs={12} sm={6} md={4} key={set.id}>
                            <Card>
                                <CardActionArea onClick={() => handleCardClick(set.name)}>
                                    <CardContent>
                                        <Typography variant='h6'>
                                            {set.name}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Container>
    );
}

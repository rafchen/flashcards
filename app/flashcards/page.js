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
            
            const docRef = doc(collection(db, 'users'), user.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const sets = docSnap.data().flashcardSets || [];
                setFlashcardSets(sets);
            } else {
                console.log('No flashcard sets found.');
            }
        }
        getFlashcardSets();
    }, [user]);

    if (!isLoaded || !isSignedIn) {
        return <></>;
    }

    const handleCardClick = (setId) => {
        router.push(`/flashcards/${setId}`);
    };

    return (
        <Container maxWidth="100vw">
            <Grid container spacing={3} sx={{ mt: 4 }}>
                {flashcardSets.map((set, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                            <CardActionArea onClick={() => handleCardClick(set.id)}>
                                <CardContent>
                                    <Typography variant='h6'>
                                        {set.name}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

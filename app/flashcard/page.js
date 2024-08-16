'use client';

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { useSearchParams } from "next/navigation";
import { Box, Container, Typography, Grid, Card, CardActionArea, CardContent } from "@mui/material";

export default function Flashcard() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState({});

    const searchParams = useSearchParams();
    const search = searchParams.get('id');

    useEffect(() => {
        async function getFlashcards() {
            if (!search || !user) return;

            try {
                const colRef = collection(doc(collection(db, 'users'), user.id), search);
                const docs = await getDocs(colRef);
                const flashcardsArray = [];

                docs.forEach((doc) => {
                    flashcardsArray.push({ id: doc.id, ...doc.data() });
                });

                setFlashcards(flashcardsArray);
            } catch (error) {
                console.error('Error fetching flashcards:', error);
            }
        }

        getFlashcards();
    }, [search, user]);

    if (!isLoaded || !isSignedIn) {
        return <></>;
    }

    const handleCardClick = (index) => {
        setFlipped((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    return (
        <Container maxWidth="lg">
            <Grid container spacing={3} sx={{ mt: 4 }}>
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
                    </Box>
                )}
            </Grid>
        </Container>
    );
}

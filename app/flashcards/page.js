'use client'

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { collection, doc, getDoc, updateDoc, setDoc } from "firebase/firestore"
import { db } from "@/firebase"
import { useRouter } from "next/navigation"
import { Card, Container, CardActionArea, CardContent, Grid, Typography, Button, Box, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import { styled } from '@mui/material/styles';

const CardFooter = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

export default function Flashcards() {
    const { isLoaded, isSignedIn, user } = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [open, setOpen] = useState(false)
    const [selectedFlashcard, setSelectedFlashcard] = useState(null)
    const router = useRouter()

    useEffect(() => {
        async function getFlashcards() {
            if (!user) return
            const docRef = doc(collection(db, 'users'), user.id)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const collections = docSnap.data().flashcards || []
                setFlashcards(collections)
            } else {
                await setDoc(docRef, { flashcards: [] })
            }
        }
        getFlashcards()
    }, [user])

    if (!isLoaded || !isSignedIn) {
        return <></>
    }

    const handleCardClick = (id) => {
        router.push(`/flashcard?id=${id}`)
    }

    const handleRemoveClick = (flashcard) => {
        setSelectedFlashcard(flashcard)
        setOpen(true)
    }

    const handleRemove = async () => {
        if (!user || !selectedFlashcard) return
        const docRef = doc(collection(db, 'users'), user.id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const collections = docSnap.data().flashcards || []
            const updatedCollections = collections.filter(flashcard => flashcard.name !== selectedFlashcard.name)
            await updateDoc(docRef, { flashcards: updatedCollections })
            setFlashcards(updatedCollections)
            setOpen(false)
        }
    }

    const handleClose = () => {
        setOpen(false)
        setSelectedFlashcard(null)
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container spacing={4}>
                {flashcards.map((flashcard, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <CardActionArea onClick={() => handleCardClick(flashcard.name)} sx={{ flexGrow: 1 }}>
                                <CardContent>
                                    <Typography variant="h6" align="center">
                                        {flashcard.name}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                            <CardFooter>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleRemoveClick(flashcard);
                                    }}
                                    size="small"
                                >
                                    Remove
                                </Button>
                            </CardFooter>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => router.push('/generate')}
                >
                    Generate More
                </Button>
            </Box>

            {/* Confirmation Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Are you sure you want to remove this flashcard?"}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleRemove} color="error" autoFocus>
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    )
}

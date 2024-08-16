"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { doc, collection, getDoc, getDocs } from "firebase/firestore";
import { useUser, isLoaded, isSignedIn, ClerkProvider } from "@clerk/nextjs";
import {
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Box,
  Typography,
} from "@mui/material";
import { db } from "@/firebase";

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});

  const searchParams = useSearchParams();
  const search = searchParams.get("id");

  useEffect(() => {
    async function getFlashcard() {
      setLoading(true);
      if (!search || search.trim() === "") {
        console.log("Invalid search parameter", { search });
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.id);
        const flashcardSetRef = doc(userDocRef, "flashcards", search);
        const flashcardsCollectionRef = collection(
          flashcardSetRef,
          "flashcards"
        );

        console.log(`Flashcard set reference: ${flashcardsCollectionRef.path}`);

        const querySnapshot = await getDocs(flashcardsCollectionRef);

        const flashcards = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (flashcards.length === 0) {
          console.log("No flashcards found for this set.");
          // Optionally, you can fetch and log the list of available sets for the user
          const userSetsRef = collection(db, "users", user.id, "flashcardSets");
          const userSets = await getDocs(userSetsRef);
          console.log(
            "Available sets for user:",
            userSets.docs.map((doc) => doc.id)
          );
        }

        setFlashcards(flashcards);
      } catch (error) {
        console.error("Error in getFlashcard:", error.message);
      } finally {
        setLoading(false);
      }
    }

    getFlashcard();
  }, [user, search, isLoaded, isSignedIn]);

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!isLoaded && !isSignedIn) {
    return <></>;
  }

  if (loading) {
    return <Typography>Loading flashcards...</Typography>;
  }

  if (!flashcards || flashcards.length === 0) {
    return <Typography>No flashcards found.</Typography>;
  }

  return (
    <ClerkProvider>
      <Container maxWidth="100vw">
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {flashcards.map((flashcard, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardActionArea onClick={() => handleCardClick(index)}>
                  <CardContent>
                    <Box
                      sx={{
                        perspective: "1000px",
                        "& > div": {
                          transition: "transform 0.6s",
                          transformStyle: "preserve-3d",
                          position: "relative",
                          width: "100%",
                          height: "200px",
                          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
                          transform: flipped[index]
                            ? "rotateY(180deg)"
                            : "rotateY(0deg)",
                        },
                        "& > div > div:nth-of-type(2)": {
                          transform: "rotateY(180deg)",
                        },
                        "& > div > div": {
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: 2,
                          boxSizing: "border-box",
                        },
                      }}
                    >
                      <div>
                        <div>
                          <Typography variant="h5" component="div">
                            {flashcard.front}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="h5" component="div">
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
      </Container>
    </ClerkProvider>
  );
}
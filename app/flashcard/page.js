'use client';

import { useUser, UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { doc, getDocs, collection, addDoc, deleteDoc, writeBatch, getDoc} from 'firebase/firestore';
import { db } from '/firebase';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  AppBar,
  Toolbar,
  CardContent,
  CardActionArea,
  Link,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';

function AddFlashcardForm({ isOpen, onClose, onAdd }) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(front, back);
    setFront('');
    setBack('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Add New Flashcard</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Front"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Back"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            margin="normal"
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ConfirmationDialog({ isOpen, onClose, onConfirm, title, content }) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{content}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [deleteCardConfirm, setDeleteCardConfirm] = useState({ open: false, id: null });
  const [deleteSetConfirm, setDeleteSetConfirm] = useState(false);

  const searchParams = useSearchParams();
  const search = searchParams.get('id');
  const router = useRouter();

  useEffect(() => {
    async function getFlashcard() {
      if (!user || !search) return;

      const docRef = collection(doc(collection(db, 'users'), user.id), search);
      const docs = await getDocs(docRef);
      const flashcards = [];

      docs.forEach((doc) => {
        flashcards.push({ id: doc.id, ...doc.data() });
      });
      setFlashcards(flashcards);
    }
    getFlashcard();
  }, [user, search]);

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddFlashcard = async (front, back) => {
    if (!user || !search) return;

    const docRef = collection(doc(collection(db, 'users'), user.id), search);
    const newFlashcard = await addDoc(docRef, { front, back });
    setFlashcards([...flashcards, { id: newFlashcard.id, front, back }]);
  };

  const handleDeleteFlashcard = async (id) => {
    if (!user || !search) return;

    const docRef = doc(collection(doc(collection(db, 'users'), user.id), search), id);
    await deleteDoc(docRef);
    setFlashcards(flashcards.filter((flashcard) => flashcard.id !== id));
    setDeleteCardConfirm({ open: false, id: null });
  };

function deleteFlashcardSet(flashcards, setToDelete) {
  const setIndex = flashcards.findIndex(set => set.name === setToDelete);
  if (setIndex !== -1) {
    flashcards.splice(setIndex, 1);
  }
  return flashcards;
}

const handleDeleteSet = async () => {
  if (!user || !search) return;

  try {
    const batch = writeBatch(db);

    // Reference to the user document
    const userDocRef = doc(db, 'users', user.id);

    // Fetch the current user document
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      console.error("User document not found");
      return;
    }

    const userData = userDoc.data();
    let flashcards = userData.flashcards || [];

    // Remove the current set from the flashcards array
    flashcards = deleteFlashcardSet(flashcards, search);

    // Update the user document with the new flashcards array
    batch.update(userDocRef, { flashcards });

    // Delete all flashcards in the set
    const flashcardsRef = collection(userDocRef, search);
    const flashcardDocs = await getDocs(flashcardsRef);
    flashcardDocs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Commit the batch
    await batch.commit();

    console.log("Flashcard set deleted successfully");
    setDeleteSetConfirm(false);
    router.push('/flashcards');
  } catch (error) {
    console.error("Error deleting flashcard set:", error);
    // Handle the error (e.g., show an error message to the user)
  }
};

  const filteredFlashcards = flashcards.filter(
    (flashcard) =>
      flashcard.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flashcard.back.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded || !isSignedIn) {
    return <></>;
  }

  return (
    <Container maxWidth="100vw">
      <AppBar position="static">
        <Toolbar>
          <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
            <Typography component="span">Flashcard SaaS</Typography>
          </Link>
          <Button variant="contained" sx={{mr:2}} href="https://forms.gle/BaPiXZKKKfa5Dk2X7">Feedback</Button>
          <Button variant="contained" sx={{ mr: 2 }} href="/generate">
            Generate
          </Button>
          <Button variant="contained" sx={{ mr: 2 }} href="/flashcards">
            Flashcards
          </Button>
          <UserButton />
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 4, mb: 4 }}>
        <TextField
          fullWidth
          label="Search Flashcards"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={() => setIsAddFormOpen(true)}>
          Add Flashcard
        </Button>
        <Button variant="contained" color="secondary" onClick={() => setDeleteSetConfirm(true)}>
          Delete Set
        </Button>
      </Box>
      <Grid container spacing={3}>
        {filteredFlashcards.map((flashcard, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardActionArea onClick={() => handleCardClick(flashcard.id)}>
              <CardContent>
                  <Box
                    sx={{
                      perspective: '1000px',
                      '& > div': {
                        transition: 'transform 0.6s',
                        transformStyle: 'preserve-3d',
                        position: 'relative',
                        width: '100%',
                        height: '208px',
                        boxShadow: '0 4px 8px 8 rgba(0,0,0, 0.2)',
                        transform: flipped[flashcard.id]
                          ? 'rotateY(180deg)'
                          : 'rotateY(0deg)',
                      },
                      '& > div > div:nth-of-type(2)': {
                        transform: 'rotateY(180deg)',
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
                      },
                    }}
                  >
                    <div>
                      <div>
                        <Typography variant="h5" component="div" sx={{ textAlign: 'center' }}>
                          {flashcard.front}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="h5" component="div" sx={{ textAlign: 'center' }}>
                          {flashcard.back}
                        </Typography>
                      </div>
                    </div>
                  </Box>
                </CardContent>
              </CardActionArea>
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteCardConfirm({ open: true, id: flashcard.id })}
                color="error"
              >
                Delete
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
      <AddFlashcardForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onAdd={handleAddFlashcard}
      />
      <ConfirmationDialog
        isOpen={deleteCardConfirm.open}
        onClose={() => setDeleteCardConfirm({ open: false, id: null })}
        onConfirm={() => handleDeleteFlashcard(deleteCardConfirm.id)}
        title="Delete Flashcard"
        content="Are you sure you want to delete this flashcard?"
      />
      <ConfirmationDialog
        isOpen={deleteSetConfirm}
        onClose={() => setDeleteSetConfirm(false)}
        onConfirm={handleDeleteSet}
        title="Delete Flashcard Set"
        content="Are you sure you want to delete this entire flashcard set? This action cannot be undone."
      />
    </Container>
  );
}
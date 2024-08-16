'use client'

import { useUser } from "@clerk/nextjs"

export default function Generate() {
    const {isLoaded, isSignedIn, user} = useUser
    const [flashcards, setFlashcards = useState([])
    const [flipped, setFlipped] = useState([])

}
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Cloud Functions
const functions = getFunctions(app);

// Initialize Firebase Auth
const auth = getAuth(app);

export { app, db, functions, auth };

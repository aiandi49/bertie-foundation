import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

const ADMIN_EMAILS = ['msleespark@gmail.com', 'ai.agent.lamar@gmail.com'];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = user ? ADMIN_EMAILS.includes(user.email || '') : false;

  return { user, isAdmin, loading };
}

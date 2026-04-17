import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { ModeratorDashboard } from '../components/ModeratorDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/Tabs';
import { Mail, Users, MessageSquare, Award, Star, Shield, ClipboardList } from 'lucide-react';
import { Button } from '../components/Button';
import { auth } from '../utils/firebase';
import { useAuth } from '../utils/useAuth';
import { signInWithEmailAndPassword } from 'firebase/auth';

function AdminDashboard() {
  const [activeView, setActiveView] = useState<'forms' | 'moderation'>('moderation');

  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-8 pb-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Admin Dashboard
          </h1>
          <Button onClick={handleLogout} variant="secondary">
            Logout
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 ${
              activeView === 'moderation' ? 'bg-primary-600 text-white' : 'bg-secondary-800/50 text-gray-300 hover:text-white'
            }`}
            onClick={() => setActiveView('moderation')}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Content Moderation</span>
            </div>
          </div>
          <div
            className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 ${
              activeView === 'forms' ? 'bg-primary-600 text-white' : 'bg-secondary-800/50 text-gray-300 hover:text-white'
            }`}
            onClick={() => setActiveView('forms')}
          >
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              <span>Form Submissions</span>
            </div>
          </div>
        </div>

        {activeView === 'moderation' ? (
          <ModeratorDashboard />
        ) : (
          <div>
            <div className="my-8 border-t border-gray-700"></div>
            <Tabs defaultValue="newsletter" className="w-full">
              <TabsList className="flex overflow-x-auto mb-4 sm:mb-6 md:mb-8 py-2 px-1 md:p-2 bg-secondary-900/80 shadow-lg rounded-xl border border-secondary-800 scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-secondary-800 no-scrollbar">
                <TabsTrigger value="newsletter" className="flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm whitespace-nowrap px-1.5 sm:px-3 min-w-fit flex-shrink-0">
                  <Mail className="w-5 h-5" />
                  <span>Newsletter</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>
    </Layout>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError('Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-white">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" fullWidth>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (user && isAdmin) {
    return <AdminDashboard />;
  }

  return <Login />;
}

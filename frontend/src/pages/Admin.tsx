import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { ModeratorDashboard } from '../components/ModeratorDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/Tabs';
import { Mail, Users, MessageSquare, Award, Star, Shield, ClipboardList } from 'lucide-react';
import { Button } from '../components/Button';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../utils/useAuth';

function AdminDashboard() {
  const [activeView, setActiveView] = useState<'forms' | 'moderation'>('moderation');

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Bertie Foundation</h1>
          <p className="text-gray-400 mt-2">Admin Access</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
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
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
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

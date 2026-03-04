import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { API_URL } from '../api'; 

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // const response = await fetch('http://localhost:8000/api/auth/login', {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // const response = await fetch('http://localhost:8000/api/auth/register', {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      if (!response.ok) {
        const text = await response.text();
        let message = 'Registration failed';
        try {
          const parsed = JSON.parse(text);
          message = parsed.detail || message;
        } catch {
          // keep default
        }
        throw new Error(message);
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">MI</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Meeting Intelligence</CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Sign in to access your dashboard' : 'Create your account to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {loading ? (mode === 'login' ? 'Signing In...' : 'Creating Account...') : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </Button>
            <div className="text-center text-sm text-gray-600">
              {mode === 'login' ? (
                <span>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                    className="text-indigo-600 hover:underline"
                  >
                    Register
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="text-indigo-600 hover:underline"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

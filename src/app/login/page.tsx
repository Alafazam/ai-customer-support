'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { SupportAgentIcon } from '@/components/icons';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Check for correct role first
      if (data.user.role !== 'CUSTOMER') {
        throw new Error('Access denied. Please use the support login page.');
      }

      // Only set auth data if role is correct
      Cookies.set('auth_token', data.token, { expires: 7 }); // 7 days expiry
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/chat';
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Clear any potentially set auth data
      Cookies.remove('auth_token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const handleSupportLogin = () => {
    window.location.href = '/support-login';
  };

  return (
    <div className="h-[100dvh] grid place-items-center bg-background">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="flex flex-col items-center">
            <Image
              src="/bot-avatar.png"
              alt="Omni Sahayak"
              width={80}
              height={80}
              className="rounded-full"
              priority
            />
            <h1 className="text-2xl font-bold mt-3"> Welcome To Omni Sahayak</h1>
          </div>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="h-11"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="space-y-4 flex flex-col items-center">
              <Button
                type="submit"
                className="w-40 h-11 text-base font-semibold bg-black hover:bg-black/90 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-base"
                onClick={handleSupportLogin}
                disabled={loading}
              >
                <SupportAgentIcon className="mr-2 h-5 w-5" />
                Login as Support Agent
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
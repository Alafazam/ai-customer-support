'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from 'lucide-react';
import { SupportAgentIcon } from '@/components/icons';
import Cookies from 'js-cookie';

export default function SupportLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user.role !== 'SUPPORT_AGENT') {
        throw new Error('Access denied. Please use the customer login page.');
      }

      // Set auth data if role is correct
      Cookies.set('auth_token', data.token, { expires: 7 });
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/dashboard';
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      // Clear any potentially set auth data
      Cookies.remove('auth_token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-[400px]">
        <CardHeader className="space-y-2">
          <div className="text-center flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold">Welcome Sahayak</h1>
            <SupportAgentIcon className="w-8 h-8" />
          </div>
          <CardDescription>Sign in to access the support dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-white bg-destructive rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-4 pt-4">
            <Button
              type="submit"
              className="w-40"
              disabled={isLoading}
            >
              {isLoading ? (
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
              onClick={() => window.location.href = '/login'}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Customer Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 
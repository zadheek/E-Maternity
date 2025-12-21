'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

export default function ProviderLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid credentials');
        setIsLoading(false);
        return;
      }

      // Fetch user role to redirect appropriately
      const response = await fetch('/api/auth/session');
      const session = await response.json();

      if (session?.user?.role === 'MOTHER') {
        toast.error('Please use the regular login page');
        setIsLoading(false);
        return;
      }

      toast.success('Login successful');

      // Redirect based on role
      switch (session?.user?.role) {
        case 'DOCTOR':
          router.push('/dashboard/doctor');
          break;
        case 'MIDWIFE':
          router.push('/dashboard/midwife');
          break;
        case 'ADMIN':
          router.push('/dashboard/admin');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2196F3]/10 via-[#00BCD4]/10 to-[#0288D1]/10 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[#2196F3] flex items-center justify-center">
              <Icons.Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#212121]">Healthcare Provider Login</h1>
          <p className="text-[#757575] mt-2">Access your professional dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Icons.MapPin className="absolute left-3 top-3 w-4 h-4 text-[#757575]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@ematernity.lk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Icons.Activity className="absolute left-3 top-3 w-4 h-4 text-[#757575]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-[#2196F3] hover:bg-[#1976D2]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icons.Activity className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              <div className="text-center text-sm text-[#757575]">
                <p>
                  Are you an expectant mother?{' '}
                  <Link href="/login" className="text-[#2196F3] hover:underline font-medium">
                    Login here
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}


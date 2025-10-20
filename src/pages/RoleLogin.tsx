
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Eye, EyeOff, LogIn, Shield, Mail, Phone } from 'lucide-react';

type LoginMethod = 'email' | 'phone';

const RoleLogin = () => {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();


  // Redirect if user is already signed in
  useEffect(() => {
    if (user) {
      // Redirect based on user role
      if (user.role === 'user') {
        navigate('/', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Phone formatting functions (same as AuthModal)
  const formatPhoneNumber = (value: string) => {
    let digits = value.replace(/\D/g, '');
    if (!digits.startsWith('961')) {
      if (digits.length > 0) {
        digits = '961' + digits;
      }
    }
    digits = digits.slice(0, 11);
    return digits;
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setIdentifier(formatted);
  };

  const displayPhone = (phone: string) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('961') && digits.length >= 4) {
      const prefix = '+961';
      const rest = digits.slice(3);
      if (rest.length <= 2) return `${prefix} ${rest}`;
      if (rest.length <= 5) return `${prefix} ${rest.slice(0, 2)} ${rest.slice(2)}`;
      return `${prefix} ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`;
    }
    return digits ? `+${digits}` : '';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.startsWith('961') && digits.length === 11;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate based on login method
    if (loginMethod === 'email' && !validateEmail(identifier)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (loginMethod === 'phone' && !validatePhone(identifier)) {
      toast.error('Please enter a valid Lebanese phone number');
      return;
    }

    // Format identifier for login
    const loginIdentifier = loginMethod === 'phone' ? `+${identifier}` : identifier;
    const success = await login(loginIdentifier, password);

    if (success) {
      toast.success('Login successful!');
      // Navigation will be handled automatically by the useEffect hook
      // when the user state updates after login
    } else {
      toast.error('Invalid credentials. Please check your credentials and try again.');
    }
  };

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render the login form if user is already authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Role-Based Access
          </CardTitle>
          <CardDescription className="text-center">
            Sign in with your credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login Method Tabs */}
            <div className="space-y-2">
              <Label className="text-sm">Sign in with</Label>
              <Tabs
                value={loginMethod}
                onValueChange={(v) => {
                  setLoginMethod(v as LoginMethod);
                  setIdentifier('');
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 h-10">
                  <TabsTrigger value="email" className="text-sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="text-sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="mt-4 space-y-2">
                  <Label htmlFor="email" className="text-sm">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="mt-4 space-y-2">
                  <Label htmlFor="phone" className="text-sm">Lebanese Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="70 123 456"
                      value={displayPhone(identifier)}
                      onChange={handlePhoneInput}
                      className="pl-10 h-11 font-mono"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">Format: +961 XX XXX XXX</p>
                </TabsContent>
              </Tabs>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Dashboard Access:</strong><br />
              For admins, managers, and sellers<br />
              Contact admin for account credentials
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleLogin;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { Eye, EyeOff, Mail, Lock, Phone, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type SignInMethod = 'email' | 'phone';

const LEBANON_CODE = '+961';

const SignIn = () => {
  const [signInMethod, setSignInMethod] = useState<SignInMethod>('phone');
  const [identifier, setIdentifier] = useState(''); // Email or phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const { signin, isLoading, requestPasswordReset } = useAuth();
  const navigate = useNavigate();

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

    if (signInMethod === 'email' && !validateEmail(identifier)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (signInMethod === 'phone' && !validatePhone(identifier)) {
      toast.error('Please enter a valid Lebanese phone number');
      return;
    }

    const email = signInMethod === 'email' ? identifier : '';
    const phone = signInMethod === 'phone' ? `+${identifier}` : '';

    const result = await signin(email, phone, password);

    if (result.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(result.message || 'Sign in failed');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetIdentifier) {
      toast.error('Please enter your email or phone number');
      return;
    }

    const isEmail = resetIdentifier.includes('@');

    if (isEmail && !validateEmail(resetIdentifier)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!isEmail && !validatePhone(resetIdentifier)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    const result = await requestPasswordReset(
      isEmail ? resetIdentifier : '',
      isEmail ? '' : `+${resetIdentifier}`
    );

    if (result.success) {
      toast.success('Password reset instructions sent!');
      setShowForgotPassword(false);
      setResetIdentifier('');
    } else {
      toast.error(result.message || 'Password reset failed');
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            </div>
            <CardDescription>
              Enter your email or phone number to receive reset instructions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetIdentifier">Email or Phone Number</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="resetIdentifier"
                    type="text"
                    placeholder="Email or phone"
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email/Phone Tabs */}
            <div className="space-y-2">
              <Label>Sign in with</Label>
              <Tabs value={signInMethod} onValueChange={(v) => {
                setSignInMethod(v as SignInMethod);
                setIdentifier('');
              }} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="phone">Phone</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>
                <TabsContent value="phone" className="mt-3 space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="70 123 456"
                      value={displayPhone(identifier)}
                      onChange={handlePhoneInput}
                      className="pl-10 font-mono"
                      required
                    />
                  </div>
                </TabsContent>
                <TabsContent value="email" className="mt-3 space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-cyan-600 hover:text-cyan-500"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-cyan-600 hover:text-cyan-500 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Mail, Lock, Phone, ArrowLeft, X, User, Calendar, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'signin' | 'signup';
}

type AuthMode = 'signin' | 'signup' | 'forgot-email' | 'forgot-otp' | 'forgot-reset';
type LoginMethod = 'email' | 'phone';

export function AuthModal({ open, onOpenChange, defaultMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [waitingPeriod, setWaitingPeriod] = useState<number | null>(null);
  const { login, register, forgotPassword, verifyOtp, resetPassword, isLoading } = useAuth();

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

    if (mode === 'signin') {
      if (!identifier || !password) {
        toast.error('Please fill in all fields');
        return;
      }

      if (loginMethod === 'email' && !validateEmail(identifier)) {
        toast.error('Please enter a valid email address');
        return;
      }

      if (loginMethod === 'phone' && !validatePhone(identifier)) {
        toast.error('Please enter a valid Lebanese phone number');
        return;
      }

      const loginIdentifier = loginMethod === 'phone' ? `+${identifier}` : identifier;
      const success = await login(loginIdentifier, password);

      if (success) {
        toast.success('Welcome back!');
        onOpenChange(false);
        resetForm();
      } else {
        toast.error('Invalid credentials');
      }
      return;
    }

    if (mode === 'signup') {
      if (!firstName || !lastName || !identifier || !password) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (loginMethod === 'email' && !validateEmail(identifier)) {
        toast.error('Please enter a valid email address');
        return;
      }

      if (loginMethod === 'phone' && !validatePhone(identifier)) {
        toast.error('Please enter a valid Lebanese phone number (8 digits)');
        return;
      }

      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }

      const email = loginMethod === 'email' ? identifier : '';
      const phone = loginMethod === 'phone' ? `+${identifier}` : '';

      const result = await register(
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword,
        gender || '',
        dateOfBirth || undefined
      );

      if (result.success) {
        toast.success('Account created successfully! You are now signed in!');
        onOpenChange(false);
        resetForm();
      } else {
        toast.error(result.message || 'Registration failed');
      }
      return;
    }

    if (mode === 'forgot-email') {
      if (!identifier) {
        toast.error('Please enter your email address');
        return;
      }

      if (!validateEmail(identifier)) {
        toast.error('Please enter a valid email address');
        return;
      }

      const result = await forgotPassword(identifier);

      if (result.success) {
        toast.success(result.message);
        setMode('forgot-otp');
      } else {
        toast.error(result.message);
        if (result.waitingPeriod) {
          setWaitingPeriod(result.waitingPeriod);
        }
      }
      return;
    }

    if (mode === 'forgot-otp') {
      if (!otp || otp.length !== 6) {
        toast.error('Please enter the 6-digit OTP');
        return;
      }

      const result = await verifyOtp(identifier, parseInt(otp));

      if (result.success) {
        toast.success(result.message);
        setMode('forgot-reset');
      } else {
        toast.error(result.message);
      }
      return;
    }

    if (mode === 'forgot-reset') {
      if (!password || !confirmPassword) {
        toast.error('Please fill in all fields');
        return;
      }

      if (password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }

      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const result = await resetPassword(identifier, password, confirmPassword);

      if (result.success) {
        toast.success('Password reset successfully!');
        setMode('signin');
        resetForm();
      } else {
        toast.error(result.message);
      }
      return;
    }
  };

  const resetForm = () => {
    setIdentifier('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setGender('');
    setDateOfBirth('');
    setOtp('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setWaitingPeriod(null);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    if (newMode === 'signin' || newMode === 'signup') {
      resetForm();
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgot-email': return 'Reset Password';
      case 'forgot-otp': return 'Verify Code';
      case 'forgot-reset': return 'New Password';
      default: return 'Welcome';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signin': return 'Sign in to continue shopping';
      case 'signup': return 'Join us to start shopping';
      case 'forgot-email': return 'Enter your email to receive a code';
      case 'forgot-otp': return `Code sent to ${identifier}`;
      case 'forgot-reset': return 'Create a new password';
      default: return '';
    }
  };

  const renderForgotPasswordFlows = () => {
    if (mode === 'forgot-email') {
      return (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email" className="text-sm">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="forgot-email"
                type="email"
                placeholder="your@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>

          {waitingPeriod && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              Wait {waitingPeriod}s before requesting again
            </p>
          )}

          <Button type="submit" className="w-full h-11 bg-cyan-600 hover:bg-cyan-700" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Code'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full h-10 text-sm"
            onClick={() => switchMode('signin')}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Sign In
          </Button>
        </form>
      );
    }

    if (mode === 'forgot-otp') {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm">Verification Code</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                className="gap-1.5"
              >
                <InputOTPGroup className="gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-10 h-11 text-base font-semibold border-2 rounded focus:border-cyan-500"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 bg-cyan-600 hover:bg-cyan-700" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full h-10 text-sm"
            onClick={() => setMode('forgot-email')}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back
          </Button>
        </form>
      );
    }

    if (mode === 'forgot-reset') {
      return (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-sm">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-11"
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

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 bg-cyan-600 hover:bg-cyan-700" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      );
    }

    return null;
  };

  const renderMainForm = () => {
    const forgotFlow = renderForgotPasswordFlows();
    if (forgotFlow) return forgotFlow;

    // Signup Form
    if (mode === 'signup') {
      return (
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Name Fields - Compact Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="firstName" className="text-xs">First Name <span className="text-red-500">*</span></Label>
              <div className="relative">
                <User className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-7 h-8 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="lastName" className="text-xs">Last Name <span className="text-red-500">*</span></Label>
              <div className="relative">
                <User className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-7 h-8 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Gender and Birth Date - Optional & Compact */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="gender" className="text-[10px] text-gray-600">Gender (Optional)</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender" className="h-8 text-xs">
                  <div className="flex items-center gap-1">
                    <UserCircle2 className="w-3 h-3 text-gray-400" />
                    <SelectValue placeholder="Select" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="dateOfBirth" className="text-[10px] text-gray-600">Birth Date (Optional)</Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="pl-7 h-8 text-xs"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          {/* Email/Phone Tabs */}
          <div className="space-y-1">
            <Label className="text-xs">Sign up with <span className="text-red-500">*</span></Label>
            <Tabs value={loginMethod} onValueChange={(v) => {
              setLoginMethod(v as LoginMethod);
              setIdentifier('');
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-7">
                <TabsTrigger value="phone" className="text-xs">Phone</TabsTrigger>
                <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
              </TabsList>
              <TabsContent value="phone" className="mt-1.5 space-y-1">
                <Label htmlFor="phone" className="text-xs">Lebanese Mobile <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="70 123 456"
                    value={displayPhone(identifier)}
                    onChange={handlePhoneInput}
                    className="pl-7 h-8 font-mono text-xs"
                    required
                  />
                </div>
              </TabsContent>
              <TabsContent value="email" className="mt-1.5 space-y-1">
                <Label htmlFor="email" className="text-xs">Email <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-7 h-8 text-xs"
                    required
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Password Fields */}
          <div className="space-y-1.5">
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs">Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-7 pr-8 h-8 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs">Confirm <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-7 pr-8 h-8 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-8 bg-cyan-600 hover:bg-cyan-700 font-medium text-xs"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Account'}
          </Button>

          <div className="text-center pt-1">
            <p className="text-xs text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-cyan-600 hover:text-cyan-500 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      );
    }

    // Signin Form
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Login Method Tabs - Only for signin */}
        <div className="space-y-1.5">
          <Label className="text-sm">Sign in with</Label>
          <Tabs value={loginMethod} onValueChange={(v) => {
            setLoginMethod(v as LoginMethod);
            setIdentifier('');
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="phone" className="text-sm">Phone</TabsTrigger>
              <TabsTrigger value="email" className="text-sm">Email</TabsTrigger>
            </TabsList>
            <TabsContent value="phone" className="mt-3 space-y-1.5">
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
            <TabsContent value="email" className="mt-3 space-y-1.5">
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
          </Tabs>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-11"
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

        <div className="text-right">
          <button
            type="button"
            onClick={() => switchMode('forgot-email')}
            className="text-xs text-cyan-600 hover:text-cyan-500 font-medium"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 font-medium"
          disabled={isLoading}
        >
          {isLoading ? 'Please wait...' : 'Sign In'}
        </Button>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="text-cyan-600 hover:text-cyan-500 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] max-h-[90vh] overflow-y-auto p-0 gap-0 sm:rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        {/* Compact header */}
        <div className="sticky top-0 z-10 bg-white border-b px-5 py-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{getTitle()}</h2>
            <p className="text-xs text-gray-500">{getDescription()}</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {renderMainForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

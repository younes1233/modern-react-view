
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'signin' | 'signup';
}

type AuthMode = 'signin' | 'signup' | 'forgot-email' | 'forgot-otp' | 'forgot-reset';

export function AuthModal({ open, onOpenChange, defaultMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [waitingPeriod, setWaitingPeriod] = useState<number | null>(null);
  const { login, register, forgotPassword, verifyOtp, resetPassword, isLoading } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signin') {
      if (!email || !password) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!validateEmail(email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      const success = await login(email, password);
      
      if (success) {
        toast.success('Welcome back!');
        onOpenChange(false);
        resetForm();
      } else {
        toast.error('Invalid credentials. Please check your email and password.');
      }
      return;
    }

    if (mode === 'signup') {
      if (!firstName || !lastName || !email || !password) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!validateEmail(email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      if (phone && !validatePhone(phone)) {
        toast.error('Please enter a valid phone number');
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

      if (dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        if (birthDate >= today) {
          toast.error('Date of birth must be before today');
          return;
        }
      }
      
      const result = await register(
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword,
        gender,
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
      if (!email) {
        toast.error('Please enter your email address');
        return;
      }

      if (!validateEmail(email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      const result = await forgotPassword(email);
      
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

      const result = await verifyOtp(email, parseInt(otp));
      
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

      const result = await resetPassword(email, password, confirmPassword);
      
      if (result.success) {
        toast.success('Password reset successfully! You can now sign in with your new password.');
        setMode('signin');
        resetForm();
      } else {
        toast.error(result.message);
      }
      return;
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setGender('');
    setDateOfBirth('');
    setOtp('');
    setShowPassword(false);
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
      case 'forgot-email': return 'Forgot Password';
      case 'forgot-otp': return 'Verify OTP';
      case 'forgot-reset': return 'Reset Password';
      default: return 'Welcome';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signin': return 'Sign in to your account to continue';
      case 'signup': return 'Create a new account to get started';
      case 'forgot-email': return 'Enter your email to receive a verification code';
      case 'forgot-otp': return 'Enter the verification code sent to your email';
      case 'forgot-reset': return 'Create a new password for your account';
      default: return '';
    }
  };

  const renderForgotEmailForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="forgot-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      
      {waitingPeriod && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please wait {waitingPeriod} seconds before requesting a new OTP.
          </p>
        </div>
      )}
      
      <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700" disabled={isLoading} size="lg">
        {isLoading ? 'Sending...' : 'Send OTP'}
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => switchMode('signin')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Sign In
      </Button>
    </form>
  );

  const renderForgotOtpForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Enter 6-digit OTP</Label>
        <p className="text-sm text-gray-600">
          We've sent a verification code to {email}
        </p>
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => setOtp(value)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      
      <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700" disabled={isLoading} size="lg">
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setMode('forgot-email')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Email
      </Button>
    </form>
  );

  const renderForgotResetForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-password">New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirm-new-password">Confirm New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="confirm-new-password"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700" disabled={isLoading} size="lg">
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );

  const renderMainForm = () => {
    if (mode === 'forgot-email') return renderForgotEmailForm();
    if (mode === 'forgot-otp') return renderForgotOtpForm();
    if (mode === 'forgot-reset') return renderForgotResetForm();

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+96170123456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
        </div>
        
        {mode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
        )}

        {mode === 'signin' && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => switchMode('forgot-email')}
              className="text-sm text-cyan-600 hover:text-cyan-500"
            >
              Forgot your password?
            </button>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full bg-cyan-600 hover:bg-cyan-700" 
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">
              {getTitle()}
            </CardTitle>
            <p className="text-gray-600">
              {getDescription()}
            </p>
          </CardHeader>
          
          <CardContent>
            {renderMainForm()}
            
            {(mode === 'signin' || mode === 'signup') && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                  {' '}
                  <button
                    type="button"
                    onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                    className="text-cyan-600 hover:text-cyan-500 font-medium"
                  >
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

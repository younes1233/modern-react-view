import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { Eye, EyeOff, User, Mail, Lock, Phone, Calendar, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type RegisterMethod = 'email' | 'phone';

const LEBANON_CODE = '+961';

const Register = () => {
  const [registerMethod, setRegisterMethod] = useState<RegisterMethod>('phone');
  const [identifier, setIdentifier] = useState(''); // Email or phone
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState(''); // Optional
  const [dateOfBirth, setDateOfBirth] = useState(''); // Optional
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuth();
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

    if (!firstName || !lastName || !identifier || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (registerMethod === 'email' && !validateEmail(identifier)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (registerMethod === 'phone' && !validatePhone(identifier)) {
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

    const email = registerMethod === 'email' ? identifier : '';
    const phone = registerMethod === 'phone' ? `+${identifier}` : '';

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
      navigate('/');
    } else {
      toast.error(result.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 p-3 py-4">
      <Card className="w-full max-w-2xl my-2">
        <CardHeader className="space-y-0.5 pb-3 pt-4">
          <CardTitle className="text-xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center text-xs">
            Join us to start shopping amazing products
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name Fields - Compact Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-xs">First Name <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-8 h-9 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-xs">Last Name <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-8 h-9 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Gender and Birth Date - Optional & Compact */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="gender" className="text-xs text-gray-600">Gender <span className="text-[10px]">(Optional)</span></Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender" className="h-9">
                    <div className="flex items-center gap-1.5">
                      <UserCircle2 className="w-3.5 h-3.5 text-gray-400" />
                      <SelectValue placeholder="Select" className="text-sm" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="dateOfBirth" className="text-xs text-gray-600">Birth Date <span className="text-[10px]">(Optional)</span></Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="pl-8 h-9 text-sm"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            {/* Email/Phone Tabs */}
            <div className="space-y-1.5">
              <Label className="text-xs">Sign up with <span className="text-red-500">*</span></Label>
              <Tabs value={registerMethod} onValueChange={(v) => {
                setRegisterMethod(v as RegisterMethod);
                setIdentifier('');
              }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="phone" className="text-xs">Phone</TabsTrigger>
                  <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
                </TabsList>
                <TabsContent value="phone" className="mt-2 space-y-1">
                  <Label htmlFor="phone" className="text-xs">Lebanese Mobile Number <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="70 123 456"
                      value={displayPhone(identifier)}
                      onChange={handlePhoneInput}
                      className="pl-8 h-9 font-mono text-sm"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-500">Format: +961 XX XXX XXX</p>
                </TabsContent>
                <TabsContent value="email" className="mt-2 space-y-1">
                  <Label htmlFor="email" className="text-xs">Email Address <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="pl-8 h-9 text-sm"
                      required
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Password Fields */}
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs">Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-8 pr-9 h-9 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs">Confirm Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-8 pr-9 h-9 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-9 bg-cyan-600 hover:bg-cyan-700 font-medium text-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="text-center pt-1">
              <p className="text-xs text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="text-cyan-600 hover:text-cyan-500 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;

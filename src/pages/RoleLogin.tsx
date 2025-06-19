
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleAuth } from '@/contexts/RoleAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RoleLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useRoleAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      toast({
        title: 'Success',
        description: 'Login successful!',
      });
      navigate('/');
    } else {
      toast({
        title: 'Error',
        description: 'Invalid credentials. Check demo accounts below.',
        variant: 'destructive',
      });
    }
  };

  const demoAccounts = [
    { role: 'Super Admin', email: 'admin@example.com', description: 'Full access to all features' },
    { role: 'Manager', email: 'manager@example.com', description: 'Orders, products, categories' },
    { role: 'Seller', email: 'seller1@example.com', description: 'Add products for approval' },
    { role: 'Customer', email: 'customer@example.com', description: 'Store access only' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Role-Based Access
          </CardTitle>
          <CardDescription className="text-center">
            Sign in with your role-specific credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="demo">Demo Accounts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                <Button type="submit" className="w-full" disabled={isLoading}>
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
            </TabsContent>
            
            <TabsContent value="demo" className="space-y-3">
              <p className="text-sm text-muted-foreground text-center mb-4">
                All accounts use password: <strong>password</strong>
              </p>
              {demoAccounts.map((account, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{account.role}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEmail(account.email)}
                      className="text-xs"
                    >
                      Use
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{account.email}</p>
                  <p className="text-xs text-muted-foreground">{account.description}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleLogin;

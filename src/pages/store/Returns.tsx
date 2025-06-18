
import { useState } from 'react';
import { StoreLayout } from '@/components/store/StoreLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PackageOpen, Search, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

const Returns = () => {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [description, setDescription] = useState('');
  const [searchOrder, setSearchOrder] = useState('');
  const [returns, setReturns] = useState([
    {
      id: 1,
      orderNumber: 'ORD-2024-001',
      productName: 'Wireless Headphones',
      returnDate: '2024-03-15',
      status: 'pending',
      reason: 'defective',
      amount: 129.99
    },
    {
      id: 2,
      orderNumber: 'ORD-2024-002',
      productName: 'Smart Watch',
      returnDate: '2024-03-10',
      status: 'approved',
      reason: 'wrong_item',
      amount: 299.99
    },
    {
      id: 3,
      orderNumber: 'ORD-2024-003',
      productName: 'Bluetooth Speaker',
      returnDate: '2024-03-08',
      status: 'completed',
      reason: 'not_satisfied',
      amount: 79.99
    }
  ]);

  if (!user) {
    return (
      <StoreLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                <PackageOpen className="w-16 h-16 mx-auto mb-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
                <p className="text-gray-600 mb-6">Please sign in to view and manage your returns.</p>
                <Button 
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-3 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
          <AuthModal 
            open={authModalOpen} 
            onOpenChange={setAuthModalOpen} 
            defaultMode="signin"
          />
        </div>
      </StoreLayout>
    );
  }

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const newReturn = {
      id: returns.length + 1,
      orderNumber,
      productName: 'Product Name',
      returnDate: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
      reason: returnReason,
      amount: 0
    };
    setReturns([newReturn, ...returns]);
    setOrderNumber('');
    setReturnReason('');
    setDescription('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredReturns = returns.filter(returnItem => 
    returnItem.orderNumber.toLowerCase().includes(searchOrder.toLowerCase()) ||
    returnItem.productName.toLowerCase().includes(searchOrder.toLowerCase())
  );

  return (
    <StoreLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Returns & Refunds
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Manage your return requests and track their status
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Submit Return Form */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <PackageOpen className="w-6 h-6" />
                  Submit Return Request
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Fill out the form below to request a return
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmitReturn} className="space-y-6">
                  <div>
                    <Label htmlFor="orderNumber" className="text-gray-700 font-medium">Order Number</Label>
                    <Input
                      id="orderNumber"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="ORD-2024-XXX"
                      required
                      className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="returnReason" className="text-gray-700 font-medium">Reason for Return</Label>
                    <Select value={returnReason} onValueChange={setReturnReason} required>
                      <SelectTrigger className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                        <SelectItem value="defective">Defective Product</SelectItem>
                        <SelectItem value="wrong_item">Wrong Item Received</SelectItem>
                        <SelectItem value="not_satisfied">Not Satisfied</SelectItem>
                        <SelectItem value="damaged">Damaged in Shipping</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-gray-700 font-medium">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please provide additional details..."
                      className="mt-2 min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-3 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Submit Return Request
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Returns List */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Your Returns
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Track the status of your return requests
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by order number or product..."
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                  />
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredReturns.length > 0 ? (
                    filteredReturns.map((returnItem) => (
                      <div 
                        key={returnItem.id} 
                        className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{returnItem.orderNumber}</h4>
                            <p className="text-gray-600 text-sm">{returnItem.productName}</p>
                          </div>
                          <Badge className={`${getStatusColor(returnItem.status)} flex items-center gap-1 px-3 py-1 rounded-full border font-medium`}>
                            {getStatusIcon(returnItem.status)}
                            {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Submitted: {returnItem.returnDate}</span>
                          <span className="font-medium text-gray-900">${returnItem.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <PackageOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No returns found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default Returns;

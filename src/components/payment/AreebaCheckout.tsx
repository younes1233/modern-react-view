import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard } from 'lucide-react';

interface AreebaCheckoutProps {
  sessionId: string;
  merchantId: string;
  checkoutScriptUrl: string;
  onPaymentComplete: () => void;
  onPaymentFailed: (error: string) => void;
  onCancel: () => void;
}

// Declare global Checkout object from Areeba script
declare global {
  interface Window {
    Checkout: any;
    errorCallback?: (error: any) => void;
    cancelCallback?: () => void;
    completeCallback?: (resultIndicator: string, sessionVersion: string) => void;
  }
}

export const AreebaCheckout = ({
  sessionId,
  merchantId,
  checkoutScriptUrl,
  onPaymentComplete,
  onPaymentFailed,
  onCancel,
}: AreebaCheckoutProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    console.log('AreebaCheckout: Initializing with', {
      sessionId,
      merchantId,
      checkoutScriptUrl
    });

    // Define global callbacks as per Areeba documentation
    window.errorCallback = (error: any) => {
      console.error('Areeba error callback:', error);
      let errorMessage = 'Payment failed. Please try again.';

      if (error.cause === 'DECLINED') {
        errorMessage = 'Your card was declined. Please try a different card.';
      } else if (error.cause === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds. Please use a different card.';
      } else if (error.explanation) {
        errorMessage = error.explanation;
      }

      setError(errorMessage);
      onPaymentFailed(errorMessage);
    };

    window.cancelCallback = () => {
      console.log('Areeba cancel callback');
      onCancel();
    };

    window.completeCallback = (resultIndicator: string, sessionVersion: string) => {
      console.log('Areeba complete callback:', { resultIndicator, sessionVersion });
      onPaymentComplete();
    };

    // Load Areeba checkout script
    const script = document.createElement('script');
    script.src = checkoutScriptUrl;
    script.async = true;
    script.setAttribute('data-error', 'errorCallback');
    script.setAttribute('data-cancel', 'cancelCallback');
    script.setAttribute('data-complete', 'completeCallback');

    script.onload = () => {
      console.log('Areeba script loaded successfully from:', checkoutScriptUrl);
      initializeCheckout();
    };

    script.onerror = () => {
      console.error('Failed to load Areeba script from:', checkoutScriptUrl);
      setError('Failed to load payment gateway. Please try again.');
      setIsLoading(false);
    };

    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      // Cleanup
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }
      // Clean up global callbacks
      delete window.errorCallback;
      delete window.cancelCallback;
      delete window.completeCallback;
    };
  }, [sessionId, merchantId, checkoutScriptUrl, onPaymentComplete, onPaymentFailed, onCancel]);

  const initializeCheckout = () => {
    try {
      if (!window.Checkout) {
        console.error('Checkout object not available');
        setError('Payment gateway not available');
        setIsLoading(false);
        return;
      }

      console.log('Configuring Areeba Checkout with session:', sessionId);

      // Version 67+ only allows session in configure()
      // All customization must be in backend INITIATE_CHECKOUT
      window.Checkout.configure({
        session: {
          id: sessionId,
        },
      });

      // Show embedded payment page
      // Areeba expects a CSS selector string, not a DOM element
      console.log('Showing embedded payment page');
      window.Checkout.showEmbeddedPage('#areeba-payment-container');
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error initializing Areeba checkout:', err);
      setError('Failed to initialize payment form: ' + err.message);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading payment form...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Areeba embedded form container */}
        <div
          id="areeba-payment-container"
          ref={containerRef}
          className={`max-h-[600px] overflow-y-auto ${isLoading ? 'hidden' : ''}`}
        />

        {/* Additional CSS to force-hide billing fields that might appear */}
        <style>{`
          #areeba-payment-container [data-billing-address],
          #areeba-payment-container .billing-address,
          #areeba-payment-container .email-field,
          #areeba-payment-container .customer-email,
          #areeba-payment-container .shipping-fields,
          #areeba-payment-container .order-summary {
            display: none !important;
          }
        `}</style>

        {!isLoading && !error && (
          <div className="pt-4">
            <Button
              onClick={onCancel}
              variant="outline"
              className="w-full"
            >
              Cancel Payment
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center pt-4">
          <p>🔒 Secured by Areeba Payment Gateway</p>
          <p className="mt-1">Your payment information is encrypted and secure</p>
        </div>
      </CardContent>
    </Card>
  );
};

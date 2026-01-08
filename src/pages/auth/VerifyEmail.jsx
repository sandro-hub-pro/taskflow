import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services/api';
import { Button, Card, CardContent, Spinner } from '../../components/ui';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const hash = searchParams.get('hash');
  const expires = searchParams.get('expires');
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!id || !hash) {
        setStatus('error');
        setErrorMessage('Invalid verification link.');
        return;
      }

      // Check if link has expired on client side first
      if (expires && Date.now() / 1000 > parseInt(expires)) {
        setStatus('error');
        setErrorMessage('Verification link has expired. Please request a new one.');
        return;
      }

      try {
        await authService.verifyEmail(id, hash, expires);
        setStatus('success');
      } catch (error) {
        setStatus('error');
        setErrorMessage(error.response?.data?.message || 'The verification link is invalid or has expired.');
      }
    };

    verify();
  }, [id, hash, expires]);

  if (status === 'verifying') {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-2xl shadow-surface-900/10 dark:shadow-black/30">
          <CardContent className="p-8 text-center">
            <Spinner size="xl" className="mx-auto mb-6" />
            <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-2">
              Verifying email...
            </h1>
            <p className="text-surface-500 dark:text-surface-400">
              Please wait while we verify your email address
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-2xl shadow-surface-900/10 dark:shadow-black/30">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-2">
              Email verified!
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mb-6">
              Your email has been successfully verified. You can now access all features.
            </p>

            <Link to="/dashboard">
              <Button className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <Card className="shadow-2xl shadow-surface-900/10 dark:shadow-black/30">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <XCircleIcon className="w-8 h-8 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-2">
            Verification failed
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mb-6">
            {errorMessage || 'The verification link is invalid or has expired.'}
          </p>

          <Link to="/login">
            <Button className="w-full">
              Go to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}


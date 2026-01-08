import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, CardContent } from '../../components/ui';
import toast from 'react-hot-toast';

export function EmailVerificationNotice() {
  const { user, logout, checkAuth } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await authService.resendVerification();
      setSent(true);
      toast.success('Verification email sent! Check your inbox.');
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = async () => {
    await checkAuth();
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <Card className="shadow-2xl shadow-surface-900/10 dark:shadow-black/30">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-6">
            <EnvelopeIcon className="w-8 h-8 text-primary-500" />
          </div>
          
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-2">
            Verify your email
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mb-2">
            We've sent a verification link to:
          </p>
          <p className="text-surface-900 dark:text-white font-medium mb-6">
            {user?.email}
          </p>

          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
            Please check your email and click the verification link to continue.
            If you don't see the email, check your spam folder.
          </p>

          <div className="space-y-3">
            {sent ? (
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                ✓ Verification email sent! Check your inbox.
              </p>
            ) : (
              <Button
                onClick={handleResend}
                variant="secondary"
                className="w-full"
                loading={sending}
              >
                Resend verification email
              </Button>
            )}

            <Button
              onClick={handleRefresh}
              variant="secondary"
              className="w-full"
              leftIcon={<ArrowPathIcon className="w-5 h-5" />}
            >
              I've verified my email
            </Button>

            <button
              onClick={logout}
              className="text-sm text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
            >
              Sign out and use a different account
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


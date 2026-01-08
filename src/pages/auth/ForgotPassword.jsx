import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services/api';
import { Button, Input, Card, CardContent } from '../../components/ui';
import toast from 'react-hot-toast';

export function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Password reset link sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
      toast.error('Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-2xl shadow-surface-900/10 dark:shadow-black/30">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-2">
              Check your email
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mb-6">
              We've sent a password reset link to <br />
              <span className="font-medium text-surface-700 dark:text-surface-300">{email}</span>
            </p>

            <Link to="/login">
              <Button variant="secondary" className="w-full">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to login
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
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-2">
              Forgot password?
            </h1>
            <p className="text-surface-500 dark:text-surface-400">
              No worries, we'll send you reset instructions
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              error={error}
              leftIcon={<EnvelopeIcon className="w-5 h-5" />}
              required
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              Send reset link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


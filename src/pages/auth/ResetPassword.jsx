import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services/api';
import { Button, Input, Card, CardContent } from '../../components/ui';
import toast from 'react-hot-toast';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await authService.resetPassword({
        token,
        email,
        ...formData,
      });
      setSuccess(true);
      toast.success('Password reset successfully');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || 'Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-2xl shadow-surface-900/10 dark:shadow-black/30">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-2">
              Password reset!
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mb-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>

            <Link to="/login">
              <Button className="w-full">
                Continue to login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token || !email) {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-2xl shadow-surface-900/10 dark:shadow-black/30">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-2">
              Invalid reset link
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mb-6">
              This password reset link is invalid or has expired.
            </p>

            <Link to="/forgot-password">
              <Button className="w-full">
                Request new link
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
              Set new password
            </h1>
            <p className="text-surface-500 dark:text-surface-400">
              Your new password must be different from previous passwords
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="New password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              error={errors.password?.[0]}
              leftIcon={<LockClosedIcon className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              }
              required
            />

            <Input
              label="Confirm new password"
              type={showPassword ? 'text' : 'password'}
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm new password"
              leftIcon={<LockClosedIcon className="w-5 h-5" />}
              required
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              Reset password
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


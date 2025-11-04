import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase-client';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import villaSayaLogo from '@assets/villasaya.svg';
import { Button } from './ui/button';
import { validateField } from '../utils/formValidation';

interface MobileAuthPageProps {
  onAuthSuccess: () => void;
}

// Helper to capitalize role for Supabase schema
const capitalizeRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    'landlord': 'Landlord',
    'property agent': 'Property Agent',
    'tenant': 'Tenant',
    'staff': 'Staff'
  };
  return roleMap[role.toLowerCase()] || 'Staff';
};

export function MobileAuthPage({ onAuthSuccess }: MobileAuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetFeedback, setResetFeedback] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'staff',
  });

  // Validate a field with real-time feedback
  const validateFormField = (field: string, value: string) => {
    let validation;
    
    if (field === 'email') {
      validation = validateField(value, {
        required: 'Email or phone number is required',
        validate: () => {
          const emailOrPhone = validateEmailOrPhone(value);
          if (!emailOrPhone) return 'Please enter a valid email or phone number';
          return true;
        }
      });
    } else if (field === 'password') {
      const minLength = isSignUp ? 8 : 6;
      validation = validateField(value, {
        required: 'Password is required',
        minLength: { value: minLength, message: `Password must be at least ${minLength} characters` },
        ...(isSignUp && {
          validate: (val: string) => {
            if (!/[A-Z]/.test(val)) return 'Must contain an uppercase letter';
            if (!/[a-z]/.test(val)) return 'Must contain a lowercase letter';
            if (!/[0-9]/.test(val)) return 'Must contain a number';
            return true;
          }
        })
      });
    } else if (field === 'name' && isSignUp) {
      validation = validateField(value, {
        required: 'Full name is required',
        minLength: { value: 2, message: 'Name must be at least 2 characters' }
      });
    } else {
      validation = { isValid: true };
    }

    setFieldErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? '' : validation.error || ''
    }));

    return validation.isValid;
  };

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        sessionStorage.setItem('access_token', data.session.access_token);
        sessionStorage.setItem('user_id', data.session.user.id);
        onAuthSuccess();
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  const validateEmailOrPhone = (input: string) => {
    // Check if it's an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(input)) {
      return 'email';
    }
    
    // Check if it's a phone number (basic validation - digits, spaces, +, -, parentheses)
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,12}$/;
    if (phoneRegex.test(input.replace(/\s/g, ''))) {
      return 'phone';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate all fields before submission
    const emailValid = validateFormField('email', formData.email);
    const passwordValid = validateFormField('password', formData.password);
    const nameValid = isSignUp ? validateFormField('name', formData.name) : true;

    if (!emailValid || !passwordValid || !nameValid) {
      setLoading(false);
      return;
    }

    try {
      // Detect if input is email or phone
      const identifierType = validateEmailOrPhone(formData.email);
      
      if (isSignUp) {
        // Sign up with Supabase Auth
        const signUpOptions: any = {
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              role: capitalizeRole(formData.role)
            }
          }
        };

        // Add email or phone based on input type
        if (identifierType === 'email') {
          signUpOptions.email = formData.email;
        } else if (identifierType === 'phone') {
          signUpOptions.phone = formData.email; // formData.email contains phone number
        } else {
          throw new Error('Invalid email or phone number');
        }

        const { data, error: signUpError } = await supabase.auth.signUp(signUpOptions);

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        if (!data.user) {
          throw new Error('Failed to create account');
        }

        // Create profile for the new user
        const { error: profileError } = await (supabase
          .from('profiles') as any)
          .insert({
            id: data.user.id,
            name: formData.name,
            role: capitalizeRole(formData.role),
            profile_data: {}
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Create default user settings
        const { error: settingsError } = await (supabase
          .from('user_settings') as any)
          .insert({
            user_id: data.user.id,
            general: {
              companyName: 'VillaSaya Properties',
              timezone: 'UTC+8',
              language: 'English',
              dateFormat: 'DD/MM/YYYY',
              currency: 'USD'
            },
            security: {
              twoFactorAuth: false,
              sessionTimeout: '30',
              passwordExpiry: '90'
            },
            notifications: {
              emailNotifications: true,
              taskReminders: true,
              expenseAlerts: true
            }
          });

        if (settingsError) {
          console.error('Settings creation error:', settingsError);
        }

        toast.success('Account created successfully! Please check your email to verify your account.');
        setIsSignUp(false);
        setFormData({ email: formData.email, password: '', name: '', role: 'staff' });
        setFieldErrors({});
      } else {
        // Sign in with Supabase Auth
        const signInOptions: any = {
          password: formData.password,
        };

        // Add email or phone based on input type
        if (identifierType === 'email') {
          signInOptions.email = formData.email;
        } else if (identifierType === 'phone') {
          signInOptions.phone = formData.email; // formData.email contains phone number
        } else {
          throw new Error('Invalid email or phone number');
        }

        const { data, error: signInError } = await supabase.auth.signInWithPassword(signInOptions);

        if (signInError) {
          throw new Error(signInError.message);
        }

        if (!data.session) {
          throw new Error('No session created');
        }

        // Session is automatically stored by Supabase
        toast.success('Signed in successfully!');
        onAuthSuccess();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error?.message) {
        setError(error.message);
      } else {
        setError('Invalid credentials or account not found');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (error) setError('');
    if (field === 'email' && resetFeedback) {
      setResetFeedback('');
    }
    // Clear field error when user types
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFieldBlur = (field: string) => {
    validateFormField(field, formData[field as keyof typeof formData] as string);
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple' | 'azure') => {
    setLoading(true);
    try {
      let redirectUrl = window.location.origin;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('OAuth error:', error);
      toast.error(error.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setResetFeedback('');

    if (!formData.email) {
      const message = 'Enter the email associated with your account to reset your password.';
      setFieldErrors(prev => ({ ...prev, email: message }));
      toast.error(message);
      return;
    }

    const inputType = validateEmailOrPhone(formData.email);
    if (inputType !== 'email') {
      const message = 'Password reset is only available with a valid email address.';
      setFieldErrors(prev => ({ ...prev, email: message }));
      toast.error(message);
      return;
    }

    try {
      setResettingPassword(true);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email);

      if (resetError) {
        throw resetError;
      }

      toast.success('Check your email for a password reset link.');
      setResetFeedback('Check your email inbox (and spam folder) for a reset link. The link expires after a short time.');
    } catch (resetError) {
      console.error('Password reset error:', resetError);
      toast.error('We could not send the reset link. Please try again in a moment.');
      setResetFeedback('We could not send the reset link. Please verify your email and try again.');
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 sm:p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={villaSayaLogo} alt="VillaSaya" className="h-24 object-contain" />
        </div>

        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-2 text-gray-900">
          {isSignUp ? 'Create your account' : 'Login to your account'}
        </h1>
        <p className="text-sm sm:text-base text-gray-500 text-center mb-6 px-2">
          {isSignUp 
            ? 'Enter your details to create a new account.' 
            : 'Enter your account details to log in.'}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Name field (sign up only) */}
          {isSignUp && (
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name:
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                onBlur={() => handleFieldBlur('name')}
                autoComplete="name"
                className={`w-full h-11 border rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B5FEB] focus:border-[#7B5FEB] transition-colors ${
                  fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                required={isSignUp}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-red-600 text-sm">{fieldErrors.name}</p>
              )}
            </div>
          )}

          {/* Email/Phone field */}
          <div className="mb-4">
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email or phone number:
            </label>
            <input
              id="identifier"
              type="text"
              placeholder="your@email.com or +1 234 567 890"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => handleFieldBlur('email')}
              autoComplete="username"
              className={`w-full h-11 border rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B5FEB] focus:border-[#7B5FEB] transition-colors ${
                fieldErrors.email || error
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              required
            />
            {fieldErrors.email && (
              <p className="mt-1 text-red-600 text-sm">{fieldErrors.email}</p>
            )}
            {error && !fieldErrors.email && (
              <p className="mt-1 text-red-600 text-sm">{error}</p>
            )}
          </div>

          {/* Password field */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password:
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                onBlur={() => handleFieldBlur('password')}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className={`w-full h-11 border rounded-lg px-3 py-2 pr-10 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B5FEB] focus:border-[#7B5FEB] transition-colors ${
                  fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-red-600 text-sm">{fieldErrors.password}</p>
            )}
            {!isSignUp && !fieldErrors.password && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resettingPassword}
                  className="text-sm text-[#7B5FEB] hover:text-[#6B4FDB] hover:underline disabled:opacity-60 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {resettingPassword ? 'Sending reset link…' : 'Forgot password?'}
                </button>
              </div>
            )}
            {resetFeedback && (
              <p className="mt-2 text-sm text-gray-600" role="status" aria-live="polite">
                {resetFeedback}
              </p>
            )}
          </div>

          {/* Remember Me */}
          {!isSignUp && (
            <div className="flex items-center mb-6">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#7B5FEB] border-gray-300 rounded focus:ring-[#7B5FEB] accent-[#7B5FEB]"
              />
              <label
                htmlFor="remember"
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                Keep me signed in
              </label>
            </div>
          )}

          {/* Login button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#7B5FEB] hover:bg-[#6B4FDB] text-white font-medium rounded-lg mb-6 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Login'}
          </Button>
        </form>

        {/* Signup link */}
        <p className="text-center text-sm sm:text-base text-gray-500 mb-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setResetFeedback('');
            }}
            className="text-[#7B5FEB] hover:text-[#6B4FDB] font-medium hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Create one'}
          </button>
        </p>

        {/* Divider */}
        {!isSignUp && (
          <>
            <div className="flex items-center mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="mx-2 text-sm text-gray-400 whitespace-nowrap">
                Or continue with
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* OAuth buttons */}
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                variant="outline"
                className="w-full h-11 bg-white border-gray-300 hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>

              <Button
                type="button"
                onClick={() => handleOAuthLogin('apple')}
                variant="outline"
                className="w-full h-11 bg-white border-gray-300 hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.42-1.08-.48-2.05-.46-3.18.01-1.44.61-2.2.44-3.06-.45C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.05-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.51-3.74 4.25z" fill="currentColor"/>
                </svg>
                Continue with Apple
              </Button>

              <Button
                type="button"
                onClick={() => handleOAuthLogin('azure')}
                variant="outline"
                className="w-full h-11 bg-white border-gray-300 hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.4 11.4H2.6V2.6h8.8v8.8z" fill="#F25022"/>
                  <path d="M21.4 11.4h-8.8V2.6h8.8v8.8z" fill="#7FBA00"/>
                  <path d="M11.4 21.4H2.6v-8.8h8.8v8.8z" fill="#00A4EF"/>
                  <path d="M21.4 21.4h-8.8v-8.8h8.8v8.8z" fill="#FFB900"/>
                </svg>
                Continue with Microsoft
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

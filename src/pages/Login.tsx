import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export function Login() {
  const { login, isLoginLoading, loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [browserInfo] = useState<string>(navigator.userAgent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Security Info Modal */}
      <div className="fixed top-2 right-2 max-w-xs bg-white p-2 text-xs text-gray-500 rounded-md shadow-sm">
        <div className="flex items-center space-x-1">
          <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Secured Connection</span>
        </div>
        <div className="mt-1 text-gray-400 text-xs truncate">{browserInfo}</div>
      </div>

      <div className="flex min-h-screen">
        {/* Left Panel - Brand/Logo */}
        <div className="hidden lg:flex lg:flex-1 bg-indigo-600 items-center justify-center p-12">
          <div className="max-w-lg text-center">
            <div className="text-5xl font-bold text-white mb-6">UniSphere</div>
            <p className="text-indigo-100 text-lg">
              Welcome to the next generation of online examinations. Secure, reliable, and designed for the modern student.
            </p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Student Login</h2>
              <p className="mt-3 text-gray-600">Sign in to access your examinations</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {loginError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">
                        {loginError instanceof Error ? loginError.message : 'Invalid email or password'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                    placeholder="student@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-base font-medium"
                isLoading={isLoginLoading}
              >
                {isLoginLoading ? 'Signing in...' : 'Sign in'}
              </Button>

              {/* Admin Link */}
              <div className="text-center mt-6">
                <Link 
                  to="/admin/login" 
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Administrator Login
                </Link>
              </div>
            </form>

            {/* Security Notes */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Your connection is secure
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";

interface SignInFormProps {
  loading: boolean;
  error?: string;
  success?: string;
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  loading,
  error,
  success,
  email,
  password,
  setEmail,
  setPassword,
  handleSubmit,
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  // Ensuring the theme has been mounted before rendering to prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-primary-100'}`}>
      <div className={`w-full max-w-md p-8 space-y-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} rounded shadow-md`}>
        <h2 className={`text-2xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-primary-700'}`}>Sign In</h2>

        {error && (
          <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 text-green-700 bg-green-100 border border-green-400 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={`block ${isDarkMode ? 'text-gray-300' : 'text-primary-700'}`}>
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring-2 ${
                isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300 focus:ring-gray-500' : 'border-primary-300 focus:ring-primary-500'
              }`}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className={`block ${isDarkMode ? 'text-gray-300' : 'text-primary-700'}`}>
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring-2 ${
                isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300 focus:ring-gray-500' : 'border-primary-300 focus:ring-primary-500'
              }`}
              placeholder="••••••••"
            />
          </div>

		<button
			type="submit"
			disabled={loading}
			className={`w-full px-4 py-2 font-semibold rounded-lg focus:outline-none focus:ring-4 ${
				isDarkMode
				? 'bg-gray-700 text-white hover:bg-gray-500 focus:ring-gray-300 shadow-md'
				: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-400 shadow-md'
			} ${loading ? 'opacity-50 cursor-not-allowed' : 'transition duration-200 ease-in-out transform hover:scale-105'}`}
			>
			{loading ? "Signing in..." : "Sign In"}
		</button>

        </form>

        <div className="text-center">
          <a href="/forgot-password" className={`${isDarkMode ? 'text-gray-400' : 'text-primary-600'} hover:underline`}>
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;

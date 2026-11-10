"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Building, Briefcase, Mail, Lock, Check, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type AccountType = "tenant" | "landlord" | "agent";

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("tenant");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const accountTypes = [
    {
      id: "tenant",
      title: "Tenant",
      description: "Looking for a home",
      icon: User,
    },
    {
      id: "landlord",
      title: "Landlord",
      description: "Listing a property",
      icon: Building,
    },
    {
      id: "agent",
      title: "Agent",
      description: "Managing listings",
      icon: Briefcase,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!agreed) {
      setError("You must agree to the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            account_type: accountType,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('fetch') || signUpError.message.includes('ENOTFOUND')) {
          setError("Cannot connect to Supabase database. Please verify your Supabase project is active/unpaused.");
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      // If Supabase requires email confirmation
      if (data?.user && !data.session) {
        setSuccess(true);
      } else {
        // Auto-confirmed, redirect to home
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      if (err.message && (err.message.includes('fetch') || err.message.includes('ENOTFOUND'))) {
        setError("Unable to connect to Supabase database. If using Supabase free tier, please check if your project is active/unpaused in your Supabase dashboard.");
      } else {
        setError(err.message || "An unexpected error occurred during account creation.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cresla.onrender.com';
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: origin,
          data: { account_type: accountType }
        },
      });

      if (oauthError) {
        if (oauthError.message.includes('provider is not enabled') || oauthError.message.includes('Unsupported provider')) {
          setError("Google Sign-In is not enabled yet in your Supabase Dashboard. Please enable Google in Authentication -> Providers, or register with Email and Password.");
        } else {
          setError(oauthError.message);
        }
      } else if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("OAuth error:", err);
      setError(err.message || "Google authentication failed. Please try email registration.");
    } finally {
      setGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-10 shadow-xl border border-slate-200 dark:border-slate-800 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Check your email</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            We&apos;ve sent a confirmation link to <strong className="text-slate-900 dark:text-white">{email}</strong>. Please click the link to verify your account and complete setup.
          </p>
          <Link
            href="/auth/login"
            className="inline-block w-full py-3 bg-gradient-to-r from-primary to-blue-700 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all"
          >
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Form Section */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-xl">
                C
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                CRESLA
              </span>
            </Link>
            <h2 className="mt-8 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Join Zimbabwe&apos;s premium real estate platform.
            </p>
          </div>

          <div className="mt-8">
            {/* Error Message banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 text-xs text-red-700 dark:text-red-300 leading-relaxed shadow-xs"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
                <div>
                  <strong className="font-bold block mb-0.5">Registration Alert:</strong>
                  {error}
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                  I want to join as a:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {accountTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = accountType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setAccountType(type.id as AccountType)}
                        className={`relative flex flex-col items-center gap-1.5 rounded-2xl border p-3.5 text-center transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-xs"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isSelected
                              ? "text-primary"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        />
                        <p
                          className={`text-xs font-bold ${
                            isSelected
                              ? "text-primary"
                              : "text-slate-700 dark:text-white"
                          }`}
                        >
                          {type.title}
                        </p>
                        {isSelected && (
                          <div className="absolute -right-1 -top-1 rounded-full bg-primary p-0.5 text-white shadow-xs">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <User className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-200 py-2.5 pl-10 pr-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-slate-900 dark:text-white dark:border-slate-800"
                    placeholder="Tinashe Moyo"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-200 py-2.5 pl-10 pr-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-slate-900 dark:text-white dark:border-slate-800"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Password (min 6 chars)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-200 py-2.5 pl-10 pr-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-slate-900 dark:text-white dark:border-slate-800"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-200 py-2.5 pl-10 pr-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-slate-900 dark:text-white dark:border-slate-800"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
                />
                <label
                  htmlFor="terms"
                  className="block text-xs text-slate-600 dark:text-slate-400"
                >
                  I agree to the{" "}
                  <span className="font-semibold text-primary">
                    Terms & Conditions
                  </span>
                </label>
              </div>

              {/* Inline error above submit */}
              {error && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {error}
                </p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center items-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary-dark transition-all disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-50 dark:bg-slate-950 px-2 text-slate-400">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                disabled={googleLoading}
                onClick={handleGoogleRegister}
                className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>{googleLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
              </button>
            </div>

            <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-bold text-primary hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Luxury home exterior"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Elevate Your Lifestyle.
            </h3>
            <p className="mt-4 max-w-xl text-lg text-slate-200">
              Join CRESLA and gain access to Zimbabwe&apos;s verified properties, trusted landlords, and top-tier real estate agents.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

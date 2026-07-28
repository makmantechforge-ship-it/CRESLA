"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Building, Briefcase, Mail, Lock, Check } from "lucide-react";

type AccountType = "tenant" | "landlord" | "agent";

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType>("tenant");

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

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Form Section */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-xl">
                K
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Kresla
              </span>
            </Link>
            <h2 className="mt-8 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Join the premium real estate marketplace today.
            </p>
          </div>

          <div className="mt-10">
            <form action="#" method="POST" className="space-y-6">
              {/* Account Type Selection */}
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200 mb-3">
                  I am a
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {accountTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = accountType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setAccountType(type.id as AccountType)}
                        className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200 hover:scale-[1.02] ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 ${
                            isSelected
                              ? "text-primary"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        />
                        <div className="space-y-0.5">
                          <p
                            className={`text-xs font-semibold ${
                              isSelected
                                ? "text-primary"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {type.title}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute -right-1.5 -top-1.5 rounded-full bg-primary p-0.5 text-white shadow-sm">
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
                  className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200"
                >
                  Full Name
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-900 dark:text-white dark:ring-slate-700 dark:focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200"
                >
                  Email address
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-900 dark:text-white dark:ring-slate-700 dark:focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200"
                >
                  Password
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-900 dark:text-white dark:ring-slate-700 dark:focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200"
                >
                  Confirm Password
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-900 dark:text-white dark:ring-slate-700 dark:focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:checked:bg-primary"
                />
                <label
                  htmlFor="terms"
                  className="block text-sm text-slate-700 dark:text-slate-300"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Terms & Conditions
                  </a>
                </label>
              </div>

              <div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="flex w-full justify-center rounded-xl bg-gradient-to-r from-primary to-blue-700 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-md hover:from-primary/90 hover:to-blue-700/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all"
                >
                  Create account
                </motion.button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold leading-6 text-primary hover:text-primary/80 transition-colors"
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
              Join Kresla and gain access to an exclusive network of premium
              properties, trusted landlords, and top-tier real estate agents.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

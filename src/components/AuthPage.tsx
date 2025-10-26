import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase-client";
import { apiRequest } from "../utils/api";
import { toast } from "sonner";
import villaSayaLogo from "@assets/villasaya.svg";
import { Button } from "./ui/button";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "landlord",
  });

  const validateEmailOrPhone = (input: string) => {
    // Check if it's an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(input)) {
      return "email";
    }

    // Check if it's a phone number (basic validation - digits, spaces, +, -, parentheses)
    const phoneRegex =
      /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,12}$/;
    if (phoneRegex.test(input.replace(/\s/g, ""))) {
      return "phone";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        await apiRequest(
          "/signup",
          {
            method: "POST",
            body: JSON.stringify(formData),
          },
          false,
        );

        toast.success("Account created successfully! Please sign in.");
        setIsSignUp(false);
      } else {
        // Sign in
        const inputType = validateEmailOrPhone(formData.email);

        if (!inputType) {
          throw new Error("Please enter a valid email or phone number");
        }

        let signInData;
        let signInError;

        if (inputType === "email") {
          // Email authentication
          const result = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
          signInData = result.data;
          signInError = result.error;
        } else {
          // Phone authentication
          const cleanPhone = formData.email.replace(/[\s\-\(\)]/g, "");
          const result = await supabase.auth.signInWithPassword({
            phone: cleanPhone,
            password: formData.password,
          });
          signInData = result.data;
          signInError = result.error;
        }

        if (signInError) {
          throw signInError;
        }

        if (signInData.session?.access_token) {
          sessionStorage.setItem(
            "access_token",
            signInData.session.access_token,
          );
          sessionStorage.setItem("user_id", signInData.user.id);
          toast.success("Signed in successfully!");
          onAuthSuccess();
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        sessionStorage.setItem("access_token", data.session.access_token);
        sessionStorage.setItem("user_id", data.session.user.id);
        onAuthSuccess();
      }
    } catch (error) {
      console.error("Session check error:", error);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const handleOAuthLogin = async (provider: "google" | "apple" | "azure") => {
    setLoading(true);
    try {
      let redirectUrl = window.location.origin;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("OAuth error:", error);
      toast.error(error.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={villaSayaLogo}
            alt="VillaSaya"
            className="h-28 object-contain"
          />
        </div>

        {/* Header */}
        <h1 className="text-3xl font-semibold text-center mb-2 text-gray-900">
          {isSignUp ? "Create your account" : "Login to your account"}
        </h1>
        <p className="text-base text-gray-500 text-center mb-6 px-2">
          {isSignUp
            ? "Enter your details to create a new account."
            : "Enter your account details to log in."}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Name field (sign up only) */}
          {isSignUp && (
            <>
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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B5FEB] focus:border-[#7B5FEB] transition-colors"
                  required={isSignUp}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role:
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full h-11 border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7B5FEB] focus:border-[#7B5FEB] transition-colors"
                >
                  <option value="landlord">Landlord</option>
                  <option value="property_agent">Property Agent</option>
                  <option value="tenant">Tenant</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </>
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
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full h-11 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B5FEB] focus:border-[#7B5FEB] transition-colors"
              required
            />
          </div>

          {/* Password field */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password:
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full h-11 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B5FEB] focus:border-[#7B5FEB] transition-colors"
              required
            />
            {!isSignUp && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  className="text-sm text-[#7B5FEB] hover:text-[#6B4FDB] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {/* Remember Me */}
          {!isSignUp && (
            <div className="flex items-center mb-6">
              <input
                id="remember-desktop"
                type="checkbox"
                className="w-4 h-4 text-[#7B5FEB] border-gray-300 rounded focus:ring-[#7B5FEB] accent-[#7B5FEB]"
              />
              <label
                htmlFor="remember-desktop"
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
            {loading ? "Please wait..." : isSignUp ? "Create account" : "Login"}
          </Button>
        </form>

        {/* Signup link */}
        <p className="text-center text-base text-gray-500 mb-6">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#7B5FEB] hover:text-[#6B4FDB] font-medium hover:underline"
          >
            {isSignUp ? "Sign in" : "Create one"}
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
                onClick={() => handleOAuthLogin("google")}
                variant="outline"
                className="w-full h-11 bg-white border-gray-300 hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>

              <Button
                type="button"
                onClick={() => handleOAuthLogin("apple")}
                variant="outline"
                className="w-full h-11 bg-white border-gray-300 hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.05 20.28c-.98.95-2.05.88-3.08.42-1.08-.48-2.05-.46-3.18.01-1.44.61-2.2.44-3.06-.45C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.05-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.51-3.74 4.25z"
                    fill="currentColor"
                  />
                </svg>
                Continue with Apple
              </Button>

              <Button
                type="button"
                onClick={() => handleOAuthLogin("azure")}
                variant="outline"
                className="w-full h-11 bg-white border-gray-300 hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M11.4 11.4H2.6V2.6h8.8v8.8z" fill="#F25022" />
                  <path d="M21.4 11.4h-8.8V2.6h8.8v8.8z" fill="#7FBA00" />
                  <path d="M11.4 21.4H2.6v-8.8h8.8v8.8z" fill="#00A4EF" />
                  <path d="M21.4 21.4h-8.8v-8.8h8.8v8.8z" fill="#FFB900" />
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

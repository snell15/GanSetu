import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, MapPin, Loader2, Map } from 'lucide-react';

const MAHARASHTRA_CITIES = [
  'Pune', 'Mumbai', 'Pimpri-Chinchwad', 'Thane',
  'Nashik', 'Nagpur', 'Navi Mumbai', 'Kalyan-Dombivli', 'Other'
];

export default function GanSetuAuth({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // Pop-up State
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const confirmPasswordRef = useRef(null);

  // NEW: Ref to anchor the top of the modal for scrolling
  const topRef = useRef(null);

  // ==========================================
  // AUTO-SCROLL & AUTO-DISMISS ALERTS
  // ==========================================
  useEffect(() => {
    if (error || successMsg) {
      // Smoothly scroll to the top so the user instantly sees the message
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      const timer = setTimeout(() => {
        setError('');
        setSuccessMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMsg]);

  // Keep the confirm password native tooltip synced if they edit the main password
  useEffect(() => {
    if (confirmPasswordRef.current) {
      if (confirmPassword && confirmPassword !== password) {
        confirmPasswordRef.current.setCustomValidity("Passwords do not match.");
      } else {
        confirmPasswordRef.current.setCustomValidity("");
      }
    }
  }, [password, confirmPassword]);

  // --- GOOGLE AUTH LOGIC ---
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      setError("Failed to log in with Google: " + err.message);
    }
  };

  // --- EMAIL & PASSWORD AUTH LOGIC ---
  const handleEmailAuth = async (e) => {
    e.preventDefault();

    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
              city: city,
              area: area.trim()
            }
          }
        });

        if (error) throw error;

        // Safely check identities to prevent undefined crashes
        if (data?.user && data?.user?.identities && data.user.identities.length === 0) {
          setError("An account with this email already exists.");
        } else {
          setSuccessMsg("Account created successfully! Please check your email for the confirmation link to activate your account.");
          setIsSignUp(false);
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err) {
      console.error("Supabase Auth Error:", err);

      // BULLETPROOF ERROR EXTRACTION
      let errorText = "An unexpected error occurred.";
      if (err?.message) {
        errorText = err.message;
      } else if (err?.msg) {
        errorText = err.msg;
      } else if (typeof err === 'object') {
        errorText = JSON.stringify(err);
      } else {
        errorText = String(err);
      }

      // THE NEW ERROR HANDLING LOGIC
      if (errorText.toLowerCase().includes("email not confirmed")) {
        setError("Your account is not activated yet. Please check your inbox for the confirmation link.");
      } else if (errorText.includes("Invalid login credentials")) {
        setError("Incorrect email or password.");
      } else {
        setError(errorText);
      }

    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-h-[90vh] overflow-y-auto relative">

      {/* Attached the ref here so it scrolls perfectly to the header */}
      <div ref={topRef} className="text-center mb-6 pt-2">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
          {isSignUp ? 'Join the Community' : 'Welcome back'}
        </h2>
        <p className="text-gray-500 text-sm">
          {isSignUp
            ? 'Create an account to securely buy and sell decorations.'
            : 'Log in to continue to GanSetu.'
          }
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-bold text-center animate-in slide-in-from-top-2 fade-in duration-200">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl font-bold text-center animate-in slide-in-from-top-2 fade-in duration-200">
          {successMsg}
        </div>
      )}

      {/* GOOGLE BUTTON */}
      <button
        onClick={handleGoogleLogin}
        type="button"
        className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm flex justify-center items-center gap-3 mb-6"
      >
        <GoogleIcon className="h-5 w-5" />
        Continue with Google
      </button>

      {/* DIVIDER */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Or use email
        </span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* DYNAMIC FORM */}
      <form onSubmit={handleEmailAuth} className="space-y-4">

        {isSignUp && (
          <>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm font-medium"
                  required={isSignUp}
                  pattern="[a-zA-Z\s]{2,50}"
                  title="Name must contain only letters and spaces (2-50 characters)."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">City</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-9 pr-2 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm font-medium appearance-none"
                    required={isSignUp}
                  >
                    <option value="" disabled>Select City</option>
                    {MAHARASHTRA_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Local Area</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Map className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g., Kothrud"
                    className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm font-medium"
                    pattern="[a-zA-Z0-9\s,.-]{2,100}"
                    title="Please enter a valid local area using letters, numbers, and basic punctuation."
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm font-medium"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm font-medium"
              required
              minLength="6"
              title="Password must be at least 6 characters long."
            />
          </div>
        </div>

        {isSignUp && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                ref={confirmPasswordRef}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-sm font-medium"
                required={isSignUp}
                title="Passwords must match."
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2 mt-4"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSignUp ? 'Create Account' : 'Log In')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={toggleMode}
          className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          {isSignUp
            ? "Already have an account? Log in"
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}

// Google SVG Component
function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
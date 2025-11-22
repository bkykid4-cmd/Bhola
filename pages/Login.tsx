
import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { auth } from '../services/firebase';
import firebase from 'firebase/compat/app';
import { Smartphone, ArrowRight, Lock, Users, Loader2, CheckCircle, AlertCircle, Copy, Globe, ExternalLink, Settings, ShieldAlert } from 'lucide-react';

// Add window type definition for recaptcha
declare global {
  interface Window {
    recaptchaVerifier: firebase.auth.RecaptchaVerifier | undefined;
  }
}

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState(false);
  const [confirmResult, setConfirmResult] = useState<firebase.auth.ConfirmationResult | null>(null);

  // Get current domain for troubleshooting
  const currentDomain = window.location.hostname;

  useEffect(() => {
    // Clean up recaptcha on unmount
    return () => {
      if (window.recaptchaVerifier) {
        try {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = undefined;
        } catch(e) { /* ignore */ }
      }
    };
  }, []);

  const setupRecaptcha = () => {
    // 1. Clear existing
    if (window.recaptchaVerifier) {
       try { 
         window.recaptchaVerifier.clear(); 
       } catch(e) {}
       window.recaptchaVerifier = undefined;
    }
    
    // 2. Remove any leftover iframe
    const container = document.getElementById('recaptcha-container');
    if (container) container.innerHTML = '';

    // 3. Initialize new
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': () => {
        console.log("Recaptcha verified");
      },
      'expired-callback': () => {
        setError("Recaptcha expired. Please try again.");
        setLoading(false);
      }
    });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsConfigError(false);

    if (mobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      setupRecaptcha();
      
      const phoneNumber = `+91${mobile}`;
      const appVerifier = window.recaptchaVerifier;
      
      if (!appVerifier) throw new Error("Recaptcha failed to initialize");

      const confirmation = await auth.signInWithPhoneNumber(phoneNumber, appVerifier);
      setConfirmResult(confirmation);
      setStep('OTP');
    } catch (err: any) {
      console.error("Login Error:", err);
      
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch(e) {}
        window.recaptchaVerifier = undefined;
      }

      if (err.code === 'auth/internal-error') {
          setError("Configuration Required: API Key is restricted.");
          setIsConfigError(true);
      } else if (err.code === 'auth/unauthorized-domain') {
          setError(`Domain '${currentDomain}' is not authorized.`);
          setIsConfigError(true);
      } else if (err.code === 'auth/invalid-phone-number') {
          setError("Invalid Phone Number.");
      } else if (err.code === 'auth/too-many-requests') {
          setError("Too many attempts. Please try later.");
      } else {
          setError(err.message || "Failed to send OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!confirmResult) {
        setError("Session expired. Please restart.");
        setStep('PHONE');
        setLoading(false);
        return;
    }

    try {
      await confirmResult.confirm(otp);
      await login(mobile, name || 'User', referralCode);
    } catch (err: any) {
      console.error("OTP Error:", err);
      if (err.code === 'auth/invalid-verification-code') {
          setError("Invalid OTP. Please check and try again.");
      } else {
          setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyDomain = () => {
     navigator.clipboard.writeText(currentDomain).then(() => {
        alert(`Copied: ${currentDomain}`);
     });
  };

  // --- CONFIGURATION ERROR VIEW ---
  if (isConfigError) {
      return (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-red-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                    <Settings size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Action Required</h1>
                <p className="text-gray-500 text-center mb-6 text-sm">
                    Google Cloud Security is blocking this app. You must change one setting to allow it to work.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2 text-sm">
                        <ShieldAlert size={16}/> The Issue:
                    </h3>
                    <p className="text-xs text-red-700 leading-relaxed">
                        The API Key <b>"Android key (auto created by Firebase)"</b> is restricted to <b>Android Apps</b> only. You are running a <b>Website</b>, so Google blocks it.
                    </p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex gap-4">
                        <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-600 shrink-0">1</div>
                        <div className="text-sm text-gray-600">
                            Open <b>Google Cloud Console</b> settings.
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-600 shrink-0">2</div>
                        <div className="text-sm text-gray-600">
                            Click the <b>Pencil Icon</b> next to "Android key".
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-600 shrink-0">3</div>
                        <div className="text-sm text-gray-600">
                            Change <b>Application restrictions</b> from "Android apps" to <b>"None"</b>.
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-600 shrink-0">4</div>
                        <div className="text-sm text-gray-600">
                            Click <b>Save</b> and wait 1 minute.
                        </div>
                    </div>
                </div>

                <a 
                    href="https://console.cloud.google.com/apis/credentials?project=student-pocket-money-2083b"
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 mb-3"
                >
                    Open Settings Page Now <ExternalLink size={16} className="inline ml-1"/>
                </a>
                
                <button onClick={() => setIsConfigError(false)} className="block w-full text-gray-500 font-bold text-sm py-2">
                    I have fixed it, Try Again
                </button>
            </div>
            
            <div className="mt-8 text-center max-w-xs">
                 <p className="text-xs text-red-400 font-mono">Error Code: auth/internal-error</p>
                 <p className="text-xs text-gray-400 mt-1">Domain: {currentDomain}</p>
            </div>
        </div>
      );
  }

  // --- NORMAL LOGIN VIEW ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 relative">
      {/* Invisible Recaptcha Container */}
      <div id="recaptcha-container"></div>
      
      {/* DOMAIN HELPER HEADER */}
      <div className="w-full max-w-sm bg-yellow-50 p-3 rounded-xl mb-4 border border-yellow-200 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between text-yellow-800">
              <div className="flex items-center gap-2">
                <Globe size={14} />
                <p className="font-bold text-[10px] uppercase">Your Domain</p>
              </div>
              <span className="text-[9px] text-yellow-600">For Authorized Domains</span>
          </div>
          <div className="flex gap-2">
             <input 
                type="text" 
                readOnly 
                value={currentDomain}
                className="bg-white border border-yellow-200 p-1.5 rounded flex-1 font-mono text-xs font-bold text-gray-700 outline-none focus:border-yellow-500"
                onClick={(e) => e.currentTarget.select()}
             />
             <button onClick={copyDomain} className="bg-yellow-500 text-black px-3 rounded font-bold text-[10px] hover:bg-yellow-400">
                 COPY
             </button>
          </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
            <Smartphone className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Student Pocket Money</h1>
          <p className="text-gray-500 text-sm mt-1">Login to start earning</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg animate-shake flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-bold">{error}</p>
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Full Name</label>
              <div className="relative">
                 <Users className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                 <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-500 font-bold">+91</span>
                <input
                  type="tel"
                  placeholder="9999999999"
                  className="w-full pl-12 p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-lg"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Referral Code (Optional)</label>
              <div className="relative">
                 <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                 <input
                    type="text"
                    placeholder="ABCD123"
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || mobile.length < 10}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:shadow-none active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Get OTP <ArrowRight size={20} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
             <div className="text-center">
                 <p className="text-sm text-gray-500">Enter the OTP sent to</p>
                 <p className="font-bold text-gray-900 text-lg">+91 {mobile}</p>
                 <button type="button" onClick={() => setStep('PHONE')} className="text-xs text-indigo-600 font-bold mt-1">Change Number</button>
             </div>

            <input
              type="text"
              placeholder="123456"
              className="w-full text-center p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-mono text-3xl tracking-widest"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              autoFocus
            />

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition-all disabled:opacity-70 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Verify & Login <CheckCircle size={20} /></>}
            </button>
          </form>
        )}
        
        <div className="mt-8 text-center">
           <p className="text-[10px] text-gray-400">By logging in, you agree to our Terms & Conditions.</p>
        </div>
      </div>
    </div>
  );
};

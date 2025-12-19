'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Check, ArrowRight, Loader2, BarChart3 } from 'lucide-react';
import { signup } from './actions';

const plans = {
  solo: { name: 'Solo Agent', price: 29, agents: 1, contacts: 100 },
  team: { name: 'Team Leader', price: 79, agents: 5, contacts: 500 },
  agency: { name: 'Agency', price: 199, agents: 25, contacts: 2000 },
};

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan') as keyof typeof plans | null;

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof plans>(planParam || 'team');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    agreeToTerms: false,
  });

  useEffect(() => {
    if (planParam && plans[planParam]) {
      setSelectedPlan(planParam);
    }
  }, [planParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.organizationName) {
      setError('Please enter your organization name');
      return false;
    }
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    setError('');

    try {
      const result = await signup({
        ...formData,
        plan: selectedPlan,
      });

      if (result.success) {
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        } else {
          router.push('/agent/dashboard?welcome=true');
        }
      } else {
        setError(result.error || 'Failed to create account');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const plan = plans[selectedPlan];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900 tracking-tight">Wealth Pro</span>
          </Link>
          <Link href="/agent/login" className="text-slate-600 hover:text-slate-900 transition text-sm font-medium">
            Already have an account?
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <div className={`w-16 h-1 rounded ${step > 1 ? 'bg-slate-900' : 'bg-slate-200'}`} />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              2
            </div>
          </div>

          {/* Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                {step === 1 ? 'Create your account' : 'Set up your organization'}
              </h1>
              <p className="text-slate-500">
                {step === 1 ? 'Start your 14-day free trial' : `${plan.name} plan - $${plan.price}/month after trial`}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <form
              onSubmit={
                step === 2
                  ? handleSubmit
                  : (e) => {
                      e.preventDefault();
                      handleNext();
                    }
              }
            >
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 font-medium mb-1.5">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none transition"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 font-medium mb-1.5">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none transition"
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 font-medium mb-1.5">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none transition"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 font-medium mb-1.5">Phone (optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none transition"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 font-medium mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none transition pr-10"
                        placeholder="At least 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 font-medium mb-1.5">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none transition"
                      placeholder="Confirm your password"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition mt-6"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  {/* Plan Selection */}
                  <div>
                    <label className="block text-sm text-slate-700 font-medium mb-2">Select Plan</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(plans) as Array<keyof typeof plans>).map((planKey) => (
                        <button
                          key={planKey}
                          type="button"
                          onClick={() => setSelectedPlan(planKey)}
                          className={`p-3 rounded-lg border text-center transition ${
                            selectedPlan === planKey
                              ? 'border-slate-900 bg-slate-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`text-sm font-medium ${
                              selectedPlan === planKey ? 'text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {plans[planKey].name}
                          </div>
                          <div className="text-xs text-slate-500">${plans[planKey].price}/mo</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 font-medium mb-1.5">Organization Name</label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none transition"
                      placeholder="Your Agency or Team Name"
                    />
                    <p className="text-xs text-slate-500 mt-1">This will be your workspace name</p>
                  </div>

                  {/* Plan Summary */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Plan</span>
                      <span className="text-slate-900 font-medium">{plan.name}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Agent Seats</span>
                      <span className="text-slate-700">{plan.agents}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Contacts</span>
                      <span className="text-slate-700">{plan.contacts}</span>
                    </div>
                    <div className="border-t border-slate-200 my-3" />
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">14-day free trial</span>
                      <span className="text-emerald-600 font-medium">$0 today</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Then</span>
                      <span className="text-slate-900">${plan.price}/month</span>
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="w-4 h-4 mt-0.5 bg-white border-slate-300 rounded text-slate-900 focus:ring-slate-500 focus:ring-offset-0"
                    />
                    <span className="text-sm text-slate-600">
                      I agree to the{' '}
                      <Link href="/terms" className="text-slate-900 hover:underline font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-slate-900 hover:underline font-medium">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Start Free Trial
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-500 text-sm mt-6">No credit card required to start your trial</p>
        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

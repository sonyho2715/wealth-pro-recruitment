import { useState } from 'react';
import { Send, User, Mail, Phone, Briefcase, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { submitApplication, ApplicationFormSchema } from '../../api/recruitment';
import { trackFormStart, trackFormSubmit, trackFormError } from '../../utils/analytics';
import { handleError, ErrorCategory } from '../../utils/error-handler';
import { z } from 'zod';

export default function ApplicationForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentOccupation: '',
    experience: 'none' as 'none' | 'some' | 'experienced',
    hasLicense: 'no' as 'yes' | 'no',
    motivation: '',
    availability: 'full-time' as 'full-time' | 'part-time' | 'flexible',
    referralSource: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [formStarted, setFormStarted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Track form start on first interaction
    if (!formStarted) {
      trackFormStart('application_form');
      setFormStarted(true);
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear API error
    if (apiError) {
      setApiError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setLoading(true);

    try {
      // Validate with Zod schema
      const validatedData = ApplicationFormSchema.parse({
        ...formData,
        phone: formData.phone.replace(/\D/g, ''), // Clean phone number
      });

      // Submit to API
      await submitApplication(validatedData);

      // Track successful submission
      trackFormSubmit('application_form');

      // Show success message
      setSubmitted(true);
      setErrors({});

      // Reset form after delay
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          currentOccupation: '',
          experience: 'none',
          hasLicense: 'no',
          motivation: '',
          availability: 'full-time',
          referralSource: '',
        });
        setFormStarted(false);
      }, 8000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err: any) => {
          const field = err.path[0] as string;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
        trackFormError('application_form', 'validation_error');
      } else {
        // Handle API errors
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit application. Please try again.';
        setApiError(errorMessage);
        trackFormError('application_form', 'api_error');
        handleError(error as Error, {
          category: ErrorCategory.API,
          severity: 'error',
          extra: { formData },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-green-200">
              <CheckCircle2 className="w-12 h-12 text-green-700" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Application Received! 🎉
          </h3>
          <p className="text-lg text-gray-700 mb-6">
            Thank you for your interest in joining our team!
          </p>
          <div className="max-w-md mx-auto text-left bg-white p-6 rounded-lg">
            <p className="text-sm font-bold text-gray-900 mb-3">What happens next:</p>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-600">1.</span>
                <span>We'll review your application within 24 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-600">2.</span>
                <span>A recruitment specialist will call you to discuss the opportunity</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-600">3.</span>
                <span>If it's a good fit, we'll schedule an interview with our team</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-600">4.</span>
                <span>Successful candidates start training within 2 weeks</span>
              </li>
            </ol>
          </div>
          <p className="text-sm text-gray-600 mt-6">
            Check your email ({formData.email}) for confirmation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-white/20 backdrop-blur">
            <Send className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Start Your Application</h2>
            <p className="text-lg opacity-90">
              Take the first step towards financial freedom. Applications reviewed within 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              First Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="John"
              />
            </div>
            {errors.firstName && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Last Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Doe"
              />
            </div>
            {errors.lastName && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.lastName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="john.doe@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="(555) 123-4567"
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-6 mt-8">Background</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Current Occupation */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Current Occupation *
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="currentOccupation"
                value={formData.currentOccupation}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.currentOccupation ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Sales Manager"
              />
            </div>
            {errors.currentOccupation && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.currentOccupation}
              </p>
            )}
          </div>

          {/* Sales Experience */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Sales/Financial Services Experience
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">No experience</option>
              <option value="1-2">1-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          {/* Has License */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Do you have a Life & Health Insurance License?
            </label>
            <select
              name="hasLicense"
              value={formData.hasLicense}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
              <option value="in-progress">In progress</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Desired Work Schedule
            </label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="full-time">Full-time (40+ hrs/week)</option>
              <option value="part-time">Part-time (20-30 hrs/week)</option>
              <option value="flexible">Flexible/As Needed</option>
            </select>
          </div>
        </div>

        {/* Motivation */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Why do you want to become a financial advisor? *
          </label>
          <textarea
            name="motivation"
            value={formData.motivation}
            onChange={handleChange}
            rows={5}
            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.motivation ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Tell us about your goals, what attracted you to this career, and what you hope to achieve..."
          />
          {errors.motivation && (
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.motivation}
            </p>
          )}
        </div>

        {/* Referral Source */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            How did you hear about this opportunity? (Optional)
          </label>
          <input
            type="text"
            name="referralSource"
            value={formData.referralSource}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="LinkedIn, referral from John Smith, Google search, etc."
          />
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 mb-1">Submission Failed</p>
                <p className="text-sm text-red-700">{apiError}</p>
                <p className="text-xs text-red-600 mt-2">
                  Please try again. If the problem persists, contact support at careers@example.com
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-gray-200">
          <p className="text-sm text-gray-600">* Required fields</p>
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Application
              </>
            )}
          </button>
        </div>
      </form>

      {/* Reassurance */}
      <div className="card bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300">
        <h3 className="font-bold text-gray-900 mb-3">🔒 Your Information is Safe</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>We never sell or share your personal information</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>No obligation - this is just an initial application</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Response within 24 hours</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Free consultation to discuss if this is right for you</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

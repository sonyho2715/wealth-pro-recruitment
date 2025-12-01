import { useState } from 'react';
import { Mail, CheckCircle2, Loader2, Gift, FileText, Video, Users } from 'lucide-react';
import { z } from 'zod';
import { trackFormStart, trackFormSubmit, trackFormError } from '../../utils/analytics';

const EmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
});

interface EmailCaptureProps {
  variant?: 'inline' | 'modal' | 'sidebar';
  onSuccess?: () => void;
}

export default function EmailCapture({ variant = 'inline', onSuccess }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formStarted, setFormStarted] = useState(false);

  const handleInputChange = () => {
    if (!formStarted) {
      trackFormStart('email_capture');
      setFormStarted(true);
    }
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      EmailSchema.parse({ email, firstName });

      // Simulate API call (replace with actual email service integration)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, integrate with:
      // - Mailchimp, ConvertKit, or similar email service
      // - Store in your database for follow-up

      trackFormSubmit('email_capture');
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
        trackFormError('email_capture', 'validation_error');
      } else {
        setError('Something went wrong. Please try again.');
        trackFormError('email_capture', 'api_error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg ${variant === 'sidebar' ? '' : 'text-center'}`}>
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-green-200">
            <CheckCircle2 className="w-8 h-8 text-green-700" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">You're In!</h3>
        <p className="text-gray-700 mb-4">
          Check your email ({email}) for your free resources.
        </p>
        <div className="text-sm text-gray-600">
          <p>What you'll receive:</p>
          <ul className="mt-2 space-y-1 text-left inline-block">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Income Potential Guide (PDF)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Day in the Life Video Series
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Exclusive Webinar Invite
            </li>
          </ul>
        </div>
      </div>
    );
  }

  const benefits = [
    { icon: FileText, text: 'Free Income Potential Guide' },
    { icon: Video, text: '"Day in the Life" Video Series' },
    { icon: Users, text: 'Exclusive Webinar Invitation' },
  ];

  return (
    <div className={`card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 ${variant === 'modal' ? 'max-w-lg mx-auto' : ''}`}>
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-full bg-blue-200">
          <Gift className="w-6 h-6 text-blue-700" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Not Ready to Apply Yet?
          </h3>
          <p className="text-gray-700">
            Get free resources to help you explore this career opportunity.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {benefits.map((benefit, idx) => {
          const Icon = benefit.icon;
          return (
            <div key={idx} className="flex items-center gap-2 p-3 bg-white rounded-lg">
              <Icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{benefit.text}</span>
            </div>
          );
        })}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                handleInputChange();
              }}
              placeholder="John"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleInputChange();
                }}
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Gift className="w-5 h-5" />
              Get Free Resources
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          We respect your privacy. Unsubscribe anytime. No spam, ever.
        </p>
      </form>
    </div>
  );
}

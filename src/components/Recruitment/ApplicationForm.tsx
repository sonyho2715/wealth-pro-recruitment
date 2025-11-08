import { useState } from 'react';
import { Send, User, Mail, Phone, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ApplicationForm() {
  const [formData, setFormData] = useState({
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

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.currentOccupation.trim()) newErrors.currentOccupation = 'Current occupation is required';
    if (!formData.motivation.trim()) newErrors.motivation = 'Please share why you want to join us';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      // In a real app, this would submit to an API
      console.log('Form submitted:', formData);
      setSubmitted(true);

      // Reset form after 5 seconds
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
      }, 5000);
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

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-gray-200">
          <p className="text-sm text-gray-600">* Required fields</p>
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg"
          >
            <Send className="w-5 h-5" />
            Submit Application
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

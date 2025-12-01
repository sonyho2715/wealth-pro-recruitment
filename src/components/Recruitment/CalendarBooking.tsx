import { useState } from 'react';
import { Calendar, Clock, Video, Phone, MapPin, CheckCircle2, User, ChevronLeft } from 'lucide-react';
import { agentConfig } from '../../config/agent.config';

type MeetingType = 'video' | 'phone' | 'in-person';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface CalendarBookingProps {
  recruiterId?: string;
  recruiterName?: string;
  onBookingComplete?: (booking: BookingDetails) => void;
}

interface BookingDetails {
  date: string;
  time: string;
  type: MeetingType;
  name: string;
  email: string;
  phone: string;
}

export default function CalendarBooking({
  recruiterName = agentConfig.agentName,
  onBookingComplete,
}: CalendarBookingProps) {
  const [step, setStep] = useState<'type' | 'date' | 'time' | 'details' | 'confirmed'>('type');
  const [meetingType, setMeetingType] = useState<MeetingType>('video');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Generate next 14 days for calendar
  const generateDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date);
      }
    }
    return dates.slice(0, 10); // Show 10 available days
  };

  // Generate time slots
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const times = [
      '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
      '4:00 PM', '4:30 PM', '5:00 PM',
    ];
    times.forEach(time => {
      // Simulate some slots being unavailable (in production, check actual availability)
      slots.push({
        time,
        available: Math.random() > 0.3,
      });
    });
    return slots;
  };

  const [timeSlots] = useState<TimeSlot[]>(generateTimeSlots());
  const [availableDates] = useState<Date[]>(generateDates());

  const meetingTypes = [
    { id: 'video' as MeetingType, icon: Video, title: 'Video Call', description: 'Zoom or Google Meet' },
    { id: 'phone' as MeetingType, icon: Phone, title: 'Phone Call', description: 'We\'ll call you' },
    { id: 'in-person' as MeetingType, icon: MapPin, title: 'In-Person', description: 'Meet at our office' },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) return;

    const booking: BookingDetails = {
      date: formatDate(selectedDate),
      time: selectedTime,
      type: meetingType,
      ...formData,
    };

    // In production, submit to your booking system/calendar API
    console.log('Booking submitted:', booking);
    onBookingComplete?.(booking);
    setStep('confirmed');
  };

  if (step === 'confirmed') {
    return (
      <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
        <div className="text-center py-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-green-200">
              <CheckCircle2 className="w-12 h-12 text-green-700" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Meeting Scheduled!</h3>
          <p className="text-gray-700 mb-6">
            Your consultation with {recruiterName} is confirmed.
          </p>

          <div className="max-w-sm mx-auto bg-white p-6 rounded-lg border-2 border-green-300 text-left">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="font-semibold">{selectedDate && formatDate(selectedDate)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="font-semibold">{selectedTime}</span>
              </div>
              <div className="flex items-center gap-3">
                {meetingType === 'video' && <Video className="w-5 h-5 text-green-600" />}
                {meetingType === 'phone' && <Phone className="w-5 h-5 text-green-600" />}
                {meetingType === 'in-person' && <MapPin className="w-5 h-5 text-green-600" />}
                <span className="font-semibold capitalize">{meetingType.replace('-', ' ')}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-6">
            Check your email ({formData.email}) for confirmation and meeting details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-full bg-blue-200">
          <Calendar className="w-6 h-6 text-blue-700" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Schedule a Free Consultation
          </h3>
          <p className="text-gray-700">
            Speak with {recruiterName} to learn more about this career opportunity.
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {['type', 'date', 'time', 'details'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s
                  ? 'bg-blue-600 text-white'
                  : ['type', 'date', 'time', 'details'].indexOf(step) > i
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              {['type', 'date', 'time', 'details'].indexOf(step) > i ? '✓' : i + 1}
            </div>
            {i < 3 && <div className="w-8 h-1 bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1: Meeting Type */}
      {step === 'type' && (
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900">How would you like to meet?</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {meetingTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setMeetingType(type.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    meetingType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${meetingType === type.id ? 'text-blue-600' : 'text-gray-600'}`} />
                  <p className="font-bold text-gray-900">{type.title}</p>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setStep('date')}
            className="w-full mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Select Date */}
      {step === 'date' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('type')}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <h4 className="font-bold text-gray-900">Select a Date</h4>
            <div className="w-16" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {availableDates.map((date, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  selectedDate?.toDateString() === date.toDateString()
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <p className="text-xs text-gray-600">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                <p className="text-lg font-bold text-gray-900">{date.getDate()}</p>
                <p className="text-xs text-gray-600">{date.toLocaleDateString('en-US', { month: 'short' })}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('time')}
            disabled={!selectedDate}
            className={`w-full mt-4 px-6 py-3 font-bold rounded-lg transition-all ${
              selectedDate
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 3: Select Time */}
      {step === 'time' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('date')}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <h4 className="font-bold text-gray-900">
              Select a Time - {selectedDate && formatDate(selectedDate)}
            </h4>
            <div className="w-16" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {timeSlots.map((slot, idx) => (
              <button
                key={idx}
                onClick={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
                className={`p-2 rounded-lg border-2 text-center text-sm font-semibold transition-all ${
                  selectedTime === slot.time
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : slot.available
                      ? 'border-gray-200 hover:border-blue-300 text-gray-700'
                      : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('details')}
            disabled={!selectedTime}
            className={`w-full mt-4 px-6 py-3 font-bold rounded-lg transition-all ${
              selectedTime
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 4: Your Details */}
      {step === 'details' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('time')}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <h4 className="font-bold text-gray-900">Your Details</h4>
            <div className="w-16" />
          </div>

          {/* Summary */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-800 mb-2">Your Appointment:</p>
            <p className="text-sm text-blue-700">
              {selectedDate && formatDate(selectedDate)} at {selectedTime} ({meetingType.replace('-', ' ')})
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!formData.name || !formData.email || !formData.phone}
            className={`w-full mt-4 px-6 py-3 font-bold rounded-lg transition-all ${
              formData.name && formData.email && formData.phone
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Confirm Booking
          </button>

          <p className="text-xs text-gray-500 text-center">
            You'll receive a confirmation email with meeting details.
          </p>
        </div>
      )}
    </div>
  );
}

import React, { Key, ReactNode } from 'react';
import { Calendar, Clock, MapPin, Video, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  ResumeAnalysisService,
  InterviewSchedulingService,
  JobMatchingService,
  FeedbackAnalysisService,
  AuthService,
  StorageService
} from '../services/api';

interface Interview {
  id: Key | null | undefined;
  interviewer: ReactNode;
  position: ReactNode;
  date: any;
  time: any;
  _id: string;
  jobId: {
    title: string;
    company: string;
    location: string;
  };
  recruiterId: {
    name: string;
    email: string;
  };
  scheduledDateTime: string;
  duration: number;
  type: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meetingLink?: string;
  notes?: string;
  slotExpiresAt: string;
}

export default function CandidateDashboard() {
  const [interviews, setInterviews] = React.useState<Interview[]>([]);
  const [availableSlots, setAvailableSlots] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadInterviews();
    loadAvailableSlots();
  }, []);

  const loadInterviews = async () => {
    try {
      const response = await InterviewSchedulingService.getUserInterviews();
      setInterviews(response || []);
    } catch (error) {
      console.error('Failed to load interviews:', error);
    }
  };

  const loadAvailableSlots = () => {
    const slots = localStorage.getItem('availableSlots');
    if (slots) {
      setAvailableSlots(JSON.parse(slots));
    }
  };

  const respondToInterview = async (interviewId: string, response: 'accept' | 'decline') => {
    try {
      setLoading(true);
      await InterviewSchedulingService.respondToInterview(interviewId, response);
      await loadInterviews();
      alert(`Interview ${response}ed successfully!`);
    } catch (error) {
      alert(error instanceof Error ? error.message : `Failed to ${response} interview`);
    } finally {
      setLoading(false);
    }
  };

  const upcomingInterviews = interviews.filter(i => i.status !== 'completed');
  const pastInterviews = interviews.filter(i => i.status === 'completed');

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  function getRatingStars(rating: number): React.ReactNode {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return <div className="flex">{stars}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Interviews</h1>
        <p className="text-gray-600">Manage your interview schedule and view feedback</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{upcomingInterviews.length}</span>
          </div>
          <p className="text-gray-600 font-medium mt-2">Upcoming</p>
          <p className="text-sm text-blue-600">
            {upcomingInterviews.length > 0 ? `Next: ${upcomingInterviews[0].date} ${upcomingInterviews[0].time}` : 'None scheduled'}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-secondary-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{pastInterviews.length}</span>
          </div>
          <p className="text-gray-600 font-medium mt-2">Completed</p>
          <p className="text-sm text-green-600">{pastInterviews.length > 0 ? 'Recently completed' : 'No completed interviews'}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-accent-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{availableSlots.length}</span>
          </div>
          <p className="text-gray-600 font-medium mt-2">Available Slots</p>
          <p className="text-sm text-accent-600">Ready to book</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-success-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">85%</span>
          </div>
          <p className="text-gray-600 font-medium mt-2">Success Rate</p>
          <p className="text-sm text-success-600">Above average</p>
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Interviews</h2>
        {upcomingInterviews.length > 0 ? (
          <div className="space-y-4">
            {upcomingInterviews.map((interview) => (
              <div key={interview._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{interview.jobId.title}</h3>
                    <p className="text-primary-600 font-medium">{interview.jobId.company}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interview.status)}`}>
                    {interview.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(interview.scheduledDateTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(interview.scheduledDateTime)} ({interview.duration} min)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{interview.jobId.location}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Type:</span> {interview.type} Interview
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Interviewer:</span> {interview.recruiterId.name}
                    </p>
                    <h3 className="font-semibold text-gray-900">{interview.jobId.title}</h3>
                    <p className="text-gray-600">{interview.jobId.company}</p>
                        <Video className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(interview.scheduledDateTime)} at {formatTime(interview.scheduledDateTime)}</span>
                         {interview.meetingLink && (
  <a
    href={interview.meetingLink}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center text-blue-600 hover:underline mt-2"
  >
    <Video className="h-4 w-4 mr-1" />
    Join Meeting
  </a>
)}

                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(interview.scheduledDateTime)} at {formatTime(interview.scheduledDateTime)}</span>
                    </div>
                  </div>
                </div>

                {interview.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Note:</span> {interview.notes}
                    </p>
                  </div>
                )}

                {interview.status === 'pending' && (
                  <div className="flex space-x-3 mt-4">
                    <button 
                      onClick={() => respondToInterview(interview._id, 'accept')}
                      disabled={loading}
                      className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors text-sm disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => respondToInterview(interview._id, 'decline')}
                      disabled={loading}
                      className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors text-sm disabled:opacity-50"
                    >
                      Decline
                    </button>
                    <div className="text-sm text-gray-500 flex items-center">
                      Expires: {formatDate(interview.slotExpiresAt)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No upcoming interviews scheduled</p>
        )}
      </div>

      {/* Available Slots */}
      {availableSlots.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Interview Slots</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSlots.map((slot, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-secondary-300 hover:bg-secondary-50 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{formatDate(slot)}</h3>
                    <p className="text-gray-600 text-sm">{formatTime(slot)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => alert('Interview booking feature coming soon!')}
                  className="w-full bg-secondary-600 text-white py-2 rounded-lg hover:bg-secondary-700 transition-colors text-sm"
                >
                  Book Interview
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Interviews */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Interview History</h2>
        <div className="space-y-4">
          {pastInterviews.map((interview) => (
            <div key={interview.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{interview.position}</h3>
                  <p className="text-gray-600">Company Interview</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{formatDate(interview.date)} at {formatTime(interview.time)}</span>
                    <span>•</span>
                    <span>with {interview.interviewer}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    {getRatingStars(4.0)}
                  </div>
                  <span className="text-sm text-gray-500">4.0/5.0</span>
                </div>
              </div>
              
              {interview.notes && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Notes:</span> {interview.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
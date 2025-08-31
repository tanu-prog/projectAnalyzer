import React, { useState } from 'react';
import { Calendar, Users, Clock, CheckCircle, Plus, Filter } from 'lucide-react';
import { InterviewSchedulingService } from '../services/interviewSchedulingService';
import { Interview } from '../services/api';
import { StorageService } from '../services/storageService';

export default function HRDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState<'calendar' | 'interviews'>('calendar');
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newInterview, setNewInterview] = useState({
    candidateName: '',
    position: '',
    interviewer: '',
    meetingLink: '',
    notes: ''
  });

  React.useEffect(() => {
    const savedInterviews = StorageService.getInterviews();
    setInterviews(savedInterviews);
  }, []);

  const availableSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
  ];

  const scheduleNewInterview = () => {
    if (!newInterview.candidateName || !newInterview.position || !newInterview.interviewer) {
      alert('Please fill in all required fields');
      return;
    }

    // Generate interview slots starting tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const slots = InterviewSchedulingService.generateInterviewSlots(tomorrow);
    const selectedSlot = slots[0]; // Use first available slot

    const interview: Interview = {
      id: Date.now(),
      candidateName: newInterview.candidateName,
      position: newInterview.position,
      date: selectedSlot.toISOString().split('T')[0],
      time: selectedSlot.toTimeString().slice(0, 5),
      duration: '1 hour',
      status: 'confirmed',
      meetingLink: newInterview.meetingLink,
      notes: newInterview.notes,
      interviewer: newInterview.interviewer
    };

    // You need to provide candidateId and hrId, replace the placeholders below as needed
    const candidateId = interview.candidateName || 'unknown-candidate';
    const hrId = 'hr-1'; // Replace with actual HR id if available
    StorageService.saveInterview(interview, candidateId, hrId);
    setInterviews([...interviews, interview]);
    setShowScheduleModal(false);
    setNewInterview({
      candidateName: '',
      position: '',
      interviewer: '',
      meetingLink: '',
      notes: ''
    });
    
    alert('Interview scheduled successfully!');
  };

  const updateInterviewStatus = (id: number, status: Interview['status']) => {
    const updatedInterviews = interviews.map(interview =>
      interview.id === id ? { ...interview, status } : interview
    );
    setInterviews(updatedInterviews);
    StorageService.updateInterview(id, { status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success-100 text-success-800';
      case 'pending': return 'bg-warning-100 text-warning-800';
      case 'completed': return 'bg-primary-100 text-primary-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Dashboard</h1>
          <p className="text-gray-600">Manage interviews and candidate scheduling</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span onClick={() => setShowScheduleModal(true)}>Schedule Interview</span>
        </button>
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule New Interview</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Candidate Name *"
                value={newInterview.candidateName}
                onChange={(e) => setNewInterview({...newInterview, candidateName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              
              <input
                type="text"
                placeholder="Position *"
                value={newInterview.position}
                onChange={(e) => setNewInterview({...newInterview, position: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              
              <input
                type="text"
                placeholder="Interviewer *"
                value={newInterview.interviewer}
                onChange={(e) => setNewInterview({...newInterview, interviewer: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              
              <input
                type="url"
                placeholder="Meeting Link (optional)"
                value={newInterview.meetingLink}
                onChange={(e) => setNewInterview({...newInterview, meetingLink: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              
              <textarea
                placeholder="Notes (optional)"
                value={newInterview.notes}
                onChange={(e) => setNewInterview({...newInterview, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={scheduleNewInterview}
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Schedule
              </button>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{interviews.filter(i => i.status !== 'completed').length}</span>
          </div>
          <p className="text-gray-600 font-medium mt-2">Today's Interviews</p>
          <p className="text-sm text-green-600">{interviews.filter(i => i.status === 'confirmed').length} confirmed</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-secondary-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{interviews.length}</span>
          </div>
          <p className="text-gray-600 font-medium mt-2">Active Candidates</p>
          <p className="text-sm text-blue-600">{interviews.filter(i => i.status === 'confirmed').length} scheduled</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-accent-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">2.5h</span>
          </div>
          <p className="text-gray-600 font-medium mt-2">Avg Response Time</p>
          <p className="text-sm text-green-600">-30min improvement</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{interviews.filter(i => i.status === 'completed').length}</span>
          </div>
          <p className="text-gray-600 font-medium mt-2">Completed Today</p>
          <p className="text-sm text-green-600">{interviews.length > 0 ? Math.round((interviews.filter(i => i.status === 'completed').length / interviews.length) * 100) : 0}% completion rate</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Interview Management</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'calendar' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setView('interviews')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'interviews' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Interview List
            </button>
          </div>
        </div>

        {view === 'calendar' ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Date Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Available Time Slots</h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => {
                    const isBooked = interviews.some(interview => interview.time === slot);
                    return (
                      <button
                        key={slot}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                          isBooked
                            ? 'bg-red-100 text-red-800 cursor-not-allowed'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                        disabled={isBooked}
                      >
                        {slot} {isBooked && '(Booked)'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Today's Schedule</h3>
              <div className="space-y-3">
                {interviews.map((interview) => (
                  <div key={interview.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{interview.candidateName}</h4>
                        <p className="text-sm text-gray-600">{interview.position}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                        {interview.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{interview.time}</span>
                      <span>•</span>
                      <span>{interview.duration}</span>
                    </div>
                    {interview.notes && (
                      <p className="text-sm text-gray-500 mt-1">{interview.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Filter Bar */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>All Status</option>
                  <option>Confirmed</option>
                  <option>Pending</option>
                  <option>Completed</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>All Positions</option>
                  <option>Frontend Developer</option>
                  <option>Full Stack Developer</option>
                  <option>Software Engineer</option>
                </select>
              </div>
            </div>

            {/* Interview List */}
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div key={interview.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{interview.candidateName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                          {interview.status}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Position:</span> {interview.position}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {interview.time} ({interview.duration})
                        </div>
                        <div>
                          <span className="font-medium">Meeting:</span> 
                          <a href={interview.meetingLink} className="text-primary-600 hover:text-primary-700 ml-1">
                            Join Call
                          </a>
                        </div>
                      </div>
                      {interview.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Notes:</span> {interview.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors">
                        Edit
                      </button>
                      <button 
                        onClick={() => updateInterviewStatus(interview.id, 'completed')}
                        className="px-3 py-1 text-sm bg-success-600 text-white rounded hover:bg-success-700 transition-colors"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
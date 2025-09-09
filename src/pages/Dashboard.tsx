import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Upload, Target, Calendar, MessageSquare, TrendingUp, Users, Clock, CheckCircle,
  BarChart3, FileText, Star, Award, Briefcase, Eye, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState<any>({});

  React.useEffect(() => {
    // Simulate loading real statistics
    setStats({
      totalResumes: 3,
      totalMatches: 12,
      totalInterviews: 5,
      completedInterviews: 2,
      pendingInterviews: 2,
      confirmedInterviews: 1,
      totalFeedbacks: 3,
      averageMatchScore: 87,
      totalJobs: 8,
      activeApplications: 6
    });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const candidateStats = [
    {
      label: 'Profile Completeness',
      value: '85%',
      icon: User,
      color: 'bg-primary-500',
      change: 'Complete your profile to get better matches',
      trend: 'up'
    },
    {
      label: 'Job Applications',
      value: stats.activeApplications?.toString() || '0',
      icon: Briefcase,
      color: 'bg-secondary-500',
      change: stats.activeApplications > 0 ? `${Math.floor(stats.activeApplications * 0.6)} in review` : 'No applications yet',
      trend: 'up'
    },
    {
      label: 'Interview Invites',
      value: stats.pendingInterviews?.toString() || '0',
      icon: Calendar,
      color: 'bg-accent-500',
      change: stats.confirmedInterviews > 0 ? `${stats.confirmedInterviews} confirmed` : 'No interviews scheduled',
      trend: 'neutral'
    },
    {
      label: 'Match Score',
      value: `${stats.averageMatchScore || 0}%`,
      icon: Target,
      color: 'bg-success-500',
      change: stats.averageMatchScore > 80 ? 'Excellent match rate' : 'Good match potential',
      trend: 'up'
    }
  ];

  const hrStats = [
    {
      label: 'Active Jobs',
      value: stats.totalJobs?.toString() || '0',
      icon: Briefcase,
      color: 'bg-primary-500',
      change: stats.totalJobs > 0 ? `${stats.totalJobs} positions open` : 'No active jobs',
      trend: 'up'
    },
    {
      label: 'Total Applicants',
      value: stats.totalResumes?.toString() || '0',
      icon: Users,
      color: 'bg-secondary-500',
      change: stats.totalResumes > 0 ? `${Math.floor(stats.totalResumes * 0.7)} qualified` : 'No applicants yet',
      trend: 'up'
    },
    {
      label: 'Interviews Today',
      value: stats.pendingInterviews?.toString() || '0',
      icon: Calendar,
      color: 'bg-accent-500',
      change: stats.completedInterviews > 0 ? `${stats.completedInterviews} completed` : 'No interviews today',
      trend: 'neutral'
    },
    {
      label: 'Avg. Response Time',
      value: '2.3h',
      icon: Clock,
      color: 'bg-success-500',
      change: '15% faster this week',
      trend: 'up'
    }
  ];

  const displayStats = user?.role === 'hr' ? hrStats : candidateStats;

  const quickActions = user?.role === 'hr'
    ? [
        { label: 'Post New Job', path: '/hr-dashboard', icon: Plus, color: 'bg-primary-500', description: 'Create job posting' },
        { label: 'Review Candidates', path: '/matches', icon: Users, color: 'bg-secondary-500', description: 'View applicants' },
        { label: 'Schedule Interviews', path: '/hr-dashboard', icon: Calendar, color: 'bg-accent-500', description: 'Manage interviews' }
      ]
    : [
        { label: 'Upload Resume', path: '/upload', icon: Upload, color: 'bg-primary-500', description: 'Get AI analysis' },
        { label: 'Find Jobs', path: '/matches', icon: Target, color: 'bg-secondary-500', description: 'Discover opportunities' },
        { label: 'My Interviews', path: '/candidate-dashboard', icon: Calendar, color: 'bg-accent-500', description: 'Manage schedule' }
      ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {user?.name || 'Guest'}!</h1>
            <p className="text-lg opacity-90">
              {user?.role === 'hr'
                ? 'Manage your recruitment pipeline and find the best talent.'
                : 'Discover your next career opportunity with AI-powered matching.'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {user?.role === 'hr' ? (
                <Users className="h-12 w-12 text-white" />
              ) : (
                <Target className="h-12 w-12 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  {stat.trend === 'up' && (
                    <TrendingUp className="h-4 w-4 text-green-500 inline ml-1" />
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{stat.label}</h3>
              <p className="text-sm text-gray-600">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.path}
                className="group p-6 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 mb-2">
                  {action.label}
                </h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Progress */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {user?.role === 'hr' ? (
              <>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">New applications received</p>
                    <p className="text-sm text-gray-600">{stats.totalResumes || 0} candidates applied this week</p>
                  </div>
                  <span className="text-sm text-gray-500">2h ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-secondary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Interview completed</p>
                    <p className="text-sm text-gray-600">Software Engineer position</p>
                  </div>
                  <span className="text-sm text-gray-500">4h ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-accent-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Job posting published</p>
                    <p className="text-sm text-gray-600">Frontend Developer role is now live</p>
                  </div>
                  <span className="text-sm text-gray-500">1d ago</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">New job matches found</p>
                    <p className="text-sm text-gray-600">{stats.totalMatches || 0} positions match your profile</p>
                  </div>
                  <span className="text-sm text-gray-500">1h ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-secondary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Interview invitation</p>
                    <p className="text-sm text-gray-600">TechCorp Inc. - Software Engineer</p>
                  </div>
                  <span className="text-sm text-gray-500">3h ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-accent-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Application submitted</p>
                    <p className="text-sm text-gray-600">Full Stack Developer at StartupXYZ</p>
                  </div>
                  <span className="text-sm text-gray-500">1d ago</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Progress/Goals */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {user?.role === 'hr' ? 'Hiring Goals' : 'Career Progress'}
          </h2>
          <div className="space-y-6">
            {user?.role === 'hr' ? (
              <>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Monthly Hires</span>
                    <span className="text-sm text-gray-600">3/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Interview Completion</span>
                    <span className="text-sm text-gray-600">8/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-secondary-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Response Time</span>
                    <span className="text-sm text-gray-600">Excellent</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
                    <span className="text-sm text-gray-600">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Applications This Month</span>
                    <span className="text-sm text-gray-600">6/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-secondary-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Interview Success Rate</span>
                    <span className="text-sm text-gray-600">High</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
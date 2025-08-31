import React, { useState } from 'react';
import { Target, Calendar, TrendingUp, RefreshCw, Download, CheckCircle } from 'lucide-react';
// Update the import to match the actual exports from ../services/api
import { JobMatchingService } from '../services/api';
import { ResumeAnalysisService } from '../services/api'; // Adjust the path as needed based on your project structure
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface JobMatch {
  id: number;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  matchingSkills: string[];
  missingSkills: string[];
  requirements?: string[];
  salary?: string;
  type?: string;
}

export default function JobMatches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const currentAnalysisId = localStorage.getItem('currentAnalysisId');
    if (currentAnalysisId) {
      loadJobMatches(currentAnalysisId);
    }
  }, []);

  const loadJobMatches = async (resumeId: string) => {
    try {
      setLoading(true);
      const response = await ResumeAnalysisService.findJobMatches(resumeId);
      setJobMatches(response.matches || []);
      setAnalyzed(true);
    } catch (error) {
      console.error('Failed to load job matches:', error);
      setError('Failed to load job matches');
    } finally {
      setLoading(false);
    }
  };

  const analyzeJobMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const resumeAnalyses = await ResumeAnalysisService.getUserResumes();
      if (resumeAnalyses.length === 0) {
        setError('Please upload and analyze a resume first');
        setLoading(false);
        return;
      }

      const latestResume = resumeAnalyses[resumeAnalyses.length - 1];
      const currentAnalysisId = localStorage.getItem('currentAnalysisId') || latestResume._id;
      
      const response = await ResumeAnalysisService.findJobMatches(currentAnalysisId);
      setJobMatches(response.matches || []);
      setAnalyzed(true);
      localStorage.setItem('currentAnalysisId', currentAnalysisId);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || 'Failed to analyze job matches. Please try again.');
      } else {
        setError('Failed to analyze job matches. Please try again.');
      }
      console.error('Job matching failed:', error);
    }
    setLoading(false);
  };

  const handleApplyToJob = async (job: JobMatch) => {
    setLoading(true);
    setError('');
    try {
      const resumeAnalyses = await ResumeAnalysisService.getUserResumes();
      if (resumeAnalyses.length === 0) {
        setError('Please upload and analyze a resume first');
        setLoading(false);
        return;
      }

      const latestResume = resumeAnalyses[resumeAnalyses.length - 1];
      const currentAnalysisId = localStorage.getItem('currentAnalysisId') || latestResume._id;

      await JobMatchingService.applyToJob(job.id, currentAnalysisId);
      alert(`Successfully applied to ${job.title} at ${job.company}!`);
    } catch (error: any) {
      if (error instanceof Error) {
        alert(error.message || 'Failed to apply to job');
      } else {
        alert('Failed to apply to job');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = (job: JobMatch) => {
    
    if (user?.role === 'hr') {
      alert(`Interview scheduling for ${job.title} at ${job.company} - Feature will open scheduling modal`);
    } else {
      handleViewSlots(job);
    }
  };

  const handleDownloadMatches = () => {
    if (jobMatches.length > 0) {
      const dataStr = JSON.stringify(jobMatches, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `job-matches-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-success-600 bg-success-50';
    if (score >= 80) return 'text-primary-600 bg-primary-50';
    if (score >= 70) return 'text-accent-600 bg-accent-50';
    return 'text-warning-600 bg-warning-50';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Matches</h1>
        <p className="text-gray-600">AI-powered job recommendations based on your resume analysis</p>
      </div>

      {/* Match Summary */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Match Results</h2>
            <p className="opacity-90">
              {analyzed 
                ? `We found ${jobMatches.length} positions that match your profile`
                : 'Click "Analyze Job Matches" to find positions that match your profile'
              }
            </p>
            {error && (
              <div className="mt-3 p-3 bg-red-500 bg-opacity-20 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
          <div className="text-right">
            {analyzed && jobMatches.length > 0 && (
              <>
                <div className="text-3xl font-bold">{jobMatches[0].matchScore}%</div>
                <div className="text-sm opacity-90">Best Match</div>
                <button
                  onClick={handleDownloadMatches}
                  className="mt-2 bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </>
            )}
            {!analyzed && (
              <div className="space-y-2">
                <button
                  onClick={analyzeJobMatches}
                  disabled={loading}
                  className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      <span>Analyze Job Matches</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Cards */}
      {analyzed && jobMatches.length > 0 ? (
        <div className="grid gap-6">
        {jobMatches.map((job) => (
          <div 
            key={job.id}
            className={`bg-white rounded-xl shadow-sm border transition-all cursor-pointer ${
              selectedJob === job.id ? 'border-primary-300 shadow-md' : 'border-gray-200 hover:shadow-md'
            }`}
            onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchColor(job.matchScore)}`}>
                      {job.matchScore}% Match
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-600 mb-2">
                    <span className="font-medium">{job.company}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                  </div>
                  <div className="text-lg font-semibold text-green-600">{job.salary}</div>
                </div>
                <div className="text-right">
                  <TrendingUp className={`h-8 w-8 mb-2 ${job.matchScore >= 90 ? 'text-success-500' : 'text-primary-500'}`} />
                </div>
              </div>

              {/* Match Details */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{job.skillsMatch}%</div>
                  <div className="text-sm text-gray-600">Skills</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{job.experienceMatch}%</div>
                  <div className="text-sm text-gray-600">Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{job.educationMatch}%</div>
                  <div className="text-sm text-gray-600">Education</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{job.matchingSkills?.length || 0}</div>
                  <div className="text-sm text-gray-600">Matching Skills</div>
                </div>
              </div>

              {/* Matching and Missing Skills */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-semibold text-success-700 mb-2">Matching Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.matchingSkills?.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-success-100 text-success-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-warning-700 mb-2">Skills to Develop</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.missingSkills?.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-warning-100 text-warning-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleApplyToJob(job)}
                  className="flex-1 bg-secondary-600 text-white py-2 px-4 rounded-lg hover:bg-secondary-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Apply Now</span>
                </button>
                <button 
                  onClick={() => handleScheduleInterview(job)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>View Slots</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
      ) : analyzed && jobMatches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No job matches found. Please try uploading a different resume.</p>
        </div>
      ) : null}
    </div>
  );
}

function handleViewSlots(job: JobMatch) {
  throw new Error('Function not implemented.');
}

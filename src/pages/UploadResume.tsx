import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Brain, Download, Eye, Edit2 } from 'lucide-react';
import { ResumeService } from '../services/resumeService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

interface ResumeAnalysis {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
    cgpa?: string;
    stream?: string;
  }>;
  certifications?: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

export default function UploadResume() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [extractedData, setExtractedData] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string>('');
  const [analysisId, setAnalysisId] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editableData, setEditableData] = useState<ResumeAnalysis | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf' || 
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        selectedFile.name.endsWith('.docx')) {
      setFile(selectedFile);
      setError('');
      setUploaded(false);
      setExtractedData(null);
      showToast('info', 'File selected successfully');
    } else {
      const errorMsg = 'Please upload a PDF or DOCX file';
      setError(errorMsg);
      showToast('error', errorMsg);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const result = await ResumeService.uploadAndAnalyze(file);
      
      setExtractedData(result.extractedData);
      setEditableData(result.extractedData);
      setAnalysisId(result.resumeId);
      setUploading(false);
      setUploaded(true);
      showToast('success', 'Resume analyzed successfully!');
    } catch (error: any) {
      console.error('Resume processing failed:', error);
      const errorMsg = error.message || 'Failed to process resume. Please try again.';
      setError(errorMsg);
      showToast('error', errorMsg);
      setUploading(false);
    }
  };

  const handleSaveEdits = () => {
    if (editableData) {
      setExtractedData(editableData);
      setShowEditModal(false);
      showToast('success', 'Resume data updated successfully!');
    }
  };

  const handleFindMatches = () => {
    if (extractedData && analysisId) {
      localStorage.setItem('currentAnalysisId', analysisId);
      navigate('/matches');
    }
  };

  const handleDownloadAnalysis = () => {
    if (extractedData) {
      const dataStr = JSON.stringify(extractedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-analysis-${analysisId}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('success', 'Analysis downloaded successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={hideToast} />
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Resume</h1>
        <p className="text-gray-600">Upload your resume to get AI-powered analysis and job matching</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}
        
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragOver 
              ? 'border-primary-400 bg-primary-50' 
              : uploaded 
              ? 'border-success-400 bg-success-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploaded ? (
            <div className="space-y-4">
              <CheckCircle className="h-16 w-16 text-success-500 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Resume Uploaded Successfully!</h3>
                <p className="text-gray-600 mt-2">Your resume has been processed and analyzed by our AI.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-16 w-16 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {file ? 'Ready to Upload' : 'Drop your resume here'}
                </h3>
                <p className="text-gray-600 mt-2">
                  {file ? `Selected: ${file.name}` : 'or click to browse files'}
                </p>
                <p className="text-sm text-gray-500 mt-1">Supports PDF and DOCX files up to 10MB</p>
              </div>
              
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Browse Files
                </label>
                
                {file && (
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="block w-full sm:w-auto px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Processing...' : 'Upload & Analyze'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Processing Status */}
      {uploading && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin">
              <Brain className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-900">Processing Your Resume</h3>
              <p className="text-primary-700">Our AI is extracting key information and analyzing your skills...</p>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Data Preview */}
      {extractedData && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Resume Analysis Results</h2>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit Details</span>
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                Personal Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{extractedData.name}</span></p>
                <p><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-900">{extractedData.email}</span></p>
                <p><span className="font-medium text-gray-700">Phone:</span> <span className="text-gray-900">{extractedData.phone}</span></p>
                {extractedData.linkedin && (
                  <p><span className="font-medium text-gray-700">LinkedIn:</span> <span className="text-blue-600">{extractedData.linkedin}</span></p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <div className="w-2 h-2 bg-secondary-500 rounded-full mr-2"></div>
                Technical Skills ({extractedData.skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {extractedData.skills.map((skill: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <div className="w-2 h-2 bg-accent-500 rounded-full mr-2"></div>
                Work Experience ({extractedData.experience.length} positions)
              </h3>
              <div className="space-y-4">
                {extractedData.experience.map((exp: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-secondary-400">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{exp.duration}</span>
                    </div>
                    <p className="text-secondary-600 font-medium mb-2">{exp.company}</p>
                    <p className="text-sm text-gray-700">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
                Education ({extractedData.education.length} degrees)
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {extractedData.education.map((edu: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{edu.year}</span>
                    </div>
                    <p className="text-gray-600 mb-1">{edu.school}</p>
                    {edu.stream && <p className="text-sm text-gray-500">Stream: {edu.stream}</p>}
                    {edu.cgpa && <p className="text-sm text-gray-500">CGPA: {edu.cgpa}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {extractedData.certifications && extractedData.certifications.length > 0 && (
              <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-warning-500 rounded-full mr-2"></div>
                  Certifications ({extractedData.certifications.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {extractedData.certifications.map((cert: string, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-accent-100 text-accent-800 rounded-full text-sm font-medium"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {extractedData.projects && extractedData.projects.length > 0 && (
              <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-error-500 rounded-full mr-2"></div>
                  Projects ({extractedData.projects.length})
                </h3>
                <div className="space-y-4">
                  {extractedData.projects.map((project: any, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-accent-400">
                      <h4 className="font-semibold text-gray-900 mb-2">{project.name}</h4>
                      <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech: string, techIndex: number) => (
                          <span 
                            key={techIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex space-x-3">
              <button 
                onClick={handleDownloadAnalysis}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Analysis</span>
              </button>
            </div>
            <button 
              onClick={handleFindMatches}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 font-semibold"
            >
              <Eye className="h-4 w-4" />
              <span>Find Job Matches</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Resume Details"
        size="xl"
      >
        {editableData && (
          <div className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editableData.name}
                    onChange={(e) => setEditableData({...editableData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editableData.email}
                    onChange={(e) => setEditableData({...editableData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editableData.phone}
                    onChange={(e) => setEditableData({...editableData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <input
                    type="text"
                    value={editableData.linkedin || ''}
                    onChange={(e) => setEditableData({...editableData, linkedin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
              <textarea
                value={editableData.skills.join(', ')}
                onChange={(e) => setEditableData({...editableData, skills: e.target.value.split(',').map(s => s.trim())})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdits}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
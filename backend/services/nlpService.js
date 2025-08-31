const axios = require('axios');
const keys = require('../config/keys');
const logger = require('../utils/logger');

class NLPService {
  constructor() {
    this.apiKey = keys.deepSeekApiKey;
    this.apiUrl = keys.deepSeekApiUrl;
  }

  async extractResumeData(resumeText) {
    const prompt = `Analyze the following resume and extract structured information. Return ONLY a JSON object with no additional text.

Resume text:
${resumeText}

Extract and return a JSON object with this exact structure:
{
  "name": "Full name",
  "email": "Email address",
  "phone": "Phone number",
  "linkedin": "LinkedIn profile URL",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration": "Duration",
      "description": "Brief description"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "school": "School name",
      "year": "Year",
      "cgpa": "CGPA/GPA",
      "stream": "Field of study"
    }
  ],
  "certifications": ["cert1", "cert2"],
  "projects": [
    {
      "name": "Project name",
      "description": "Description",
      "technologies": ["tech1", "tech2"]
    }
  ]
}`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      const content = response.data.choices[0]?.message?.content;
      return JSON.parse(this.cleanJsonResponse(content));
    } catch (error) {
      logger.error('Resume extraction failed:', error);
      throw new Error('Failed to extract resume data');
    }
  }

  async generateCandidateBrief(resumeData) {
    const prompt = `Create a concise 4-5 line professional brief about this candidate for recruiters.

Candidate Data:
Name: ${resumeData.name}
Email: ${resumeData.email}
Skills: ${resumeData.skills?.join(', ')}
Experience: ${resumeData.experience?.map(exp => `${exp.title} at ${exp.company}`).join(', ')}
Education: ${resumeData.education?.map(edu => `${edu.degree} in ${edu.stream} from ${edu.school}`).join(', ')}

Create a brief that highlights:
1. Key qualifications
2. Relevant experience
3. Technical skills
4. Educational background

Keep it professional and concise (4-5 lines maximum).`;

    try {
      const response = await axios.post(this.apiUrl, {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 300
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.data.choices[0]?.message?.content?.trim();
    } catch (error) {
      logger.error('Brief generation failed:', error);
      return `${resumeData.name} is a qualified candidate with experience in ${resumeData.skills?.slice(0, 3).join(', ')}. They have worked as ${resumeData.experience?.[0]?.title} and hold a ${resumeData.education?.[0]?.degree}. Strong technical background with relevant industry experience.`;
    }
  }

  cleanJsonResponse(response) {
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return response.substring(jsonStart, jsonEnd + 1);
    }
    
    return response;
  }
}

module.exports = new NLPService();
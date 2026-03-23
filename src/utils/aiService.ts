import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const aiService = {
  /**
   * Generates a concise AI summary for a project report based on provided metrics.
   */
  async generateReportSummary(data: {
    projectName: string;
    groupName: string;
    totalTasks: number;
    completedTasks: number;
    lateSubmissions: number;
    completionRate: number;
    memberStats: Array<{
      name: string;
      assigned: number;
      completed: number;
      late: number;
      rate: number;
    }>;
  }) {
    if (!API_KEY) {
      console.warn('Gemini API Key is missing. Skipping AI summary.');
      return 'AI Summary is currently unavailable (Missing API Key).';
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        You are an expert project management analyst. Analyze the following project performance data and provide a concise, professional summary (max 3-4 sentences) for a group report.
        
        Project: ${data.projectName}
        Group: ${data.groupName}
        Overall Metrics:
        - Total Tasks: ${data.totalTasks}
        - Completed Tasks: ${data.completedTasks}
        - Late Submissions: ${data.lateSubmissions}
        - Completion Rate: ${data.completionRate}%
        
        Member Performance:
        ${data.memberStats.map(m => `- ${m.name}: ${m.completed}/${m.assigned} tasks completed (${m.late} late).`).join('\n')}
        
        Focus on identifying the top performer, any potential bottlenecks, and an overall assessment of the group's accountability. Keep it encouraging but objective.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return 'Failed to generate AI summary. Please check your connection and API limits.';
    }
  }
};

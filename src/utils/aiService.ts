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
      console.log('Attempting AI summary generation...');
      
      const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.0-pro'];
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          console.log(`Trying model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });

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
          console.log(`Successfully generated summary using ${modelName}`);
          return response.text().trim();
        } catch (err: any) {
          console.warn(`Model ${modelName} failed:`, err.message);
          lastError = err;
          continue; // Try next model
        }
      }

      throw lastError || new Error('All models failed to generate content');
    } catch (error: any) {
      console.error('CRITICAL: Gemini API Failure after fallbacks:', error);
      return `Failed to generate AI summary. Error: ${error.message || 'Unknown error'}. Please verify API access for these models.`;
    }
  }
};

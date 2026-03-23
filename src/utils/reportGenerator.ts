import { Project, Task, User } from '../types';
import { AccountabilityEngine } from '../lib/AccountabilityEngine';
import { format } from 'date-fns';
import { SIT_REPORT_TEMPLATE } from './reportTemplate';
import { aiService } from './aiService';

export const generateGroupReport = async (project: Project, tasks: Task[], members: User[]): Promise<string> => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const lateSubmissions = tasks.filter(t => {
        if (t.isLate) return true;
        if (t.status === 'done' && t.completedAt && t.deadline) {
            // Note: Firebase timestamps are handled by checking .toMillis()
            try {
                return t.completedAt.toMillis() > t.deadline.toMillis();
            } catch (e) { return false; }
        }
        return false;
    }).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const memberStats = members.map(member => {
        const stats = AccountabilityEngine.calculateMemberStats(member.uid, tasks, project);
        const memberCompletionRate = stats.tasksAssigned > 0 
            ? Math.round((stats.tasksCompleted / stats.tasksAssigned) * 100) 
            : 0;
        return {
            name: member.displayName || member.username || 'Anonymous',
            assigned: stats.tasksAssigned,
            completed: stats.tasksCompleted,
            late: stats.tasksLate,
            rate: memberCompletionRate
        };
    });

    const reportDate = format(new Date(), 'PPPP p');

    // Generate AI Summary
    const aiSummary = await aiService.generateReportSummary({
        projectName: project.name || 'N/A',
        groupName: project.course || 'N/A',
        totalTasks,
        completedTasks,
        lateSubmissions,
        completionRate,
        memberStats
    });

    // Generate member rows HTML
    const memberRows = memberStats.map(m => `
        <tr>
            <td>${m.name}</td>
            <td>${m.assigned}</td>
            <td>${m.completed}</td>
            <td>${m.late}</td>
            <td>${m.rate}%</td>
        </tr>
    `).join('');

    // Inject data into SIT Template (Global replacement for multiple occurrences)
    let html = SIT_REPORT_TEMPLATE;
    html = html.split('{{group_name}}').join(project.name || 'N/A');
    html = html.split('{{project_name}}').join(project.course || 'N/A');
    html = html.split('{{total_tasks}}').join(totalTasks.toString());
    html = html.split('{{overall_completion}}').join(completionRate.toString());
    html = html.split('{{member_rows}}').join(memberRows);
    html = html.split('{{generated_date}}').join(reportDate);
    html = html.split('{{ai_summary}}').join(aiSummary);

    return html;
};

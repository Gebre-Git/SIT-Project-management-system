import { Project, Task, User } from '../types';
import { AccountabilityEngine } from '../lib/AccountabilityEngine';
import { format } from 'date-fns';

export const generateGroupReport = (project: Project, tasks: Task[], members: User[]): string => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const lateSubmissions = tasks.filter(t => {
        if (t.isLate) return true;
        if (t.status === 'done' && t.completedAt && t.deadline) {
            return t.completedAt.toMillis() > t.deadline.toMillis();
        }
        return false;
    }).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const onTimeRate = completedTasks > 0 ? Math.round(((completedTasks - lateSubmissions) / completedTasks) * 100) : 0;

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

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Performance Report - ${project.name}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        :root {
            --primary: #2563eb;
            --slate-900: #0f172a;
            --slate-600: #475569;
            --slate-400: #94a3b8;
            --slate-100: #f1f5f9;
        }

        body {
            font-family: 'Inter', -apple-system, sans-serif;
            color: var(--slate-900);
            line-height: 1.5;
            margin: 0;
            padding: 40px;
            background: white;
        }

        @media print {
            body { padding: 0; }
            .no-print { display: none; }
        }

        .header {
            text-align: center;
            border-bottom: 4px solid var(--primary);
            padding-bottom: 30px;
            margin-bottom: 40px;
        }

        .logo {
            font-size: 28px;
            font-weight: 900;
            color: var(--primary);
            text-transform: uppercase;
            letter-spacing: -0.025em;
            margin-bottom: 5px;
        }

        .motto {
            font-size: 12px;
            font-weight: 700;
            color: var(--slate-400);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 20px;
        }

        .report-title {
            font-size: 24px;
            font-weight: 900;
            text-transform: uppercase;
            margin: 0;
        }

        .report-meta {
            font-size: 12px;
            color: var(--slate-600);
            margin-top: 5px;
        }

        section {
            margin-bottom: 40px;
        }

        h2 {
            font-size: 18px;
            font-weight: 900;
            text-transform: uppercase;
            border-left: 4px solid var(--primary);
            padding-left: 15px;
            margin-bottom: 25px;
            color: var(--slate-900);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
        }

        .stat-card {
            padding: 20px;
            background: var(--slate-100);
            border-radius: 12px;
        }

        .stat-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--slate-600);
            letter-spacing: 0.05em;
        }

        .stat-value {
            font-size: 20px;
            font-weight: 900;
            color: var(--slate-900);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th {
            text-align: left;
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            color: var(--slate-400);
            padding: 12px 15px;
            border-bottom: 2px solid var(--slate-100);
        }

        td {
            padding: 15px;
            font-size: 14px;
            border-bottom: 1px solid var(--slate-100);
        }

        .member-name {
            font-weight: 700;
        }

        .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 10px;
            color: var(--slate-400);
            border-top: 1px solid var(--slate-100);
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Shaggar Institute of Technology</div>
        <div class="motto">Excellence in Innovation & Technology</div>
        <h1 class="report-title">Group Project Performance Report</h1>
        <div class="report-meta">Generated on ${reportDate}</div>
    </div>

    <section>
        <h2>Group Analytics</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Group Name</div>
                <div class="stat-value">${project.name}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Project / Course</div>
                <div class="stat-value">${project.course}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Completion Rate</div>
                <div class="stat-value">${completionRate}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Tasks: Completed vs Total</div>
                <div class="stat-value">${completedTasks} / ${totalTasks}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Late Submissions</div>
                <div class="stat-value">${lateSubmissions}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">On-Time Rate</div>
                <div class="stat-value">${onTimeRate}%</div>
            </div>
        </div>
    </section>

    <section>
        <h2>Member Statistics</h2>
        <table>
            <thead>
                <tr>
                    <th>Member Name</th>
                    <th>Assigned</th>
                    <th>Completed</th>
                    <th>Late</th>
                    <th>Rate</th>
                </tr>
            </thead>
            <tbody>
                ${memberStats.map(m => `
                    <tr>
                        <td class="member-name">${m.name}</td>
                        <td>${m.assigned}</td>
                        <td>${m.completed}</td>
                        <td>${m.late}</td>
                        <td>${m.rate}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </section>

    <div class="footer">
        © ${new Date().getFullYear()} CrewSpace - Academic Accountability System
    </div>

    <script>
        // Auto-open print dialog when ready (optional, maybe keep it manual for preview)
        // window.onload = () => window.print();
    </script>
</body>
</html>
    `;
};

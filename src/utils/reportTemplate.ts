export const SIT_REPORT_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SIT - Group Project Performance Report Template</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&display=swap');
        
        :root {
            /* SIT Brand Colors */
            --sit-daintree: #02272F;
            --sit-orange: #F15A24;
            --sit-teal: #8AC4C7;
            --sit-yellow: #EEBE41;
            --sit-light-blue: #CFDFDC;
            --sit-light-yellow: #EAE4D2;
            
            --text-main: var(--sit-daintree);
            --text-muted: #64748b;
            --border-light: #e2e8f0;
            --corner-marker: #D1D5DB;
        }

        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        body {
            font-family: 'Poppins', sans-serif;
            color: var(--text-main);
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            line-height: 1.6;
        }

        /* Page Layout */
        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            position: relative;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
        }

        @media print {
            body { background: none; }
            .page { 
                box-shadow: none; 
                margin: 0;
                width: 100%;
                min-height: 100vh;
            }
        }

        .main-content {
            flex: 1;
        }

        /* Corner Markers */
        .corner {
            position: absolute;
            width: 15mm;
            height: 15mm;
            border: 1px solid var(--corner-marker);
            z-index: 10;
        }
        .corner-tl { top: 10mm; left: 10mm; border-right: none; border-bottom: none; }
        .corner-tr { top: 10mm; right: 10mm; border-left: none; border-bottom: none; }
        .corner-bl { bottom: 10mm; left: 10mm; border-right: none; border-top: none; }
        .corner-br { bottom: 10mm; right: 10mm; border-left: none; border-top: none; }

        /* Header Section */
        .header {
            text-align: center;
            margin-top: 10mm;
            margin-bottom: 20mm;
            position: relative;
        }

        .logo-placeholder {
            max-width: 120mm;
            margin: 0 auto;
        }

        .logo-text-top {
            font-weight: 900;
            font-size: 24pt;
            letter-spacing: 0.05em;
            margin: 0;
            text-transform: uppercase;
        }

        .motto {
            font-size: 10pt;
            font-weight: 700;
            color: var(--sit-orange);
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-top: 5mm;
        }

        h1.report-title {
            font-size: 18pt;
            font-weight: 900;
            color: var(--sit-daintree);
            margin-bottom: 25mm;
            text-transform: capitalize;
        }

        /* Section Headings */
        h2.section-title {
            font-size: 14pt;
            font-weight: 900;
            color: var(--sit-daintree);
            text-transform: capitalize;
            margin-top: 30mm;
            margin-bottom: 10mm;
        }

        /* Info Grid (Placeholders) */
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10mm;
            margin-bottom: 20mm;
        }

        .info-item {
            border-bottom: 1px solid var(--border-light);
            padding-bottom: 2mm;
        }

        .label {
            font-size: 8pt;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--text-muted);
            display: block;
            margin-bottom: 1mm;
        }

        .value {
            font-size: 11pt;
            font-weight: 700;
        }

        /* Data Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15mm;
        }

        th {
            text-align: left;
            font-size: 9pt;
            font-weight: 900;
            text-transform: uppercase;
            padding: 4mm 2mm;
            border-bottom: 2pt solid var(--sit-daintree);
            color: var(--sit-daintree);
        }

        td {
            padding: 4mm 2mm;
            font-size: 10pt;
            border-bottom: 1px solid var(--border-light);
        }

        /* Footer */
        .generated-date {
            text-align: right;
            font-size: 12pt;
            font-weight: 900;
            color: var(--sit-daintree);
            margin-bottom: 2mm;
        }

        .page-footer {
            text-align: center;
            font-size: 8pt;
            font-weight: 700;
            color: var(--sit-teal);
            text-transform: uppercase;
            letter-spacing: 0.2em;
            padding-top: 5mm;
            border-top: 1px solid var(--border-light);
        }

        /* Accent Elements */
        .accent-bar {
            height: 2pt;
            background: linear-gradient(to right, var(--sit-orange), var(--sit-yellow));
            width: 50mm;
            margin: 5mm 0;
        }

        .completion-bar {
            height: 8pt;
            background: var(--sit-light-blue);
            border-radius: 4pt;
            overflow: hidden;
            width: 40mm;
        }

        .completion-fill {
            height: 100%;
            background: var(--sit-teal);
        }

        /* Interactive Elements */
        .no-print {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        @media print {
            .no-print { display: none !important; }
        }

        .download-btn {
            position: absolute;
            top: 20mm;
            right: 20mm;
            background-color: var(--sit-orange);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-family: 'Poppins', sans-serif;
            font-size: 10pt;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(241, 90, 36, 0.3);
            z-index: 1000;
            transition: all 0.2s ease;
        }

        .download-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(241, 90, 36, 0.4);
            background-color: #f36d3e;
        }

        .download-btn:active {
            transform: translateY(0);
        }

        /* AI Summary Card Styling */
        .ai-summary-card {
            background-color: #ffffff;
            border: none;
            border-left: 4px solid var(--sit-teal);
            padding: 0 0 0 15px;
            margin-top: 5mm;
            position: relative;
        }

        .ai-text {
            font-size: 12pt;
            font-style: italic;
            color: var(--sit-daintree);
            margin: 0;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="page">
        <!-- Corner Markers -->
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>

        <div class="main-content">

        <div class="header">
            <!-- SIT Logo (Updated from provided image) -->
            <div class="logo-placeholder">
                <img src="data:image/png;base64,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" alt="SIT Logo" style="height: 60px; margin-bottom: 2mm;">
                <div class="motto">Excellence in Science and Technology</div>
            </div>
        </div>

        <h1 class="report-title">Group Project Performance Report</h1>

        <h2 class="section-title">Group Analytics</h2>
        <div class="info-grid">
            <div class="info-item">
                <span class="label">Group Name</span>
                <span class="value">{{group_name}}</span>
            </div>
            <div class="info-item">
                <span class="label">Project / Course</span>
                <span class="value">{{project_name}}</span>
            </div>
            <div class="info-item">
                <span class="label">Total Tasks</span>
                <span class="value">{{total_tasks}}</span>
            </div>
            <div class="info-item">
                <span class="label">Overall Completion</span>
                <span class="value">{{overall_completion}}%</span>
                <div class="completion-bar" style="margin-top: 2mm;">
                    <div class="completion-fill" style="width: {{overall_completion}}%;"></div>
                </div>
            </div>
        </div>

        <h2 class="section-title">Member Analytics</h2>
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
                <!-- Template Rows -->
                {{member_rows}}
            </tbody>
        </table>

        <!-- AI Powered Insights Section -->
        <h2 class="section-title">AI-Powered Insights</h2>
        <div class="ai-summary-card">

            <p class="ai-text">
                {{ai_summary}}
            </p>
        </div>
    </div> <!-- .main-content -->

        <div class="generated-date">Generated: {{generated_date}}</div>

        <!-- Download Button (Visible only on web view, ignored by PDF generator) -->
        <button onclick="downloadPDF()" class="no-print download-btn" data-html2canvas-ignore>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PDF
        </button>

        <div class="page-footer">
            EXCELLENCE IN INNOVATION & TECHNOLOGY
        </div>
    </div>

    <!-- PDF Generation Script -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <script>
        function downloadPDF() {
            const element = document.querySelector('.page');
            const originalHeight = element.style.height;
            
            // Calculate height in pixels and convert to A4 multiples
            // Standard A4 at 96 DPI is ~1123px. We'll use mm for calculation.
            const rect = element.getBoundingClientRect();
            const pxPerMm = rect.width / 210; // 210mm is A4 width
            const currentHeightMm = rect.height / pxPerMm;
            const totalPages = Math.ceil(currentHeightMm / 297);
            
            // Force container to be exact multiple of A4 height (minus safety margin to prevent blank page)
            element.style.height = (totalPages * 297 - 0.5) + 'mm';

            const opt = {
                margin: 0,
                filename: 'SIT_Report_{{group_name}}.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true,
                    logging: false,
                    letterRendering: true
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Generate and save
            html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
                // Return to original height after PDF is captured
                element.style.height = originalHeight;
            }).save();
        }
    </script>
</body>
</html>
`;

export interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: string
  systemPrompt: string
  sampleNotes: string
  suggestedSections: string[]
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "executive-summary",
    name: "Executive Summary & Brief",
    description: "Synthesizes strategic notes, meeting highlights, and business updates into an executive deliverable.",
    icon: "TrendingUp",
    sampleNotes: `Q3 Review Notes:
- Revenue grew by 24% YoY reaching $4.2M, beating target of $3.9M.
- Customer Acquisition Cost (CAC) dropped from $420 to $310 due to organic referral loop.
- Churn spiked slightly in mid-market tier (from 1.8% to 2.4%) due to onboarding delays.
- Product team shipped v2 enterprise SSO and analytics dashboard.
- Main risks: competitor launched budget tier; European expansion delayed by GDPR audit pending until Nov.
- Recommendation: accelerate customer success hiring for mid-market; approve $50k marketing spend for enterprise campaign.`,
    suggestedSections: [
      "Executive Summary",
      "Financial & KPI Highlights",
      "Strategic Accomplishments",
      "Critical Risks & Mitigations",
      "Leadership Recommendations & Next Steps"
    ],
    systemPrompt: `You are an elite management consultant and executive ghostwriter.
Transform the provided raw notes into an Executive Summary & Brief.
Adhere to the following guidelines:
1. Write with crisp, authoritative, high-density prose. Avoid fluff, unnecessary adjectives, and filler phrases.
2. Structure the document with markdown headers (# Title, ## Section, ### Subsection).
3. Use bullet points and clean markdown tables where numerical data, comparisons, or KPI metrics are present.
4. Highlight key takeaways, risks, and strategic decisions explicitly.`
  },
  {
    id: "incident-postmortem",
    name: "Incident Post-Mortem",
    description: "Translates outage logs, timelines, and incident chat threads into a structured engineering post-mortem.",
    icon: "AlertTriangle",
    sampleNotes: `Incident 2026-09-28: Payment Gateway Timeout
- 14:15 UTC: Alert fired on PagerDuty - API checkout service error rate exceeded 5%.
- 14:22 UTC: On-call engineer (Dave) acknowledged. Discovered Redis connection pool exhaustion.
- 14:35 UTC: Database queries backed up; checkout service began returning 504 Gateway Timeout.
- 14:48 UTC: Root cause identified: release v3.4.1 introduced un-indexed query on orders table during webhook processing.
- 15:02 UTC: Rolled back v3.4.1 to v3.4.0. Connection pool drained.
- 15:15 UTC: All health checks green. Error rate returned to baseline (0.01%).
- Total downtime: 60 minutes. Estimated affected users: ~1,400 carts dropped ($34k GMV impacted).
- Action items: Add index on orders.webhook_event_id, add Redis pool size circuit breaker, revise PR review checklist for DB migrations.`,
    suggestedSections: [
      "Incident Overview & Severity",
      "User & Financial Impact",
      "Detailed Timeline (UTC)",
      "Technical Root Cause Analysis",
      "Resolution & Recovery",
      "Corrective & Preventive Action Items (Owners & Priorities)"
    ],
    systemPrompt: `You are a Principal Reliability and Systems Engineer writing a blameless Incident Post-Mortem (RCA).
Transform the provided notes into an engineering post-mortem.
Adhere to these guidelines:
1. Maintain an objective, blameless engineering tone. Focus on system vulnerabilities and process gaps rather than human error.
2. Provide a precise chronological timeline in table format.
3. Clearly dissect the direct trigger versus systemic root causes (5-Whys methodology).
4. Organize action items into P0/P1 preventive measures with concrete deliverables.`
  },
  {
    id: "project-status",
    name: "Weekly Project Status",
    description: "Turns fragmented task updates and sprint notes into a stakeholder-ready status report.",
    icon: "CheckCircle2",
    sampleNotes: `Project Phoenix - Week 39 Update:
- Overall status: AMBER (due to mobile SDK delay).
- Shipped this week: Auth v2 integration, user profile redesign, PostgreSQL migration completed without data loss.
- In progress: Stripe billing portal setup (80% done), iOS Swift bridging (blocked).
- Blockers: iOS developer on sick leave; waiting on third-party KYC vendor API key approval.
- Budget: $42,000 spent out of $60,000 Q3 allocation (on track).
- Next week goals: Unblock iOS SDK, conduct staging load test, finalize enterprise SLA documentation.`,
    suggestedSections: [
      "Project Health & Traffic Light Status",
      "Key Accomplishments This Week",
      "Current Blockers & Roadblocks",
      "Upcoming Milestones & Deliverables",
      "Budget & Resource Tracking"
    ],
    systemPrompt: `You are a Senior Technical Project Manager.
Transform the provided raw notes into a crisp, transparent Weekly Project Status Report.
Adhere to these guidelines:
1. Display an upfront Executive Health Indicator (Green / Amber / Red) with rationale.
2. Separate completed work from in-progress deliverables clearly.
3. Categorize blockers with explicit impact and unblocking requests.
4. Format dates, owners, and milestones using markdown tables or checklists.`
  },
  {
    id: "meeting-minutes",
    name: "Meeting Minutes & Action Items",
    description: "Converts conversational meeting notes into structured decisions, key discussions, and assigned tasks.",
    icon: "Users",
    sampleNotes: `Product Strategy Sync - Oct 1st
Attendees: Sarah (PM), Leo (Tech Lead), Maya (Design), Alex (Marketing)
- Discussion: Maya presented new onboarding flow wireframes. Team liked step-by-step wizard over single form.
- Tech feasibility: Leo raised concern regarding mobile camera latency in Step 2. Decision: make document upload optional in first session.
- Marketing: Alex needs final feature screenshot by Oct 10 for launch announcement newsletter.
- Pricing discussion: debated $29/mo vs $49/mo pro plan. Decided to launch at $39/mo with early bird discount.
- Next sync scheduled for next Thursday 10 AM.`,
    suggestedSections: [
      "Meeting Metadata (Attendees, Date, Objective)",
      "Key Discussions & Context",
      "Decisions Reached & Consensus",
      "Action Items (Assignee, Deadline, Deliverable)",
      "Future Agenda Items"
    ],
    systemPrompt: `You are an executive chief of staff.
Transform the conversational meeting notes into actionable Meeting Minutes.
Adhere to these guidelines:
1. Capture decisions unequivocally so there is no ambiguity.
2. Format Action Items into an explicit markdown checklist with Assignee and Deadlines.
3. Summarize discussions into concise, bulleted themes rather than transcript dialogue.`
  },
  {
    id: "research-brief",
    name: "Research & Analysis Brief",
    description: "Synthesizes customer discovery, competitive analysis, or literature notes into an insight brief.",
    icon: "BookOpen",
    sampleNotes: `User Interviews on Report Automation (5 B2B users):
- 4 out of 5 users copy-paste notes between Notion, Slack, and Google Docs before sending to clients.
- Average time spent drafting reports: 2.5 hours every Friday.
- Pain points: formatting PDF headers, remembering consistent branding, summarizing technical jargon for non-tech clients.
- Willingness to pay: $30-$80/month if export is 1-click DOCX/PDF.
- Key quote from User 3: 'I know what happened in the meeting, I just hate spending 45 minutes turning bullet points into full sentences.'`,
    suggestedSections: [
      "Executive Abstract",
      "Methodology & Sample Size",
      "Core Insights & Emergent Themes",
      "Direct Quotes & User Verbatims",
      "Commercial & Product Implications"
    ],
    systemPrompt: `You are a Principal Product Researcher and Industry Analyst.
Transform the research notes into a compelling Research & Analysis Brief.
Adhere to these guidelines:
1. Highlight core patterns, quantitative metrics, and qualitative evidence.
2. Present user pain points and willingness to pay with clear analytical conclusions.
3. Draw concrete product opportunities and strategic implications.`
  }
]

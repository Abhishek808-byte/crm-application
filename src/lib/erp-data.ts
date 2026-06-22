// Mock operational data for the demo platform.

// ── Contacts / Leads ─────────────────────────────────────────────────────────

export type ContactStage =
  | "new" | "contacted" | "qualified" | "proposal_sent"
  | "negotiation" | "won" | "lost";

export interface Contact {
  id: string;
  name: string;
  initials: string;
  title: string;
  company: string;
  domain: string;
  email: string;
  phone?: string;
  location?: string;
  industry?: string;
  source?: string;
  stage: ContactStage;
  icpScore: number;
  dealValue?: string;
  closeDate?: string;
  demoDate?: string;
  lastActivity?: string;
  intent?: "High" | "Medium" | "Low";
  employees?: string;
  funding?: string;
  selected?: boolean;
  labels?: string[];
}

export const STAGE_META: Record<ContactStage, { label: string; color: string; bg: string; group: "contact" | "lead" | "deal" | "won" | "lost" }> = {
  new:           { label: "New",           color: "text-blue-700",   bg: "bg-blue-50",    group: "contact" },
  contacted:     { label: "Contacted",     color: "text-indigo-700", bg: "bg-indigo-50",  group: "lead"    },
  qualified:     { label: "Qualified",     color: "text-cyan-700",   bg: "bg-cyan-50",    group: "lead"    },
  proposal_sent: { label: "Proposal Sent", color: "text-amber-700",  bg: "bg-amber-50",   group: "deal"    },
  negotiation:   { label: "Negotiation",   color: "text-violet-700", bg: "bg-violet-50",  group: "deal"    },
  won:           { label: "Won",           color: "text-green-700",  bg: "bg-green-100",  group: "won"     },
  lost:          { label: "Lost",          color: "text-red-700",    bg: "bg-red-50",     group: "lost"    },
};

export const PIPELINE_STAGES: { key: ContactStage; label: string; num: string; description: string }[] = [
  { key: "new",           label: "New",           num: "01", description: "Newly added contacts" },
  { key: "contacted",     label: "Contacted",     num: "02", description: "Initial outreach made" },
  { key: "qualified",     label: "Qualified",     num: "03", description: "Meets ICP criteria" },
  { key: "proposal_sent", label: "Proposal Sent", num: "04", description: "Proposal delivered to prospect" },
  { key: "negotiation",   label: "Negotiation",   num: "05", description: "Active negotiation in progress" },
  { key: "won",           label: "Won",           num: "06", description: "Deal closed and won" },
];

export const STAGE_CONVERSIONS = [
  { from: "New",           to: "Contacted",     pct: 85 },
  { from: "Contacted",     to: "Qualified",     pct: 72 },
  { from: "Qualified",     to: "Proposal Sent", pct: 88 },
  { from: "Proposal Sent", to: "Negotiation",   pct: 61 },
  { from: "Negotiation",   to: "Won",           pct: 46 },
];

export const CONTACTS: Contact[] = [
  { id: "C-001", name: "Arjun Mehta",       initials: "AM", title: "CTO",                    company: "Northstar Industries",   domain: "northstar.io",      email: "arjun@northstar.io",      phone: "+91 98765 43210", location: "Bengaluru", industry: "SaaS",                  source: "LinkedIn",       stage: "negotiation",   icpScore: 91, dealValue: "$124,000", closeDate: "2026-06-30", lastActivity: "1d ago",  intent: "High",   employees: "500-1000", funding: "Series C"    },
  { id: "C-002", name: "Sofia Reyes",        initials: "SR", title: "VP Marketing",           company: "Verdant Pharma",         domain: "verdantpharma.com", email: "sreyes@verdantpharma.com", location: "Mexico City", industry: "Healthcare",            source: "Domain enrich",  stage: "proposal_sent", icpScore: 83, dealValue: "$89,000",  closeDate: "2026-07-12", lastActivity: "3d ago",  intent: "Medium", employees: "1000+",    funding: "Public"      },
  { id: "C-003", name: "James O'Brien",      initials: "JO", title: "Head of Engineering",    company: "Loom & Co",              domain: "loomandco.com",     email: "jobrien@loomandco.com",   location: "Dublin",      industry: "Fintech",               source: "visitor.iq",     stage: "contacted",     icpScore: 75, dealValue: "$42,000",  closeDate: "2026-08-01", lastActivity: "5h ago",  intent: "High",   employees: "200-500",  funding: "Series B"    },
  { id: "C-004", name: "Mei Lin",            initials: "ML", title: "Director of Operations", company: "Pixelforge Studios",     domain: "pixelforge.io",     email: "mei@pixelforge.io",       location: "Singapore",   industry: "Media & Entertainment", source: "LinkedIn",       stage: "qualified",     icpScore: 62, dealValue: "$28,500",  lastActivity: "2d ago",  intent: "Medium", employees: "50-200",   funding: "Seed"        },
  { id: "C-005", name: "David Okonkwo",      initials: "DO", title: "CEO",                    company: "Helix Labs",             domain: "helixlabs.ai",      email: "david@helixlabs.ai",      location: "Lagos",       industry: "Biotech",               source: "Domain enrich",  stage: "contacted",     icpScore: 88, lastActivity: "1d ago",  intent: "High",   employees: "50-200",   funding: "Series A"    },
  { id: "C-006", name: "Emma Schulz",        initials: "ES", title: "Product Manager",        company: "CloudWave Solutions",    domain: "cloudwave.de",      email: "emma@cloudwave.de",       location: "Berlin",      industry: "Cloud Infrastructure",  source: "visitor.iq",     stage: "new",           icpScore: 45, lastActivity: "7d ago",  intent: "Low",    employees: "200-500",  funding: "Bootstrapped" },
  { id: "C-007", name: "Lucas Ferreira",     initials: "LF", title: "Sales Director",         company: "Brio Commerce",          domain: "briocommerce.com",  email: "lucas@briocommerce.com",  location: "São Paulo",   industry: "E-Commerce",            source: "LinkedIn",       stage: "won",           icpScore: 95, dealValue: "$156,000", closeDate: "2026-05-28", lastActivity: "Closed",  intent: "High",   employees: "1000+",    funding: "Series D"    },
  { id: "C-008", name: "Priya Kapoor",       initials: "PK", title: "Engineering Manager",    company: "TechNova Pvt Ltd",       domain: "technova.in",       email: "priya@technova.in",       location: "Hyderabad",   industry: "SaaS",                  source: "Domain enrich",  stage: "negotiation",   icpScore: 79, dealValue: "$55,000",  closeDate: "2026-06-28", lastActivity: "2h ago",  intent: "High",   employees: "200-500",  funding: "Series A"    },
  { id: "C-009", name: "Tomáš Novák",        initials: "TN", title: "CIO",                    company: "Skoda Digital",          domain: "skodadigital.cz",   email: "tomas@skodadigital.cz",   location: "Prague",      industry: "Automotive",            source: "visitor.iq",     stage: "qualified",     icpScore: 58, dealValue: "$38,000",  lastActivity: "4d ago",  intent: "Medium", employees: "1000+",    funding: "Public"      },
  { id: "C-010", name: "Aiko Nakamura",      initials: "AN", title: "VP Sales",               company: "Synapse Co",             domain: "synapse.co.jp",     email: "aiko@synapse.co.jp",      location: "Tokyo",       industry: "AI / ML",               source: "LinkedIn",       stage: "proposal_sent", icpScore: 86, dealValue: "$72,000",  closeDate: "2026-07-20", lastActivity: "6h ago",  intent: "High",   employees: "50-200",   funding: "Series B"    },
  { id: "C-011", name: "Ben Carter",         initials: "BC", title: "Founder",                company: "Groveyard",              domain: "groveyard.io",      email: "ben@groveyard.io",        location: "Austin",      industry: "AgriTech",              source: "visitor.iq",     stage: "new",           icpScore: 0,  lastActivity: "3d ago",  intent: "Medium", employees: "10-50",    funding: "Pre-seed"    },
  { id: "C-012", name: "Natasha Orlova",     initials: "NO", title: "CFO",                    company: "MedRoute Inc",           domain: "medroute.com",      email: "natasha@medroute.com",    location: "Chicago",     industry: "Healthcare",            source: "Domain enrich",  stage: "lost",          icpScore: 31, lastActivity: "2w ago",  intent: "Low",    employees: "50-200",   funding: "Bootstrapped" },
];

// ── Tasks ─────────────────────────────────────────────────────────────────────

export type TaskType = "qualify" | "review" | "followup" | "bookdemo" | "close" | "task" | "call" | "meeting" | "email";
export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  priority: TaskPriority;
  status: "open" | "completed";
  contactId?: string;
  contactName?: string;
  company?: string;
  dueDate?: string;
  assignee: string;
  notes?: string;
  isAuto?: boolean;
}

export const TASK_TYPE_META: Record<TaskType, { label: string; icon: string; color: string; bg: string }> = {
  qualify:  { label: "Qualify Lead",  icon: "✦", color: "#0EA5E9", bg: "#F0F9FF" },
  review:   { label: "Review Email",  icon: "✉", color: "#F59E0B", bg: "#FFFBEB" },
  followup: { label: "Follow-up",     icon: "↩", color: "#8B5CF6", bg: "#F5F3FF" },
  bookdemo: { label: "Book Demo",     icon: "▶", color: "#6366F1", bg: "#EEF2FF" },
  close:    { label: "Close Deal",    icon: "★", color: "#10B981", bg: "#ECFDF5" },
  task:     { label: "Task",          icon: "✓", color: "#6B7280", bg: "#F3F4F6" },
  call:     { label: "Call",          icon: "📞", color: "#0EA5E9", bg: "#F0F9FF" },
  meeting:  { label: "Meeting",       icon: "📅", color: "#8B5CF6", bg: "#F5F3FF" },
  email:    { label: "Email",         icon: "✉", color: "#F59E0B", bg: "#FFFBEB" },
};

export const TASKS: Task[] = [
  { id: "T-001", title: "Qualify lead: Loom & Co", type: "qualify",  label: "Qualify Lead",  icon: "✦", color: "#0EA5E9", bgColor: "#F0F9FF", priority: "high",   status: "open", contactId: "C-003", contactName: "James O'Brien", company: "Loom & Co",             dueDate: "2026-06-20", assignee: "D. Okonkwo",  isAuto: true  },
  { id: "T-002", title: "Review email: Northstar",  type: "review",   label: "Review Email",  icon: "✉", color: "#F59E0B", bgColor: "#FFFBEB", priority: "high",   status: "open", contactId: "C-001", contactName: "Arjun Mehta",   company: "Northstar Industries",  dueDate: "2026-06-21", assignee: "H. Park",     isAuto: true  },
  { id: "T-003", title: "Follow-up: Verdant Pharma",type: "followup", label: "Follow-up",     icon: "↩", color: "#8B5CF6", bgColor: "#F5F3FF", priority: "medium", status: "open", contactId: "C-002", contactName: "Sofia Reyes",   company: "Verdant Pharma",        dueDate: "2026-06-22", assignee: "D. Okonkwo",  isAuto: true  },
  { id: "T-004", title: "Book demo: Synapse Co",    type: "bookdemo", label: "Book Demo",     icon: "▶", color: "#6366F1", bgColor: "#EEF2FF", priority: "medium", status: "open", contactId: "C-010", contactName: "Aiko Nakamura", company: "Synapse Co",            dueDate: "2026-06-25", assignee: "H. Park",     isAuto: true  },
  { id: "T-005", title: "Prep demo: TechNova",      type: "meeting",  label: "Meeting",       icon: "📅", color: "#8B5CF6", bgColor: "#F5F3FF", priority: "high",   status: "open", contactId: "C-008", contactName: "Priya Kapoor",  company: "TechNova Pvt Ltd",      dueDate: "2026-06-25", assignee: "D. Okonkwo",  notes: "Prepare product walkthrough for engineering audience", isAuto: false },
  { id: "T-006", title: "Close deal: Brio Commerce", type: "close",   label: "Close Deal",    icon: "★", color: "#10B981", bgColor: "#ECFDF5", priority: "low",    status: "completed", contactId: "C-007", contactName: "Lucas Ferreira", company: "Brio Commerce",        dueDate: "2026-05-28", assignee: "D. Okonkwo",  isAuto: true  },
  { id: "T-007", title: "Update CRM records Q2",    type: "task",     label: "Task",          icon: "✓", color: "#6B7280", bgColor: "#F3F4F6", priority: "low",    status: "open",                                                                                         dueDate: "2026-06-30", assignee: "H. Park",     notes: "Ensure all Q2 deal values are updated in the system" },
  { id: "T-008", title: "Qualify lead: Skoda Digital", type: "qualify", label: "Qualify Lead", icon: "✦", color: "#0EA5E9", bgColor: "#F0F9FF", priority: "medium", status: "open", contactId: "C-009", contactName: "Tomáš Novák",  company: "Skoda Digital",         dueDate: "2026-06-23", assignee: "H. Park",     isAuto: true  },
];

// ── Marketing Campaigns ───────────────────────────────────────────────────────

export type CampaignStatus = "active" | "draft" | "paused" | "complete" | "scheduled";
export type CampaignPlatform = "LinkedIn" | "Email" | "Twitter" | "Multi";

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  platform: CampaignPlatform;
  budget: number;
  reach: number;
  leads: number;
  conversion: number;
  startDate: string;
  endDate?: string;
  description?: string;
}

export const CAMPAIGNS: Campaign[] = [
  { id: "MKT-001", name: "Q3 Enterprise Outreach",         status: "active",    platform: "Multi",    budget: 18000, reach: 42500, leads: 312, conversion: 0.73, startDate: "2026-06-01", endDate: "2026-08-31", description: "Multi-channel enterprise ICP campaign targeting Series B+ SaaS companies" },
  { id: "MKT-002", name: "Healthcare Vertical Play",       status: "active",    platform: "LinkedIn", budget: 9500,  reach: 18200, leads: 148, conversion: 0.81, startDate: "2026-05-15", endDate: "2026-07-15", description: "Targeting VPs and Directors in pharma and medtech" },
  { id: "MKT-003", name: "Re-engagement Series — Cold",    status: "paused",    platform: "Email",    budget: 4200,  reach: 8900,  leads:  54, conversion: 0.61, startDate: "2026-04-01", endDate: "2026-06-30", description: "Follow-up sequence for leads older than 90 days" },
  { id: "MKT-004", name: "Summer Pipeline Accelerator",    status: "scheduled", platform: "Multi",    budget: 22000, reach: 0,     leads:   0, conversion: 0,    startDate: "2026-07-01", endDate: "2026-09-30", description: "Awareness + retargeting to fill Q3 pipeline" },
  { id: "MKT-005", name: "APAC Expansion — SaaS",          status: "draft",     platform: "LinkedIn", budget: 12000, reach: 0,     leads:   0, conversion: 0,    startDate: "2026-07-15", description: "First GTM push into Japan, Singapore, India markets" },
  { id: "MKT-006", name: "Fintech ICP Blitz — May",        status: "complete",  platform: "Email",    budget: 6800,  reach: 11400, leads: 203, conversion: 1.78, startDate: "2026-05-01", endDate: "2026-05-31", description: "Focused ICP qualification for fintech segment" },
];

export interface ContentItem {
  id: string;
  title: string;
  type: "LinkedIn Post" | "Blog Post" | "Email Copy" | "Ad Copy" | "Newsletter";
  status: "draft" | "in_review" | "approved" | "published";
  author: string;
  date: string;
  campaign?: string;
}

export const CONTENT_ITEMS: ContentItem[] = [
  { id: "CON-001", title: "Why Enterprise SaaS Needs Better ICP Tooling",  type: "Blog Post",     status: "published",  author: "Content Team", date: "2026-06-10", campaign: "Q3 Enterprise Outreach" },
  { id: "CON-002", title: "5 Signs Your Lead Scoring Is Broken",            type: "LinkedIn Post",  status: "published",  author: "Content Team", date: "2026-06-14"                       },
  { id: "CON-003", title: "Healthcare CRM — Email Sequence v3",             type: "Email Copy",     status: "in_review",  author: "H. Park",      date: "2026-06-16", campaign: "Healthcare Vertical Play" },
  { id: "CON-004", title: "Outreach Personalisation at Scale — Webinar CTA",type: "Ad Copy",        status: "approved",   author: "Content Team", date: "2026-06-17", campaign: "Summer Pipeline Accelerator" },
  { id: "CON-005", title: "Q3 Product Newsletter — Feature Highlights",     type: "Newsletter",     status: "draft",      author: "H. Park",      date: "2026-06-19"                       },
];

// ── Calendar Events ───────────────────────────────────────────────────────────

export type EventType = "demo" | "meeting" | "call" | "review" | "deadline";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: EventType;
  contact?: string;
  company?: string;
  duration?: string;
}

export const CALENDAR_EVENTS: CalendarEvent[] = [
  // May 2026
  { id: "EV-M01", title: "Demo — Global Retail Corp",      date: "2026-05-08", time: "10:00", type: "demo",     contact: "Claire Dumont",  company: "Global Retail Corp",    duration: "60m" },
  { id: "EV-M02", title: "Discovery call — Apex Fintech",  date: "2026-05-13", time: "14:30", type: "call",     contact: "Ben Howard",     company: "Apex Fintech",          duration: "30m" },
  { id: "EV-M03", title: "QBR — Evergreen SaaS",           date: "2026-05-20", time: "09:00", type: "meeting",  contact: "Mia Torres",     company: "Evergreen SaaS",        duration: "90m" },
  { id: "EV-M04", title: "Proposal review — Helix Health",  date: "2026-05-27", time: "11:00", type: "review",   contact: "Leon Park",      company: "Helix Health",          duration: "45m" },
  { id: "EV-M05", title: "Q1 close deadline",               date: "2026-05-31", time: "17:00", type: "deadline" },
  // June 2026
  { id: "EV-001", title: "Demo — Northstar Industries",   date: "2026-06-22", time: "10:00", type: "demo",     contact: "Arjun Mehta",    company: "Northstar Industries",  duration: "60m" },
  { id: "EV-002", title: "Demo — TechNova Pvt Ltd",       date: "2026-06-25", time: "14:00", type: "demo",     contact: "Priya Kapoor",   company: "TechNova Pvt Ltd",      duration: "45m" },
  { id: "EV-003", title: "Follow-up call — Verdant Pharma",date: "2026-06-22",time: "11:30", type: "call",     contact: "Sofia Reyes",    company: "Verdant Pharma",        duration: "30m" },
  { id: "EV-004", title: "Proposal review — Synapse Co",  date: "2026-06-24", time: "09:00", type: "review",   contact: "Aiko Nakamura",  company: "Synapse Co",            duration: "30m" },
  { id: "EV-005", title: "Team sync — Pipeline review",   date: "2026-06-23", time: "09:30", type: "meeting",  duration: "45m" },
  { id: "EV-006", title: "Q2 reporting deadline",          date: "2026-06-30", time: "18:00", type: "deadline" },
  { id: "EV-007", title: "Discovery call — Loom & Co",    date: "2026-06-20", time: "15:00", type: "call",     contact: "James O'Brien",  company: "Loom & Co",             duration: "30m" },
  { id: "EV-008", title: "Qualification — Skoda Digital", date: "2026-06-23", time: "13:00", type: "review",   contact: "Tomáš Novák",    company: "Skoda Digital",         duration: "30m" },
  // July 2026
  { id: "EV-J01", title: "Demo — Pinnacle Logistics",      date: "2026-07-03", time: "10:00", type: "demo",     contact: "Sam Reeves",     company: "Pinnacle Logistics",    duration: "60m" },
  { id: "EV-J02", title: "Kickoff — Q3 Pipeline",          date: "2026-07-07", time: "09:00", type: "meeting",  duration: "60m" },
  { id: "EV-J03", title: "Call — Meridian Capital",        date: "2026-07-10", time: "15:00", type: "call",     contact: "Nadia Osei",     company: "Meridian Capital",      duration: "30m" },
  { id: "EV-J04", title: "Review — Atlas Biotech proposal",date: "2026-07-15", time: "11:00", type: "review",   contact: "Carlos Vega",    company: "Atlas Biotech",         duration: "45m" },
  { id: "EV-J05", title: "Q3 forecast deadline",            date: "2026-07-31", time: "17:00", type: "deadline" },
];

// ── Analytics ─────────────────────────────────────────────────────────────────

export const QUALIFICATION_BATCHES = [
  { id: "B1", batch: "Batch 1", total: 100, qualified: 71, rejected: 29, qualPct: 71, source: "visitor.iq"    },
  { id: "B2", batch: "Batch 2", total:  80, qualified: 52, rejected: 28, qualPct: 65, source: "visitor.iq"    },
  { id: "B3", batch: "Batch 3", total: 120, qualified: 70, rejected: 50, qualPct: 58, source: "MongoDB"        },
  { id: "B4", batch: "Batch 4", total:  90, qualified: 39, rejected: 51, qualPct: 43, source: "MongoDB"        },
  { id: "B5", batch: "Batch 5", total:  60, qualified: 22, rejected: 38, qualPct: 37, source: "visitor.iq"    },
  { id: "B6", batch: "Batch 6", total:  85, qualified: 58, rejected: 27, qualPct: 68, source: "Domain enrich" },
  { id: "B7", batch: "Batch 7", total:  95, qualified: 75, rejected: 20, qualPct: 79, source: "Domain enrich" },
  { id: "B8", batch: "Batch 8", total: 110, qualified: 72, rejected: 38, qualPct: 65, source: "visitor.iq"    },
];

export const REJECTION_REASONS = [
  { reason: "Wrong industry",  count: 32, pct: 32 },
  { reason: "Too small",       count: 24, pct: 24 },
  { reason: "Low ICP score",   count: 20, pct: 20 },
  { reason: "Duplicate",       count: 14, pct: 14 },
  { reason: "Other",           count: 10, pct: 10 },
];

export const SOURCE_QUALITY = [
  { source: "visitor.iq",    total: 240, qualified: 156, rejected:  84, qualRate: 65 },
  { source: "Domain enrich", total: 180, qualified: 153, rejected:  27, qualRate: 85 },
  { source: "LinkedIn",      total: 120, qualified:  82, rejected:  38, qualRate: 68 },
  { source: "MongoDB",       total:  90, qualified:  38, rejected:  52, qualRate: 42 },
];

export const REVIEWER_PERFORMANCE = [
  { reviewer: "D. Okonkwo", total: 180, qualified: 124, rejected:  56, qualRate: 69 },
  { reviewer: "H. Park",    total: 210, qualified: 155, rejected:  55, qualRate: 74 },
  { reviewer: "A. Sterling",total: 140, qualified:  78, rejected:  62, qualRate: 56 },
];

export interface ApprovalItem {
  id: string;
  subject: string;
  module: "Finance" | "HR" | "Procurement" | "IT";
  requester: string;
  amount?: number;
  age: string;
  priority: "critical" | "high" | "normal";
  aiRisk: "low" | "medium" | "high";
  status: "pending" | "in_review" | "flagged" | "approved";
}

export const APPROVALS: ApprovalItem[] = [
  { id: "REQ-8829", subject: "Infrastructure expansion — Tokyo region", module: "Procurement", requester: "Sarah Chen", amount: 45200, age: "2m", priority: "critical", aiRisk: "medium", status: "pending" },
  { id: "REQ-8830", subject: "Enterprise SaaS renewal — Datadog", module: "Finance", requester: "Mark Vasquez", amount: 12900, age: "14m", priority: "high", aiRisk: "low", status: "pending" },
  { id: "REQ-8831", subject: "Recruitment budget Q3 — Engineering", module: "HR", requester: "Priya Anand", amount: 86000, age: "1h", priority: "high", aiRisk: "low", status: "in_review" },
  { id: "REQ-8832", subject: "Laptop fleet refresh — 24 units", module: "IT", requester: "Leon Wright", amount: 38400, age: "2h", priority: "normal", aiRisk: "medium", status: "pending" },
  { id: "REQ-8833", subject: "Vendor onboarding — Helix Labs", module: "Procurement", requester: "Sarah Chen", age: "3h", priority: "normal", aiRisk: "high", status: "flagged" },
  { id: "REQ-8834", subject: "Q4 marketing reallocation", module: "Finance", requester: "Aiko Tanaka", amount: 22500, age: "5h", priority: "normal", aiRisk: "low", status: "pending" },
  { id: "REQ-8835", subject: "Severance — confidential", module: "HR", requester: "Priya Anand", amount: 64000, age: "6h", priority: "high", aiRisk: "medium", status: "in_review" },
  { id: "REQ-8836", subject: "Annual security audit — KPMG", module: "Finance", requester: "Mark Vasquez", amount: 91200, age: "1d", priority: "high", aiRisk: "low", status: "pending" },
];

export interface TransactionRow {
  id: string;
  vendor: string;
  vendorId: string;
  category: string;
  amount: number;
  status: "verified" | "review" | "flagged" | "settled";
  approver: string;
  date: string;
  aiRisk: "low" | "medium" | "high";
}

export const TRANSACTIONS: TransactionRow[] = [
  { id: "TX-902341", vendor: "Cloud Infrastructure Systems", vendorId: "V-401", category: "OpEx / IT", amount: 12450, status: "verified", approver: "Sarah J.", date: "2026-05-19", aiRisk: "low" },
  { id: "TX-902388", vendor: "Acme Logistics Co.", vendorId: "V-554", category: "Procurement", amount: 4200, status: "review", approver: "Mark R.", date: "2026-05-19", aiRisk: "low" },
  { id: "TX-902401", vendor: "Design Dynamics Inc.", vendorId: "V-902", category: "Marketing / Ads", amount: 8900, status: "flagged", approver: "Aiko T.", date: "2026-05-20", aiRisk: "high" },
  { id: "TX-902412", vendor: "Global Workspace Hub", vendorId: "V-118", category: "Rent / Utilities", amount: 22500, status: "verified", approver: "Sarah J.", date: "2026-05-20", aiRisk: "low" },
  { id: "TX-902418", vendor: "Helix Labs", vendorId: "V-820", category: "R&D", amount: 18250, status: "review", approver: "Leon W.", date: "2026-05-20", aiRisk: "medium" },
  { id: "TX-902420", vendor: "Bright North Consulting", vendorId: "V-061", category: "Professional Services", amount: 30000, status: "verified", approver: "Mark R.", date: "2026-05-20", aiRisk: "low" },
  { id: "TX-902426", vendor: "Sentinel Security", vendorId: "V-712", category: "OpEx / Security", amount: 5800, status: "settled", approver: "—", date: "2026-05-18", aiRisk: "low" },
  { id: "TX-902430", vendor: "Northwind Travels", vendorId: "V-330", category: "T&E", amount: 2100, status: "flagged", approver: "Aiko T.", date: "2026-05-18", aiRisk: "medium" },
];

export interface EmployeeRow {
  id: string;
  name: string;
  initials: string;
  title: string;
  department: string;
  location: string;
  manager: string;
  status: "active" | "leave" | "onboarding";
  joined: string;
}

export const EMPLOYEES: EmployeeRow[] = [
  { id: "EMP-1042", name: "Sarah Chen", initials: "SC", title: "Director, Procurement", department: "Procurement", location: "Tokyo", manager: "A. Sterling", status: "active", joined: "2021-03-14" },
  { id: "EMP-1108", name: "Mark Vasquez", initials: "MV", title: "Senior Finance Analyst", department: "Finance", location: "Austin", manager: "A. Sterling", status: "active", joined: "2022-07-01" },
  { id: "EMP-1122", name: "Priya Anand", initials: "PA", title: "VP People Operations", department: "HR", location: "Bengaluru", manager: "CEO", status: "active", joined: "2019-11-22" },
  { id: "EMP-1188", name: "Leon Wright", initials: "LW", title: "IT Infrastructure Lead", department: "IT", location: "London", manager: "CTO", status: "active", joined: "2023-01-09" },
  { id: "EMP-1201", name: "Aiko Tanaka", initials: "AT", title: "Marketing Operations", department: "Marketing", location: "Tokyo", manager: "CMO", status: "leave", joined: "2020-05-30" },
  { id: "EMP-1244", name: "Daniel Okonkwo", initials: "DO", title: "Account Executive", department: "Sales", location: "Lagos", manager: "VP Sales", status: "onboarding", joined: "2026-05-02" },
  { id: "EMP-1259", name: "Hana Park", initials: "HP", title: "Senior Recruiter", department: "HR", location: "Seoul", manager: "P. Anand", status: "active", joined: "2024-02-18" },
];

export interface PORow {
  id: string;
  vendor: string;
  items: number;
  total: number;
  status: "draft" | "sent" | "received" | "closed";
  owner: string;
  eta: string;
}

export const PURCHASE_ORDERS: PORow[] = [
  { id: "PO-44012", vendor: "Cloud Infrastructure Systems", items: 4, total: 24800, status: "sent", owner: "Sarah Chen", eta: "2026-06-01" },
  { id: "PO-44018", vendor: "Helix Labs", items: 12, total: 18250, status: "draft", owner: "Sarah Chen", eta: "—" },
  { id: "PO-44021", vendor: "Sentinel Security", items: 2, total: 5800, status: "received", owner: "Leon Wright", eta: "Delivered" },
  { id: "PO-44030", vendor: "Northwind Travels", items: 8, total: 2100, status: "closed", owner: "Aiko Tanaka", eta: "Closed" },
];

export interface CRMAccount {
  id: string;
  name: string;
  segment: "Enterprise" | "Mid-Market" | "SMB";
  arr: number;
  health: "green" | "amber" | "red";
  owner: string;
  renewal: string;
}

export const CRM_ACCOUNTS: CRMAccount[] = [
  { id: "ACC-2001", name: "Northstar Industries", segment: "Enterprise", arr: 1240000, health: "green", owner: "D. Okonkwo", renewal: "2026-09-30" },
  { id: "ACC-2014", name: "Verdant Pharma", segment: "Enterprise", arr: 890000, health: "amber", owner: "D. Okonkwo", renewal: "2026-07-12" },
  { id: "ACC-2030", name: "Loom & Co", segment: "Mid-Market", arr: 142000, health: "green", owner: "H. Park", renewal: "2027-01-04" },
  { id: "ACC-2055", name: "Pixelforge Studios", segment: "SMB", arr: 32000, health: "red", owner: "D. Okonkwo", renewal: "2026-06-15" },
];

export interface ActivityEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  type: "approve" | "comment" | "flag" | "ai";
}

export const RECENT_ACTIVITY: ActivityEvent[] = [
  { id: "1", actor: "Mark Vasquez", action: "approved", target: "Invoice #9921 — Marketing", time: "14m ago", type: "approve" },
  { id: "2", actor: "AI Assistant", action: "flagged duplicate on", target: "TX-902401 vs TX-902388", time: "27m ago", type: "ai" },
  { id: "3", actor: "Sarah Chen", action: "commented on", target: "Contract #882 — Helix Labs", time: "1h ago", type: "comment" },
  { id: "4", actor: "Priya Anand", action: "escalated", target: "REQ-8835 to CFO", time: "2h ago", type: "flag" },
];

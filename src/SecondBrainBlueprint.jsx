import { useState } from "react";

const sections = [
  { id: "philosophy", label: "Philosophy" },
  { id: "domains", label: "Your Life Domains" },
  { id: "modules", label: "Core Modules" },
  { id: "ai-engine", label: "AI Priority Engine" },
  { id: "features", label: "Must-Have Features" },
  { id: "stack", label: "Tech Stack" },
  { id: "roadmap", label: "Build Roadmap" },
];

const domain_data = [
  {
    name: "BHEL Estate Office",
    icon: "🏛️",
    color: "#c0392b",
    sub: ["AC Fleet (115 units)", "Vendor Mgmt – Sehgal Electricals", "Guest House Ops", "Admin Drafting (EN/HI)", "Finance & HR Coordination", "Disposal & Procurement Notes"],
    weight: "HIGH — PSU accountability, deadlines, hierarchy",
  },
  {
    name: "Intimus Enterprises LLP",
    icon: "💼",
    color: "#d35400",
    sub: ["Client Acquisition (MSME, NCR)", "Website Builds (HTML/React)", "Domain & Hosting", "UPI / Payment Infra", "Partner Coordination"],
    weight: "MEDIUM — Revenue potential, growth phase",
  },
  {
    name: "Academic – IIT Delhi EMBA",
    icon: "📚",
    color: "#27ae60",
    sub: ["Entrance Exam Prep", "Practice Papers", "Marketing Mgmt (MSL760)", "Case Studies (HBS, etc.)", "Application Deadlines"],
    weight: "MEDIUM — Career transformation, long horizon",
  },
  {
    name: "Trekking & Fitness",
    icon: "🏔️",
    color: "#2980b9",
    sub: ["Trek Planning (Himalayan)", "Training Schedule", "Nutrition (Vegetarian)", "Gear Prep", "Route Research"],
    weight: "PERSONAL — Well-being, recovery, identity",
  },
  {
    name: "AI & Tech Learning",
    icon: "🤖",
    color: "#8e44ad",
    sub: ["Claude Code / AI Tools", "PWA / App Dev", "Telegram Bots", "Google Apps Script", "Research & Evaluation"],
    weight: "ENABLER — Amplifies BHEL + Intimus output",
  },
];

const modules = [
  {
    name: "Quick Capture",
    icon: "⚡",
    color: "#e74c3c",
    desc: "The most critical module. Any friction = you won't use it.",
    features: [
      "Voice-to-task with a single tap (even offline)",
      "Text dump — no format required, AI structures it later",
      "Photo capture (of printed memos, notices, whiteboards)",
      "Quick add widget on home screen (Android/iOS)",
      "Telegram bot as a capture endpoint (you already have this infra)",
    ],
    insight: "At BHEL, you'll capture between meetings or in the field. Voice + widget is non-negotiable.",
  },
  {
    name: "Context Switcher",
    icon: "🔄",
    color: "#e67e22",
    desc: "You live in 5 different 'modes' — the app must know which one you're in.",
    features: [
      "Domain filter: BHEL / Intimus / Academic / Trek / AI-Learning",
      "Auto-suggest domain based on time of day and location",
      "Separate task queues per domain, unified daily view",
      "Energy level selector: High / Medium / Low (maps to task type)",
      "Office hours vs. after-hours mode",
    ],
    insight: "Post-6PM, you shouldn't be seeing BHEL vendor tasks. The app should surface Intimus or study tasks instead.",
  },
  {
    name: "AI Prioritizer",
    icon: "🧠",
    color: "#f39c12",
    desc: "The brain of the system — tells you WHAT to do and WHEN.",
    features: [
      "Scores each task on: Urgency × Importance × Energy-Cost × Deadline-Proximity",
      "BHEL hierarchy awareness (DGM/AGM deadlines rank higher automatically)",
      "PSU rhythm understanding (month-end, quarter-end = crunch)",
      "Eisenhower Matrix as the display framework",
      "Daily 'What should I do now?' query in plain language",
    ],
    insight: "This is the differentiator. Not just storage — active guidance.",
  },
  {
    name: "Daily Briefing",
    icon: "🌅",
    color: "#16a085",
    desc: "Start every day with a clear, AI-generated plan.",
    features: [
      "Morning push: 'Your top 3 tasks for today'",
      "Pending from yesterday — did you complete, delay, or reassign?",
      "Deadline radar: what's due in next 3 / 7 / 30 days",
      "Energy forecast: time-block suggestions for deep vs. shallow work",
      "BHEL calendar awareness (holidays, paydays, audit periods)",
    ],
    insight: "Delivered at 8:00 AM via notification. Takes 60 seconds to read. You walk into office already knowing your day.",
  },
  {
    name: "Knowledge Base",
    icon: "📂",
    color: "#2980b9",
    desc: "Reference layer — the 'brain' part of Second Brain.",
    features: [
      "SOP library for BHEL processes (vendor onboarding, AC complaint flow)",
      "Draft templates: Hindi admin notes, payment release, disposal notes",
      "Trek references: gear lists, route notes, altitude acclimatisation",
      "Intimus: client SOPs, service packages, pricing",
      "AI: tools research, code snippets, deployment notes",
    ],
    insight: "Not another Google Drive. Everything is searchable in plain language: 'Show me the last disposal note format'.",
  },
  {
    name: "Weekly Review",
    icon: "📊",
    color: "#8e44ad",
    desc: "The habit that keeps the system alive.",
    features: [
      "Every Sunday, 30-minute structured review prompt",
      "Tasks completed vs. pending — domain-wise breakdown",
      "Goals check: are weekly tasks aligned to monthly goals?",
      "Inbox zero: triage all unprocessed captures from the week",
      "Next week planning: top 3 per domain",
    ],
    insight: "Most second brain systems die because people skip this. Make it a Sunday notification you can do in-app in 20 mins.",
  },
];

const priorityEngine = [
  {
    label: "Urgency Score",
    icon: "⏰",
    desc: "Days until deadline → exponential weight as deadline approaches. BHEL audit deadlines score 2x.",
    color: "#e74c3c",
  },
  {
    label: "Importance Score",
    icon: "⭐",
    desc: "Manual tag (High/Med/Low) × Domain weight. BHEL official tasks auto-weight higher due to PSU accountability.",
    color: "#f39c12",
  },
  {
    label: "Energy Cost",
    icon: "🔋",
    desc: "Does this require deep focus (drafting a Hindi Admin Note) or is it shallow (forwarding an email)? Matched to your energy level at the moment.",
    color: "#27ae60",
  },
  {
    label: "Delegation Flag",
    icon: "👥",
    desc: "Can this be assigned to a subordinate, vendor, or Intimus partner? AI flags delegatable tasks with suggested assignee.",
    color: "#2980b9",
  },
  {
    label: "Goal Alignment",
    icon: "🎯",
    desc: "Is this task connected to a monthly/quarterly goal? Orphan tasks (not aligned to any goal) get de-prioritized.",
    color: "#8e44ad",
  },
];

const quadrants = [
  { q: "Q1 — DO NOW", desc: "BHEL audit response, vendor payment stuck, guest house emergency, complaint escalation", bg: "#fdf0f0", border: "#e74c3c", label: "Urgent + Important" },
  { q: "Q2 — SCHEDULE", desc: "EMBA study blocks, Intimus client website build, PWA feature dev, trek training, BITS preparation", bg: "#f0fdf4", border: "#27ae60", label: "Important, Not Urgent" },
  { q: "Q3 — DELEGATE", desc: "Routine vendor follow-ups, clerical file work, form submissions others can fill, BHEL circular circulation", bg: "#fff8f0", border: "#f39c12", label: "Urgent, Not Important" },
  { q: "Q4 — ELIMINATE", desc: "Redundant status meetings, low-value WhatsApp groups, tasks with no clear goal connection", bg: "#f8f8ff", border: "#95a5a6", label: "Not Urgent, Not Important" },
];

const techStack = [
  {
    layer: "Frontend (App)",
    choice: "React PWA (Vite + Tailwind)",
    why: "Works on Android & iOS. Add to Home Screen. Offline-ready. You already deploy to Netlify/Vercel.",
    cost: "₹0",
    icon: "📱",
  },
  {
    layer: "Database",
    choice: "Google Sheets + Apps Script",
    why: "You've already built this for AC PWA. Extend the same pattern. Zero cost, familiar.",
    cost: "₹0",
    icon: "🗄️",
  },
  {
    layer: "AI Brain",
    choice: "Gemini 1.5 Flash (free tier) + Claude API (low volume)",
    why: "Gemini free tier for daily prioritization. Claude for Hindi drafting and complex reasoning.",
    cost: "₹0–₹400/mo",
    icon: "🤖",
  },
  {
    layer: "Capture Channel",
    choice: "Telegram Bot (existing) + PWA widget",
    why: "You already have the Telegram bot + Flask infra on Railway.app. Reuse it as a capture endpoint.",
    cost: "₹0",
    icon: "⚡",
  },
  {
    layer: "Notifications",
    choice: "Telegram push + PWA notifications",
    why: "No Firebase needed. Telegram handles reliable push. PWA handles in-app alerts.",
    cost: "₹0",
    icon: "🔔",
  },
  {
    layer: "Hosting",
    choice: "Netlify / Vercel (frontend) + Railway.app (backend)",
    why: "Your existing zero-cost stack. No changes needed.",
    cost: "₹0",
    icon: "☁️",
  },
  {
    layer: "Auth",
    choice: "Google OAuth (single user / family)",
    why: "Simple, free, secure. You're already using Google ecosystem.",
    cost: "₹0",
    icon: "🔐",
  },
];

const roadmap = [
  {
    phase: "Phase 1 — Foundation",
    duration: "2–3 Weeks",
    color: "#e74c3c",
    tasks: [
      "Set up Google Sheet as master task database (columns: task, domain, urgency, importance, deadline, energy, status, notes)",
      "Build Quick Capture form — plain text input that saves to Sheets",
      "Connect Telegram bot as alternative capture",
      "Basic domain filter view in PWA",
    ],
    output: "A working capture + store system. Raw, but functional.",
  },
  {
    phase: "Phase 2 — AI Prioritization",
    duration: "2–3 Weeks",
    color: "#e67e22",
    tasks: [
      "Add Gemini API call: feed task list → get back priority scores + Eisenhower quadrant",
      "Build Eisenhower Matrix view in PWA",
      "Daily Briefing: morning notification with top-3 tasks",
      "Add energy level input (morning check-in)",
    ],
    output: "The system now tells you what to do. This is the 'wow' moment.",
  },
  {
    phase: "Phase 3 — Knowledge Base",
    duration: "2 Weeks",
    color: "#27ae60",
    tasks: [
      "Add a 'Notes' section to Google Sheets (2nd tab)",
      "Build a simple search UI — query → AI finds relevant note/template",
      "Store BHEL draft templates, trek plans, Intimus SOPs",
      "Link tasks to relevant notes",
    ],
    output: "Your institutional knowledge is now searchable.",
  },
  {
    phase: "Phase 4 — Review & Habit",
    duration: "1 Week",
    color: "#2980b9",
    tasks: [
      "Weekly review screen — prompted every Sunday at 8 PM",
      "Task completion analytics (simple bar chart per domain)",
      "Goal-setting module: 3 monthly goals per domain",
      "Completed tasks archive with timestamps",
    ],
    output: "The system becomes a habit, not a burden.",
  },
  {
    phase: "Phase 5 — Polish",
    duration: "Ongoing",
    color: "#8e44ad",
    tasks: [
      "Hindi voice input support for BHEL task capture",
      "Recurring tasks (monthly AC inspection, rent collection, BHEL payroll cycles)",
      "Photo-to-task (snap a printed notice → AI extracts the action items)",
      "Intimus client CRM: link tasks to specific clients",
    ],
    output: "Full personal OS. Second Brain at full power.",
  },
];

export default function SecondBrainBlueprint() {
  const [active, setActive] = useState("philosophy");

  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: "#0d1117",
      minHeight: "100vh",
      color: "#e6edf3",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #161b22 0%, #0d1117 100%)",
        borderBottom: "1px solid #30363d",
        padding: "32px 24px 24px",
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#58a6ff", textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>
            RESEARCH BLUEPRINT · PERSONAL AI SYSTEM
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", fontFamily: "'Georgia', serif", lineHeight: 1.2 }}>
            Your Second Brain
          </h1>
          <p style={{ color: "#8b949e", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            A deeply personalized research document — built around your life as Deputy Engineer at BHEL Noida, 
            founder of Intimus Enterprises LLP, IIT Delhi EMBA aspirant, and Himalayan trekker.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            {["Zero-cost stack", "AI-powered prioritization", "Mobile-first PWA", "Hindi + English", "5 life domains"].map(t => (
              <span key={t} style={{
                background: "#1c2128", border: "1px solid #30363d", borderRadius: 20,
                padding: "3px 10px", fontSize: 11, color: "#79c0ff", fontFamily: "monospace",
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "#161b22", borderBottom: "1px solid #30363d",
        overflowX: "auto",
      }}>
        <div style={{ display: "flex", padding: "0 16px", maxWidth: 860, margin: "0 auto" }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "14px 14px", fontSize: 12, fontFamily: "monospace",
              color: active === s.id ? "#58a6ff" : "#8b949e",
              borderBottom: active === s.id ? "2px solid #58a6ff" : "2px solid transparent",
              whiteSpace: "nowrap", letterSpacing: 0.5,
              transition: "all 0.2s",
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* PHILOSOPHY */}
        {active === "philosophy" && (
          <div>
            <SectionTitle icon="💡" title="The Philosophy — Why This Is Different" />
            <Card>
              <p style={bodyText}>
                Most to-do apps are <strong>storage systems</strong>. They wait for you to open them, 
                read through 40 tasks, and figure out what to do. That's cognitive work the app should be doing for you.
              </p>
              <p style={bodyText}>
                Your Second Brain should work like a <strong>trusted Chief of Staff</strong> — one who knows your 
                seniority at BHEL, your Intimus growth goals, your EMBA timeline, your next trek target, and your 
                current energy level — and says: <em>"Sir, do this now, defer this to 6PM, and this can wait till Friday."</em>
              </p>
              <Divider />
              <h3 style={h3style}>The 4-Step Framework (Tiago Forte's CODE — adapted for you)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { step: "C — Capture", desc: "Everything that needs attention goes into the inbox. BHEL memo, Intimus lead, trek booking — one place, zero friction." },
                  { step: "O — Organize", desc: "AI auto-tags each item to one of your 5 domains and assigns urgency/importance. You don't sort manually." },
                  { step: "D — Distill", desc: "AI reduces the noise. Today's view shows only what matters now. No 40-item list. Max 5 priority tasks per day." },
                  { step: "E — Execute", desc: "The app tells you WHAT to do, in WHAT ORDER, with HOW MUCH TIME to allocate. You just execute." },
                ].map(item => (
                  <div key={item.step} style={{ background: "#1c2128", borderRadius: 8, padding: 14, border: "1px solid #30363d" }}>
                    <div style={{ color: "#58a6ff", fontFamily: "monospace", fontSize: 12, marginBottom: 6 }}>{item.step}</div>
                    <div style={{ color: "#8b949e", fontSize: 13, lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
              <Divider />
              <h3 style={h3style}>The Core Promise</h3>
              <div style={{ background: "#0d1117", borderLeft: "3px solid #58a6ff", padding: "16px 20px", borderRadius: "0 8px 8px 0" }}>
                <p style={{ ...bodyText, margin: 0, fontStyle: "italic", color: "#c9d1d9" }}>
                  "Every morning, you open one screen. You see 3–5 things to do, in order. You know which domain they're from, 
                  how long each takes, and why they're priority. You don't think. You just do."
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* DOMAINS */}
        {active === "domains" && (
          <div>
            <SectionTitle icon="🗺️" title="Your Life Domains — The 5 Zones" />
            <p style={{ ...bodyText, color: "#8b949e", marginBottom: 24 }}>
              The app must understand these 5 zones intimately. Each has different urgency rhythms, 
              stakeholders, and success metrics.
            </p>
            {domain_data.map((d, i) => (
              <Card key={i} style={{ marginBottom: 16, borderLeft: `3px solid ${d.color}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ fontSize: 28, lineHeight: 1 }}>{d.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ ...h3style, color: d.color, marginBottom: 6 }}>{d.name}</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                      {d.sub.map(s => (
                        <span key={s} style={{
                          background: "#0d1117", border: `1px solid ${d.color}33`,
                          borderRadius: 4, padding: "2px 8px", fontSize: 11, color: "#8b949e",
                          fontFamily: "monospace",
                        }}>{s}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: d.color, fontFamily: "monospace", opacity: 0.8 }}>
                      ⚖️ {d.weight}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Card style={{ background: "#1c2128", marginTop: 8 }}>
              <h3 style={h3style}>How Domains Affect Prioritization</h3>
              <p style={{ ...bodyText, color: "#8b949e" }}>
                BHEL tasks carry institutional weight — delays can affect performance appraisals, 
                cause vendor disputes, or breach PSU compliance. They get automatic urgency boosts.
                Intimus tasks have revenue potential but flexible timelines. EMBA prep has fixed exam dates 
                as hard anchors. Trek is health-critical and should not be consistently sacrificed. 
                The AI must balance all five — not just optimize for BHEL firefighting.
              </p>
            </Card>
          </div>
        )}

        {/* MODULES */}
        {active === "modules" && (
          <div>
            <SectionTitle icon="🧩" title="Core App Modules" />
            <p style={{ ...bodyText, color: "#8b949e", marginBottom: 24 }}>
              Six modules form the complete system. Build them in this order — each adds value independently.
            </p>
            {modules.map((m, i) => (
              <Card key={i} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{m.icon}</span>
                  <h3 style={{ ...h3style, color: m.color, margin: 0 }}>Module {i + 1}: {m.name}</h3>
                </div>
                <p style={{ ...bodyText, color: "#8b949e", marginBottom: 12 }}>{m.desc}</p>
                <ul style={{ margin: "0 0 12px", paddingLeft: 20 }}>
                  {m.features.map((f, j) => (
                    <li key={j} style={{ color: "#c9d1d9", fontSize: 13, lineHeight: 1.8, marginBottom: 2 }}>{f}</li>
                  ))}
                </ul>
                <div style={{
                  background: "#0d1117", borderLeft: `3px solid ${m.color}`,
                  padding: "10px 14px", borderRadius: "0 6px 6px 0",
                  fontSize: 12, color: "#8b949e", fontStyle: "italic",
                }}>
                  💡 {m.insight}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* AI ENGINE */}
        {active === "ai-engine" && (
          <div>
            <SectionTitle icon="⚙️" title="The AI Priority Engine" />
            <p style={{ ...bodyText, color: "#8b949e", marginBottom: 24 }}>
              This is what makes your app a Second Brain and not just a to-do list. 
              A hybrid of Eisenhower Matrix + GTD + custom BHEL-aware scoring.
            </p>

            <h3 style={{ ...h3style, marginBottom: 12 }}>Priority Score Formula</h3>
            <Card style={{ background: "#0d1117", border: "1px solid #58a6ff33", marginBottom: 24 }}>
              <div style={{ fontFamily: "monospace", fontSize: 14, color: "#58a6ff", textAlign: "center", padding: "8px 0" }}>
                Priority Score = (Urgency × 0.35) + (Importance × 0.30) + (Deadline Proximity × 0.20) + (Goal Alignment × 0.15)
              </div>
              <div style={{ textAlign: "center", fontSize: 11, color: "#8b949e", marginTop: 6 }}>
                BHEL official tasks receive a 1.5× multiplier on the final score
              </div>
            </Card>

            <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
              {priorityEngine.map((p, i) => (
                <div key={i} style={{
                  background: "#1c2128", borderRadius: 8, padding: 16,
                  border: `1px solid ${p.color}33`, display: "flex", gap: 14,
                }}>
                  <div style={{ fontSize: 24, lineHeight: 1 }}>{p.icon}</div>
                  <div>
                    <div style={{ color: p.color, fontFamily: "monospace", fontSize: 12, marginBottom: 4 }}>{p.label}</div>
                    <div style={{ color: "#8b949e", fontSize: 13, lineHeight: 1.6 }}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ ...h3style, marginBottom: 12 }}>Eisenhower Matrix — Your Daily View</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {quadrants.map((q, i) => (
                <div key={i} style={{
                  background: "#1c2128", borderRadius: 8, padding: 14,
                  borderTop: `3px solid ${q.border}`,
                }}>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: q.border, marginBottom: 4 }}>{q.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3", marginBottom: 8 }}>{q.q}</div>
                  <div style={{ fontSize: 12, color: "#8b949e", lineHeight: 1.6 }}>{q.desc}</div>
                </div>
              ))}
            </div>

            <Card style={{ marginTop: 20 }}>
              <h3 style={h3style}>PSU-Specific Intelligence</h3>
              <p style={{ ...bodyText, color: "#8b949e" }}>
                The AI must understand BHEL's rhythm: month-end billing rushes, quarterly audit windows, 
                DGM/AGM approval hierarchies, and HOD meeting cycles. Tasks tagged as "HOD meeting input" 
                auto-escalate 48 hours before the next scheduled meeting. Vendor payment deadlines 
                get a hard "must-do" flag to avoid LD (liquidated damages) situations.
              </p>
            </Card>
          </div>
        )}

        {/* FEATURES */}
        {active === "features" && (
          <div>
            <SectionTitle icon="✨" title="Must-Have Features" />
            <div style={{ display: "grid", gap: 14 }}>
              {[
                {
                  cat: "CAPTURE", color: "#e74c3c",
                  items: [
                    ["Home Screen Widget", "One-tap capture without opening the app. Type or speak."],
                    ["Telegram Bot Inbox", "Send task to your Telegram bot. It syncs to the master list."],
                    ["Photo-to-Task", "Snap a printed BHEL notice. AI extracts action items automatically."],
                    ["Voice Notes (Hindi/English)", "Speak in Hindi: app transcribes and creates a structured task."],
                  ]
                },
                {
                  cat: "ORGANIZE", color: "#e67e22",
                  items: [
                    ["Auto-Domain Tagging", "AI reads the task text and assigns it to the right domain."],
                    ["Recurring Tasks", "Monthly AC fleet inspection, quarterly maintenance cycle, rent collection."],
                    ["Sub-tasks", "Break 'Prepare disposal note for 56 ACs' into 5 linked sub-steps."],
                    ["Document Links", "Attach Google Drive links to tasks (draft, notice, vendor quote)."],
                  ]
                },
                {
                  cat: "PRIORITIZE & EXECUTE", color: "#27ae60",
                  items: [
                    ["Daily Top 5", "AI picks your top 5 tasks for the day. You start with these."],
                    ["Time Block Suggestions", "High-energy tasks (drafting) in morning. Low-energy (emails) post-lunch."],
                    ["Context-aware Queue", "At 9AM: BHEL tasks. After 6PM: Intimus or study tasks surface."],
                    ["2-Minute Rule Flagging", "Tasks under 2 minutes are flagged for immediate clearance."],
                  ]
                },
                {
                  cat: "REVIEW & IMPROVE", color: "#2980b9",
                  items: [
                    ["Weekly Sunday Review", "Structured 20-min review: what's done, what's stuck, what's next week."],
                    ["Goal–Task Alignment Check", "Monthly: are your tasks actually moving your goals forward?"],
                    ["Completion Analytics", "Simple graph: tasks completed per domain per week."],
                    ["Bottleneck Detection", "If BHEL Q3 tasks keep rolling over, the AI flags it and asks why."],
                  ]
                },
                {
                  cat: "BHEL-SPECIFIC", color: "#8e44ad",
                  items: [
                    ["Hindi Admin Note Generator", "Describe task → AI drafts formal Hindi paragraph-format note."],
                    ["Vendor Tracker", "Link tasks to M/s Sehgal Electricals, track pending items per vendor."],
                    ["Complaint → Task Pipeline", "New AC complaint → auto-generate a follow-up task for your AC PWA."],
                    ["Approval Chain Awareness", "Tag tasks needing HOD/Finance approval; track approval status."],
                  ]
                },
              ].map((section) => (
                <Card key={section.cat} style={{ borderTop: `3px solid ${section.color}` }}>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: section.color, marginBottom: 12, letterSpacing: 2 }}>
                    {section.cat}
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {section.items.map(([title, desc]) => (
                      <div key={title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: section.color, fontSize: 14, marginTop: 1 }}>▸</span>
                        <div>
                          <span style={{ color: "#e6edf3", fontSize: 13, fontWeight: 600 }}>{title}: </span>
                          <span style={{ color: "#8b949e", fontSize: 13 }}>{desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TECH STACK */}
        {active === "stack" && (
          <div>
            <SectionTitle icon="🛠️" title="Tech Stack — Zero-Cost Architecture" />
            <p style={{ ...bodyText, color: "#8b949e", marginBottom: 24 }}>
              Built entirely on your existing infra preferences. No paid services required to start. 
              Every layer uses tools you've already proven in the AC PWA and Telegram bot projects.
            </p>

            <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
              {techStack.map((t, i) => (
                <div key={i} style={{
                  background: "#1c2128", borderRadius: 8, padding: 16,
                  border: "1px solid #30363d", display: "flex", gap: 14, alignItems: "flex-start",
                }}>
                  <div style={{ fontSize: 24 }}>{t.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#8b949e", letterSpacing: 1 }}>{t.layer}</div>
                      <span style={{
                        background: t.cost === "₹0" ? "#12261e" : "#261512",
                        color: t.cost === "₹0" ? "#3fb950" : "#f0883e",
                        fontFamily: "monospace", fontSize: 11, padding: "2px 8px", borderRadius: 4,
                        whiteSpace: "nowrap",
                      }}>{t.cost}</span>
                    </div>
                    <div style={{ color: "#e6edf3", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t.choice}</div>
                    <div style={{ color: "#8b949e", fontSize: 12, lineHeight: 1.6 }}>{t.why}</div>
                  </div>
                </div>
              ))}
            </div>

            <Card>
              <h3 style={h3style}>Data Architecture — Google Sheets Schema</h3>
              <p style={{ ...bodyText, color: "#8b949e", marginBottom: 12 }}>
                One master spreadsheet with 4 tabs:
              </p>
              {[
                ["Tab 1: Tasks", "ID | Title | Domain | Urgency | Importance | Deadline | EnergyLevel | Status | Notes | GoalID | CreatedAt"],
                ["Tab 2: Goals", "ID | Title | Domain | Horizon (Monthly/Quarterly) | Progress | LinkedTaskCount"],
                ["Tab 3: Knowledge", "ID | Title | Domain | Content | Tags | LastAccessed"],
                ["Tab 4: Reviews", "WeekNumber | Completed | Pending | RolledOver | KeyInsight | NextWeekPlan"],
              ].map(([tab, schema]) => (
                <div key={tab} style={{ marginBottom: 12 }}>
                  <div style={{ color: "#58a6ff", fontFamily: "monospace", fontSize: 12, marginBottom: 4 }}>{tab}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#8b949e", background: "#0d1117", padding: "8px 12px", borderRadius: 6, overflowX: "auto", whiteSpace: "nowrap" }}>
                    {schema}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ROADMAP */}
        {active === "roadmap" && (
          <div>
            <SectionTitle icon="🗓️" title="Build Roadmap — 8 Weeks to Full System" />
            <p style={{ ...bodyText, color: "#8b949e", marginBottom: 24 }}>
              Build this incrementally. Each phase is usable on its own. Don't wait for Phase 5 to start getting value.
            </p>

            {roadmap.map((phase, i) => (
              <div key={i} style={{ marginBottom: 20, display: "flex", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: phase.color, display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff",
                    flexShrink: 0,
                  }}>{i + 1}</div>
                  {i < roadmap.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: "#30363d", marginTop: 8 }} />
                  )}
                </div>
                <Card style={{ flex: 1, borderLeft: `3px solid ${phase.color}`, marginBottom: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <h3 style={{ ...h3style, color: phase.color, margin: 0 }}>{phase.phase}</h3>
                    <span style={{
                      fontFamily: "monospace", fontSize: 11, color: "#8b949e",
                      background: "#0d1117", padding: "2px 8px", borderRadius: 4, whiteSpace: "nowrap",
                    }}>{phase.duration}</span>
                  </div>
                  <ul style={{ margin: "0 0 12px", paddingLeft: 18 }}>
                    {phase.tasks.map((t, j) => (
                      <li key={j} style={{ color: "#c9d1d9", fontSize: 13, lineHeight: 1.8 }}>{t}</li>
                    ))}
                  </ul>
                  <div style={{
                    background: "#0d1117", borderRadius: 6, padding: "8px 12px",
                    fontSize: 12, color: "#3fb950", fontFamily: "monospace",
                  }}>
                    ✓ Output: {phase.output}
                  </div>
                </Card>
              </div>
            ))}

            <Card style={{ marginTop: 8, background: "#12261e", border: "1px solid #3fb95033" }}>
              <h3 style={{ ...h3style, color: "#3fb950" }}>Final Vision: Your Personal OS</h3>
              <p style={{ ...bodyText, color: "#8b949e" }}>
                At full build, your Second Brain will: capture tasks in 5 seconds, prioritize them automatically, 
                brief you every morning, draft BHEL admin notes in Hindi on demand, remind you to train for your 
                next trek, track Intimus client work, and tell you every Sunday what moved and what didn't. 
                It will know you better than any generic app — because it was built for exactly who you are.
              </p>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}

// Helpers
const Card = ({ children, style }) => (
  <div style={{
    background: "#161b22", borderRadius: 10, padding: 20,
    border: "1px solid #30363d", ...style,
  }}>{children}</div>
);

const SectionTitle = ({ icon, title }) => (
  <div style={{ marginBottom: 24 }}>
    <h2 style={{
      fontSize: 20, fontWeight: 700, color: "#e6edf3",
      margin: "0 0 4px", display: "flex", alignItems: "center", gap: 10,
    }}>
      <span>{icon}</span> {title}
    </h2>
    <div style={{ height: 2, background: "linear-gradient(90deg, #58a6ff, transparent)", marginTop: 10 }} />
  </div>
);

const Divider = () => (
  <div style={{ height: 1, background: "#30363d", margin: "16px 0" }} />
);

const bodyText = { fontSize: 14, lineHeight: 1.7, margin: "0 0 12px", color: "#c9d1d9" };
const h3style = { fontSize: 15, fontWeight: 700, color: "#e6edf3", margin: "0 0 10px" };

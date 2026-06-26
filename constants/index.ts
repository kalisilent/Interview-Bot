import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod";

export const mappings = {
  "react.js": "react", reactjs: "react", react: "react",
  "next.js": "nextjs", nextjs: "nextjs", next: "nextjs",
  "vue.js": "vuejs", vuejs: "vuejs", vue: "vuejs",
  "express.js": "express", expressjs: "express", express: "express",
  "node.js": "nodejs", nodejs: "nodejs", node: "nodejs",
  mongodb: "mongodb", mongo: "mongodb", mongoose: "mongoose",
  mysql: "mysql", postgresql: "postgresql", sqlite: "sqlite",
  firebase: "firebase", docker: "docker", kubernetes: "kubernetes",
  aws: "aws", azure: "azure", gcp: "gcp",
  digitalocean: "digitalocean", heroku: "heroku",
  photoshop: "photoshop", "adobe photoshop": "photoshop",
  html5: "html5", html: "html5", css3: "css3", css: "css3",
  sass: "sass", scss: "sass", less: "less",
  tailwindcss: "tailwindcss", tailwind: "tailwindcss",
  bootstrap: "bootstrap", jquery: "jquery",
  typescript: "typescript", ts: "typescript",
  javascript: "javascript", js: "javascript",
  "angular.js": "angular", angularjs: "angular", angular: "angular",
  nestjs: "nestjs", graphql: "graphql",
  apollo: "apollo", webpack: "webpack", babel: "babel",
  npm: "npm", yarn: "yarn", git: "git",
  github: "github", gitlab: "gitlab", bitbucket: "bitbucket",
  figma: "figma", prisma: "prisma", redux: "redux",
  redis: "redis", jest: "jest", cypress: "cypress",
  "nuxt.js": "nuxt", nuxtjs: "nuxt", nuxt: "nuxt",
  vercel: "vercel", netlify: "netlify",
  python: "python", java: "java", go: "go",
  rust: "rust", kotlin: "kotlin", swift: "swift",
  flutter: "flutter", dart: "dart",
};

// ─── STUDENT: University Admission Interviewer ───────────────────────────────
export const studentInterviewer: CreateAssistantDTO = {
  name: "University Admission Interviewer",
  firstMessage: "Hello! Welcome to your university admission interview. I have reviewed your academic profile and have a few questions prepared for you. Are you ready to begin?",
  transcriber: { provider: "deepgram", model: "nova-2", language: "en" },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4o-mini",
    messages: [{
      role: "system",
      content: `You are a university admissions interviewer. Your job is to ask the candidate the following questions one by one to assess their suitability for admission.

Questions to ask:
{{questions}}

STRICT RULES:
- Ask question 1 first. Wait for the full answer. Then ask question 2. Continue in order.
- After each answer say only "Thank you" or "I see" or "Interesting" — then immediately ask the next question
- Do NOT ask any questions outside the list above
- Do NOT give feedback or evaluate answers during the interview
- Do NOT have extended conversations
- After the LAST question is answered, say exactly: "Thank you so much for your time today. This concludes your admission interview. We will review your application and be in touch soon. Best of luck. Goodbye!"
- This is a voice call — keep all your responses very short (1 sentence max before asking next question)`,
    }],
  },
  endCallFunctionEnabled: true,
  endCallPhrases: ["this concludes your admission interview", "best of luck. goodbye"],
};

// ─── FRESHER: Job Interviewer ─────────────────────────────────────────────────
export const fresherInterviewer: CreateAssistantDTO = {
  name: "Job Interviewer - Fresher",
  firstMessage: "Hello! Thank you for joining today. I have reviewed your profile and have some questions ready for you. Are you ready to begin the interview?",
  transcriber: { provider: "deepgram", model: "nova-2", language: "en" },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4o-mini",
    messages: [{
      role: "system",
      content: `You are a professional job interviewer conducting a structured interview for a fresher candidate.

Questions to ask in order:
{{questions}}

STRICT RULES:
- Ask question 1 first. Wait for the full answer. Then ask question 2. Continue in order.
- After each answer say only "Thank you" or "Got it" or "I see" — then immediately ask the next question
- Do NOT ask follow-up questions or have extended conversations
- Do NOT give any feedback on answers during the interview
- Do NOT skip any questions
- After the LAST question is answered, say exactly: "Thank you for your time today. That concludes our interview. We will review your responses and get back to you soon. Goodbye!"
- This is a voice call — keep all responses under 1 sentence before asking the next question`,
    }],
  },
  endCallFunctionEnabled: true,
  endCallPhrases: ["that concludes our interview", "get back to you soon. goodbye"],
};

// ─── PROFESSIONAL: Job Interviewer ───────────────────────────────────────────
export const professionalInterviewer: CreateAssistantDTO = {
  name: "Job Interviewer - Professional",
  firstMessage: "Hello! Thank you for making time today. I have gone through your profile and have a set of questions prepared. Are you ready to get started?",
  transcriber: { provider: "deepgram", model: "nova-2", language: "en" },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4o-mini",
    messages: [{
      role: "system",
      content: `You are a senior technical interviewer conducting a structured interview for an experienced professional candidate.

Questions to ask in order:
{{questions}}

STRICT RULES:
- Ask question 1 first. Wait for the full answer. Then ask question 2. Continue in order.
- After each answer say only "Thank you" or "Understood" or "Good" — then immediately ask the next question
- Do NOT ask follow-up questions, do NOT probe deeper, do NOT have extended conversations
- Do NOT give any feedback or evaluation during the interview
- Do NOT skip any questions
- After the LAST question is answered, say exactly: "Thank you for your time today. That concludes our interview. Our team will review your responses and reach out to you shortly. Goodbye!"
- This is a voice call — keep all responses under 1 sentence before asking the next question`,
    }],
  },
  endCallFunctionEnabled: true,
  endCallPhrases: ["that concludes our interview", "reach out to you shortly. goodbye"],
};

// ─── DEFAULT fallback (kept for backward compat) ─────────────────────────────
export const interviewer = fresherInterviewer;

// ─── FEEDBACK SCHEMAS ─────────────────────────────────────────────────────────

export const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.tuple([
    z.object({ name: z.literal("Communication Skills"), score: z.number(), comment: z.string() }),
    z.object({ name: z.literal("Technical Knowledge"), score: z.number(), comment: z.string() }),
    z.object({ name: z.literal("Problem Solving"), score: z.number(), comment: z.string() }),
    z.object({ name: z.literal("Cultural Fit"), score: z.number(), comment: z.string() }),
    z.object({ name: z.literal("Confidence and Clarity"), score: z.number(), comment: z.string() }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});

export const studentFeedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.tuple([
    z.object({ name: z.literal("Communication Skills"), score: z.number(), comment: z.string() }),
    z.object({ name: z.literal("Academic Knowledge"), score: z.number(), comment: z.string() }),
    z.object({ name: z.literal("Passion and Motivation"), score: z.number(), comment: z.string() }),
    z.object({ name: z.literal("Critical Thinking"), score: z.number(), comment: z.string() }),
    z.object({ name: z.literal("Confidence and Clarity"), score: z.number(), comment: z.string() }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});

export const interviewCovers = [
  "/adobe.png", "/amazon.png", "/facebook.png", "/hostinger.png",
  "/pinterest.png", "/quora.png", "/reddit.png", "/skype.png",
  "/spotify.png", "/telegram.png", "/tiktok.png", "/yahoo.png",
];

export const dummyInterviews: Interview[] = [
  {
    id: "1", userId: "user1", role: "Frontend Developer", type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    level: "Junior", questions: ["What is React?"], finalized: false, createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2", userId: "user1", role: "Full Stack Developer", type: "Mixed",
    techstack: ["Node.js", "Express", "MongoDB", "React"],
    level: "Senior", questions: ["What is Node.js?"], finalized: false, createdAt: "2024-03-14T15:30:00Z",
  },
];

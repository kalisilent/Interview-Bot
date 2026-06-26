import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function GET() {
    return Response.json({ success: true, data: 'THANK YOU!' }, { status: 200 });
}

export async function POST(request: Request) {
    console.log('🔥 Generate route called!');

    try {
        const body = await request.json();
        console.log('📦 Request body:', body);

        const { role, level, techstack, amount, userid, userType, studyField, academicReport, resumeText, jdText } = body;

        // For students, studyField is the identifier; for others, role is required
        if (!userid) {
            return Response.json({ success: false, error: 'Missing userid' }, { status: 400 });
        }
        if (userType === 'student' && !studyField) {
            return Response.json({ success: false, error: 'Missing studyField for student' }, { status: 400 });
        }
        if (userType !== 'student' && !role) {
            return Response.json({ success: false, error: 'Missing role' }, { status: 400 });
        }

        const durationMap: Record<string, number> = { student: 15, fresher: 30, professional: 45 };
        const duration = durationMap[userType] || 30;

        let prompt = '';

        if (userType === 'student') {
            prompt = `You are preparing questions for a UNIVERSITY ADMISSION INTERVIEW.

Field of Study Applied For: ${studyField}

Student Academic Report:
${academicReport}

Generate exactly ${amount} interview questions. Rules:
- These are university admission questions, NOT job interview questions
- Ask 2-3 questions directly based on the academic report above (specific subjects, grades, achievements mentioned)
- Ask 1-2 questions about why they chose ${studyField} and their passion for it
- Ask 1 question about future goals in this field
- Ask 1 question about a challenge they overcame academically
- Questions must be specific, NOT generic. Reference actual subjects/achievements from their report
- Do NOT ask about work experience, tech stack, or professional skills
- Do NOT use "/" or "*" or special characters
- Return ONLY a JSON array: ["Question 1", "Question 2", ...]`;

        } else if (userType === 'fresher') {
            prompt = `You are preparing questions for a JOB INTERVIEW for a FRESHER candidate (0-2 years experience).

Role: ${role}
Level: ${level}
Tech Stack: ${techstack}

Candidate Resume:
${resumeText}

Job Description:
${jdText}

Generate exactly ${amount} interview questions. Rules:
- 3-4 TECHNICAL questions specific to the tech stack: ${techstack}. Ask about specific concepts, data structures, algorithms, system design basics, or framework internals — NOT surface level
- 2-3 questions directly from the resume (mention specific projects, internships, or technologies listed)
- 1-2 behavioral questions (STAR format: handle conflict, tight deadline, learning from failure)
- 1 question about why they want this specific role based on the JD
- Questions must be specific and technical, NOT generic or vague
- Do NOT use "/" or "*" or special characters
- Return ONLY a JSON array: ["Question 1", "Question 2", ...]`;

        } else {
            prompt = `You are preparing questions for a JOB INTERVIEW for a PROFESSIONAL candidate (2+ years experience).

Role: ${role}
Level: ${level}
Tech Stack: ${techstack}

Candidate Resume:
${resumeText}

Job Description:
${jdText}

Generate exactly ${amount} interview questions. Rules:
- 3-4 DEEP TECHNICAL questions: system design, architecture decisions, performance optimization, scalability, security — for ${techstack}
- 2-3 questions from the resume: dig into specific projects, ask about technical decisions made, challenges faced
- 2-3 LEADERSHIP questions: team management, mentoring, driving technical decisions, handling disagreements
- 1-2 JD alignment questions: how their experience matches specific requirements in the JD
- 1 strategic thinking question: how they would approach a complex problem at scale
- Questions must be senior-level, specific, and challenging — NOT basic
- Do NOT use "/" or "*" or special characters
- Return ONLY a JSON array: ["Question 1", "Question 2", ...]`;
        }

        console.log('🤖 Calling Gemini...');

        const { text: questionsRaw } = await generateText({
            model: google('gemini-2.5-flash'),
            prompt,
        });

        console.log('✅ Gemini response:', questionsRaw);

        let parsedQuestions;
        try {
            parsedQuestions = JSON.parse(questionsRaw);
        } catch {
            const match = questionsRaw.match(/\[[\s\S]*\]/);
            if (match) {
                parsedQuestions = JSON.parse(match[0]);
            } else {
                throw new Error('Could not parse questions from Gemini response');
            }
        }

        console.log('📝 Parsed questions:', parsedQuestions);

        const interview = {
            role: userType === 'student' ? studyField : role,
            type: userType === 'student' ? 'university-admission' : 'mixed',
            level: userType === 'student' ? 'student' : level,
            techstack: userType === 'student' ? [studyField] : (techstack ? techstack.split(',').map((t: string) => t.trim()) : []),
            questions: parsedQuestions,
            userId: userid,
            userType: userType || 'fresher',
            studyField: studyField || '',
            duration,
            academicReport: academicReport || '',
            resumeText: resumeText || '',
            jdText: jdText || '',
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
        };

        console.log('💾 Saving to Firestore...');
        const docRef = await db.collection('interviews').add(interview);
        console.log('✅ Saved with ID:', docRef.id);

        return Response.json({ success: true, interviewId: docRef.id }, { status: 200 });

    } catch (error) {
        console.error('❌ Error in generate route:', error);
        return Response.json({ success: false, error: String(error) }, { status: 500 });
    }
}

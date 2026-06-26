'use server';

import { db } from "@/firebase/admin";
import { generateObject } from "ai";
import { google } from '@ai-sdk/google';
import { feedbackSchema, studentFeedbackSchema } from '@/constants';

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
    const interviews = await db.collection('interviews')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
    return interviews.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Interview[];
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;
    const interviews = await db.collection('interviews')
        .orderBy('createdAt', 'desc')
        .where('finalized', '==', true)
        .where('userId', '!=', userId)
        .limit(limit)
        .get();
    return interviews.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Interview[];
}

export async function getInterviewById(interviewId: string): Promise<Interview | null> {
    try {
        const doc = await db.collection('interviews').doc(interviewId).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as Interview;
    } catch (error) {
        console.error('Error fetching interview:', error);
        return null;
    }
}

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, userType } = params;

    try {
        console.log('📊 Creating feedback. Transcript messages:', transcript.length, 'userType:', userType);

        const formattedTranscript = transcript.length > 0
            ? transcript.map((s) => `-${s.role}: ${s.content}\n`).join('')
            : 'No transcript available - candidate did not respond.';

        const isStudent = userType === 'student';

        let prompt = '';
        let schema: any;

        if (isStudent) {
            schema = studentFeedbackSchema;
            prompt = `You are evaluating a UNIVERSITY ADMISSION INTERVIEW. Assess the candidate's suitability for university admission.

Transcript:
${formattedTranscript}

Score the candidate from 0 to 100 in these EXACT categories:
- Communication Skills: How clearly and confidently they express themselves
- Academic Knowledge: Depth of knowledge in their subject area
- Passion and Motivation: Genuine interest and drive for their chosen field
- Critical Thinking: Ability to reason, analyze, and think independently
- Confidence and Clarity: Composure and clarity under interview conditions

Provide 3-5 specific strengths with examples from the transcript.
Provide 3-5 actionable areas for improvement.
Write a final assessment paragraph about their readiness for university admission.
Be honest and specific — reference actual things they said.`;
        } else {
            schema = feedbackSchema;
            const isProfessional = userType === 'professional';
            prompt = `You are evaluating a JOB INTERVIEW for a ${isProfessional ? 'PROFESSIONAL (senior)' : 'FRESHER (entry-level)'} candidate.

Transcript:
${formattedTranscript}

Score the candidate from 0 to 100 in these EXACT categories:
- Communication Skills: Clarity, articulation, structured responses
- Technical Knowledge: Depth and accuracy of technical answers
- Problem Solving: Analytical thinking and solution approach
- Cultural Fit: Attitude, professionalism, and work ethic signals
- Confidence and Clarity: Confidence in delivery and clarity of thought

${isProfessional
    ? 'As a senior candidate, hold them to a high standard. Weak system design or leadership answers should be scored lower.'
    : 'As a fresher, assess foundational knowledge and learning potential, not years of experience.'}

Provide 3-5 specific strengths with examples from the transcript.
Provide 3-5 actionable areas for improvement with specific advice.
Write a final assessment paragraph. Be honest — if performance was poor, say so clearly.`;
        }

        const { object } = await generateObject({
            model: google('gemini-2.5-flash', { structuredOutputs: false }),
            schema,
            prompt,
            system: "You are a professional evaluator. Score honestly. Reference specific things from the transcript.",
        });

        const feedback = await db.collection('feedback').add({
            interviewId,
            userId,
            totalScore: object.totalScore,
            categoryScores: object.categoryScores,
            strengths: object.strengths,
            areasForImprovement: object.areasForImprovement,
            finalAssessment: object.finalAssessment,
            userType: userType || 'fresher',
            createdAt: new Date().toISOString(),
        });

        console.log('✅ Feedback saved:', feedback.id, 'Score:', object.totalScore);
        return { success: true, feedbackId: feedback.id };

    } catch (error) {
        console.error('❌ Error saving feedback:', error);
        return { success: false };
    }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
    const { interviewId, userId } = params;
    const feedback = await db.collection('feedback')
        .where('interviewId', '==', interviewId)
        .where('userId', '==', userId)
        .limit(1)
        .get();
    if (feedback.empty) return null;
    const feedbackDoc = feedback.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getFeedbackByInterviewIdPublic(interviewId: string): Promise<Feedback | null> {
    const feedback = await db.collection('feedback')
        .where('interviewId', '==', interviewId)
        .limit(1)
        .get();
    if (feedback.empty) return null;
    const feedbackDoc = feedback.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

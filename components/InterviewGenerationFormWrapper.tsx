"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import InterviewGenerationForm, { GenerationFormData } from '@/components/InterviewGenerationForm';

interface InterviewGenerationFormWrapperProps {
    userName: string;
    userId: string;
    userProfilePicture?: string;
    userInitials?: string;
}

const InterviewGenerationFormWrapper = ({ 
    userName, 
    userId,
}: InterviewGenerationFormWrapperProps) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleFormSubmit = async (data: GenerationFormData) => {
        setLoading(true);

        try {
            console.log('Submitting form data:', data);

            const response = await fetch('/api/vapi/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: data.role || data.studyField || '',
                    level: data.level || 'student',
                    type: data.userType === 'student' ? 'university-admission' : 'mixed',
                    techstack: data.techstack || '',
                    amount: data.amount,
                    userid: userId,
                    userType: data.userType,
                    studyField: data.studyField || '',
                    academicReport: data.academicReport || '',
                    resumeText: data.resumeText || '',
                    jdText: data.jdText || '',
                }),
            });

            const result = await response.json();
            console.log('API response:', result);

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to generate interview');
            }

            toast.success('Interview generated! Loading...');
            router.push(`/interview/${result.interviewId}`);

        } catch (error) {
            console.error('Error generating interview:', error);
            toast.error('Failed to generate interview. Please try again.');
            setLoading(false);
        }
    };

    return (
        <InterviewGenerationForm
            onSubmit={handleFormSubmit}
            loading={loading}
        />
    );
};

export default InterviewGenerationFormWrapper;
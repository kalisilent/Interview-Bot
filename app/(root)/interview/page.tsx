import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth.action';
import InterviewGenerationFormWrapper from '@/components/InterviewGenerationFormWrapper';

const Page = async () => {
    const user = await getCurrentUser();
    if (!user) redirect('/sign-in');

    return (
        <>
            <div className="flex flex-col items-center mb-6">
                <h3 className="text-2xl font-semibold">Generate Your Interview</h3>
                <p className="text-light-400 text-sm mt-2">
                    Tell us about yourself and we will create a personalized interview
                </p>
            </div>

            <InterviewGenerationFormWrapper
                userName={user.name}
                userId={user.id}
                userProfilePicture={user.profilePicture}
                userInitials={user.profileInitials}
            />
        </>
    );
};

export default Page;
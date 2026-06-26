"use client"
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { vapi } from '@/lib/vapi.sdk';
import { studentInterviewer, fresherInterviewer, professionalInterviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

interface SavedMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface AgentProps {
    userName: string;
    userId: string;
    userProfilePicture?: string;
    userInitials?: string;
    type: 'generate' | 'interview';
    interviewId?: string;
    questions?: string[];
    userType?: string; // 'student' | 'fresher' | 'professional'
}

interface Message {
    type: string;
    transcriptType?: string;
    role: 'user' | 'assistant' | 'system';
    transcript: string;
}

const Agent = ({ userName, userId, userProfilePicture, userInitials, type, interviewId, questions, userType }: AgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [imageError, setImageError] = useState(false);

    const handleGenerateFeedback = useCallback(async (msgs: SavedMessage[]) => {
        if (type !== 'interview' || !interviewId) {
            router.push('/');
            return;
        }
        try {
            const { success, feedbackId: id } = await createFeedback({
                interviewId,
                userId,
                transcript: msgs,
                userType,
            });
            if (success && id) {
                router.push(`/interview/${interviewId}/feedback`);
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error('Error in handleGenerateFeedback:', error);
            router.push('/');
        }
    }, [interviewId, userId, router, type, userType]);

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
        const onMessage = (message: Message) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                setMessages((prev) => [...prev, { role: message.role, content: message.transcript }]);
            }
        };
        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);
        const onError = (e: Error) => console.error('Vapi error:', e);

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        };
    }, []);

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            if (type === 'generate') {
                router.push('/');
            } else {
                handleGenerateFeedback(messages);
            }
        }
    }, [callStatus, messages, type, router, handleGenerateFeedback]);

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);
        try {
            if (type === 'generate') {
                const assistantId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
                if (!assistantId) {
                    alert('NEXT_PUBLIC_VAPI_WORKFLOW_ID not set in .env.local');
                    setCallStatus(CallStatus.INACTIVE);
                    return;
                }
                await vapi.start(assistantId, {
                    variableValues: { username: userName, userid: userId },
                });
            } else {
                // Pick the right interviewer config based on userType
                const interviewerConfig =
                    userType === 'student' ? studentInterviewer :
                    userType === 'professional' ? professionalInterviewer :
                    fresherInterviewer;

                const formattedQuestions = questions
                    ? questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
                    : '';

                console.log('🎤 Starting interview | userType:', userType, '| questions:', questions?.length);

                await vapi.start(interviewerConfig, {
                    variableValues: { questions: formattedQuestions },
                });
            }
        } catch (error) {
            console.error('Failed to start call:', error);
            setCallStatus(CallStatus.INACTIVE);
        }
    };

    const handleDisconnect = async () => {
        try {
            await vapi.stop();
            setCallStatus(CallStatus.FINISHED);
        } catch (error) {
            console.error('Failed to stop call:', error);
        }
    };

    const latestMessage = messages[messages.length - 1]?.content;
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <>
            <div className='call-view'>
                <div className='card-interviewer'>
                    <div className='avatar'>
                        <Image src="/ai-avatar.png" className='object-cover' alt="Avatar" width={65} height={54} />
                        {isSpeaking && <span className="animate-speak" />}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                <div className='card-border'>
                    <div className='card-content'>
                        {!imageError && userProfilePicture ? (
                            <Image
                                src={userProfilePicture}
                                className='rounded-full object-cover size-[120px]'
                                alt={userName}
                                width={120}
                                height={120}
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className='rounded-full bg-gradient-to-br from-blue-500 to-purple-600 size-[120px] flex items-center justify-center text-white text-2xl font-bold shadow-lg'>
                                {userInitials || userName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className='transcript'>
                        <p key={latestMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
                            {latestMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className='w-full flex justify-center'>
                {callStatus !== CallStatus.ACTIVE ? (
                    <button className='relative btn-call' onClick={handleCall}>
                        <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus === 'CONNECTING' && 'hidden')} />
                        <span>{isCallInactiveOrFinished ? 'Call' : 'Connecting...'}</span>
                    </button>
                ) : (
                    <button className='btn-disconnect' onClick={handleDisconnect}>Disconnect</button>
                )}
            </div>
        </>
    );
};

export default Agent;

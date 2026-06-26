"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InterviewGenerationFormProps {
    onSubmit: (data: GenerationFormData) => void;
    loading?: boolean;
}

export interface GenerationFormData {
    userType: 'student' | 'fresher' | 'professional';
    studyField?: string;   // students only
    role?: string;         // fresher/professional only
    level?: string;        // fresher/professional only
    techstack?: string;    // fresher/professional only
    amount: number;
    academicReport?: string; // students only (mandatory)
    resumeText?: string;     // fresher/professional
    jdText?: string;         // fresher/professional
}

const userTypes = [
    { value: 'student', label: '🎓 Student', description: 'University admission interview' },
    { value: 'fresher', label: '🚀 Fresher', description: '0-2 years, job interview' },
    { value: 'professional', label: '💼 Professional', description: '2+ years, job interview' },
];

const studyFields = [
    'Science', 'Commerce', 'Arts & Humanities', 'Engineering',
    'Medicine & Health', 'Law', 'Management & Business',
    'Computer Science', 'Social Sciences', 'Design & Architecture',
];

const levels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
];

const InterviewGenerationForm = ({ onSubmit, loading = false }: InterviewGenerationFormProps) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<GenerationFormData>>({
        userType: undefined,
        studyField: '',
        role: '',
        level: '',
        techstack: '',
        amount: 5,
        academicReport: '',
        resumeText: '',
        jdText: '',
    });

    const isStudent = formData.userType === 'student';
    // Student: 1(type) 2(field) 3(academic report) 4(review)
    // Fresher/Pro: 1(type) 2(role) 3(level) 4(techstack) 5(resume) 6(JD) 7(review)
    const totalSteps = isStudent ? 4 : 7;
    const progressPercentage = (step / totalSteps) * 100;

    const handleNext = () => {
        if (step === 1 && !formData.userType) { toast.error('Please select your type'); return; }
        if (isStudent) {
            if (step === 2 && !formData.studyField) { toast.error('Please select your field of study'); return; }
            if (step === 3 && !formData.academicReport) { toast.error('Academic report is required'); return; }
        } else {
            if (step === 2 && !formData.role) { toast.error('Please enter a role'); return; }
            if (step === 3 && !formData.level) { toast.error('Please select a level'); return; }
            if (step === 4 && !formData.techstack) { toast.error('Please enter tech stack'); return; }
            if (step === 5 && !formData.resumeText) { toast.error('Resume is required'); return; }
            if (step === 6 && !formData.jdText) { toast.error('Job description is required'); return; }
        }
        if (step < totalSteps) { setStep(step + 1); } else { handleSubmit(); }
    };

    const handleBack = () => { if (step > 1) setStep(step - 1); };

    const handleSubmit = () => {
        if (isStudent && (!formData.studyField || !formData.academicReport)) {
            toast.error('Please fill all required fields'); return;
        }
        if (!isStudent && (!formData.role || !formData.level || !formData.techstack)) {
            toast.error('Please fill all required fields'); return;
        }
        onSubmit({
            userType: formData.userType as 'student' | 'fresher' | 'professional',
            studyField: formData.studyField || '',
            role: formData.role || '',
            level: formData.level || '',
            techstack: formData.techstack || '',
            amount: isStudent ? 6 : formData.userType === 'fresher' ? 8 : 12,
            academicReport: formData.academicReport || '',
            resumeText: formData.resumeText || '',
            jdText: formData.jdText || '',
        });
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="card-border max-w-2xl w-full">
                <div className="card py-10 px-8">
                    {/* Progress bar */}
                    <div className="mb-8">
                        <div className="w-full bg-dark-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-primary-200 to-primary-100 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-light-400 mt-2">Step {step} of {totalSteps}</p>
                    </div>

                    {/* STEP 1: User Type */}
                    {step === 1 && (
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-2xl font-semibold">Who are you?</h2>
                                <p className="text-light-400 text-sm mt-2">This tailors your interview experience</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                {userTypes.map(type => (
                                    <button key={type.value}
                                        onClick={() => setFormData({ ...formData, userType: type.value as any })}
                                        className={cn('w-full p-4 rounded-xl text-left transition-all border-2',
                                            formData.userType === type.value ? 'border-primary-200 bg-primary-200/10' : 'border-dark-200 hover:border-light-600'
                                        )}>
                                        <p className="font-semibold text-white">{type.label}</p>
                                        <p className="text-xs text-light-400 mt-1">{type.description}</p>
                                    </button>
                                ))}
                            </div>
                            <Button onClick={handleNext} disabled={!formData.userType} className="btn-primary w-full">Next</Button>
                        </div>
                    )}

                    {/* STEP 2 STUDENT: Study Field */}
                    {step === 2 && isStudent && (
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-2xl font-semibold">Field of Study</h2>
                                <p className="text-light-400 text-sm mt-2">What stream are you applying for?</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {studyFields.map(field => (
                                    <button key={field}
                                        onClick={() => setFormData({ ...formData, studyField: field })}
                                        className={cn('p-3 rounded-lg text-sm font-medium transition-all border-2',
                                            formData.studyField === field ? 'border-primary-200 bg-primary-200/10 text-white' : 'border-dark-200 text-light-400 hover:border-light-600'
                                        )}>
                                        {field}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={handleBack} variant="outline" className="btn-secondary flex-1">Back</Button>
                                <Button onClick={handleNext} disabled={!formData.studyField} className="btn-primary flex-1">Next</Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 STUDENT: Academic Report (MANDATORY) */}
                    {step === 3 && isStudent && (
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-2xl font-semibold">Academic Report <span className="text-destructive-100 text-sm">*Required</span></h2>
                                <p className="text-light-400 text-sm mt-2">Paste your grades, achievements, subjects, or academic summary. This is used to ask specific questions about your academics.</p>
                            </div>
                            <textarea
                                placeholder="e.g. Class 12 - Physics 92, Chemistry 88, Maths 95... Achievements: Science Olympiad winner... Extracurriculars: Debate club..."
                                value={formData.academicReport || ''}
                                onChange={e => setFormData({ ...formData, academicReport: e.target.value })}
                                className="w-full bg-dark-200 rounded-lg p-4 text-white min-h-44 resize-none border border-dark-300 focus:border-primary-200 focus:outline-none placeholder:text-light-400 text-sm"
                            />
                            <div className="flex gap-3">
                                <Button onClick={handleBack} variant="outline" className="btn-secondary flex-1">Back</Button>
                                <Button onClick={handleNext} disabled={!formData.academicReport} className="btn-primary flex-1">Next</Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4 STUDENT: Review */}
                    {step === 4 && isStudent && (
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-2xl font-semibold">Ready to go!</h2>
                                <p className="text-light-400 text-sm mt-2">Your university admission interview is ready</p>
                            </div>
                            <div className="bg-dark-200 rounded-xl p-5 space-y-2">
                                <p className="text-light-100"><span className="text-white font-semibold">Type:</span> 🎓 University Admission</p>
                                <p className="text-light-100"><span className="text-white font-semibold">Field:</span> {formData.studyField}</p>
                                <p className="text-light-100"><span className="text-white font-semibold">Academic Report:</span> ✅ Provided</p>
                                <p className="text-light-100"><span className="text-white font-semibold">Questions:</span> 5-6 tailored questions</p>
                                <p className="text-light-100"><span className="text-white font-semibold">Duration:</span> ~15 minutes</p>
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={handleBack} variant="outline" className="btn-secondary flex-1">Back</Button>
                                <Button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
                                    {loading ? 'Generating...' : 'Generate Interview'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 FRESHER/PRO: Role */}
                    {step === 2 && !isStudent && (
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-2xl font-semibold">Target Role</h2>
                                <p className="text-light-400 text-sm mt-2">e.g., Software Engineer, Data Analyst, Product Manager</p>
                            </div>
                            <Input placeholder="Enter job role..." value={formData.role || ''}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="!bg-dark-200 !rounded-full !min-h-12 !px-5" />
                            <div className="flex gap-3">
                                <Button onClick={handleBack} variant="outline" className="btn-secondary flex-1">Back</Button>
                                <Button onClick={handleNext} disabled={!formData.role} className="btn-primary flex-1">Next</Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 FRESHER/PRO: Level */}
                    {step === 3 && !isStudent && (
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-2xl font-semibold">Experience Level</h2>
                                <p className="text-light-400 text-sm mt-2">For the role you are targeting</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {levels.map(level => (
                                    <button key={level.value}
                                        onClick={() => setFormData({ ...formData, level: level.value })}
                                        className={cn('p-4 rounded-lg text-sm font-semibold transition-all border-2',
                                            formData.level === level.value ? 'border-primary-200 bg-primary-200/10 text-white' : 'border-dark-200 text-light-400 hover:border-light-600'
                                        )}>
                                        {level.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={handleBack} variant="outline" className="btn-secondary flex-1">Back</Button>
                                <Button onClick={handleNext} disabled={!formData.level} className="btn-primary flex-1">Next</Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4 FRESHER/PRO: Tech Stack */}
                    {step === 4 && !isStudent && (
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-2xl font-semibold">Tech Stack</h2>
                                <p className="text-light-400 text-sm mt-2">Comma-separated. e.g., React, Node.js, MongoDB, AWS</p>
                            </div>
                            <Input placeholder="React, Node.js, PostgreSQL..."
                                value={formData.techstack || ''}
                                onChange={e => setFormData({ ...formData, techstack: e.target.value })}
                                className="!bg-dark-200 !rounded-full !min-h-12 !px-5" />
                            <div className="flex gap-3">
                                <Button onClick={handleBack} variant="outline" className="btn-secondary flex-1">Back</Button>
                                <Button onClick={handleNext} disabled={!formData.techstack} className="btn-primary flex-1">Next</Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 5 FRESHER/PRO: Resume */}
                    {step === 5 && !isStudent && (
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-2xl font-semibold">Your Resume</h2>
                                <p className="text-light-400 text-sm mt-2">Paste your resume — used to ask specific questions about your experience</p>
                            </div>
                            <textarea
                                placeholder="Paste your resume content here..."
                                value={formData.resumeText || ''}
                                onChange={e => setFormData({ ...formData, resumeText: e.target.value })}
                                className="w-full bg-dark-200 rounded-lg p-4 text-white min-h-40 resize-none border border-dark-300 focus:border-primary-200 focus:outline-none placeholder:text-light-400"
                            />
                            <div className="flex gap-3">
                                <Button onClick={handleBack} variant="outline" className="btn-secondary flex-1">Back</Button>
                                <Button onClick={handleNext} disabled={!formData.resumeText} className="btn-primary flex-1">Next</Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 6 FRESHER/PRO: JD */}
                    {step === 6 && !isStudent && (
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-2xl font-semibold">Job Description</h2>
                                <p className="text-light-400 text-sm mt-2">Paste the JD — questions will be aligned to the role requirements</p>
                            </div>
                            <textarea
                                placeholder="Paste the job description here..."
                                value={formData.jdText || ''}
                                onChange={e => setFormData({ ...formData, jdText: e.target.value })}
                                className="w-full bg-dark-200 rounded-lg p-4 text-white min-h-40 resize-none border border-dark-300 focus:border-primary-200 focus:outline-none placeholder:text-light-400"
                            />
                            <div className="flex gap-3">
                                <Button onClick={handleBack} variant="outline" className="btn-secondary flex-1">Back</Button>
                                <Button onClick={handleNext} disabled={!formData.jdText} className="btn-primary flex-1">Next</Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 7 FRESHER/PRO: Review */}
                    {step === 7 && !isStudent && (
                        <div className="flex flex-col gap-6">
                            <div>
                                <h2 className="text-2xl font-semibold">Ready to go!</h2>
                                <p className="text-light-400 text-sm mt-2">Review your selections</p>
                            </div>
                            <div className="bg-dark-200 rounded-xl p-5 space-y-2">
                                <p className="text-light-100"><span className="text-white font-semibold">Type:</span> {formData.userType === 'fresher' ? '🚀 Fresher' : '💼 Professional'}</p>
                                <p className="text-light-100"><span className="text-white font-semibold">Role:</span> {formData.role}</p>
                                <p className="text-light-100"><span className="text-white font-semibold">Level:</span> {formData.level}</p>
                                <p className="text-light-100"><span className="text-white font-semibold">Tech Stack:</span> {formData.techstack}</p>
                                <p className="text-light-100"><span className="text-white font-semibold">Resume:</span> ✅ Provided</p>
                                <p className="text-light-100"><span className="text-white font-semibold">JD:</span> ✅ Provided</p>
                                <p className="text-light-100"><span className="text-white font-semibold">Questions:</span> {formData.userType === 'fresher' ? '7-8' : '10-12'} tailored questions</p>
                                <p className="text-light-100"><span className="text-white font-semibold">Duration:</span> ~{formData.userType === 'fresher' ? '30' : '45'} minutes</p>
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={handleBack} variant="outline" className="btn-secondary flex-1">Back</Button>
                                <Button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
                                    {loading ? 'Generating...' : 'Generate Interview'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewGenerationForm;

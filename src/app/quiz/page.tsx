"use client";
import Quiz from "@/components/quiz";
import { currentQuizData, currentFormData } from "@/components/form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function QuizPage() {
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!currentQuizData || currentQuizData.length === 0) {
            router.push("/");
            return;
        }
        setIsReady(true);
    }, [router]);

    if (!isReady) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center bg-white border-2 border-slate-200 rounded-xl shadow-[4px_4px_0px_0px_rgba(203,213,225,1)] p-8">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-lg font-bold text-gray-700">Loading your quiz...</p>
                </div>
            </div>
        );
    }

    return (
        <Quiz
            quizData={currentQuizData}
            formData={currentFormData}
        />
    );
}

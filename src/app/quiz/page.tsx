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
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading quiz...</p>
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

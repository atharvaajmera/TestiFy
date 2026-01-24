"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Sparkles, ChevronRight } from "lucide-react";

interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
}

interface QuizProps {
    quizData: QuizQuestion[];
    formData: {
        name: string;
        class: string;
        subject: string;
        topic: string;
        difficulty: string;
    };
}

export default function Quiz({ quizData, formData }: QuizProps) {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const currentQuestion = quizData[currentQuestionIndex];
    const totalQuestions = quizData.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    const handleOptionSelect = (option: string) => {
        if (showAnswer) return;
        setSelectedAnswer(option);
    };

    const handleSubmitAnswer = () => {
        if (!selectedAnswer) return;

        const isCorrect = selectedAnswer === currentQuestion.answer;
        if (isCorrect) {
            setScore((prev) => prev + 1);
        }

        setShowAnswer(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedAnswer(null);
            setShowAnswer(false);
        } else {
            setQuizCompleted(true);
        }
    };

    const handleRestartQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowAnswer(false);
        setScore(0);
        setQuizCompleted(false);
    };

    if (quizCompleted) {
        const percentage = Math.round((score / totalQuestions) * 100);
        const isPerfect = percentage === 100;
        const isGood = percentage >= 70;

        return (
            <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-10 max-w-lg w-full text-center">
                    <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200/50">
                        {isPerfect ? (
                            <Trophy className="w-16 h-16 text-amber-200" />
                        ) : (
                            <Sparkles className="w-16 h-16 text-white" />
                        )}
                    </div>

                    <h2 className="text-4xl font-bold text-slate-800 mb-3">
                        {isPerfect ? "Perfect Score! 🎉" : isGood ? "Well Done! 🌟" : "Keep Practicing! 💪"}
                    </h2>
                    <p className="text-xl text-slate-600 mb-10">Great job, {formData.name}!</p>

                    <div className="bg-indigo-50 rounded-3xl p-8 mb-8 shadow-lg shadow-indigo-100/30">
                        <div className="text-6xl font-bold text-indigo-500 mb-3">{percentage}%</div>
                        <p className="text-lg text-slate-600">
                            <span className="font-bold text-slate-800">{score}</span> out of{" "}
                            <span className="font-bold text-slate-800">{totalQuestions}</span> correct
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleRestartQuiz}
                            className="flex-1 px-6 py-4 bg-indigo-500 text-white rounded-3xl font-bold text-lg shadow-lg shadow-indigo-200/50 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-200/60 transition-all"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => router.push("/")}
                            className="flex-1 px-6 py-4 bg-white text-indigo-500 rounded-3xl font-bold text-lg shadow-lg shadow-slate-200/50 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60 transition-all ring-2 ring-indigo-200"
                        >
                            New Quiz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] flex flex-col py-6">
            {/* Progress Section */}
            <div className="max-w-2xl mx-auto w-full px-6 mb-4">
                <div className="bg-white rounded-3xl shadow-lg shadow-indigo-100/30 p-4">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-indigo-500 bg-indigo-50 px-4 py-2 rounded-full">
                            {currentQuestionIndex + 1} / {totalQuestions}
                        </span>
                        <span className="text-sm font-bold text-slate-600">
                            Score: <span className="text-indigo-500">{score}</span>
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <div className="flex-1 flex items-center justify-center px-6">
                <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-6 max-w-2xl w-full">
                    {/* Question Header */}
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-slate-800 leading-relaxed">
                            {currentQuestion.question}
                        </h2>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mb-6">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrect = option === currentQuestion.answer;
                            const optionLetter = String.fromCharCode(65 + index);

                            let cardClasses = "w-full p-4 rounded-3xl text-left transition-all duration-200 cursor-pointer bg-white shadow-sm text-slate-700";
                            let letterClasses = "w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold flex-shrink-0";

                            if (showAnswer) {
                                if (isCorrect) {
                                    cardClasses = "w-full p-4 rounded-3xl text-left transition-all duration-200 bg-green-50 shadow-md shadow-green-100/50 text-green-700 border-2 border-green-500";
                                    letterClasses += " bg-green-500 text-white";
                                } else if (isSelected && !isCorrect) {
                                    cardClasses = "w-full p-4 rounded-3xl text-left transition-all duration-200 bg-red-50 shadow-md shadow-red-100/50 text-red-700 border-2 border-red-500";
                                    letterClasses += " bg-red-500 text-white";
                                } else {
                                    cardClasses = "w-full p-4 rounded-3xl text-left transition-all duration-200 bg-white opacity-40 text-slate-500";
                                    letterClasses += " bg-slate-100 text-slate-400";
                                }
                            } else if (isSelected) {
                                cardClasses = "w-full p-4 rounded-3xl text-left transition-all duration-200 bg-indigo-50 shadow-md shadow-indigo-100/50 text-indigo-700 -translate-y-0.5 border-2 border-indigo-500";
                                letterClasses += " bg-indigo-500 text-white";
                            } else {
                                cardClasses += " hover:shadow-md hover:-translate-y-0.5 hover:text-indigo-600";
                                letterClasses += " bg-slate-100 text-slate-600";
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={showAnswer}
                                    className={cardClasses}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={letterClasses}>
                                            {optionLetter}
                                        </div>
                                        <span className="text-base font-medium flex-1">
                                            {option}
                                        </span>
                                        {showAnswer && isCorrect && (
                                            <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                        {showAnswer && isSelected && !isCorrect && (
                                            <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex justify-center">
                        {!showAnswer ? (
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={!selectedAnswer}
                                className={`px-8 py-3 rounded-3xl font-bold text-base transition-all ${selectedAnswer
                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-200/60"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    }`}
                            >
                                Check Answer
                            </button>
                        ) : (
                            <button
                                onClick={handleNextQuestion}
                                className="px-8 py-3 bg-indigo-500 text-white rounded-3xl font-bold text-base shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-200/60 transition-shadow flex items-center gap-2"
                            >
                                {currentQuestionIndex < totalQuestions - 1 ? "Next Question" : "See Results"}
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
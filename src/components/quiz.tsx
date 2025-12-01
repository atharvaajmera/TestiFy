"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

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
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center"
                >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">{percentage}%</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
                    <p className="text-gray-600 mb-6">Great job, {formData.name}!</p>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <p className="text-lg">
                            You scored <span className="font-bold text-indigo-600">{score}</span> out of{" "}
                            <span className="font-bold">{totalQuestions}</span> questions
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleRestartQuiz}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => router.push("/")}
                            className="flex-1 px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
                        >
                            New Quiz
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col">
                <div className="max-w-2xl mx-auto p-4">
                    <div className="text-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Question {currentQuestionIndex + 1} of {totalQuestions}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                            className="bg-indigo-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-8">
                            {currentQuestion.question}
                        </h2>

                        <div className="space-y-4">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = selectedAnswer === option;
                                const isCorrect = option === currentQuestion.answer;

                                let optionClass = "border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50";

                                if (showAnswer) {
                                    if (isCorrect) {
                                        optionClass = "border-2 border-green-500 bg-green-50";
                                    } else if (isSelected && !isCorrect) {
                                        optionClass = "border-2 border-red-500 bg-red-50";
                                    } else {
                                        optionClass = "border-2 border-gray-200 opacity-50";
                                    }
                                } else if (isSelected) {
                                    optionClass = "border-2 border-indigo-600 bg-indigo-50";
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleOptionSelect(option)}
                                        disabled={showAnswer}
                                        className={`w-full p-4 rounded-xl text-left transition-all ${optionClass}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <span className="text-gray-800">{option}</span>
                                            {showAnswer && isCorrect && (
                                                <svg className="w-6 h-6 text-green-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                            {showAnswer && isSelected && !isCorrect && (
                                                <svg className="w-6 h-6 text-red-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-8 flex justify-end">
                            {!showAnswer ? (
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={!selectedAnswer}
                                    className={`px-8 py-3 rounded-xl font-semibold transition-colors ${selectedAnswer
                                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    Submit Answer
                                </button>
                            ) : (
                                <button
                                    onClick={handleNextQuestion}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                                >
                                    {currentQuestionIndex < totalQuestions - 1 ? "Next Question" : "See Results"}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

export interface FormData {
  name: string;
  class: string;
  subject: string;
  topic: string;
  difficulty: string;
}

// Export a variable to hold the current form data for use in other components
export let currentFormData: FormData = {
  name: "",
  class: "",
  subject: "",
  topic: "",
  difficulty: "",
};

// Export quiz questions for use in quiz page
export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export let currentQuizData: QuizQuestion[] = [];

const steps = [
  {
    id: 1,
    title: "What's your name?",
    field: "name" as keyof FormData,
    placeholder: "Enter your name",
    type: "input",
  },
  {
    id: 2,
    title: "Which class are you in?",
    field: "class" as keyof FormData,
    placeholder: "Enter your class (e.g., 10th, 12th)",
    type: "select",
    options: [
      { value: "class-6", label: "Class 6" },
      { value: "class-7", label: "Class 7" },
      { value: "class-8", label: "Class 8" },
      { value: "class-9", label: "Class 9" },
      { value: "class-10", label: "Class 10" },
    ],
  },
  {
    id: 3,
    title: "What subject?",
    field: "subject" as keyof FormData,
    placeholder: "Enter subject ",
    type: "select",
    options: [
      { value: "math", label: "Mathematics" },
      { value: "science", label: "Science" },
      { value: "english", label: "English Grammar" },
      { value: "computer-science", label: "Computer" },
    ],
  },
  {
    id: 4,
    title: "Which topic (Include the book name for better results)?",
    field: "topic" as keyof FormData,
    placeholder: "Enter specific topic",
    type: "input",
  },
  {
    id: 5,
    title: "Select difficulty level",
    field: "difficulty" as keyof FormData,
    type: "radio",
    options: [
      { value: "easy", label: "Easy" },
      { value: "medium", label: "Medium" },
      { value: "hard", label: "Hard" },
    ],
  },
];

export default function Form() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [questionsLatex, setQuestionsLatex] = useState<string | null>(null);
  const [solutionsLatex, setSolutionsLatex] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    class: "",
    subject: "",
    topic: "",
    difficulty: "",
  });
  const currentField = steps[currentStep]?.field;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const canProceed = formData[currentField]?.trim() !== "";

  const handleInputChange = (value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [currentField]: value };
      currentFormData = newData; // Sync to exported variable
      return newData;
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const proceedToOptions = () => {
    currentFormData = formData;
    setShowOptions(true);
  };

  const renderInputField = () => {
    const step = steps[currentStep];
    if (step.type === "input") {
      return (
        <input
          type="text"
          name={step.field}
          placeholder={step.placeholder}
          value={formData[step.field]}
          onChange={(e) => handleInputChange(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg text-black bg-white w-full"
          required
        />
      );
    } else if (step.type === "select") {
      return (
        <select
          name={step.field}
          value={formData[step.field]}
          onChange={(e) => handleInputChange(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg text-black bg-white w-full"
          required
        >
          <option value="">{step.placeholder}</option>
          {step.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    } else if (step.type === "radio") {
      return (
        <div className="flex justify-between mt-2 w-full">
          {step.options?.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                type="radio"
                id={option.value}
                name={step.field}
                value={option.value}
                checked={formData[step.field] === option.value}
                onChange={(e) => handleInputChange(e.target.value)}
                required
              />
              <label htmlFor={option.value} className="ml-2">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleGenerateTest = async (): Promise<{ questions: string; solutions: string } | null> => {
    try {
      const response = await fetch("/api/generate-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to generate test");
      }

      console.log("Questions LaTeX received");
      console.log("Solutions LaTeX received");

      // Clean up the LaTeX (remove markdown code blocks if present)
      const cleanLatex = (latex: string) => {
        if (!latex) return '';
        let cleaned = latex.trim();

        // Remove ```latex at the beginning (with optional whitespace/newline)
        cleaned = cleaned.replace(/^```latex\s*\n?/i, '');

        // Remove ``` at the end (with optional whitespace/newline)
        cleaned = cleaned.replace(/\n?```\s*$/i, '');

        return cleaned.trim();
      };

      const cleanedQuestions = cleanLatex(data.questionsLatex);
      const cleanedSolutions = cleanLatex(data.solutionsLatex);

      console.log("Cleaned Questions (first 100):", cleanedQuestions.substring(0, 100));
      console.log("Cleaned Solutions (first 100):", cleanedSolutions.substring(0, 100));

      setQuestionsLatex(cleanedQuestions);
      setSolutionsLatex(cleanedSolutions);

      return { questions: cleanedQuestions, solutions: cleanedSolutions };
    } catch (error) {
      console.error("Error generating test:", error);
      setLoadingMessage("Error generating test. Please try again.");
      setTimeout(() => setGenerating(false), 2000);
      return null;
    }
  };

  const generatePDF = async (latexCode: string, filePrefix: string) => {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latexContent: latexCode,
          filename: `${filePrefix}.tex`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      const block = await response.blob();

      // Check if blob is valid
      if (block.size === 0) {
        throw new Error("Received empty PDF file");
      }

      console.log("PDF blob received, size:", block.size);

      // Create blob URL
      const url = window.URL.createObjectURL(new Blob([block], { type: 'application/pdf' }));

      const timestamp = Date.now();
      const uniqueFilename = `${filePrefix}-${timestamp}.pdf`;

      // Use a more reliable download approach for mobile
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = uniqueFilename;

      // Add to DOM, click, and remove
      document.body.appendChild(a);

      // Small delay to ensure DOM update
      setTimeout(() => {
        a.click();

        // Try opening in new tab as well (for desktop)
        setTimeout(() => {
          window.open(url, '_blank');
        }, 100);

        // Cleanup after download starts
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          console.log("PDF download complete");
        }, 2000);
      }, 100);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const handleDownloadQuestions = async () => {
    setGenerating(true);
    setLoadingMessage("Generating questions PDF...");

    let latex = questionsLatex;

    // Generate test if not already generated
    if (!latex) {
      const result = await handleGenerateTest();
      if (!result) {
        setGenerating(false);
        return;
      }
      latex = result.questions;
    }

    setLoadingMessage("Converting questions to PDF...");
    await generatePDF(latex, "test-paper");
    setGenerating(false);
    setLoadingMessage("");
  };

  const handleDownloadSolutions = async () => {
    setGenerating(true);
    setLoadingMessage("Generating solutions PDF...");

    let latex = solutionsLatex;

    // Generate test if not already generated
    if (!latex) {
      const result = await handleGenerateTest();
      if (!result) {
        setGenerating(false);
        return;
      }
      latex = result.solutions;
    }

    setLoadingMessage("Converting solutions to PDF...");
    await generatePDF(latex, "solutions");
    setGenerating(false);
    setLoadingMessage("");
  };

  const handleGenerateQuiz = async () => {
    setGenerating(true);
    setLoadingMessage("Generating interactive quiz...");

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to generate quiz");
      }

      // Store quiz data in exported variable
      currentQuizData = data.quizQuestions;
      currentFormData = formData;

      setGenerating(false);
      setLoadingMessage("");

      // Redirect to quiz page
      router.push("/quiz");
    } catch (error) {
      console.error("Error generating quiz:", error);
      setLoadingMessage("Error generating quiz. Please try again.");
      setTimeout(() => setGenerating(false), 2000);
    }
  };

  const handleStartOver = () => {
    setQuestionsLatex(null);
    setSolutionsLatex(null);
    setShowOptions(false);
    const emptyData = {
      name: "",
      class: "",
      subject: "",
      topic: "",
      difficulty: "",
    };
    setFormData(emptyData);
    currentFormData = emptyData;
    currentQuizData = [];
    setCurrentStep(0);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canProceed) {
        e.preventDefault();
        if (isLastStep) {
          proceedToOptions();
        } else {
          nextStep();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [canProceed, isLastStep, currentStep, formData]);

  if (generating) {
    return (
      <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
        >
          <div className="flex flex-col items-center">
            <motion.div
              className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <h3 className="mt-6 text-xl font-semibold text-gray-800">
              {loadingMessage}
            </h3>
            <p className="mt-2 text-sm text-gray-600 text-center">
              This may take a few moments...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showOptions) {
    return (
      <div className="flex flex-col items-center justify-center mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Ready to Proceed!
            </h2>
            <p className="text-gray-600 mt-2">
              Hi {formData.name}! Choose how you&apos;d like to practice for {formData.topic}.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGenerateQuiz}
              className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              Take Online Quiz
            </button>

            <button
              onClick={handleDownloadQuestions}
              className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              Download Question Paper (PDF)
            </button>

            <button
              onClick={handleDownloadSolutions}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              Download Solutions (PDF)
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleStartOver}
              className="w-full px-4 py-2 text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Start Over
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between items-center mb-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${index <= currentStep ? "bg-indigo-600" : "bg-gray-300"
                }`}
            />
          ))}
        </div>
        <div className="text-center text-sm text-gray-600">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {steps[currentStep].title}
        </h2>

        <div className="mb-6">{renderInputField()}</div>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={prevStep}
            disabled={isFirstStep}
            className={`px-4 py-2 rounded-lg transition-colors ${isFirstStep
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            Back
          </button>

          <button
            type="button"
            onClick={isLastStep ? proceedToOptions : nextStep}
            disabled={!canProceed}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${!canProceed
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
          >
            {isLastStep ? "Proceed" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

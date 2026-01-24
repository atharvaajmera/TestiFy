import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { GlassCard } from "./onboarding/GlassCard";
import { ProgressBar } from "./onboarding/progressbar";
import { Sparkles, Trophy } from "lucide-react";

const proceedIcons = [
  {
    id: 1,
    name: "quiz-icon",
    src: '<svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M7.78799 2H16.212C17.0305 1.99999 17.7061 1.99998 18.2561 2.04565C18.8274 2.0931 19.3523 2.19496 19.8439 2.45035C20.5745 2.82985 21.1702 3.42553 21.5497 4.1561C21.805 4.64774 21.9069 5.17258 21.9543 5.74393C22 6.29394 22 6.96949 22 7.78802V11.212C22 12.0305 22 12.7061 21.9543 13.2561C21.9069 13.8274 21.805 14.3523 21.5497 14.8439C21.1702 15.5745 20.5745 16.1702 19.8439 16.5497C19.3523 16.805 18.8274 16.9069 18.2561 16.9544C17.7061 17 17.0305 17 16.212 17H13V19H17C17.5523 19 18 19.4477 18 20C18 20.5523 17.5523 21 17 21H7C6.44772 21 6 20.5523 6 20C6 19.4477 6.44772 19 7 19H11V17H7.78798C6.96946 17 6.29393 17 5.74393 16.9544C5.17258 16.9069 4.64774 16.805 4.1561 16.5497C3.42553 16.1702 2.82985 15.5745 2.45035 14.8439C2.19496 14.3523 2.0931 13.8274 2.04565 13.2561C1.99998 12.7061 1.99999 12.0305 2 11.212V7.78799C1.99999 6.96947 1.99998 6.29393 2.04565 5.74393C2.0931 5.17258 2.19496 4.64774 2.45035 4.1561C2.82985 3.42553 3.42553 2.82985 4.1561 2.45035C4.64774 2.19496 5.17258 2.0931 5.74393 2.04565C6.29393 1.99998 6.96947 1.99999 7.78799 2ZM16.17 15C17.041 15 17.6331 14.9992 18.0905 14.9612C18.536 14.9242 18.7634 14.8572 18.9219 14.7748C19.2872 14.5851 19.5851 14.2872 19.7748 13.9219C19.8572 13.7634 19.9242 13.536 19.9612 13.0905C19.9992 12.6331 20 12.041 20 11.17V7.83C20 6.95898 19.9992 6.36686 19.9612 5.90945C19.9242 5.46401 19.8572 5.23663 19.7748 5.07805C19.5851 4.71277 19.2872 4.41493 18.9219 4.22517C18.7634 4.1428 18.536 4.07578 18.0905 4.03879C17.6331 4.0008 17.041 4 16.17 4H7.83C6.95898 4 6.36686 4.0008 5.90945 4.03879C5.46401 4.07578 5.23663 4.1428 5.07805 4.22517C4.71277 4.41493 4.41493 4.71277 4.22517 5.07805C4.1428 5.23663 4.07578 5.46401 4.03879 5.90945C4.0008 6.36686 4 6.95898 4 7.83V11.17C4 12.041 4.0008 12.6331 4.03879 13.0905C4.07578 13.536 4.1428 13.7634 4.22517 13.9219C4.41493 14.2872 4.71277 14.5851 5.07805 14.7748C5.23663 14.8572 5.46401 14.9242 5.90945 14.9612C6.36686 14.9992 6.95898 15 7.83 15H16.17Z" fill="#0F1729"></path> </g></svg>'
  },
  {
    id: 2,
    name: "questions-pdf",
    src:
      '<svg width="64px" height="64px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M8 42H32C33.1046 42 34 41.1046 34 40V8C34 6.89543 33.1046 6 32 6H8C6.89543 6 6 6.89543 6 8V40C6 41.1046 6.89543 42 8 42ZM32 44H8C5.79086 44 4 42.2091 4 40V8C4 5.79086 5.79086 4 8 4H32C34.2091 4 36 5.79086 36 8V40C36 42.2091 34.2091 44 32 44Z" fill="#333333"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M18 13C18 12.4477 18.4477 12 19 12H31C31.5523 12 32 12.4477 32 13C32 13.5523 31.5523 14 31 14H19C18.4477 14 18 13.5523 18 13Z" fill="#333333"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M18 17C18 16.4477 18.4477 16 19 16H31C31.5523 16 32 16.4477 32 17C32 17.5523 31.5523 18 31 18H19C18.4477 18 18 17.5523 18 17Z" fill="#333333"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M18 25C18 24.4477 18.4477 24 19 24H31C31.5523 24 32 24.4477 32 25C32 25.5523 31.5523 26 31 26H19C18.4477 26 18 25.5523 18 25Z" fill="#333333"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M18 29C18 28.4477 18.4477 28 19 28H31C31.5523 28 32 28.4477 32 29C32 29.5523 31.5523 30 31 30H19C18.4477 30 18 29.5523 18 29Z" fill="#333333"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M10 26V29H13V26H10ZM9 24H14C14.5523 24 15 24.4477 15 25V30C15 30.5523 14.5523 31 14 31H9C8.44772 31 8 30.5523 8 30V25C8 24.4477 8.44772 24 9 24Z" fill="#333333"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 12.2929C16.0976 12.6834 16.0976 13.3166 15.7071 13.7071L11 18.4142L8.29289 15.7071C7.90237 15.3166 7.90237 14.6834 8.29289 14.2929C8.68342 13.9024 9.31658 13.9024 9.70711 14.2929L11 15.5858L14.2929 12.2929C14.6834 11.9024 15.3166 11.9024 15.7071 12.2929Z" fill="#333333"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M42 24H40V39.3333L41 40.6667L42 39.3333V24ZM44 40L41 44L38 40V22H44V40Z" fill="#333333"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M42 17H40V19H42V17ZM40 15H42C43.1046 15 44 15.8954 44 17V21H38V17C38 15.8954 38.8954 15 40 15Z" fill="#333333"></path> </g></svg>',
  },
  {
    id: 2,
    name: "solutions-pdf",
    src: '<svg fill="#000000" width="64px" height="64px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.999 0c-6.188 0-11.035 5.035-11.035 11.223 0 4.662 2.29 6.883 4.1 8.504 1.165 1.044 1.949 1.674 1.949 2.448v1.695c0 0.044 0.006 0.086 0.011 0.129h-0.023v2.895c0.001 3.053 1.975 5.105 5.033 5.105 2.952 0 4.967-2.052 4.967-5.105v-2.895h-0.029c0.006-0.043 0.013-0.085 0.013-0.129v-1.695c0-1.18 0.876-1.893 2.204-3.053 1.797-1.569 3.844-3.521 3.844-7.899 0-6.189-4.847-11.223-11.036-11.223zM15.962 30c-1.872 0-2.959-1.161-2.959-3.105l-0.014-1.334c0.72 0.246 1.7 0.439 3.012 0.439 1.294 0 2.276-0.207 3.003-0.462v1.356c0 1.974-1.102 3.105-3.041 3.105zM21.876 17.616c-1.358 1.186-2.889 2.413-2.889 4.559v1.264c-0.474 0.265-1.349 0.58-3.004 0.58-1.736 0-2.56-0.308-2.969-0.546v-1.298c0-1.706-1.334-2.791-2.615-3.938-1.697-1.521-3.434-3.245-3.434-7.014-0-5.085 3.95-9.223 9.034-9.223 5.086 0 9.036 4.138 9.036 9.223 0 3.47-1.515 4.956-3.16 6.393z"></path> </g></svg>'
  }
]
export interface FormData {
  name: string;
  class: string;
  subject: string;
  topic: string;
  difficulty: string;
}

export let currentFormData: FormData = {
  name: "",
  class: "",
  subject: "",
  topic: "",
  difficulty: "",
};

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
    title: "Which topic do you wanna practice today?",
    subtitle: "(Include the book name for better results)",
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
          className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
          required
        />
      );
    } else if (step.type === "select") {
      return (
        <select
          name={step.field}
          value={formData[step.field]}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
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
        <div className="flex flex-col gap-3 mt-2 w-full">
          {step.options?.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${formData[step.field] === option.value
                ? "bg-indigo-50 ring-2 ring-indigo-600"
                : "bg-slate-50 hover:bg-slate-100"
                }`}
            >
              <input
                type="radio"
                name={step.field}
                value={option.value}
                checked={formData[step.field] === option.value}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-5 h-5 text-indigo-600 focus:ring-indigo-600"
                required
              />
              <span className="text-slate-800 font-medium">{option.label}</span>
            </label>
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
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-800">
                Ready to Proceed!
              </h2>
              <p className="text-slate-600 mt-2">
                Hi {formData.name}! Choose how you&apos;d like to practice {formData.topic}.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGenerateQuiz}
                className="w-full px-6 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-3"
              >
                <span dangerouslySetInnerHTML={{ __html: proceedIcons[0].src }} className="w-6 h-6 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-white [&_path]:fill-white" />
                Take Online Quiz
              </button>

              <button
                onClick={handleDownloadQuestions}
                className="w-full px-6 py-4 bg-white text-indigo-600 rounded-full font-bold hover:bg-indigo-50 transition-all ring-2 ring-indigo-200 flex items-center justify-center gap-3"
              >
                <span dangerouslySetInnerHTML={{ __html: proceedIcons[1].src }} className="w-6 h-6 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-indigo-600 [&_path]:fill-indigo-600" />
                Download Question Paper
              </button>

              <button
                onClick={handleDownloadSolutions}
                className="w-full px-6 py-4 bg-white text-indigo-600 rounded-full font-bold hover:bg-indigo-50 transition-all ring-2 ring-indigo-200 flex items-center justify-center gap-3"
              >
                <span dangerouslySetInnerHTML={{ __html: proceedIcons[2].src }} className="w-6 h-6 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-indigo-600 [&_path]:fill-indigo-600" />
                Download Solutions
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <button
                onClick={handleStartOver}
                className="w-full px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-all font-bold"
              >
                Start Over
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-[448px]"
      >
        <GlassCard>
          {/* Segmented Progress Bar */}
          <div className="flex gap-2 mb-6 px-8 pt-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${index <= currentStep ? "bg-indigo-600" : "bg-slate-200"
                  }`}
              />
            ))}
          </div>

          <div className="p-8 pt-2 min-h-[200px] flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {steps[currentStep].title}
              </h2>
              {steps[currentStep].subtitle && (
                <p className="text-sm text-gray-500 mt-2">
                  {steps[currentStep].subtitle}
                </p>
              )}
            </div>

            <div className="mb-6 flex-grow">{renderInputField()}</div>

            <div className="flex justify-between items-center mt-auto">
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
        </GlassCard>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "motion/react";

export interface FormData {
  name: string;
  class: string;
  subject: string;
  topic: string;
  difficulty: string;
}

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
    title: "Which topic?",
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
  const [currentStep, setCurrentStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [questionsLatex, setQuestionsLatex] = useState<string | null>(null);
  const [solutionsLatex, setSolutionsLatex] = useState<string | null>(null);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
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
    setFormData((prev) => ({
      ...prev,
      [currentField]: value,
    }));
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

  const handleSubmit = async () => {
    setGenerating(true);
    setLoadingMessage("Generating test and solutions...");
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
      setShowDownloadOptions(true);
      setGenerating(false);
      setLoadingMessage("");
    } catch (error) {
      console.error("Error generating test:", error);
      setLoadingMessage("Error generating test. Please try again.");
      setTimeout(() => setGenerating(false), 2000);
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
    if (!questionsLatex) return;
    setGenerating(true);
    setLoadingMessage("Converting questions to PDF...");
    await generatePDF(questionsLatex, "test-paper");
    setGenerating(false);
    setLoadingMessage("");
  };

  const handleDownloadSolutions = async () => {
    if (!solutionsLatex) return;
    setGenerating(true);
    setLoadingMessage("Converting solutions to PDF...");
    await generatePDF(solutionsLatex, "solutions");
    setGenerating(false);
    setLoadingMessage("");
  };

  const handleStartOver = () => {
    setQuestionsLatex(null);
    setSolutionsLatex(null);
    setShowDownloadOptions(false);
    setFormData({
      name: "",
      class: "",
      subject: "",
      topic: "",
      difficulty: "",
    });
    setCurrentStep(0);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canProceed) {
        e.preventDefault();
        if (isLastStep) {
          handleSubmit();
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

  if (showDownloadOptions) {
    return (
      <div className="flex flex-col items-center justify-center mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Test Generated Successfully!
            </h2>
            <p className="text-gray-600 mt-2">
              Your test paper and solutions are ready to download.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleDownloadQuestions}
              className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Question Paper
            </button>

            <button
              onClick={handleDownloadSolutions}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Download Solutions
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleStartOver}
              className="w-full px-4 py-2 text-green-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Generate Another Test
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
            onClick={isLastStep ? handleSubmit : nextStep}
            disabled={!canProceed}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${!canProceed
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
          >
            {isLastStep ? "Generate Test" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

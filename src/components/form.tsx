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
    setLoadingMessage("Generating the test questions...");
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

      console.log("Latex generated from gemini", data.latexCode);
      const fullResponseString = data.latexCode;
      const regex = /```latex\n([\s\S]*?)\n```/;
      const match = fullResponseString.match(regex);
      const extractedLatex = match ? match[1] : fullResponseString;
      console.log(
        "Cleaned LaTeX to be sent for PDF conversion:",
        extractedLatex
      );
      setLoadingMessage("Converting to PDF...");
      await generatePDF(extractedLatex);
      setFormData({
        name: "",
        class: "",
        subject: "",
        topic: "",
        difficulty: "",
      });
      setCurrentStep(0);
    } catch (error) {
      console.error("Error generating test:", error);
      setLoadingMessage("Error generating test. Please try again.");
      setTimeout(() => setGenerating(false), 2000);
    } finally {
      setGenerating(false);
    }
  };

  const generatePDF = async (latexCode: string) => {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latexContent: latexCode,
          filename: "test-paper.tex",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }
      const block = await response.blob();
      const url = window.URL.createObjectURL(block);
      setLoadingMessage("Opening the PDF...");
      window.open(url, "_blank");
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test-paper.pdf';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setGenerating(false);
        setLoadingMessage("");
      }, 1000);

    } catch (error) {
      console.error("Error generating PDF:", error);
      setLoadingMessage("Error generating PDF. Please try again.");
      setTimeout(() => {
        setGenerating(false);
        setLoadingMessage("");
      }, 2000);
    }
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

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse, NextRequest } from "next/server";
import {
  checkSystemAvailability,
  incrementSystemUsage,
} from "../../../../middleware";

const apiKey = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenerativeAI(apiKey);

export interface FormInputProps {
  name: string;
  class: string;
  subject: string;
  topic: string;
  difficulty: string;
}

export async function GET() {
  return NextResponse.json({
    message: "API route is working.",
    success: true,
  });
}

async function generateQuizQuestions(
  formData: FormInputProps,
): Promise<string[]> {
  const model = ai.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
    },
  });

  // Determine number of questions based on difficulty
  let numQuestions;
  switch (formData.difficulty.toLowerCase()) {
    case "easy":
      numQuestions = 5;
      break;
    case "medium":
      numQuestions = 8;
      break;
    case "hard":
      numQuestions = 10;
      break;
    default:
      numQuestions = 7;
  }

  const prompt = `Generate exactly ${numQuestions} quiz questions in valid JSON format based on the following parameters:
Name: ${formData.name}
Class: ${formData.class}
Subject: ${formData.subject}
Topic: ${formData.topic}
Difficulty Level: ${formData.difficulty}

IMPORTANT: Return ONLY a valid JSON array. Each object must have:
- "question": string
- "options": array of exactly 4 strings
- "answer": string (must match one of the options exactly)

Example format:
[
  {
    "question": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "answer": "4"
  }
]

Generate exactly ${numQuestions} questions. Do not include any markdown formatting, explanations, or text outside the JSON array.`;

  let retries = 3;
  while (retries > 0) {
    try {
      const response = await model.generateContent(prompt);
      let text = response.response.text();

      text = text.trim();
      if (text.startsWith("```json")) {
        text = text.slice(7);
      } else if (text.startsWith("```")) {
        text = text.slice(3);
      }
      if (text.endsWith("```")) {
        text = text.slice(0, -3);
      }
      text = text.trim();

      const quizQuestions = JSON.parse(text);

      if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
        throw new Error("Invalid response format: not an array or empty");
      }

      return quizQuestions;
    } catch (error) {
      retries--;
      console.error(`Attempt failed (${retries} retries left):`, error);

      if (retries === 0) {
        console.error(
          "Error parsing quiz questions JSON after all retries:",
          error,
        );
        throw new Error(
          "Failed to generate valid quiz questions. Please try again.",
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error("Failed to generate quiz questions");
}

export async function POST(request: NextRequest) {
  const systemAvailable = await checkSystemAvailability("gemini");

  if (!systemAvailable) {
    return NextResponse.json(
      { error: "The free limit has been reached for today, please try again tomorrow." },
      { status: 503 } 
    );
  }
  try {
    const formData: FormInputProps = await request.json();
    const quizQuestions = await generateQuizQuestions(formData);
    await incrementSystemUsage("gemini");
    return NextResponse.json({
      success: true,
      quizQuestions,
    });
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate quiz questions",
      },
      { status: 500 },
    );
  }
}

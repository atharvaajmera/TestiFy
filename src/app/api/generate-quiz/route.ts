import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse, NextRequest } from "next/server";

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
    message: "API route is working!",
    success: true,
  });
}

async function generateQuizQuestions(
  formData: FormInputProps
): Promise<string[]> {
  const model = ai.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  });
  const prompt = `Generate a json for quiz questions with answers based on the following parameters:
Name: ${formData.name}
Class: ${formData.class}
Subject: ${formData.subject}
Topic: ${formData.topic}
Difficulty Level: ${formData.difficulty}
The difficulty and the number of questions should be corresponding, like easy mode means less questions plus easier questions, while hard mode means more questions plus harder questions.
The output should be only a JSON array of objects, each containing "question" and four "options" fields. Also there should be a correct "answer" field indicating the correct option. There should be no markdown formatting or any other text outside the JSON array.`;

  const response = await model.generateContent(prompt);
  let text = response.response.text();

  // Clean up the response - remove markdown code blocks if present
  text = text.trim();
  if (text.startsWith("```json")) {
    text = text.slice(7); // Remove ```json
  } else if (text.startsWith("```")) {
    text = text.slice(3); // Remove ```
  }
  if (text.endsWith("```")) {
    text = text.slice(0, -3); // Remove trailing ```
  }
  text = text.trim();

  try {
    const quizQuestions = JSON.parse(text);
    return quizQuestions;
  } catch (error) {
    console.error("Error parsing quiz questions JSON:", error);
    console.error("Raw response:", text);
    throw new Error("Failed to parse quiz questions from AI response");
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData: FormInputProps = await request.json();
    const quizQuestions = await generateQuizQuestions(formData);
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
      { status: 500 }
    );
  }
}

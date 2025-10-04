import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse, NextRequest } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.log("Missing GEMINI_API_KEY in env");
  throw new Error("Missing GEMINI_API_KEY in env");
}

const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

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
    success: true 
  });
}

async function generateTestLatexcode(formData: FormInputProps): Promise<string> {
  const model = ai.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  });

  const prompt = `Generate LaTeX code for a test paper with the following parameters:
Name: ${formData.name}
Class: ${formData.class}
Subject: ${formData.subject}
Topic: ${formData.topic}
Difficulty Level: ${formData.difficulty}

CRITICAL REQUIREMENTS:
1. Output ONLY valid LaTeX code - no explanations, no markdown formatting, no code blocks and the latex version should be compatible with the texlive 2016 engine
2. Start directly with \\documentclass and end with \\end{document}
3. Use proper LaTeX syntax that compiles without errors
4. Ensure every \\begin{enumerate} has a matching \\end{enumerate}
5. Do not use any markdown formatting like \`\`\`latex or \`\`\`
6. The question set should be a mix of different types like (MCQs, short answer, long answer), don't just stick to one format, each paper should have a unique set of problems
7. The maximum marks should be corresponding to the choosen dificulty level, easy=15, medium=20, hard=30, the difficulty level of the questions should be relevant to the difficulty level of the paper
8. Include the Name, Class (just like this-> Class-10..not like class-class-10), Subject, Maximum Marks, and the choosen "Difficulty" level in the beggining just like a typical school exam format where the details are given in the top middle and so on, ake care of the spacing and formatting

Example structure:
\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\begin{document}
\\title{${formData.subject} Test}
\\author{${formData.name}}
\\date{\\today}
\\maketitle
[content here]
\\end{document}`;

  const result = await model.generateContent(prompt);
  const response = result.response; 
  const text = response.text();

  return text.trim();
}

function validateLatexStructure(latex: string): boolean {
  const hasDocumentClass = latex.includes('\\documentclass');
  const hasBeginDocument = latex.includes('\\begin{document}');
  const hasEndDocument = latex.includes('\\end{document}');
  
  const beginEnumerate = (latex.match(/\\begin\{enumerate\}/g) || []).length;
  const endEnumerate = (latex.match(/\\end\{enumerate\}/g) || []).length;
  
  return hasDocumentClass && hasBeginDocument && hasEndDocument && (beginEnumerate === endEnumerate);
}

export async function POST(request: NextRequest) {
  try {
    const formData: FormInputProps = await request.json();
    
    console.log("Received form data:", formData);
    
    const latexCode = await generateTestLatexcode(formData);
    
    console.log("Generated LaTeX code:", latexCode);

    return NextResponse.json({
      success: true,
      latexCode: latexCode
    });

  } catch (error:any) {
    console.error("Error generating test:", error);
    
    if (error.message.includes("temporarily unavailable")) {
      return NextResponse.json({
        success: false,
        message: "The AI service is temporarily unavailable. Please try again in a few minutes.",
        error: "SERVICE_UNAVAILABLE"
      }, { status: 503 });
    }
    
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to generate test paper",
      error: "GENERATION_FAILED"
    }, { status: 500 });
  }
}
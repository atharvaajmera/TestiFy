import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse, NextRequest } from "next/server";
import {
  checkSystemAvailability,
  incrementSystemUsage,
} from "../../../../middleware";

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
    success: true,
  });
}

interface GeneratedTest {
  questionsLatex: string;
  solutionsLatex: string;
}

async function generateTestLatexcode(
  formData: FormInputProps,
): Promise<GeneratedTest> {
  const model = ai.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
    },
  });

  const prompt = `Generate LaTeX code for a test paper AND its solution key with the following parameters:
Name: ${formData.name}
Class: ${formData.class}
Subject: ${formData.subject}
Topic: ${formData.topic}
Difficulty Level: ${formData.difficulty}

YOU MUST OUTPUT TWO SEPARATE LATEX DOCUMENTS:
1. First, output the QUESTION PAPER
2. Then output exactly this separator on its own line: %%%SOLUTIONS_SEPARATOR%%%
3. Then output the SOLUTION KEY for all the questions

CRITICAL REQUIREMENTS FOR BOTH DOCUMENTS:
1. Output ONLY valid LaTeX code - no explanations, no markdown formatting, no code blocks and the latex version should be compatible with the texlive 2016 engine
2. Each document must start with \\\\documentclass and end with \\\\end{document}
3. Use proper LaTeX syntax that compiles without errors
4. Ensure every \\\\begin{enumerate} has a matching \\\\end{enumerate}
5. Do not use any markdown formatting like \\\`\\\`\\\`latex or \\\`\\\`\\\`
6. The question set should be a mix of different types like (MCQs, short answer, long answer), don't just stick to one format, each paper should have a unique set of problems
7. The maximum marks should be corresponding to the choosen dificulty level, easy=15, medium=20, hard=30, the difficulty level of the questions should be relevant to the difficulty level of the paper
8. Include the Name, Class (just like this-> Class-10..not like class-class-10), Subject, Maximum Marks, and the choosen "Difficulty" level in the beggining just like a typical school exam format where the details are given in the top middle and so on, take care of the spacing and formatting
9. Only output the latex code that can be compiled directly on cloudconvert without any external additions and errors
10. If the name of a book is mentioned in the topic field alongwith the chapter name, make sure to generate questions strictly from that book only

FOR THE SOLUTION KEY:
1. Title it as "Solution Key" instead of "Test"
2. Include the same header info (Name, Class, Subject, etc.)
3. List each question number with its complete solution/answer
4. For MCQs, show the correct option with brief explanation
5. For numerical problems, show step-by-step working

IMPORTANT FORMATTING RULES for maths QUESTIONS:
1. Wrap ALL decimal numbers in math mode: \$0.25\$, \$3.45\$, etc.
2. Use \\textrm{Rs.} instead of ₹ symbol
3. For MCQ options, use \\begin{enumerate} and \\item, NOT [a)] syntax
4. AVOID using tikzpicture environments - describe diagrams in text instead, or use simple ASCII representations
5. If you absolutely must use tikzpicture, include \\usepackage{tikz} in the preamble
6. Include these packages:
   \\usepackage{amsmath}
   \\usepackage{amssymb}
   \\usepackage[T1]{fontenc}
   \\usepackage{textcomp}
   \\usepackage{enumerate}
   \\usepackage{tikz}

Example structure for each document:
\\\\documentclass{article}
\\\\usepackage[utf8]{inputenc}
\\\\usepackage{amsmath}
\\\\usepackage{amssymb}
\\\\usepackage[T1]{fontenc}
\\\\usepackage{textcomp}
\\\\usepackage{enumerate}
\\\\usepackage{geometry}
\\\\usepackage{tikz}
\\\\geometry{a4paper, margin=1in}
\\\\begin{document}
\\\\title{${formData.subject} Test}
\\\\author{${formData.name}}
\\\\date{\\\\today}
\\\\maketitle
[content here]
\\\\end{document}

%%%SOLUTIONS_SEPARATOR%%%

\\\\documentclass{article}
...solution key document...
\\\\end{document}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text().trim();

  // Split the response into questions and solutions
  const parts = text.split("%%%SOLUTIONS_SEPARATOR%%%");

  return {
    questionsLatex: parts[0]?.trim() || "",
    solutionsLatex: parts[1]?.trim() || "",
  };
}

// function validateLatexStructure(latex: string): boolean {
//   const hasDocumentClass = latex.includes('\\documentclass');
//   const hasBeginDocument = latex.includes('\\begin{document}');
//   const hasEndDocument = latex.includes('\\end{document}');

//   const beginEnumerate = (latex.match(/\\begin\{enumerate\}/g) || []).length;
//   const endEnumerate = (latex.match(/\\end\{enumerate\}/g) || []).length;

//   return hasDocumentClass && hasBeginDocument && hasEndDocument && (beginEnumerate === endEnumerate);
// }

export async function POST(request: NextRequest) {
  const systemAvailable = await checkSystemAvailability("gemini");

  if (!systemAvailable) {
    return NextResponse.json(
      {
        error:
          "The free limit has been reached for today, please try again tomorrow.",
      },
      { status: 503 },
    );
  }

  try {
    const formData: FormInputProps = await request.json();

    console.log("Received form data:", formData);

    const { questionsLatex, solutionsLatex } =
      await generateTestLatexcode(formData);

    console.log("Generated Questions LaTeX:", questionsLatex.substring(0, 200));
    console.log("Generated Solutions LaTeX:", solutionsLatex.substring(0, 200));

    await incrementSystemUsage("gemini");

    return NextResponse.json({
      success: true,
      questionsLatex,
      solutionsLatex,
    });
  } catch (error: unknown) {
    console.error("Error generating test:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("temporarily unavailable")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The AI service is temporarily unavailable. Please try again in a few minutes.",
          error: "SERVICE_UNAVAILABLE",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage || "Failed to generate test paper",
        error: "GENERATION_FAILED",
      },
      { status: 500 },
    );
  }
}

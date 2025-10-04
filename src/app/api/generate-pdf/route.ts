import { NextRequest, NextResponse } from "next/server";

interface LaTeXToPDFRequest {
  latexContent: string;
  filename?: string;
}

interface CloudConvertTask {
  id: string;
  name: string;
  operation: string;
  status: string;
  result?: {
    files?: Array<{
      filename: string;
      size: number;
      url: string;
    }>;
    form?: {
      url: string;
      parameters: Record<string, string>;
    };
  };
  message?: string;
}

interface CloudConvertJobResponse {
  data: {
    id: string;
    status: string;
    tasks: Array<CloudConvertTask>;
  };
}

interface CloudConvertTaskResponse {
  data: CloudConvertTask;
}

export async function POST(request: NextRequest) {
  try {
    const API_KEY = process.env.CLOUDCONVERT_API_KEY;

    if (!API_KEY) {
      console.error("CloudConvert API key not configured");
      return NextResponse.json(
        { error: "CloudConvert API key not configured" },
        { status: 500 }
      );
    }

    const body: LaTeXToPDFRequest = await request.json();

    if (!body.latexContent) {
      console.error("LaTeX content is required");
      return NextResponse.json(
        { error: "LaTeX content is required" },
        { status: 400 }
      );
    }

    const filename = body.filename || "test-paper.tex";

    // Enhanced logging for mobile debugging
    console.log("=== DETAILED LATEX CONTENT ANALYSIS ===");
    console.log("Content length:", body.latexContent.length);
    console.log("Content preview (first 200 chars):", body.latexContent.substring(0, 200));
    console.log("Content preview (last 200 chars):", body.latexContent.substring(Math.max(0, body.latexContent.length - 200)));
    console.log("Character codes (first 50):", Array.from(body.latexContent.substring(0, 50)).map(c => c.charCodeAt(0)).join(','));
    console.log("Contains backslashes:", body.latexContent.includes('\\'));
    console.log("Contains curly braces:", body.latexContent.includes('{') && body.latexContent.includes('}'));
    console.log("Line break type:", body.latexContent.includes('\r\n') ? 'CRLF' : body.latexContent.includes('\n') ? 'LF' : 'None detected');
    console.log("Full content:");
    console.log(body.latexContent);
    console.log("=====================================");

    console.log("Starting LaTeX to PDF conversion...");

    const jobResponse = await fetch("https://api.cloudconvert.com/v2/jobs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: {
          "import-latex": {
            operation: "import/raw",
            filename: filename,
            file: body.latexContent, 
          },
          "convert-to-pdf": {
            operation: "convert",
            input: "import-latex",
            output_format: "pdf",
            engine: "texlive", 
            engine_version: "2023", 
            timeout: 600, 
          },
          "export-pdf": {
            operation: "export/url",
            input: "convert-to-pdf",
          },
        },
      }),
    });

    if (!jobResponse.ok) {
      const errorData = await jobResponse.text();
      console.error("Failed to create CloudConvert job:", errorData);
      return NextResponse.json(
        { error: "Failed to create conversion job", details: errorData },
        { status: jobResponse.status }
      );
    }

    const jobData: CloudConvertJobResponse = await jobResponse.json();
    console.log("--- Initial Job Creation Response ---");
    console.log(JSON.stringify(jobData, null, 2));
    console.log("-------------------------------------");

    console.log("Job created with ID:", jobData.data.id);

    console.log("Using import/raw - skipping upload step");

    const importTask = jobData.data.tasks.find(
      (task) => task.name === "import-latex"
    );

    if (importTask?.status === "error") {
      console.error("Import task failed:", importTask.message);
      return NextResponse.json(
        { error: "Import task failed", details: importTask.message },
        { status: 500 }
      );
    }

    console.log(`Import task status: ${importTask?.status}`);

    let jobStatus = "waiting";
    let attempts = 0;
    const maxAttempts = 60;
    const pollInterval = 2000;

    while (jobStatus !== "finished" && jobStatus !== "error" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));

      try {
        const statusResponse = await fetch(
          `https://api.cloudconvert.com/v2/jobs/${jobData.data.id}`,
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
            },
          }
        );

        if (!statusResponse.ok) {
          console.error("Failed to check job status:", statusResponse.status);
          const errorText = await statusResponse.text();
          console.error("Status check error:", errorText);
          
          attempts++;
          if (attempts >= 3) {
            return NextResponse.json(
              { error: "Failed to check job status repeatedly", details: errorText },
              { status: 500 }
            );
          }
          continue;
        }

        const statusData: CloudConvertJobResponse = await statusResponse.json();
        jobStatus = statusData.data.status;
        attempts++;

        console.log(
          `Job status: ${jobStatus} (attempt ${attempts}/${maxAttempts})`
        );

        statusData.data.tasks.forEach(task => {
          if (task.status === "error") {
            console.error(`Task ${task.name} failed:`, task.message || "No error message");
          }
        });

        if (jobStatus === "finished") {
          console.log("--- Final Job Data from CloudConvert ---");
          console.log(JSON.stringify(statusData, null, 2));
          console.log("-----------------------------------------");

          const exportTask = statusData.data.tasks.find(
            (task) => task.name === "export-pdf"
          );

          if (exportTask?.result?.files?.[0]) {
            const pdfFile = exportTask.result.files[0];
            console.log("PDF generated successfully:", pdfFile.url);

             const pdfResponse = await fetch(pdfFile.url);
            
            if (!pdfResponse.ok) {
              console.error("Failed to download PDF from CloudConvert");
              return NextResponse.json(
                { error: "Failed to download generated PDF" },
                { status: 500 }
              );
            }

            const pdfBuffer = await pdfResponse.arrayBuffer();

            return new NextResponse(pdfBuffer, {
              status: 200,
              headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${pdfFile.filename}"`,
                'Content-Length': pdfBuffer.byteLength.toString(),
                'Cache-Control': 'no-cache',
              },
            });
          } else {
            console.error("PDF file not found in export task result:", exportTask);
            return NextResponse.json(
              { error: "PDF file not found in conversion result", details: exportTask },
              { status: 500 }
            );
          }
        }

        if (jobStatus === "error") {
          const errorTasks = statusData.data.tasks.filter(
            (task) => task.status === "error"
          );
          console.error("Conversion job failed. Error tasks:", errorTasks);
          return NextResponse.json(
            { 
              error: "LaTeX compilation failed", 
              details: errorTasks,
              allTasks: statusData.data.tasks 
            },
            { status: 500 }
          );
        }

      } catch (pollError) {
        console.error("Error during polling:", pollError);
        attempts++;
        if (attempts >= maxAttempts) {
          return NextResponse.json(
            { error: "Failed to poll job status", details: String(pollError) },
            { status: 500 }
          );
        }
      }
    }

    if (jobStatus !== "finished") {
      console.error("Job did not complete within timeout. Final status:", jobStatus);
      return NextResponse.json(
        { 
          error: "Conversion timeout - job took too long to complete", 
          finalStatus: jobStatus,
          attempts: attempts 
        },
        { status: 408 }
      );
    }

  } catch (error) {
    console.error("Error in LaTeX to PDF conversion:", error);
    
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      { 
        error: "Internal server error during conversion", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "LaTeX to PDF conversion API endpoint",
    methods: ["POST"],
    example: {
      latexContent:
        "\\documentclass{article}\\begin{document}Hello World\\end{document}",
      filename: "my-document.tex",
    },
    description: "Send LaTeX content in the request body to generate a PDF",
  });
}
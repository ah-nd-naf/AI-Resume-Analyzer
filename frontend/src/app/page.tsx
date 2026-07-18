"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, AlertCircle, CheckCircle2 } from "lucide-react";

// Define the shape of our expected AI response
type Critique = {
  category: string;
  issue: string;
  solution: string;
};

type AnalysisResult = {
  ats_score: number;
  summary: string;
  critiques: Critique[];
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResults(null); // Reset results on new file upload
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    // Prepare the file to be sent via HTTP POST
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/resumes/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume. Please try again.");
      }

      const data = await response.json();
      setResults(data.analysis); // Map the AI analysis object to our state
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            AI Resume Analyzer
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Upload your resume to get an instant ATS score and AI-powered feedback.
          </p>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`flex justify-center px-6 pt-10 pb-12 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ease-in-out ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-white"
          }`}
        >
          <div className="space-y-2 text-center">
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-16 w-16 text-gray-400" />
            <div className="text-lg text-gray-600">
              {isDragActive ? <p className="text-blue-600 font-medium">Drop your resume here...</p> : <p><span className="text-blue-600 font-medium">Click to upload</span> or drag and drop</p>}
            </div>
            <p className="text-sm text-gray-500">PDF up to 5MB</p>
          </div>
        </div>

        {/* Selected File & Action Button */}
        {file && (
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
              <div className="truncate max-w-xs">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Analysis Results Dashboard */}
        {results && (
          <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-200">
            {/* Score & Summary Section */}
            <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-200 flex flex-col sm:flex-row items-center gap-8">
              <div className="flex flex-col items-center justify-center bg-white rounded-full h-32 w-32 shadow-sm border-4 border-blue-100 flex-shrink-0">
                <span className="text-4xl font-extrabold text-blue-600">{results.ats_score}</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">ATS Score</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Executive Summary</h3>
                <p className="text-gray-700 leading-relaxed">{results.summary}</p>
              </div>
            </div>

            {/* Critiques Section */}
            <div className="p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                Actionable Improvements
              </h3>
              <div className="space-y-6">
                {results.critiques.map((critique, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                      {critique.category}
                    </span>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-bold text-gray-700 block mb-1">Issue:</span>
                        <p className="text-sm text-gray-600">{critique.issue}</p>
                      </div>
                      <div className="pl-4 border-l-2 border-green-400">
                        <span className="text-sm font-bold text-green-700 block mb-1">Solution:</span>
                        <p className="text-sm text-gray-700">{critique.solution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
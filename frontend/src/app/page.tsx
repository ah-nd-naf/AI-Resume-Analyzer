"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  // This function triggers when a user drops a file into the zone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  // Initialize react-dropzone to only accept PDFs
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            AI Resume Analyzer
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Upload your resume to get an instant ATS score and AI-powered feedback.
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          {...getRootProps()}
          className={`mt-8 flex justify-center px-6 pt-10 pb-12 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ease-in-out ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-white"
          }`}
        >
          <div className="space-y-2 text-center">
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-16 w-16 text-gray-400" />
            <div className="text-lg text-gray-600">
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Drop your resume here...</p>
              ) : (
                <p>
                  <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500">PDF up to 5MB</p>
          </div>
        </div>

        {/* Selected File Indicator */}
        {file && (
          <div className="mt-6 bg-white p-4 rounded-lg shadow border border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => alert("We will connect this to the backend next!")}
            >
              Analyze Resume
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
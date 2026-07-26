export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function analyzeResume(formData: FormData) {
  const response = await fetch(`${API_BASE_URL}/api/resumes/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to analyze resume. Please try again.");
  }
  return response.json();
}

export async function rewriteBullet(originalText: string, recommendation: string) {
  const response = await fetch(`${API_BASE_URL}/api/resumes/rewrite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ original_text: originalText, recommendation }),
  });
  if (!response.ok) throw new Error("Failed to generate rewrite.");
  return response.json();
}

export async function fetchHistory(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/resumes/history?user_id=${userId}`);
  return response.json();
}

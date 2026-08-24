const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export async function analyzeResume(formData: FormData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resumes/upload`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || "Failed to analyze resume. Please try again.");
    }
    return response.json();
  } catch (err: any) {
    if (err.name === "TypeError" && (err.message === "Failed to fetch" || err.message.includes("fetch"))) {
      throw new Error(
        `Unable to reach backend (${API_BASE_URL}). If Render was asleep, please wait 30 seconds for it to wake up and try again.`
      );
    }
    throw err;
  }
}

export async function rewriteBullet(originalText: string, recommendation: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resumes/rewrite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ original_text: originalText, recommendation }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || "Failed to generate rewrite.");
    }
    return response.json();
  } catch (err: any) {
    if (err.name === "TypeError" && (err.message === "Failed to fetch" || err.message.includes("fetch"))) {
      throw new Error(`Unable to connect to ${API_BASE_URL}.`);
    }
    throw err;
  }
}

export async function fetchHistory(userId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resumes/history?user_id=${userId}`);
    return response.json();
  } catch {
    return { history: [] };
  }
}


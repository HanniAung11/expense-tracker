import { getFirebaseAuth } from "./firebase";

/**
 * Get the current user's Firebase ID token
 */
export async function getIdToken(): Promise<string | null> {
  try {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.warn("Firebase Auth not initialized");
      return null;
    }
    if (!auth.currentUser) {
      console.warn("No current user in Firebase Auth");
      return null;
    }
    const token = await auth.currentUser.getIdToken();
    if (!token) {
      console.warn("Failed to get ID token from current user");
      return null;
    }
    return token;
  } catch (error) {
    console.error("Error getting ID token:", error);
    return null;
  }
}

/**
 * Fetch with automatic authentication header
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getIdToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    console.warn("No token available for authenticated fetch to:", url);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Log error responses for debugging
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${response.status}):`, errorText);
  }

  return response;
}


import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { prisma } from "./db";

// Type-safe helper to access user model (fixes TypeScript errors when Prisma client types aren't recognized)
const userModel = (prisma as any).user as {
  findFirst: (args: { where: { firebaseUid: string } }) => Promise<any>;
  findUnique: (args: { where: { firebaseUid: string } }) => Promise<any>;
  create: (args: { data: { firebaseUid: string; email: string; name: string | null } }) => Promise<any>;
};

let adminApp: App | undefined;

function getAdminApp() {
  if (adminApp) return adminApp;

  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  // For MVP: Use environment variables for Firebase Admin
  // Use the same project ID as the client
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  
  if (!projectId) {
    console.warn("Firebase Project ID not set. Auth verification may fail.");
    // Return a dummy app to prevent crashes, but auth will fail
    return initializeApp({ projectId: "dummy" });
  }

  // Try to initialize with service account credentials from env vars
  // If not available, will use Application Default Credentials
  try {
    if (
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL
    ) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    } else {
      // Fallback: Use default credentials (for local dev with gcloud auth)
      adminApp = initializeApp({
        projectId,
      });
    }
  } catch (error) {
    // If initialization fails, try with just projectId
    adminApp = initializeApp({
      projectId,
    });
  }

  return adminApp;
}

export async function verifyIdToken(idToken: string) {
  try {
    const app = getAdminApp();
    const auth = getAuth(app);
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error: any) {
    console.error("Error verifying token:", error);
    // Log more details about the error
    if (error.code) {
      console.error("Firebase Admin error code:", error.code);
    }
    if (error.message) {
      console.error("Firebase Admin error message:", error.message);
    }
    return null;
  }
}

export async function getCurrentUser(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("No authorization header found");

      // Development fallback: use demo user so the app works without full Firebase Admin setup
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "Using demo user fallback because no auth header was provided (development only)."
        );
        let user = await userModel.findFirst({
          where: { firebaseUid: "demo-dev-user" },
        });

        if (!user) {
          user = await userModel.create({
            data: {
              firebaseUid: "demo-dev-user",
              email: "demo@example.com",
              name: "Demo User",
            },
          });
        }

        return user;
      }

      return null;
    }

    const idToken = authHeader.split("Bearer ")[1];
    if (!idToken) {
      console.warn("No token found in authorization header");

      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "Using demo user fallback because no token was found (development only)."
        );
        let user = await userModel.findFirst({
          where: { firebaseUid: "demo-dev-user" },
        });

        if (!user) {
          user = await userModel.create({
            data: {
              firebaseUid: "demo-dev-user",
              email: "demo@example.com",
              name: "Demo User",
            },
          });
        }

        return user;
      }

      return null;
    }

    const decodedToken = await verifyIdToken(idToken);
    if (!decodedToken) {
      console.warn("Token verification failed");

      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "Using demo user fallback because token verification failed (development only)."
        );
        let user = await userModel.findFirst({
          where: { firebaseUid: "demo-dev-user" },
        });

        if (!user) {
          user = await userModel.create({
            data: {
              firebaseUid: "demo-dev-user",
              email: "demo@example.com",
              name: "Demo User",
            },
          });
        }

        return user;
      }

      return null;
    }

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email || "";

    // Get or create Prisma User
    let user = await userModel.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      user = await userModel.create({
        data: {
          firebaseUid,
          email,
          name: decodedToken.name || null,
        },
      });
    }

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}


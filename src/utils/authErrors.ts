/**
 * Maps Firebase Auth error codes to user-friendly human-readable error messages.
 */
export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  const code = error?.code || error?.message || "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password. Please verify your credentials and try again.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please log in instead.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters with letters and numbers.";
    case "auth/invalid-email":
      return "Please provide a valid email address.";
    case "auth/operation-not-allowed":
      return "Email and password sign-in is not enabled for this project.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support or an administrator.";
    case "auth/too-many-requests":
      return "Access to this account has been temporarily disabled due to many failed login attempts. Please try again in a few minutes.";
    case "auth/network-request-failed":
      return "A network error occurred. Please check your internet connection and try again.";
    case "auth/popup-closed-by-user":
      return "The sign-in popup was closed before completing authentication.";
    case "auth/requires-recent-login":
      return "This action requires recent authentication. Please log in again.";
    default:
      if (typeof error?.message === "string" && !error.message.includes("Firebase:")) {
        return error.message;
      }
      return "Authentication failed. Please verify your details and try again.";
  }
}

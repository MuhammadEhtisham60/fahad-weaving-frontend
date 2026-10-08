import { useCallback } from "react";
import { toast } from "sonner";

/**
 * A reusable hook to parse and display API errors.
 * Useful for manually handling errors in try/catch blocks outside the global Redux API slice.
 */
export function useApiError() {
  const handleError = useCallback((error) => {
    // If it's a standard JS Error object
    if (error instanceof Error) {
      toast.error(error.message);
      return;
    }

    // Handle RTK Query or Axios style error payloads
    const data = error?.data || error?.response?.data || error;
    let message = "An unexpected error occurred.";

    if (data?.errors && typeof data.errors === "object") {
      // Handle { success: false, message: "...", errors: { field: ["msg"] } }
      const firstErrorKey = Object.keys(data.errors)[0];
      if (firstErrorKey) {
        const firstErrorVal = data.errors[firstErrorKey];
        const errorText = Array.isArray(firstErrorVal) ? firstErrorVal[0] : firstErrorVal;
        message = `${firstErrorKey}: ${errorText}`;
      } else {
        message = data.message || "Validation failed";
      }
    } else if (data?.detail) {
      message = data.detail;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.non_field_errors) {
      message = data.non_field_errors[0];
    } else if (typeof data === "object" && data !== null) {
      // Handle generic Django REST Framework field errors
      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        const firstVal = data[firstKey];
        message = Array.isArray(firstVal) ? `${firstKey}: ${firstVal[0]}` : String(firstVal);
      }
    } else if (typeof data === "string") {
      message = data;
    } else if (error?.error) {
      message = typeof error.error === "string" ? error.error : "Request failed";
    }

    toast.error(message);
  }, []);

  return { handleError };
}

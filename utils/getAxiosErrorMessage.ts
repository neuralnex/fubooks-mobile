import axios, { AxiosError } from 'axios';

/** User-visible message; handles network/offline where `response` is missing. */
export function getAxiosErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ message?: string; error?: string }>;
    const data = err.response?.data;
    if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.length > 0) {
        return data.message;
      }
      if (typeof data.error === 'string' && data.error.length > 0) {
        return data.error;
      }
    }
    if (err.code === 'ECONNABORTED') {
      return 'Request timed out. Check your connection or try again.';
    }
    if (err.message === 'Network Error' || !err.response) {
      return 'Cannot reach server. Check Wi‑Fi/mobile data, VPN, and that the app was rebuilt with the correct API URL.';
    }
    return err.message || 'Request failed';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === 'string' ? error : 'Something went wrong';
}

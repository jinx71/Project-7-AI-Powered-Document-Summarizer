import axios, { AxiosError } from 'axios';
import type { ApiResponse, DocType } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  timeout: 180_000, // long documents can take a while
});

export async function summarizeDocument(
  file: File,
  docType: DocType
): Promise<ApiResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_type', docType);

  try {
    const response = await api.post<ApiResponse>('/api/summarize', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    // The backend returns the same envelope on error statuses — surface it
    const axiosError = error as AxiosError<ApiResponse>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data;
    }
    return {
      success: false,
      data: null,
      message:
        'Could not reach the API. Check that the backend is running and VITE_API_URL is correct.',
    };
  }
}

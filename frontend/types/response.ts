export interface ServiceResponse<T> {
  data: T | null;
  success: boolean;
  message: string;
}

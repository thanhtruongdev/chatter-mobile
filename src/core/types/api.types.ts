export interface ApiFieldError {
  field?: string;
  code?: string;
  message: string;
}

export interface ApiResponseEnvelope<TData> {
  success: boolean;
  message: string;
  data: TData;
  metadata?: Record<string, unknown>;
  errors?: ApiFieldError[];
}

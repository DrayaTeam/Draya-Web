// src/app/core/models/payment.model.ts

export interface PaymentConfirmResponse {
  // If the backend returns any data when a payment is confirmed
  success: boolean;
  message?: string;
}

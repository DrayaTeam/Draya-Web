// src/app/core/models/payment.model.ts

export interface CheckoutClassroomRequest {
  redirectionUrl: string;
}

export interface CheckoutResponse {
  checkoutUrl?: string;
  paymentUrl?: string;
  url?: string;
}

export interface PaymentStatusDto {
  paymentTransactionId: string;
  status: 'Pending' | 'Completed' | 'Failed' | string;
  grossAmount: number;
  purpose?: string;
  classroomId?: string;
  isEnrolled: boolean;
}

export interface InitiateTopUpRequest {
  amount: number;
  redirectionUrl: string;
}

export interface TopUpCheckoutDto {
  transactionId: string;
  amount: number;
  checkoutUrl: string;
}

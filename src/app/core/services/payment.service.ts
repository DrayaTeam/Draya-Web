// src/app/core/services/payment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentConfirmResponse } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/payments`;

  /**
   * Confirms a payment by ID (often used after a callback redirect).
   * @param paymentId The UUID of the payment transaction.
   * @param isSuccess Query parameter from Paymob indicating success.
   */
  confirmPayment(paymentId: string, isSuccess: boolean = true): Observable<PaymentConfirmResponse> {
    return this.http.post<PaymentConfirmResponse>(
      `${this.baseUrl}/confirm/${paymentId}?isSuccess=${isSuccess}`,
      {}
    );
  }
}

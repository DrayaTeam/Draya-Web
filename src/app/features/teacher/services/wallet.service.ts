// src/app/features/teacher/services/wallet.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  WalletBalance,
  PaginatedResponse,
  WalletTransaction,
  PayoutAccount,
  CreatePayoutAccountRequest,
  Withdrawal,
  TopupResponse,
} from '../../../core/models/wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/wallet`;

  /** Retrieves the teacher's current wallet balance. */
  getBalance(): Observable<WalletBalance> {
    return this.http.get<WalletBalance>(`${this.baseUrl}/balance`);
  }

  /** Retrieves the teacher's wallet transaction history. */
  getTransactions(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<WalletTransaction>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResponse<WalletTransaction>>(`${this.baseUrl}/transactions`, {
      params,
    });
  }

  /** Retrieves the teacher's payout accounts (e.g. Instapay). */
  getPayoutAccounts(): Observable<PayoutAccount[]> {
    return this.http.get<PayoutAccount[]>(`${this.baseUrl}/payout-accounts`);
  }

  /** Adds a new payout account. */
  addPayoutAccount(payload: CreatePayoutAccountRequest): Observable<PayoutAccount> {
    return this.http.post<PayoutAccount>(`${this.baseUrl}/payout-accounts`, payload);
  }

  /** Updates an existing payout account. */
  updatePayoutAccount(id: string, payload: CreatePayoutAccountRequest): Observable<PayoutAccount> {
    return this.http.put<PayoutAccount>(`${this.baseUrl}/payout-accounts/${id}`, payload);
  }

  /** Deletes a payout account. */
  deletePayoutAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/payout-accounts/${id}`);
  }

  /** Requests a withdrawal of the earned balance. */
  requestWithdrawal(amount: number, payoutAccountId: string): Observable<Withdrawal> {
    return this.http.post<Withdrawal>(`${this.baseUrl}/withdrawals`, { amount, payoutAccountId });
  }

  /** Retrieves the teacher's withdrawal history. */
  getWithdrawals(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<Withdrawal>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResponse<Withdrawal>>(`${this.baseUrl}/withdrawals`, { params });
  }

  /** Initiates a wallet top-up (Purchased Balance) via Paymob. */
  topup(amount: number, redirectionUrl?: string): Observable<TopupResponse> {
    const payload = redirectionUrl ? { amount, redirectionUrl } : { amount };
    return this.http.post<TopupResponse>(`${this.baseUrl}/topup`, payload);
  }
}

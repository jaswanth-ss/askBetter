import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnhanceData } from '../components/enhance-panel/enhance-panel';

export interface PromptResponse {
  improved_prompt: string;
}

@Injectable({ providedIn: 'root' })
export class PromptService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5127/api/prompt/prompt';

  send(prompt: string, context: EnhanceData | null): Observable<PromptResponse> {
    const url = `${this.baseUrl}/${encodeURIComponent(prompt)}`;
    return this.http.post<PromptResponse>(url, context);
  }
}

import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnhancePanel, EnhanceData } from './components/enhance-panel/enhance-panel';
import { PromptService } from './services/prompt.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, EnhancePanel],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private promptService = inject(PromptService);

  mode = signal<'ask' | 'askBetter'>('ask');
  showEnhanceForm = signal(false);
  isLoading = signal(false);
  hasResult = signal(false);
  resultText = signal('');
  errorMessage = signal('');
  copied = signal(false);
  promptText = '';

  private askResult = signal('');
  private askBetterResult = signal('');

  setMode(m: 'ask' | 'askBetter') {
    this.mode.set(m);
    this.showEnhanceForm.set(false);
    this.errorMessage.set('');
    this.copied.set(false);
    const stored = m === 'ask' ? this.askResult() : this.askBetterResult();
    this.resultText.set(stored);
    this.hasResult.set(!!stored);
  }

  onSend() {
    if (!this.promptText.trim()) return;
    if (this.mode() === 'ask') {
      this.callBackend(null);
    } else {
      this.showEnhanceForm.set(true);
    }
  }

  onEnhancedSend(data: EnhanceData) {
    this.showEnhanceForm.set(false);
    this.callBackend(data);
  }

  closeEnhanceForm() {
    this.showEnhanceForm.set(false);
  }

  onNewPrompt() {
    this.promptText = '';
    this.hasResult.set(false);
    this.resultText.set('');
    this.errorMessage.set('');
    this.copied.set(false);
    if (this.mode() === 'ask') {
      this.askResult.set('');
    } else {
      this.askBetterResult.set('');
    }
  }

  async copyResult() {
    if (!this.resultText()) return;
    await navigator.clipboard.writeText(this.resultText());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  private callBackend(context: EnhanceData | null) {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.copied.set(false);
    this.promptService.send(this.promptText, context).subscribe({
      next: (res) => {
        this.resultText.set(res.improved_prompt);
        if (this.mode() === 'ask') {
          this.askResult.set(res.improved_prompt);
        } else {
          this.askBetterResult.set(res.improved_prompt);
        }
        this.isLoading.set(false);
        this.hasResult.set(true);
      },
      error: () => {
        this.errorMessage.set('Something went wrong. Make sure the backend and Python service are running.');
        this.isLoading.set(false);
      },
    });
  }
}

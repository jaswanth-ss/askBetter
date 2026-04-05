import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnhancePanel, EnhanceData } from './components/enhance-panel/enhance-panel';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, EnhancePanel],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  mode = signal<'ask' | 'askBetter'>('ask');
  showEnhanceForm = signal(false);
  isLoading = signal(false);
  hasResult = signal(false);
  promptText = '';

  setMode(m: 'ask' | 'askBetter') {
    this.mode.set(m);
    this.showEnhanceForm.set(false);
    this.hasResult.set(false);
  }

  onSend() {
    if (!this.promptText.trim()) return;
    if (this.mode() === 'ask') {
      this.isLoading.set(true);
      setTimeout(() => {
        this.isLoading.set(false);
        this.hasResult.set(true);
      }, 1200);
    } else {
      this.showEnhanceForm.set(true);
    }
  }

  onEnhancedSend(data: EnhanceData) {
    this.showEnhanceForm.set(false);
    this.isLoading.set(true);
    console.log('Enhanced send:', { prompt: this.promptText, ...data });
    setTimeout(() => {
      this.isLoading.set(false);
      this.hasResult.set(true);
    }, 1500);
  }

  closeEnhanceForm() {
    this.showEnhanceForm.set(false);
  }

  onNewPrompt() {
    this.promptText = '';
    this.hasResult.set(false);
  }
}

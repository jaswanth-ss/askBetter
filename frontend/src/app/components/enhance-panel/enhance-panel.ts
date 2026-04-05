import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface EnhanceData {
  topic: string;
  experienceLevel: string;
  responseFormat: string;
  purpose: string;
  tone: string;
  length: string;
  useResources: boolean;
  resourceTypes: string[];
  additionalContext: string;
}

@Component({
  selector: 'app-enhance-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './enhance-panel.html',
  styleUrl: './enhance-panel.css',
})
export class EnhancePanel {
  visible = input(false);
  prompt = input('');

  send = output<EnhanceData>();
  close = output<void>();

  data: EnhanceData = this.fresh();

  experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  responseFormats = ['Essay', 'Research Paper', 'Poem', 'Summary', 'Bullet Points', 'Step-by-step', 'Code', 'Other'];
  purposes = ['Search', 'Research', 'Deep Understanding', 'Creative Writing', 'Problem Solving', 'Learning'];
  tones = ['Formal', 'Casual', 'Academic', 'Technical', 'Conversational'];
  lengths = ['Concise', 'Medium', 'Detailed', 'Comprehensive'];
  resourceOptions = ['Web Search', 'Academic Papers', 'Documentation', 'News Articles', 'Books'];

  select(field: 'experienceLevel' | 'responseFormat' | 'purpose' | 'tone' | 'length', value: string) {
    this.data[field] = this.data[field] === value ? '' : value;
  }

  isSelected(field: 'experienceLevel' | 'responseFormat' | 'purpose' | 'tone' | 'length', value: string): boolean {
    return this.data[field] === value;
  }

  toggleResource(type: string) {
    const idx = this.data.resourceTypes.indexOf(type);
    if (idx > -1) {
      this.data.resourceTypes = this.data.resourceTypes.filter((t) => t !== type);
    } else {
      this.data.resourceTypes = [...this.data.resourceTypes, type];
    }
  }

  isResourceSelected(type: string): boolean {
    return this.data.resourceTypes.includes(type);
  }

  onSend() {
    this.send.emit({ ...this.data });
    this.data = this.fresh();
  }

  onClose() {
    this.close.emit();
    this.data = this.fresh();
  }

  private fresh(): EnhanceData {
    return {
      topic: '',
      experienceLevel: '',
      responseFormat: '',
      purpose: '',
      tone: '',
      length: '',
      useResources: false,
      resourceTypes: [],
      additionalContext: '',
    };
  }
}

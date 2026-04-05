import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface EnhanceData {
  topic: string;
  userExperienceLevel: string;
  responseFormat: string;
  reasonForAsking: string;
  preferredTone: string;
  responseLength: string;
  useExternalResources: string;
  additionalContext: string;
}

type SelectField = 'userExperienceLevel' | 'responseFormat' | 'reasonForAsking' | 'preferredTone' | 'responseLength';

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

  useResources = false;
  resourceTypes: string[] = [];
  resourceLinks = '';

  otherText: Record<SelectField, string> = this.freshOther();

  experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Other'];
  responseFormats = ['Essay', 'Research Paper', 'Poem', 'Summary', 'Bullet Points', 'Step-by-step', 'Code', 'Other'];
  purposes = ['Search', 'Research', 'Deep Understanding', 'Creative Writing', 'Problem Solving', 'Learning', 'Other'];
  tones = ['Formal', 'Casual', 'Academic', 'Technical', 'Conversational', 'Other'];
  lengths = ['Concise', 'Medium', 'Detailed', 'Comprehensive', 'Other'];
  resourceOptions = ['Web Search', 'Academic Papers', 'Documentation', 'News Articles', 'Books'];

  select(field: SelectField, value: string) {
    this.data[field] = this.data[field] === value ? '' : value;
    if (value !== 'Other') {
      this.otherText[field] = '';
    }
  }

  isSelected(field: SelectField, value: string): boolean {
    return this.data[field] === value;
  }

  isOtherSelected(field: SelectField): boolean {
    return this.data[field] === 'Other';
  }

  toggleResource(type: string) {
    const idx = this.resourceTypes.indexOf(type);
    if (idx > -1) {
      this.resourceTypes = this.resourceTypes.filter((t) => t !== type);
    } else {
      this.resourceTypes = [...this.resourceTypes, type];
    }
  }

  isResourceSelected(type: string): boolean {
    return this.resourceTypes.includes(type);
  }

  onSend() {
    const resolve = (field: SelectField): string => {
      const val = this.data[field];
      return val === 'Other' ? (this.otherText[field].trim() || 'Other') : val;
    };

    let useExternalResources = 'none';
    if (this.useResources) {
      const parts: string[] = [];
      if (this.resourceTypes.length > 0) parts.push(this.resourceTypes.join(', '));
      if (this.resourceLinks.trim()) parts.push(this.resourceLinks.trim());
      useExternalResources = parts.length > 0 ? parts.join(' - ') : 'yes';
    }

    const enriched: EnhanceData = {
      topic: this.data.topic,
      userExperienceLevel: resolve('userExperienceLevel'),
      responseFormat: resolve('responseFormat'),
      reasonForAsking: resolve('reasonForAsking'),
      preferredTone: resolve('preferredTone'),
      responseLength: resolve('responseLength'),
      useExternalResources,
      additionalContext: this.data.additionalContext,
    };

    this.send.emit(enriched);
    this.reset();
  }

  onClose() {
    this.close.emit();
    this.reset();
  }

  private reset() {
    this.data = this.fresh();
    this.useResources = false;
    this.resourceTypes = [];
    this.resourceLinks = '';
    this.otherText = this.freshOther();
  }

  private fresh(): EnhanceData {
    return {
      topic: '',
      userExperienceLevel: '',
      responseFormat: '',
      reasonForAsking: '',
      preferredTone: '',
      responseLength: '',
      useExternalResources: 'none',
      additionalContext: '',
    };
  }

  private freshOther(): Record<SelectField, string> {
    return {
      userExperienceLevel: '',
      responseFormat: '',
      reasonForAsking: '',
      preferredTone: '',
      responseLength: '',
    };
  }
}

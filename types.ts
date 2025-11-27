export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: number;
}

export enum AIActionType {
  SUMMARIZE = 'Summarize',
  FIX_GRAMMAR = 'Fix Grammar',
  CONTINUE_WRITING = 'Continue Writing',
  MAKE_LONGER = 'Expand',
}

export interface AIState {
  isLoading: boolean;
  error: string | null;
}
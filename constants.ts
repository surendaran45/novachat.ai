import { ModelType, ModelConfig } from './types';
import { Bot, Zap, BrainCircuit } from 'lucide-react';

export const MODELS: Record<ModelType, ModelConfig> = {
  [ModelType.FLASH]: {
    id: ModelType.FLASH,
    name: 'Gemini Flash 2.5',
    description: 'Fast, efficient, and versatile for everyday tasks.',
    useThinking: false
  },
  [ModelType.PRO]: {
    id: ModelType.PRO,
    name: 'Gemini Pro 3.0',
    description: 'High intelligence for complex reasoning and coding.',
    useThinking: true
  }
};

export const INITIAL_MESSAGE = "Hello! I am NovaChat. How can I help you today?";

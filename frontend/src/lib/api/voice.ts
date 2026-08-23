import { apiClient } from './client';
import { VoiceCommandPayload, VoiceCommandResponse } from '@/types/voice';

export async function sendVoiceCommand(payload: VoiceCommandPayload): Promise<VoiceCommandResponse> {
  try {
    const response = await apiClient<any>('voice/command', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response as VoiceCommandResponse;
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Voice assistant temporarily unavailable. Try typing your command.',
      error: {
        code: err?.code || 'API_ERROR',
        message: err?.message || 'Voice request failed.',
      },
    };
  }
}

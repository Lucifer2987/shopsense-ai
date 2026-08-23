import { apiClient } from './client';
import { VoiceCommandPayload, VoiceCommandResponse } from '@/types/voice';

export async function sendVoiceCommand(payload: VoiceCommandPayload): Promise<VoiceCommandResponse> {
  const response = await apiClient<any>('voice/command', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response as VoiceCommandResponse;
}

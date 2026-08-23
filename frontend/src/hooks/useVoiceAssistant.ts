import { useState, useRef, useCallback, useEffect } from 'react';
import { VoiceState, VoiceCommandResponse } from '@/types/voice';
import * as voiceApi from '@/lib/api/voice';
import { useApp } from '@/context/AppContext';

// Detects if text looks like Hinglish/Hindi
function detectLang(text: string): string {
  const keywords = [
    'bhai', 'doodh', 'dudh', 'chahiye', 'kar de', 'karo', 'hatao', 'daal',
    'paani', 'atta', 'chawal', 'chini', 'seb', 'kela', 'tamatar', 'aloo',
    'mera', 'budget', 'hai', 'kitna', 'rahe', 'hain', 'log', 'kal', 'sasta',
    'dhoondh', 'saaf', 'dikhao', 'nahi', 'bhi', 'packet', 'aur'
  ];
  const lower = text.toLowerCase();
  return keywords.some(w => lower.includes(w)) ? 'Hindi / Hinglish detected' : 'English detected';
}

export function useVoiceAssistant() {
  const { userId, ensureList, refreshList, refreshContext, setBudget, showToast, listLoading } = useApp();

  const [state, setState] = useState<VoiceState>('IDLE');
  const [transcript, setTranscript] = useState<string>('');
  const [lastResponse, setLastResponse] = useState<VoiceCommandResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);

  const isListeningRef = useRef<boolean>(false);
  const hasExecutedRef = useRef<boolean>(false);

  // Stable refs that mirror the latest values without causing re-initialization
  const ensureListRef = useRef(ensureList);
  const refreshListRef = useRef(refreshList);
  const refreshContextRef = useRef(refreshContext);
  const setBudgetRef = useRef(setBudget);
  const showToastRef = useRef(showToast);
  const userIdRef = useRef(userId);

  ensureListRef.current = ensureList;
  refreshListRef.current = refreshList;
  refreshContextRef.current = refreshContext;
  setBudgetRef.current = setBudget;
  showToastRef.current = showToast;
  userIdRef.current = userId;

  // Check speech support once (just the API, not instantiate)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supported = !!(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
    setIsSpeechSupported(supported);
  }, []);

  // Central command execution — uses only refs so it's stable
  const executeVoiceCommand = useCallback(async (text: string): Promise<VoiceCommandResponse | null> => {
    const trimmed = text.trim();
    if (!trimmed) return null;

    setState('PROCESSING');
    setTranscript(trimmed);
    setDetectedLanguage(detectLang(trimmed));
    setErrorMessage(null);

    try {
      const activeList = await ensureListRef.current();

      if (!activeList?.id) {
        console.error('[ShopSense Voice] No active shopping list ID available.');
        setState('ERROR');
        setErrorMessage("Your shopping list isn't ready yet. Please try again.");
        return null;
      }

      const payload = {
        text: trimmed,
        list_id: activeList.id,
        user_id: userIdRef.current,
      };

      console.log('[ShopSense Voice] Sending command:', payload);

      const response = await voiceApi.sendVoiceCommand(payload);
      console.log('[ShopSense Voice] Response:', response);

      setLastResponse(response);

      if (response.success) {
        setState('SUCCESS');
        if (response.message) {
          showToastRef.current(response.message, 'success');
        }
        await refreshListRef.current();
        if (response.data?.budget) {
          setBudgetRef.current(response.data.budget);
        }
        if (response.data?.context_type || response.data?.context_data) {
          await refreshContextRef.current();
        }
        return response;
      } else {
        setState('ERROR');
        const errMsg = response.error?.message || response.message || "Couldn't process that command.";
        setErrorMessage(errMsg);
        return response;
      }
    } catch (err: any) {
      console.warn('[ShopSense Voice] Request issue:', err);
      setState('ERROR');
      const msg = err?.message || 'Failed to process voice command. Please try again.';
      setErrorMessage(msg);
      showToastRef.current(msg, 'error');
      return null;
    }
  }, []); // fully stable

  // Build a fresh SpeechRecognition instance and start it immediately
  // Called only when the user explicitly taps the mic button
  const startListening = useCallback((lang = 'en-IN') => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    // Stop any existing instance first
    if (isListeningRef.current) {
      stopListening();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      isListeningRef.current = true;
      hasExecutedRef.current = false;
      setState('LISTENING');
      setErrorMessage(null);
      setLastResponse(null);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalSpeech = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        const piece = item[0]?.transcript || '';
        if (item.isFinal) {
          finalSpeech += piece;
        } else {
          interim += piece;
        }
      }
      const display = finalSpeech || interim;
      if (display) {
        setTranscript(display);
        setDetectedLanguage(detectLang(display));
      }

      // Fire command exactly once when final speech is captured
      if (finalSpeech && !hasExecutedRef.current) {
        hasExecutedRef.current = true;
        try { recognition.stop(); } catch { /* ignore */ }
        executeVoiceCommand(finalSpeech);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[ShopSense Voice] Error event:', event.error);
      isListeningRef.current = false;
      if (event.error === 'no-speech') {
        setState('IDLE');
        setErrorMessage('No speech detected. Tap 🎙 and try speaking again.');
      } else if (event.error === 'not-allowed') {
        setState('ERROR');
        setErrorMessage('Microphone access denied. Allow mic permission in your browser.');
      } else {
        setState('ERROR');
        setErrorMessage('Speech recognition issue. Try typing your command below.');
      }
    };

    recognition.onend = () => {
      isListeningRef.current = false;
    };

    // Store the active instance so stopListening can reach it
    (startListening as any).__active = recognition;

    try {
      recognition.start();
    } catch (err: any) {
      console.warn('[ShopSense Voice] start() failed:', err.message);
      setState('ERROR');
      setErrorMessage('Could not start microphone. Please try again.');
    }
  }, [executeVoiceCommand]);

  const stopListening = useCallback(() => {
    const active = (startListening as any).__active;
    if (active && isListeningRef.current) {
      try { active.stop(); } catch { /* ignore */ }
    }
    isListeningRef.current = false;
    setState(prev => prev === 'LISTENING' ? 'IDLE' : prev);
  }, [startListening]);

  const resetState = useCallback(() => {
    // Stop any active recognition
    const active = (startListening as any).__active;
    if (active && isListeningRef.current) {
      try { active.abort(); } catch { /* ignore */ }
    }
    isListeningRef.current = false;
    hasExecutedRef.current = false;
    setState('IDLE');
    setTranscript('');
    setLastResponse(null);
    setErrorMessage(null);
    setDetectedLanguage(null);
  }, [startListening]);

  return {
    state,
    transcript,
    setTranscript,
    lastResponse,
    errorMessage,
    detectedLanguage,
    isSpeechSupported,
    listLoading,
    startListening,
    stopListening,
    executeVoiceCommand,
    processCommand: executeVoiceCommand,
    resetState,
  };
}

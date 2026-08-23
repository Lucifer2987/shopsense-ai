'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { Mic, Send, AlertCircle, CheckCircle2, X, MicOff, Loader2, Globe } from 'lucide-react';

// Languages supported by the browser Web Speech API + understood by Gemini backend
const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', label: 'English', flag: '🇮🇳', nativeLabel: 'English' },
  { code: 'hi-IN', label: 'Hindi', flag: '🇮🇳', nativeLabel: 'हिन्दी' },
  { code: 'bn-IN', label: 'Bengali', flag: '🇮🇳', nativeLabel: 'বাংলা' },
  { code: 'ta-IN', label: 'Tamil', flag: '🇮🇳', nativeLabel: 'தமிழ்' },
  { code: 'te-IN', label: 'Telugu', flag: '🇮🇳', nativeLabel: 'తెలుగు' },
  { code: 'mr-IN', label: 'Marathi', flag: '🇮🇳', nativeLabel: 'मराठी' },
  { code: 'gu-IN', label: 'Gujarati', flag: '🇮🇳', nativeLabel: 'ગુજરાતી' },
  { code: 'pa-IN', label: 'Punjabi', flag: '🇮🇳', nativeLabel: 'ਪੰਜਾਬੀ' },
  { code: 'kn-IN', label: 'Kannada', flag: '🇮🇳', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ml-IN', label: 'Malayalam', flag: '🇮🇳', nativeLabel: 'മലയാളം' },
  { code: 'ur-IN', label: 'Urdu', flag: '🇮🇳', nativeLabel: 'اردو' },
  { code: 'or-IN', label: 'Odia', flag: '🇮🇳', nativeLabel: 'ଓଡ଼ିଆ' },
] as const;

type LangCode = typeof SUPPORTED_LANGUAGES[number]['code'];

// Contextual suggestion commands per language
const SUGGESTIONS_BY_LANG: Record<string, string[]> = {
  'en-IN': [
    'add 2 litres of milk',
    'find organic apples under 200',
    'set my budget to 1000',
    'what should I buy?',
  ],
  'hi-IN': [
    'दो लीटर दूध जोड़ो',
    'सेब खोजो 200 से कम में',
    'मेरा बजट 1000 रुपये है',
    'मुझे क्या खरीदना चाहिए?',
  ],
  'bn-IN': [
    '২ লিটার দুধ যোগ করো',
    '২০০ টাকার মধ্যে আপেল খোঁজো',
    'আমার বাজেট ১০০০ টাকা',
  ],
  'ta-IN': [
    '2 லிட்டர் பால் சேர்க்கவும்',
    '200க்கும் கம்மியான ஆப்பிள் தேடுங்கள்',
    'என் பட்ஜெட் 1000 ரூபாய்',
  ],
  'te-IN': [
    '2 లీటర్ల పాలు జోడించు',
    '200 లోపు ఆపిల్ వెతుకు',
    'నా బడ్జెట్ 1000 రూపాయలు',
  ],
  'mr-IN': [
    '२ लिटर दूध जोडा',
    '२०० पेक्षा कमी सफरचंद शोधा',
    'माझे बजेट १००० आहे',
  ],
  'gu-IN': [
    '2 લિટર દૂધ ઉમેરો',
    '200 થી ઓછા ભાવે સફરજન શોધો',
    'મારું બજેટ 1000 છે',
  ],
  'pa-IN': [
    '2 ਲੀਟਰ ਦੁੱਧ ਪਾਓ',
    '200 ਤੋਂ ਘੱਟ ਵਿੱਚ ਸੇਬ ਲੱਭੋ',
    'ਮੇਰਾ ਬਜਟ 1000 ਰੁਪਏ ਹੈ',
  ],
  'kn-IN': [
    '2 ಲೀಟರ್ ಹಾಲು ಸೇರಿಸಿ',
    '200 ರೂ ಒಳಗೆ ಸೇಬು ಹುಡುಕಿ',
    'ನನ್ನ ಬಜೆಟ್ 1000 ರೂಪಾಯಿ',
  ],
  'ml-IN': [
    '2 ലിറ്റർ പാൽ ചേർക്കൂ',
    '200 രൂപയ്ക്ക് കീഴിൽ ആപ്പിൾ തിരയൂ',
    'എന്റെ ബഡ്ജറ്റ് 1000 രൂപ',
  ],
  'ur-IN': [
    '2 لیٹر دودھ شامل کریں',
    '200 سے کم میں سیب تلاش کریں',
    'میرا بجٹ 1000 روپے ہے',
  ],
  'or-IN': [
    '2 ଲିଟର ଦୁଧ ଯୋଡ଼ନ୍ତୁ',
    '200 ତଳେ ଆପଲ ଖୋଜ',
    'ମୋ ବଜେଟ 1000 ଟଙ୍କା',
  ],
};

// Hinglish always available as a fallback set
const HINGLISH_SUGGESTIONS = [
  'bhai 2 litre doodh add kar de',
  'mera budget 1000 hai',
  'kal 5 friends aa rahe hain',
  'optimize my basket',
];

export function VoiceAssistantModal() {
  const { isVoiceModalOpen, setIsVoiceModalOpen, listLoading } = useApp();
  const {
    state,
    transcript,
    lastResponse,
    errorMessage,
    detectedLanguage,
    isSpeechSupported,
    startListening,
    stopListening,
    executeVoiceCommand,
    resetState,
  } = useVoiceAssistant();

  const [textInput, setTextInput] = useState('');
  const [selectedLang, setSelectedLang] = useState<LangCode>('en-IN');
  const [showLangPicker, setShowLangPicker] = useState(false);

  if (!isVoiceModalOpen) return null;

  const selectedLangInfo = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)!;
  const suggestions = SUGGESTIONS_BY_LANG[selectedLang] || HINGLISH_SUGGESTIONS;

  const handleClose = () => {
    stopListening();
    resetState();
    setShowLangPicker(false);
    setIsVoiceModalOpen(false);
  };

  const handleMicClick = () => {
    if (state === 'LISTENING') {
      stopListening();
    } else {
      startListening(selectedLang);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || state === 'PROCESSING' || listLoading) return;
    const input = textInput;
    setTextInput('');
    await executeVoiceCommand(input);
  };

  const handleSuggestionClick = async (cmd: string) => {
    if (state === 'PROCESSING' || listLoading) return;
    await executeVoiceCommand(cmd);
  };

  const handleLangSelect = (code: LangCode) => {
    setSelectedLang(code);
    setShowLangPicker(false);
    resetState();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl p-6 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="font-extrabold text-base text-[var(--text-primary)]">
              Voice Shopping
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Speak in your language — Gemini understands
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Picker Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowLangPicker(p => !p)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Select language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{selectedLangInfo.nativeLabel}</span>
              </button>

              {showLangPicker && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl z-20 py-1 overflow-hidden max-h-64 overflow-y-auto">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangSelect(lang.code as LangCode)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                        selectedLang === lang.code
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)]'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="font-medium">{lang.label}</span>
                      <span className="ml-auto text-[10px] text-[var(--text-muted)]">{lang.nativeLabel}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
              aria-label="Close voice assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Audio Action Area */}
        <div className="py-6 flex flex-col items-center justify-center text-center">

          {/* Main Mic Button */}
          <div className="relative mb-4">
            {state === 'LISTENING' && (
              <div className="absolute -inset-2.5 rounded-full bg-emerald-500/20 animate-mic-pulse" />
            )}

            <button
              onClick={handleMicClick}
              disabled={!isSpeechSupported || state === 'PROCESSING' || listLoading}
              className={`relative w-18 h-18 rounded-full flex items-center justify-center shadow-lg transition-all duration-150 ${
                listLoading
                  ? 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] cursor-wait'
                  : !isSpeechSupported
                  ? 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)] cursor-not-allowed'
                  : state === 'LISTENING'
                  ? 'bg-red-500 text-white scale-105 shadow-red-500/30'
                  : state === 'PROCESSING'
                  ? 'bg-amber-500 text-white animate-pulse shadow-amber-500/30 cursor-wait'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-600/30'
              }`}
              aria-label={state === 'LISTENING' ? 'Stop listening' : 'Start speaking'}
            >
              {listLoading ? (
                <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
              ) : !isSpeechSupported ? (
                <MicOff className="w-7 h-7" />
              ) : state === 'LISTENING' ? (
                <div className="flex items-center gap-1">
                  <span className="w-1 h-4 bg-white rounded-full animate-wave-1" />
                  <span className="w-1 h-6 bg-white rounded-full animate-wave-2" />
                  <span className="w-1 h-3 bg-white rounded-full animate-wave-3" />
                  <span className="w-1 h-7 bg-white rounded-full animate-wave-4" />
                  <span className="w-1 h-4 bg-white rounded-full animate-wave-5" />
                </div>
              ) : (
                <Mic className="w-7 h-7" />
              )}
            </button>
          </div>

          {/* Status display */}
          <div className="min-h-[52px] flex flex-col items-center justify-center px-2 w-full">
            {listLoading ? (
              <p className="text-xs font-semibold text-[var(--text-muted)] animate-pulse">
                Preparing your shopping list...
              </p>
            ) : !isSpeechSupported ? (
              <p className="text-xs text-[var(--text-muted)] max-w-xs">
                Voice input isn&apos;t supported in this browser. Type your command below.
              </p>
            ) : state === 'LISTENING' ? (
              <>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  Listening in {selectedLangInfo.label}...
                </span>
                <p className="text-sm font-semibold text-[var(--text-primary)] italic max-w-xs">
                  {transcript ? `"${transcript}"` : 'Speak now...'}
                </p>
              </>
            ) : state === 'PROCESSING' ? (
              <>
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                  Understanding...
                </span>
                <p className="text-xs font-medium text-[var(--text-secondary)]">
                  {transcript ? `"${transcript}"` : 'Processing command...'}
                </p>
              </>
            ) : state === 'SUCCESS' && lastResponse ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{lastResponse.message || 'Done! Added to list.'}</span>
              </div>
            ) : state === 'ERROR' ? (
              <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-xl border border-red-500/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage || "Couldn't understand that command."}</span>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-[var(--text-primary)] mb-0.5">
                  Tap microphone to speak in {selectedLangInfo.nativeLabel}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Gemini understands 12+ Indian languages
                </p>
              </>
            )}
          </div>

          {/* Detected language badge */}
          {detectedLanguage && !listLoading && (
            <span className="mt-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {detectedLanguage}
            </span>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="mb-3.5">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
            Quick Examples in {selectedLangInfo.label}:
          </span>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleSuggestionClick(cmd)}
                disabled={state === 'PROCESSING' || listLoading}
                className="px-2.5 py-1 rounded-lg text-xs bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-left disabled:opacity-50"
              >
                &ldquo;{cmd}&rdquo;
              </button>
            ))}
            {/* Always show one Hinglish tip if not already in en-IN mode */}
            {selectedLang !== 'en-IN' && (
              <button
                onClick={() => handleSuggestionClick('bhai 2 litre doodh add kar de')}
                disabled={state === 'PROCESSING' || listLoading}
                className="px-2.5 py-1 rounded-lg text-xs bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-left disabled:opacity-50 border-dashed"
              >
                &ldquo;bhai 2 litre doodh add kar de&rdquo;
              </button>
            )}
          </div>
        </div>

        {/* Text Input Fallback */}
        <form onSubmit={handleManualSubmit} className="pt-3 border-t border-[var(--border-subtle)]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={state === 'PROCESSING' || listLoading}
              placeholder={listLoading ? 'Preparing list...' : `Type in any language...`}
              className="w-full pl-3.5 pr-10 py-2 rounded-xl text-xs sm:text-sm bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || state === 'PROCESSING' || listLoading}
              className="absolute right-1.5 p-1.5 rounded-lg bg-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
              aria-label="Send command"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

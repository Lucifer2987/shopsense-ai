'use client';

import React, { useState } from 'react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useApp } from '@/context/AppContext';
import { Mic, Send, Globe, CheckCircle2, AlertCircle, Sparkles, X, ChevronUp, ChevronDown } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', label: 'English / Hinglish', native: 'English' },
  { code: 'hi-IN', label: 'Hindi', native: 'हिन्दी' },
  { code: 'bn-IN', label: 'Bengali', native: 'বাংলা' },
  { code: 'ta-IN', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te-IN', label: 'Telugu', native: 'తెలుగు' },
  { code: 'mr-IN', label: 'Marathi', native: 'मराठी' },
  { code: 'gu-IN', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa-IN', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'kn-IN', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml-IN', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'ur-IN', label: 'Urdu', native: 'اردو' },
  { code: 'or-IN', label: 'Odia', native: 'ଓଡ଼ିଆ' },
];

export function PersistentVoiceBar() {
  const { listLoading } = useApp();
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

  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedLangInfo = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  const handleMicToggle = () => {
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

  const handleQuickCommand = async (cmd: string) => {
    if (state === 'PROCESSING' || listLoading) return;
    await executeVoiceCommand(cmd);
  };

  return (
    <div className="fixed bottom-16 md:bottom-5 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none flex justify-center">
      <div className="pointer-events-auto w-full max-w-xl rounded-2xl bg-[var(--bg-card)]/95 dark:bg-slate-900/95 backdrop-blur-md border border-[var(--border-subtle)] shadow-xl transition-all duration-200 overflow-hidden">
        
        {/* Language Selection Drawer (if open) */}
        {showLangMenu && (
          <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card-subtle)]/80 max-h-48 overflow-y-auto grid grid-cols-3 gap-1.5 text-xs">
            {SUPPORTED_LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => {
                  setSelectedLang(l.code);
                  setShowLangMenu(false);
                  resetState();
                }}
                className={`px-2 py-1.5 rounded-lg text-left font-medium transition-colors ${
                  selectedLang === l.code
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                {l.native}
              </button>
            ))}
          </div>
        )}

        {/* Main Bar Content */}
        <div className="p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3">
          
          {/* Main Microphone Button */}
          <button
            onClick={handleMicToggle}
            disabled={!isSpeechSupported || state === 'PROCESSING' || listLoading}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 shadow-xs ${
              state === 'LISTENING'
                ? 'bg-red-500 text-white animate-pulse shadow-red-500/30 scale-105'
                : state === 'PROCESSING'
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white active:scale-95'
            }`}
            aria-label={state === 'LISTENING' ? 'Stop listening' : 'Start speaking'}
          >
            {state === 'LISTENING' ? (
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-white rounded-full animate-wave-1" />
                <span className="w-1 h-5 bg-white rounded-full animate-wave-2" />
                <span className="w-1 h-4 bg-white rounded-full animate-wave-3" />
              </div>
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Center Dynamic Feedback & Input Area */}
          <div className="flex-1 min-w-0">
            {state === 'LISTENING' ? (
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                  Listening ({selectedLangInfo.native})...
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate italic">
                  {transcript ? `"${transcript}"` : 'Say items, budget or occasion...'}
                </p>
              </div>
            ) : state === 'PROCESSING' ? (
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider block">
                  Understanding...
                </span>
                <p className="text-xs text-[var(--text-secondary)] truncate">
                  {transcript ? `"${transcript}"` : 'Processing shopping command...'}
                </p>
              </div>
            ) : state === 'SUCCESS' && lastResponse ? (
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold truncate">
                  {lastResponse.message || 'Added to your list!'}
                </span>
              </div>
            ) : state === 'ERROR' ? (
              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 min-w-0">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-xs font-medium truncate">
                  {errorMessage || 'Try speaking again or type below'}
                </span>
              </div>
            ) : (
              /* Idle State — Direct Type / Hint */
              <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Tell ShopSense what you need... (e.g. 2L milk, bread)"
                  className="w-full text-xs sm:text-sm bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
                {textInput.trim() && (
                  <button
                    type="submit"
                    className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0 hover:bg-emerald-700 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Language Picker Toggle */}
            <button
              onClick={() => setShowLangMenu(p => !p)}
              className="p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors flex items-center gap-1 border border-transparent hover:border-[var(--border-subtle)]"
              title="Change Voice Language"
              aria-label="Change Voice Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline text-[11px]">{selectedLangInfo.native}</span>
            </button>

            {/* Quick Suggestions Expand Toggle */}
            <button
              onClick={() => setIsExpanded(p => !p)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
              title={isExpanded ? 'Hide suggestions' : 'Show suggestions'}
              aria-label="Toggle suggestions"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Expandable Quick Chips Tray */}
        {isExpanded && (
          <div className="px-3 pb-3 pt-1 border-t border-[var(--border-subtle)] bg-[var(--bg-card-subtle)]/40 flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mr-1">
              Try saying:
            </span>
            <button
              onClick={() => handleQuickCommand('bhai 2 litre doodh add kar de')}
              className="px-2.5 py-1 rounded-lg text-xs bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              &ldquo;bhai 2 litre doodh add kar de&rdquo;
            </button>
            <button
              onClick={() => handleQuickCommand('kal 4 log aa rahe hain')}
              className="px-2.5 py-1 rounded-lg text-xs bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              &ldquo;kal 4 log aa rahe hain&rdquo;
            </button>
            <button
              onClick={() => handleQuickCommand('apples under 200')}
              className="px-2.5 py-1 rounded-lg text-xs bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              &ldquo;apples under 200&rdquo;
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useApp } from '@/context/AppContext';
import { Mic, Send, Globe, CheckCircle2, AlertCircle, X, Loader2, ChevronDown } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', label: 'English', native: 'English' },
  { code: 'hi-IN', label: 'Hindi', native: 'हिन्दी' },
  { code: 'gu-IN', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'mr-IN', label: 'Marathi', native: 'मराठी' },
  { code: 'bn-IN', label: 'Bengali', native: 'বাংলা' },
  { code: 'ta-IN', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te-IN', label: 'Telugu', native: 'తెలుగు' },
  { code: 'pa-IN', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'kn-IN', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml-IN', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'ur-IN', label: 'Urdu', native: 'اردو' },
  { code: 'or-IN', label: 'Odia', native: 'ଓଡ଼ିଆ' },
];

export function FloatingVoiceAssistant() {
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

  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [textInput, setTextInput] = useState('');

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

  const handleClose = () => {
    stopListening();
    resetState();
    setShowLangMenu(false);
    setIsVoiceModalOpen(false);
  };

  return (
    <>
      {/* Floating Bottom-Right Trigger Button (Desktop & Tablet) */}
      {!isVoiceModalOpen && (
        <div className="fixed bottom-6 right-6 z-40 hidden md:block">
          <button
            onClick={() => {
              setIsVoiceModalOpen(true);
              startListening(selectedLang);
            }}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="Open voice shopping"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <span>Voice Shop</span>
          </button>
        </div>
      )}

      {/* Compact Voice Interaction Card */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 z-50 flex items-end md:items-end justify-center md:justify-end p-3 pb-18 sm:p-0 md:p-0">
          
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs md:hidden"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Card Surface */}
          <div className="relative w-full max-w-sm rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl p-4 z-10 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-sm text-[var(--text-primary)]">Voice Shop</span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Language Switcher Trigger */}
                <button
                  onClick={() => setShowLangMenu(p => !p)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                  aria-label="Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-extrabold">{selectedLangInfo.native}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                <button
                  onClick={handleClose}
                  className="p-1 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)]"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* In-Card Language Selector Drawer (100% visible, fully readable, never clipped) */}
            {showLangMenu && (
              <div className="my-2 p-2 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] grid grid-cols-3 gap-1 max-h-36 overflow-y-auto animate-in fade-in duration-100">
                {SUPPORTED_LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setSelectedLang(l.code);
                      setShowLangMenu(false);
                      resetState();
                    }}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                      selectedLang === l.code
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[var(--bg-card)] text-slate-800 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 border border-[var(--border-subtle)]'
                    }`}
                  >
                    <span className="block leading-tight">{l.native}</span>
                    <span className="block text-[9px] opacity-70">{l.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Mic & Live Speech Area */}
            <div className="py-3 flex flex-col items-center justify-center text-center">
              
              <button
                onClick={handleMicToggle}
                disabled={!isSpeechSupported || state === 'PROCESSING' || listLoading}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-150 mb-2 ${
                  state === 'LISTENING'
                    ? 'bg-red-500 text-white animate-pulse shadow-red-500/30 scale-105'
                    : state === 'PROCESSING'
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 active:scale-95'
                }`}
                aria-label={state === 'LISTENING' ? 'Stop listening' : 'Start speaking'}
              >
                {listLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : state === 'LISTENING' ? (
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-white rounded-full animate-wave-1" />
                    <span className="w-1 h-5 bg-white rounded-full animate-wave-2" />
                    <span className="w-1 h-3 bg-white rounded-full animate-wave-3" />
                  </div>
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>

              {/* Status / Transcript Feedback */}
              <div className="min-h-[38px] flex flex-col items-center justify-center px-1 w-full">
                {state === 'LISTENING' ? (
                  <>
                    <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider mb-0.5">
                      Listening in {selectedLangInfo.native}...
                    </span>
                    <p className="text-xs font-bold text-[var(--text-primary)] italic line-clamp-2">
                      {transcript ? `"${transcript}"` : 'Speak grocery items...'}
                    </p>
                  </>
                ) : state === 'PROCESSING' ? (
                  <>
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider mb-0.5">
                      Understanding...
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] italic line-clamp-1">
                      {transcript ? `"${transcript}"` : 'Processing command...'}
                    </p>
                  </>
                ) : state === 'SUCCESS' && lastResponse ? (
                  /* High Contrast Success Pill */
                  <div className="flex items-center gap-1.5 text-emerald-950 dark:text-emerald-100 text-xs font-bold bg-emerald-100 dark:bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="line-clamp-2">{lastResponse.message || 'Added to cart!'}</span>
                  </div>
                ) : state === 'ERROR' ? (
                  <div className="flex items-center gap-1.5 text-red-950 dark:text-red-100 text-xs font-medium bg-red-100 dark:bg-red-900/80 px-3 py-1.5 rounded-xl border border-red-500/30">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="line-clamp-2">{errorMessage || 'Could not understand that command.'}</span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-bold text-[var(--text-primary)]">
                      Tap mic & speak in {selectedLangInfo.native}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Try &ldquo;bhai 2 litre doodh add kar de&rdquo;
                    </p>
                  </>
                )}
              </div>

            </div>

            {/* Quick Suggestion Chips */}
            <div className="mb-2.5 pt-2 border-t border-[var(--border-subtle)]">
              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Quick Commands:
              </span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => handleQuickCommand('bhai 2 litre doodh add kar de')}
                  className="px-2 py-1 rounded-lg text-[10px] bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold"
                >
                  &ldquo;2L doodh add kar de&rdquo;
                </button>
                <button
                  onClick={() => handleQuickCommand('kal 4 log aa rahe hain')}
                  className="px-2 py-1 rounded-lg text-[10px] bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold"
                >
                  &ldquo;kal 4 log aa rahe hain&rdquo;
                </button>
                <button
                  onClick={() => handleQuickCommand('apples under 200')}
                  className="px-2 py-1 rounded-lg text-[10px] bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold"
                >
                  &ldquo;apples under 200&rdquo;
                </button>
              </div>
            </div>

            {/* Direct Type Fallback */}
            <form onSubmit={handleManualSubmit} className="relative flex items-center">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Or type grocery command..."
                className="w-full pl-3 pr-8 py-2 rounded-xl text-xs bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!textInput.trim() || state === 'PROCESSING'}
                className="absolute right-1.5 p-1 rounded-lg bg-emerald-600 text-white disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
}

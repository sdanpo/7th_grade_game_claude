import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface Props {
  onResult: (text: string) => void;
  instruction: string;
  active: boolean;
}

export function VoiceChallenge({ onResult, instruction, active }: Props) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const recognition = new SR();
    recognition.lang = 'he-IL';
    recognition.continuous = false;
    recognition.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const text = Array.from(e.results as ArrayLike<SpeechRecognitionResult>)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join('');
      setTranscript(text);
      if (e.results[e.results.length - 1].isFinal) {
        onResult(text);
        setListening(false);
      }
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); };

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [onResult]);

  const toggleListen = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setListening(true);
    }
  };

  if (!active) return null;

  return (
    <div className="glass-card p-4 rounded-2xl text-center space-y-3">
      <p className="text-purple-300 font-semibold text-sm">🎤 {instruction}</p>

      {!supported ? (
        <p className="text-red-400 text-sm">הדפדפן שלך לא תומך בזיהוי קול. הקלד את התשובה.</p>
      ) : (
        <>
          <button
            onClick={toggleListen}
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all ${
              listening ? 'animate-pulse' : ''
            }`}
            style={{
              background: listening ? 'rgba(239,68,68,0.3)' : 'rgba(124,58,237,0.3)',
              border: `2px solid ${listening ? '#ef4444' : '#7c3aed'}`,
              boxShadow: listening ? '0 0 20px rgba(239,68,68,0.5)' : '0 0 10px rgba(124,58,237,0.3)',
            }}
          >
            {listening ? <MicOff size={28} className="text-red-400" /> : <Mic size={28} className="text-purple-400" />}
          </button>

          {listening && (
            <div className="flex gap-1 justify-center items-end h-6">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-1 bg-purple-400 rounded-full animate-pulse"
                  style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}

          {transcript && (
            <div className="p-2 rounded-lg text-sm font-semibold"
              style={{ background: 'rgba(124,58,237,0.2)', color: '#c4b5fd' }}>
              "{transcript}"
            </div>
          )}

          <p className="text-gray-500 text-xs">
            {listening ? 'מקשיב... דבר בבקשה' : 'לחץ על המיקרופון ואמור את התשובה'}
          </p>
        </>
      )}
    </div>
  );
}

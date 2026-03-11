import { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface Props {
  instruction: string;
  onCapture: (dataUrl: string) => void;
  active: boolean;
}

export function CameraChallenge({ instruction, onCapture, active }: Props) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setSupported(false);
    }
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, [stream]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
      setError('');
    } catch {
      setError('לא ניתן לגשת למצלמה. וודא שנתת הרשאה.');
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCaptured(dataUrl);
    stopCamera();
    onCapture(dataUrl);
  };

  const reset = () => { setCaptured(null); };

  if (!active) return null;

  return (
    <div className="glass-card p-4 rounded-2xl space-y-3">
      <p className="text-amber-300 font-semibold text-sm text-center">📷 {instruction}</p>

      {!supported ? (
        <p className="text-red-400 text-sm text-center">המצלמה אינה נתמכת בדפדפן זה.</p>
      ) : error ? (
        <p className="text-red-400 text-sm text-center">{error}</p>
      ) : captured ? (
        <div className="text-center space-y-2">
          <img src={captured} alt="captured" className="rounded-xl max-h-40 mx-auto border border-yellow-400/30" />
          <div className="text-green-400 font-semibold text-sm">✓ תמונה נלכדה!</div>
          <button onClick={reset} className="btn-purple text-xs px-3 py-1 rounded-lg">
            צלם שוב
          </button>
        </div>
      ) : stream ? (
        <div className="space-y-2">
          <video ref={videoRef} className="rounded-xl w-full max-h-48 object-cover"
            style={{ border: '2px solid rgba(255,215,0,0.3)' }} />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2">
            <button onClick={capturePhoto} className="btn-gold flex-1 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
              <Camera size={18} /> צלם!
            </button>
            <button onClick={stopCamera} className="btn-purple py-2 px-3 rounded-xl">
              <CameraOff size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button onClick={startCamera}
            className="btn-gold py-3 px-6 rounded-xl font-bold flex items-center gap-2 mx-auto">
            <Camera size={20} /> הפעל מצלמה
          </button>
          <p className="text-gray-500 text-xs mt-2">נדרשת הרשאת מצלמה</p>
        </div>
      )}
    </div>
  );
}

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, X, Image as ImageIcon } from 'lucide-react';

interface Props {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<Props> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to access camera. Please allow permissions or upload a file.');
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [startCamera]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Stop camera before proceeding
        if (stream) stream.getTracks().forEach(t => t.stop());
        
        onCapture(imageData);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="text-white p-2 bg-white/20 rounded-full backdrop-blur-sm">
          <X />
        </button>
        <h2 className="text-white font-medium">Scan Ingredients</h2>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white text-center p-6">
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-600 px-6 py-2 rounded-lg"
            >
              Upload Photo Instead
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Overlay guides */}
        <div className="absolute inset-0 pointer-events-none border-[40px] border-black/30 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>
            </div>
        </div>
      </div>

      <div className="bg-black/90 p-8 pb-12 flex justify-around items-center">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="text-white/80 flex flex-col items-center gap-1 text-xs"
        >
          <div className="bg-white/10 p-3 rounded-full">
            <ImageIcon size={24} />
          </div>
          Upload
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileUpload}
        />

        <button 
          onClick={captureImage}
          className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 flex items-center justify-center transition-transform active:scale-90"
        >
          <div className="w-16 h-16 bg-white border-2 border-black rounded-full"></div>
        </button>

        <button 
          onClick={switchCamera}
          className="text-white/80 flex flex-col items-center gap-1 text-xs"
        >
          <div className="bg-white/10 p-3 rounded-full">
            <RefreshCw size={24} />
          </div>
          Flip
        </button>
      </div>
    </div>
  );
};

export default CameraScanner;

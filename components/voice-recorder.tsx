'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Play, Trash2, Download } from 'lucide-react';

interface VoiceRecorderProps {
  onVoiceRecorded?: (blob: Blob) => void;
  onVoiceCleared?: () => void;
}

export default function VoiceRecorder({ onVoiceRecorded, onVoiceCleared }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        onVoiceRecorded?.(blob);
        
        // Clean up stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Unable to access microphone. Please check permissions.');
      console.error('Microphone error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const playRecording = async () => {
    if (!recordedBlob) return;

    try {
      const url = URL.createObjectURL(recordedBlob);
      const audio = new Audio(url);
      audioElementRef.current = audio;

      setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };

      audio.play();
    } catch (err) {
      setError('Failed to play recording');
      console.error('Playback error:', err);
    }
  };

  const downloadRecording = () => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-note-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearRecording = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setRecordedBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
    onVoiceCleared?.();
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      {error ? (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>
      ) : null}

      {!recordedBlob ? (
        // Recording interface
        <div className="rounded-lg p-4 surface">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Mic size={20} />
              Start Recording
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Recording...</span>
                </div>
                <span className="text-lg font-mono font-semibold text-gray-900">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <Square size={20} />
                Stop Recording
              </button>
            </div>
          )}
        </div>
      ) : (
        // Playback interface
        <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <Mic size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Voice Note</p>
                  <p className="text-xs text-gray-500">{formatTime(recordingTime)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={playRecording}
                disabled={isPlaying}
                className={`p-2 rounded-full transition-colors ${
                  isPlaying
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                title={isPlaying ? 'Playing...' : 'Play'}
              >
                <Play size={20} fill="currentColor" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={downloadRecording}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                title="Download voice note"
              >
                <Download size={16} />
                Download
              </button>
              <button
                type="button"
                onClick={clearRecording}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                title="Delete voice note"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

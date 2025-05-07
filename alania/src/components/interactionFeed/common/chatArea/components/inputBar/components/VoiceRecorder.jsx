import React, { useState, useRef, useEffect } from "react";
import { MicrophoneIcon, PauseIcon, PlayIcon, SpeakerWaveIcon, XMarkIcon } from "@heroicons/react/24/outline";

function VoiceRecorder({ onVoiceRecord, onVoiceRemove }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const MAX_DURATION = 600; // 10 minutes in seconds
  const [pcmData, setPcmData] = useState(null);

  // Initialiser l'analyseur audio pour l'enregistrement
  const setupAudioAnalyser = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
  };

  // Démarrer l'enregistrement
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      setupAudioAnalyser(stream);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const id = Date.now();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const fileReader = new FileReader();
        fileReader.onload = () => {
          audioContext.decodeAudioData(fileReader.result, (audioBuffer) => {
            const pcm = audioBuffer.getChannelData(0);
            setPcmData(pcm);
            setRecordedBlob({ blob, url, id });
            onVoiceRecord({
              id,
              blob,
              url,
              type: "audio/webm",
              name: `recording-${Date.now()}.webm`,
              size: blob.size,
            });
            // ...
          }, (error) => {
            console.error('Erreur de décodage des données audio', error);
          });
        };
        fileReader.readAsArrayBuffer(blob);
        // ...
      };

      mediaRecorder.start();
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setDuration(0);
      updateWaveform(); // Start waveform animation

      // Mettre à jour la durée chaque seconde
      intervalRef.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= MAX_DURATION) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
    } catch (err) {
      setError("Impossible d'accéder au microphone. Vérifiez les permissions.");
      setIsRecording(false);
    }
  };

  // Arrêter l'enregistrement
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
    cancelAnimationFrame(animationFrameRef.current);
    drawFlatLine();
    // if (recordedBlob) {
    //   onVoiceRecord({
    //     blob: recordedBlob.blob,
    //     url: recordedBlob.url,
    //     type: "audio/webm",
    //     name: `recording-${Date.now()}.webm`,
    //     size: recordedBlob.blob.size,
    //   });
    // }
  };

  // Mettre en pause l'enregistrement
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(intervalRef.current);
      cancelAnimationFrame(animationFrameRef.current);
      drawFlatLine();
    }
  };

  // Reprendre l'enregistrement
  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= MAX_DURATION) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
      updateWaveform();
    }
  };

  // Gérer la lecture/pause de l'audio
  const togglePlayPause = () => {
    if (!recordedBlob || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animationFrameRef.current);
      drawFlatLine();
    } else {
      audioRef.current.src = recordedBlob.url;
      audioRef.current.play();
      setIsPlaying(true);
      updateWaveform();
    }
  };

  // Dessiner une ligne plate
  const drawFlatLine = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  const drawStaticWaveform = () => {
    if (!pcmData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const data = pcmData;
  
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#d1d5db"; // Gris clair pour les ondes figées
    const barCount = 50;
    const barWidth = width / barCount - 2;
  
    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + 2);
      const index = Math.floor((i * data.length) / barCount);
      const value = data[index] * 2; // Ajuster l'amplitude
      const barHeight = Math.abs(value) * (height * 0.8);
      ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
    }
  };

  const drawPlaybackWaveform = () => {
    if (!pcmData || !canvasRef.current || !audioRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const data = pcmData;
    const progress = audioRef.current.currentTime / audioRef.current.duration;
    const barCount = 50;
    const barWidth = width / barCount - 2;
    const playedBars = Math.floor(barCount * progress);
  
    ctx.clearRect(0, 0, width, height);
  
    // Dessiner toutes les barres
    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + 2);
      const index = Math.floor((i * data.length) / barCount);
      const value = data[index] * 2;
      const barHeight = Math.abs(value) * (height * 0.8);
      ctx.fillStyle = i <= playedBars ? "#000000" : "#d1d5db"; // Noir pour la partie jouée, gris sinon
      ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
    }
  
    // Dessiner le petit rond noir
    const cursorX = progress * width;
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(cursorX, height / 2, 5, 0, 2 * Math.PI); // Rond de rayon 5
    ctx.fill();
  };
  // Mettre à jour la barre de progression (waveform)
  const updateWaveform = () => {
    if (!canvasRef.current || !audioRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barCount = 50;
    const barWidth = width / barCount - 2;

    if (isRecording && !isPaused && analyserRef.current) {
      // Pendant l'enregistrement
      const dataArray = new Uint8Array(analyserRef.current.fftSize);
      analyserRef.current.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "#ef4444";
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        const index = Math.floor((i * dataArray.length) / barCount);
        const value = dataArray[index] / 128.0; // Normaliser entre 0 et 2
        const barHeight = (value - 1) * (height * 0.8); // Ajuster l'amplitude
        ctx.fillRect(x, (height - Math.abs(barHeight)) / 2, barWidth, Math.abs(barHeight));
      }
    } else if (isPlaying && audioRef.current) {
      // Pendant la lecture
      const progress = audioRef.current.currentTime / audioRef.current.duration;
      const playedBars = Math.floor(barCount * progress);

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        const barHeight = Math.random() * height * 0.6 + height * 0.2;
        ctx.fillStyle = i <= playedBars ? "#3b82f6" : "#d1d5db";
        ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
      }

      setCurrentTime(audioRef.current.currentTime);
    } else if (recordedBlob) {
      // dessiner une forme d'onde statique
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        const barHeight = Math.random() * height * 0.6 + height * 0.2;
        ctx.fillStyle = "#d1d5db";
        ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
      }
    } else {
      drawFlatLine();
      // return;
    }

    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  };

  // Réinitialiser (fermer la pop-up)
  const resetRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    if (recordedBlob) {
      URL.revokeObjectURL(recordedBlob.url);
      onVoiceRemove(recordedBlob.id);
      setRecordedBlob(null);
    }
    setIsRecording(false);
    setIsPaused(false);
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
    clearInterval(intervalRef.current);
    cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      console.log(audioContextRef.current);
      audioContextRef.current.close().then(() => {
        audioContextRef.current = null;
      }).catch((err) => {
        console.error("Erreur lors de la fermeture du AudioContext :", err);
      });
    }
    
  };

  // Formater la durée (en secondes) en mm:ss
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Gérer la fin de la lecture
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    cancelAnimationFrame(animationFrameRef.current);
    drawFlatLine();
  };

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordedBlob) {
        URL.revokeObjectURL(recordedBlob.url);
      }
      clearInterval(intervalRef.current);
      cancelAnimationFrame(animationFrameRef.current);

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }

    };
  }, [recordedBlob]);

  // Gérer le clic sur le bouton principal
  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleRecordClick}
        className={`text-gray-600 hover:bg-gray-200 rounded-full p-2 flex items-center ${isRecording ? 'pulse' : ''}`}
        aria-label={isRecording ? "Arrêter l'enregistrement vocal" : "Commencer l'enregistrement vocal"}
      >
        <MicrophoneIcon className="h-6 w-6" />
        {isRecording && <span className="ml-1 text-red-500 text-xs"></span>}
      </button>
      {(isRecording || recordedBlob) && (
        <div className="absolute bottom-full right-0 w-80 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-lg z-30 transform -translate-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {isRecording
                ? `Enregistrement : ${formatDuration(duration)}`
                : isPlaying
                ? `Lecture : ${formatDuration(currentTime)} / ${formatDuration(duration)}`
                : `Enregistré : ${formatDuration(duration)}`}
            </span>
            <button
              onClick={resetRecording}
              className="p-1 bg-white rounded-full text-gray-500 hover:text-gray-700"
              aria-label="Fermer la fenêtre d'enregistrement"
            >
              o
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          {/* Playback Controls */}
          <div className="flex items-center mb-4">
            <button
              onClick={togglePlayPause}
              disabled={!recordedBlob}
              className={`p-2 rounded-full mr-2 ${
                !recordedBlob
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-teal-600 text-white hover:bg-teal-700"
              }`}
              aria-label={isPlaying ? "Mettre la lecture en pause" : "Lire l'enregistrement"}
            >
              {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            </button>
            <canvas
              ref={canvasRef}
              className="w-full h-10 rounded"
              width="200"
              height="40"
            />
            {recordedBlob && (
              <div className="w-full h-1 bg-gray-200 mt-2">
                <div
                  className="h-full bg-teal-600"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
          {/* Recording Controls */}
          {isRecording && (
            <div className="flex gap-2">
              <button
                onClick={isPaused ? resumeRecording : pauseRecording}
                disabled={!isRecording}
                className={`p-2 rounded-full ${
                  !isRecording
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                }`}
                aria-label={isPaused ? "Reprendre l'enregistrement" : "Mettre l'enregistrement en pause"}
              >
                {isPaused ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
              </button>
              <button
                onClick={stopRecording}
                disabled={!isRecording}
                className={`p-2 rounded-full ${
                  !isRecording
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                }`}
                aria-label="Arrêter l'enregistrement"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
          <audio ref={audioRef} className="hidden" onEnded={handleAudioEnded} />
        </div>
      )}
      {error && (
        <p className="absolute top-full left-0 mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default VoiceRecorder;
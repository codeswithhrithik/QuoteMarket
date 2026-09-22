/**
 * ============================================================================
 * Digital Signature Pad Component
 * ============================================================================
 * Supports drawing on interactive canvas, typing in stylized handwriting,
 * uploading a PNG signature, or utilizing default owner signature.
 */

import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Type, Upload, RotateCcw, Check, UserCheck } from 'lucide-react';

export default function SignaturePad({
  signatureType = 'draw',
  signatureData = '',
  signerName = '',
  signerTitle = 'Authorized Signatory',
  ownerDefaultSignature = '',
  onChange
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState(signatureType || 'draw');
  const [typedName, setTypedName] = useState(signatureData && signatureType === 'type' ? signatureData : signerName || '');

  // Initialize canvas
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0f172a';

      // Load existing drawn signature if it's a dataURL
      if (signatureData && signatureData.startsWith('data:image')) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = signatureData;
      }
    }
  }, [mode]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange({ signatureType: 'draw', signatureData: dataUrl });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onChange({ signatureType: 'draw', signatureData: '' });
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'owner_default') {
      onChange({ signatureType: 'owner_default', signatureData: ownerDefaultSignature });
    } else if (newMode === 'type') {
      onChange({ signatureType: 'type', signatureData: typedName });
    }
  };

  const handleTypedChange = (val) => {
    setTypedName(val);
    onChange({ signatureType: 'type', signatureData: val });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange({ signatureType: 'upload', signatureData: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Authorized Signature</h3>
            <p className="text-xs text-slate-500">Sign digitally to validate this quotation</p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleModeChange('draw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              mode === 'draw' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Draw
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('type')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              mode === 'type' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Type
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              mode === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
          {ownerDefaultSignature && (
            <button
              type="button"
              onClick={() => handleModeChange('owner_default')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                mode === 'owner_default' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Saved
            </button>
          )}
        </div>
      </div>

      {/* Signature Content Area */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
        {mode === 'draw' && (
          <div className="space-y-2">
            <div className="relative bg-white rounded-lg border border-slate-300 overflow-hidden shadow-inner">
              <canvas
                ref={canvasRef}
                width={400}
                height={120}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-28 touch-none cursor-crosshair block"
              />
              <span className="absolute bottom-2 right-2 text-[10px] text-slate-400 select-none">
                Draw above line
              </span>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearCanvas}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>
        )}

        {mode === 'type' && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Type your full legal name"
              value={typedName}
              onChange={(e) => handleTypedChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {typedName && (
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                <p className="font-serif italic text-2xl text-blue-900 tracking-wide font-normal">
                  {typedName}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Digital Signature Preview</p>
              </div>
            )}
          </div>
        )}

        {mode === 'upload' && (
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {signatureData && signatureData.startsWith('data:image') && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-center">
                <img src={signatureData} alt="Uploaded signature" className="max-h-20 object-contain" />
              </div>
            )}
          </div>
        )}

        {mode === 'owner_default' && (
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center">
            {ownerDefaultSignature ? (
              <img src={ownerDefaultSignature} alt="Default signature" className="max-h-20 object-contain" />
            ) : (
              <p className="text-xs text-slate-500">No default company signature configured in Settings.</p>
            )}
          </div>
        )}
      </div>

      {/* Signer Name & Title info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Signer Name
          </label>
          <input
            type="text"
            placeholder="e.g. Johnathan Smith"
            value={signerName}
            onChange={(e) => onChange({ signerName: e.target.value })}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Designation / Title
          </label>
          <input
            type="text"
            placeholder="e.g. Authorized Signatory / Managing Director"
            value={signerTitle}
            onChange={(e) => onChange({ signerTitle: e.target.value })}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

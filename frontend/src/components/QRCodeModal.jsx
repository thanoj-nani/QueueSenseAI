import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Check, X, ExternalLink, Printer } from 'lucide-react';

const QRCodeModal = ({ isOpen, onClose, token }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !token) return null;

  const trackingUrl = `${window.location.origin}/track/${token.token_number || token.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-sm w-full shadow-2xl p-6 text-slate-100 relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
            <QrCode className="w-6 h-6 text-white" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Mobile Queue Pass</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Scan with your smartphone camera to track live token updates on the go.
            </p>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-2xl inline-block shadow-inner border border-slate-200">
            <QRCodeSVG
              value={trackingUrl}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Token Summary Card */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Token ID:</span>
              <span className="font-bold text-cyan-400 font-mono">{token.token_number}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Visitor:</span>
              <span className="font-medium text-slate-200">{token.user_name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Category:</span>
              <span className="font-medium text-slate-200">{token.service_category}</span>
            </div>
          </div>

          {/* Copy Link & Print Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCopy}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              {copied ? 'Link Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={handlePrint}
              className="py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default QRCodeModal;

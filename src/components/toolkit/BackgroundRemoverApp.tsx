import React, { useState, useRef } from 'react';
import { Upload, Download, Settings, Image as ImageIcon, CheckCircle2, ArrowRight, Wand2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { removeBackground } from '@imgly/background-removal';

export function BackgroundRemoverApp() {
  const [step, setStep] = useState<1 | 2>(1);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [bgColor, setBgColor] = useState('transparent');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFile = async (file: File) => {
    setOriginalFile(file);
    const src = URL.createObjectURL(file);
    setOriginalUrl(src);
    setStep(2);
    processImage(src);
  };

  const processImage = async (src: string) => {
    setProcessing(true);
    setResultUrl('');
    try {
      // Execute imgly local WASM removal using CDN for assets to bypass hosting limits
      const blob = await removeBackground(src, {
        publicPath: 'https://static.imgly.com/background-removal/1.7.0/',
      });
      setResultUrl(URL.createObjectURL(blob));
    } catch (e) {
      alert("Failed to remove background. Please try another image.");
      setStep(1);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
     if (!resultUrl) return;
     
     if (bgColor === 'transparent') {
        const a = document.createElement('a');
        a.href = resultUrl;
        a.download = 'bg-removed.png';
        a.click();
        return;
     }

     // If solid color, compose onto canvas
     const canvas = document.createElement('canvas');
     const ctx = canvas.getContext('2d');
     const img = new Image();
     img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
           ctx.fillStyle = bgColor;
           ctx.fillRect(0, 0, canvas.width, canvas.height);
           ctx.drawImage(img, 0, 0);
           const url = canvas.toDataURL('image/png');
           const a = document.createElement('a');
           a.href = url;
           a.download = 'bg-replaced.png';
           a.click();
        }
     };
     img.src = resultUrl;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-[600px]">
      
      {step === 1 && (
        <div className="max-w-3xl mx-auto mt-12 bg-white/5 backdrop-blur-xl rounded-3xl p-12 text-center border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-colors shadow-sm cursor-pointer relative overflow-hidden group"
             onClick={() => fileInputRef.current?.click()}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity"></div>
          <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" ref={fileInputRef} onChange={e => {
            if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
          }} />
          <div className="relative z-10 w-20 h-20 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
             <Wand2 className="w-10 h-10" />
          </div>
          <h2 className="relative z-10 text-3xl font-extrabold text-white mb-2">Upload an image</h2>
          <p className="relative z-10 text-slate-400 mb-8 max-w-sm mx-auto">JPG, PNG or WebP up to 20MB. Fully processed in your browser.</p>
          
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-slate-500">
             <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Processed securely</div>
             <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Free — no login</div>
             <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Full resolution download</div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col lg:flex-row gap-8">
           
           {/* Editor Viewport */}
           <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px]">
                 
                 {/* Original */}
                 <div className="bg-white/5 backdrop-blur-md border text-center border-white/10 rounded-2xl p-4 flex flex-col h-full shadow-lg">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Original Image</span>
                    <div className="flex-1 bg-[#080810]/50 rounded-xl overflow-hidden flex items-center justify-center relative">
                       <img src={originalUrl} className="max-w-full max-h-full object-contain" />
                    </div>
                 </div>

                 {/* Result */}
                 <div className="bg-white/5 backdrop-blur-md border text-center border-white/10 rounded-2xl p-4 flex flex-col h-full shadow-lg relative">
                    <div className="absolute inset-0 bg-blue-500/5 blur-xl pointer-events-none"></div>
                    <span className="relative z-10 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center justify-center gap-2">
                      Result 
                      {processing && <span className="text-blue-400 lowercase tracking-normal flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400 animate-ping shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div> processing</span>}
                    </span>
                    <div 
                      className="relative z-10 flex-1 rounded-xl overflow-hidden flex items-center justify-center transition-colors duration-500 border border-white/10"
                      style={{ 
                        backgroundColor: bgColor === 'transparent' ? '#080810' : bgColor,
                        backgroundImage: bgColor === 'transparent' ? 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMmMzZTRmIi8+PHJlY3QgeD0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzE2MWMyNCIvPjxyZWN0IHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMxNjFjMjQiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzJjM2U0ZiIvPjwvc3ZnPg==")' : undefined
                      }}
                    >
                       {processing ? (
                          <div className="absolute inset-0 bg-blue-500/10 animate-pulse flex items-center justify-center backdrop-blur-sm">
                            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-blue-300 px-4 py-2 rounded-full font-bold shadow-xl animate-bounce">Analyzing semantics...</span>
                          </div>
                       ) : (
                          <img src={resultUrl} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                       )}
                    </div>
                 </div>

              </div>
           </div>

           {/* Settings Sidebar */}
           <div className="w-full lg:w-[320px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg h-fit space-y-8">
              
              <div>
                 <h3 className="font-bold text-white mb-4">Background Settings</h3>
                 <div className="grid grid-cols-4 gap-2 mb-4">
                    <button onClick={() => setBgColor('transparent')} className={`h-12 rounded-lg border-2 ${bgColor === 'transparent' ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'border-white/20 hover:border-white/50'}`} style={{ backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMmMzZTRmIi8+PHJlY3QgeD0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzE2MWMyNCIvPjxyZWN0IHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMxNjFjMjQiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzJjM2U0ZiIvPjwvc3ZnPg==")' }} title="Transparent"></button>
                    <button onClick={() => setBgColor('#FFFFFF')} className={`h-12 rounded-lg border-2 bg-white ${bgColor === '#FFFFFF' ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'border-white/20'}`} title="White"></button>
                    <button onClick={() => setBgColor('#000000')} className={`h-12 rounded-lg border-2 bg-black ${bgColor === '#000000' ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'border-white/20'}`} title="Black"></button>
                    <div className="relative h-12 rounded-lg border-2 border-white/20 overflow-hidden hover:border-white/50" title="Custom Color">
                       <input type="color" value={bgColor === 'transparent' ? '#ffffff' : bgColor} onChange={e => setBgColor(e.target.value)} className="absolute inset-[-10px] w-20 h-20 cursor-pointer" />
                    </div>
                 </div>
              </div>

              <div>
                 <Button onClick={downloadResult} disabled={processing || !resultUrl} className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.3)] border-none">
                    <Download className="w-5 h-5 mr-2" /> Download Image
                 </Button>
                 <p className="text-center text-xs text-slate-400 mt-3">Full resolution. No watermarks.</p>
              </div>

              <div className="pt-6 border-t border-white/10">
                 <Button variant="outline" onClick={() => setStep(1)} className="w-full bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
                    Upload another image
                 </Button>
              </div>

           </div>
        </div>
      )}
    </div>
  );
}

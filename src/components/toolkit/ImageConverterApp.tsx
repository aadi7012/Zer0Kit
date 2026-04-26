import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, ArrowRight, Download, Images, Settings, CheckCircle2, AlertCircle, FileArchive } from 'lucide-react';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import JSZip from 'jszip';

type ImageFile = {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'converting' | 'success' | 'error';
  resultBlob?: Blob;
  resultUrl?: string;
  originalSize: number;
  newSize?: number;
};

const FORMATS = [
  { id: 'image/webp', label: 'WebP', desc: 'Web images, animation, small size' },
  { id: 'image/jpeg', label: 'JPG', desc: 'Photos, universal support' },
  { id: 'image/png', label: 'PNG', desc: 'Logos, transparency, lossless' },
];

export function ImageConverterApp() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [targetFormat, setTargetFormat] = useState('image/webp');
  const [quality, setQuality] = useState(85);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newImgs = Array.from(files).map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      preview: URL.createObjectURL(f),
      status: 'pending' as const,
      originalSize: f.size
    }));
    setImages(prev => [...prev, ...newImgs].slice(0, 50));
    if (step === 1) setStep(2);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const next = prev.filter(i => i.id !== id);
      if (next.length === 0) setStep(1);
      return next;
    });
  };

  const convertBatch = async () => {
    setStep(3);
    
    for (let i = 0; i < images.length; i++) {
      const imgConfig = images[i];
      setImages(prev => prev.map(p => p.id === imgConfig.id ? { ...p, status: 'converting' } : p));
      
      try {
        const resultBlob = await convertImage(imgConfig.preview, targetFormat, quality / 100);
        setImages(prev => prev.map(p => p.id === imgConfig.id ? {
          ...p,
          status: 'success',
          resultBlob,
          resultUrl: URL.createObjectURL(resultBlob),
          newSize: resultBlob.size
        } : p));
      } catch (err) {
        setImages(prev => prev.map(p => p.id === imgConfig.id ? { ...p, status: 'error' } : p));
      }
    }
  };

  const convertImage = (src: string, format: string, q: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No ctx');
        
        // Fill white background for JPEGs to prevent black alpha channels
        if (format === 'image/jpeg') {
           ctx.fillStyle = '#FFFFFF';
           ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject('Blob failed');
        }, format, q);
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    const successes = images.filter(i => i.status === 'success' && i.resultBlob);
    
    successes.forEach(img => {
       const ext = targetFormat.split('/')[1] === 'jpeg' ? 'jpg' : targetFormat.split('/')[1];
       const oldName = img.file.name.split('.').slice(0, -1).join('.');
       const newName = `${oldName}-converted.${ext}`;
       zip.file(newName, img.resultBlob!);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-batch-${Date.now()}.zip`;
    a.click();
  };

  const formatSize = (bytes: number) => (bytes / 1024).toFixed(1) + ' KB';

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-[600px] bg-transparent">
      
      {step === 1 && (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 text-center border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-colors cursor-pointer relative overflow-hidden group"
             onClick={() => fileInputRef.current?.click()}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity"></div>
          <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={e => handleFiles(e.target.files)} />
          <Images className="w-16 h-16 text-blue-400 mx-auto mb-6 relative z-10 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
          <h2 className="text-3xl font-extrabold text-white mb-2 relative z-10">Drop images here</h2>
          <p className="text-slate-400 mb-8 relative z-10">or click to browse — JPG, PNG, WebP up to 25MB each (Max 50 files)</p>
          <div className="flex justify-center gap-2 relative z-10">
            {['JPG', 'PNG', 'WebP'].map(f => (
              <span key={f} className="px-3 py-1 bg-white/5 text-slate-300 text-xs font-bold rounded-md border border-white/10">{f}</span>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-lg">
             <div className="flex items-center justify-between mb-4 px-2">
               <h3 className="font-bold text-white">{images.length} images selected</h3>
               <button onClick={() => fileInputRef.current?.click()} className="text-sm font-bold text-blue-400 hover:text-blue-300">+ Add more</button>
               <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={e => handleFiles(e.target.files)} />
             </div>
             <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
               {images.map(img => (
                 <div key={img.id} className="flex items-center justify-between p-2 rounded-xl border border-white/5 hover:border-white/20 hover:bg-[#0c0c16]/50 transition-colors">
                   <div className="flex items-center gap-3">
                     <img src={img.preview} alt="" className="w-10 h-10 object-cover rounded-lg border border-white/10" />
                     <div className="overflow-hidden">
                       <p className="text-sm font-semibold text-slate-200 truncate max-w-[150px]">{img.file.name}</p>
                       <p className="text-xs text-slate-500">{formatSize(img.originalSize)}</p>
                     </div>
                   </div>
                   <button onClick={() => removeImage(img.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-md transition-colors">
                     <X className="w-4 h-4"/>
                   </button>
                 </div>
               ))}
             </div>
          </div>

          {/* Settings */}
          <div className="lg:col-span-7 space-y-6">
             <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-lg">
               <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Settings className="w-5 h-5"/> Output Format</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FORMATS.map(f => (
                    <button 
                      key={f.id} 
                      onClick={() => setTargetFormat(f.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${targetFormat === f.id ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/10 hover:border-white/30 bg-[#080810]/30'}`}
                    >
                      <div className={`font-black text-lg mb-1 ${targetFormat === f.id ? 'text-white' : 'text-slate-300'}`}>{f.label}</div>
                      <div className="text-xs text-slate-400 leading-tight">{f.desc}</div>
                    </button>
                  ))}
               </div>
               
               {(targetFormat === 'image/jpeg' || targetFormat === 'image/webp') && (
                 <div className="mt-8">
                   <div className="flex justify-between mb-2">
                     <Label className="text-slate-200">Quality: {quality}%</Label>
                     <span className="text-xs text-slate-400 font-medium">
                       {quality < 50 ? 'Low quality, smallest size' : quality < 85 ? 'Balanced (Recommended)' : 'High quality, larger size'}
                     </span>
                   </div>
                   <input type="range" min="10" max="100" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                 </div>
               )}
             </div>

             <Button onClick={convertBatch} className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white rounded-2xl border-none">
               Convert {images.length} Image{images.length > 1 ? 's' : ''}
             </Button>

             <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3 backdrop-blur-sm">
               <span className="text-blue-400 mt-0.5">💡</span>
               <p className="text-sm text-slate-300 font-medium leading-relaxed">
                 Pro tip: Everything happens securely in your browser. Images are never uploaded to any external server.
               </p>
             </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="relative z-10">
               <h2 className="text-2xl font-bold text-white">Conversion Complete</h2>
               <p className="text-slate-400 mt-1">{images.filter(i => i.status === 'success').length} of {images.length} images processed successfully.</p>
            </div>
            <div className="flex gap-3 relative z-10">
              <Button variant="outline" onClick={() => setStep(2)} className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white">Convert More</Button>
              <Button onClick={downloadZip} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)] border-none">
                 <FileArchive className="w-4 h-4 mr-2"/> Download ZIP
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {images.map(img => (
               <div key={img.id} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 flex items-center gap-4 hover:border-white/20 transition-colors">
                  <img src={img.resultUrl || img.preview} className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-200 truncate mb-1">{img.file.name}</p>
                    
                    {img.status === 'converting' && (
                       <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                          <div className="bg-blue-500 h-full w-1/2 animate-pulse rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                       </div>
                    )}
                    
                    {img.status === 'success' && img.newSize && (
                       <div className="flex items-center gap-3 text-xs">
                         <span className="text-slate-500 line-through">{formatSize(img.originalSize)}</span>
                         <ArrowRight className="w-3 h-3 text-slate-500" />
                         <span className="text-emerald-400 font-bold">{formatSize(img.newSize)}</span>
                         <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-bold ml-auto border border-emerald-500/20">
                           -{Math.round((1 - img.newSize / img.originalSize) * 100)}%
                         </span>
                       </div>
                    )}

                    {img.status === 'error' && (
                       <div className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3"/> Conversion failed</div>
                    )}
                  </div>
                  {img.status === 'success' && img.resultUrl && (
                     <a href={img.resultUrl} download={`${img.file.name.split('.')[0]}_converted.${targetFormat.split('/')[1] === 'jpeg' ? 'jpg' : targetFormat.split('/')[1]}`}>
                        <Button size="sm" variant="outline" className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"><Download className="w-4 h-4"/></Button>
                     </a>
                  )}
               </div>
             ))}
          </div>
        </div>
      )}

    </div>
  );
}

import { useState, useRef } from 'react';
import { Upload, Wand2, Layout } from 'lucide-react';
import Markdown from 'react-markdown';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || '');

export function UIForge() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generateCode = async () => {
    if (!image || !preview) return;
    setLoading(true);
    try {
      if (!process.env.GEMINI_API_KEY) throw new Error("API Key Missing.");
      
      const base64Data = preview.split(',')[1];
      const response = await ai.getGenerativeModel({
        model: 'gemini-2.0-flash',
      }).generateContent([
        `You are an expert Frontend Developer. Convert the provided UI screenshot into perfectly structured React code using Tailwind CSS for styling. Ensure all elements, spacing, typography, and colors approximate the image as closely as possible.
          
Output ONLY the raw markdown of the React component code inside a jsx codeblock. Focus purely on clean, production-ready code.`,
        {
          inlineData: {
            data: base64Data,
            mimeType: image.type
          }
        }
      ]);
      setOutput(response.response.text() || 'No response generated.');
    } catch (err: any) {
      setOutput(`**Error:** ${err.message || 'Failed to generate code.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-start">
      {/* Left: Input Panel */}
      <div className="space-y-6 flex flex-col h-full">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 bg-slate-900 hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all cursor-pointer rounded-2xl flex flex-col items-center justify-center p-12 text-center h-[300px]"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          {preview ? (
            <div className="relative w-full h-full flex items-center justify-center">
               <img src={preview} alt="Upload preview" className="max-w-full max-h-[250px] object-contain rounded drop-shadow-2xl" />
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-slate-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Upload UI Screenshot</h3>
              <p className="text-sm text-slate-400">PNG, JPG up to 10MB.</p>
            </>
          )}
        </div>

        <Button 
          size="lg" 
          onClick={generateCode} 
          disabled={loading || !image}
          className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 text-white font-bold text-lg h-14"
        >
          {loading ? (
             <span className="flex items-center gap-2 animate-pulse">
               <Wand2 className="w-5 h-5" /> Analyzing Pixels...
             </span>
          ) : (
             <span className="flex items-center gap-2">
               <Layout className="w-5 h-5" /> Generate React + Tailwind
             </span>
          )}
        </Button>
      </div>

      {/* Right: Output Panel */}
      <Card className="h-[600px] flex flex-col bg-slate-900/40 border border-slate-800/80 shadow-2xl relative overflow-hidden">
         {!output && !loading && (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')]">
              <Layout className="w-16 h-16 opacity-20 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Awaiting the Design</h3>
              <p className="max-w-xs text-sm leading-relaxed">Upload a screenshot. ForgeKit will visually process the components and write clean React code for it instantly.</p>
           </div>
         )}
         {loading && (
           <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900/80 backdrop-blur-sm z-10">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
              <h3 className="text-lg font-bold text-indigo-400">Forging Components...</h3>
              <p className="text-sm text-slate-400 mt-2">Writing Tailwind classes & mapping layouts.</p>
           </div>
         )}
         {output && (
           <CardContent className="p-0 h-full overflow-y-auto">
             <div className="p-8 prose prose-invert prose-indigo max-w-none prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-slate-800 prose-code:text-emerald-400">
               <Markdown>{output}</Markdown>
             </div>
           </CardContent>
         )}
      </Card>
    </div>
  );
}

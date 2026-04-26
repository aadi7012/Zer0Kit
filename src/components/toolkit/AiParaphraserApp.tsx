import React, { useState, useRef } from 'react';
import { Wand2, SpellCheck, Copy, Check, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const STYLES = [
  { id: 'standard', label: 'Standard', desc: 'Balanced rewrite, preserves tone' },
  { id: 'formal', label: 'Formal', desc: 'Professional language, removes contractions' },
  { id: 'casual', label: 'Casual', desc: 'Conversational, friendly, relaxed' },
  { id: 'fluent', label: 'Fluent', desc: 'Improves flow and readability' },
  { id: 'simple', label: 'Simple', desc: 'Shorter sentences, easier vocab' },
  { id: 'creative', label: 'Creative', desc: 'Expressive, varied structure' },
  { id: 'academic', label: 'Academic', desc: 'Scholarly tone, precise' },
];

export function AiParaphraserApp() {
  const [mode, setMode] = useState<'paraphrase' | 'grammar'>('paraphrase');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  
  // Paraphrase state
  const [style, setStyle] = useState('fluent');
  const [intensity, setIntensity] = useState('moderate');
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState(false);

  // Grammar state
  const [grammarIssues, setGrammarIssues] = useState<any[]>([]);
  const [grammarAnalyzing, setGrammarAnalyzing] = useState(false);
  const [showClean, setShowClean] = useState(false);
  const [activeHoverId, setActiveHoverId] = useState<number | null>(null);

  const handleCopy = (text: string) => {
     navigator.clipboard.writeText(text);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
  };

  const calculateStats = (text: string) => {
     const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
     const chars = text.length;
     const readTime = Math.max(1, Math.ceil(words / 200));
     return { words, chars, readTime };
  };

  const runParaphraser = async () => {
    if (!input.trim()) return;
    setStreaming(true);
    setOutput('');
    
    try {
      const prompt = `You are a professional editor. Rewrite the user's text in a ${style} style, with a ${intensity} level of change. Preserve the original meaning exactly. Return only the rewritten text, no preamble or quotes. Text to rewrite:\n\n${input}`;
      const responseStream = await ai.models.generateContentStream({ model: 'gemini-2.5-flash', contents: prompt });
      
      let fullText = '';
      for await (const chunk of responseStream) {
         fullText += chunk.text;
         setOutput(fullText);
      }
    } catch (e) {
      setOutput('An error occurred during rewriting. Please try again.');
    } finally {
      setStreaming(false);
    }
  };

  const runGrammar = async () => {
    if (!input.trim()) return;
    setGrammarAnalyzing(true);
    setGrammarIssues([]);
    setShowClean(false);
    
    try {
      const prompt = `You are an expert grammar system. Analyze the following text and find grammar, spelling, punctuation, and style issues.
      Return ONLY a RAW JSON ARRAY of objects. No markdown formatting, no comments.
      Each object must match this exact format:
      {"original_phrase": "exact string from text that is wrong", "type": "grammar" | "spelling" | "style" | "punctuation", "explanation": "Short explanation", "suggestion": "The fix"}
      
      Text to analyze:
      ${input}`;

      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      const txt = response.text || "[]";
      // safely extract json if it included markdown bounds
      const jsonMatch = txt.match(/\\[[\\s\\S]*\\]/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
      setGrammarIssues(parsed);
      
      // build initial clean state
      let cleanText = input;
      parsed.forEach((issue: any) => {
         cleanText = cleanText.replace(issue.original_phrase, issue.suggestion);
      });
      setOutput(cleanText); // Hold the clean version in output simultaneously
      
    } catch (e) {
      alert("Failed to analyze grammar. Try testing a shorter segment.");
    } finally {
      setGrammarAnalyzing(false);
    }
  };

  const renderAnnotatedText = () => {
     if (grammarIssues.length === 0) return <span>{input}</span>;
     
     let renderHtml = input;
     grammarIssues.forEach((issue, idx) => {
        // Warning: simplistic regex replace for prototype. In production, use AST/token mapping.
        const color = issue.type === 'grammar' ? 'text-red-600 underline decoration-red-400 decoration-wavy' :
                      issue.type === 'spelling' ? 'text-blue-600 underline decoration-blue-400 decoration-wavy' :
                      issue.type === 'punctuation' ? 'text-green-600 underline decoration-green-400 decoration-wavy' :
                      'text-yellow-600 underline decoration-yellow-400 decoration-wavy';
                      
        // Injecting an interactive span. React handles raw string -> dangerouslySetInnerHTML 
        const tag = `<span class="cursor-pointer font-bold ${color} relative group" data-idx="${idx}">${issue.original_phrase}</span>`;
        renderHtml = renderHtml.replace(issue.original_phrase, tag);
     });

     return (
        <div 
           className="relative leading-relaxed whitespace-pre-wrap font-sans text-slate-800"
           onMouseOver={(e: any) => {
               const idx = e.target.getAttribute('data-idx');
               if (idx !== null) setActiveHoverId(Number(idx));
           }}
           onMouseOut={() => setActiveHoverId(null)}
           dangerouslySetInnerHTML={{ __html: renderHtml }}
        />
     );
  };

  const inStats = calculateStats(input);
  const outStats = calculateStats(mode === 'paraphrase' ? output : (showClean ? output : input));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 flex flex-col min-h-[85vh]">
      
      {/* Mode Toggle */}
      <div className="flex justify-center z-10 relative">
         <div className="bg-white/5 border border-white/10 p-1.5 rounded-full flex max-w-md w-full shadow-inner backdrop-blur-md">
            <button onClick={() => setMode('paraphrase')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-full transition-all duration-300 ${mode === 'paraphrase' ? 'bg-white/10 shadow text-blue-400 ring-1 ring-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
               <Wand2 className="w-4 h-4"/> Paraphraser
            </button>
            <button onClick={() => setMode('grammar')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-full transition-all duration-300 ${mode === 'grammar' ? 'bg-white/10 shadow text-blue-400 ring-1 ring-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
               <SpellCheck className="w-4 h-4"/> Grammar Fixer
            </button>
         </div>
      </div>

      {mode === 'paraphrase' && (
         <div className="bg-white/5 rounded-2xl shadow-sm border border-white/10 p-4 relative z-10 backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#0c0c16]/50 p-2 rounded-xl mb-2">
               <div className="flex gap-2 w-full overflow-x-auto custom-scrollbar pb-1">
                  {STYLES.map(s => (
                     <button key={s.id} onClick={() => setStyle(s.id)} className={`px-4 py-2 text-sm font-bold rounded-lg border whitespace-nowrap transition-all duration-300 ${style === s.id ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-transparent text-slate-400 border-white/5 hover:bg-white/5 hover:text-slate-200'}`}>
                        {s.label}
                     </button>
                  ))}
               </div>
               <div className="flex items-center gap-2 shrink-0 px-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Intensity:</span>
                  <select value={intensity} onChange={e => setIntensity(e.target.value)} className="bg-transparent font-bold text-white focus:outline-none cursor-pointer">
                     <option value="minimal" className="bg-[#0c0c16] text-white">Minimal</option>
                     <option value="moderate" className="bg-[#0c0c16] text-white">Moderate</option>
                     <option value="aggressive" className="bg-[#0c0c16] text-white">Aggressive</option>
                  </select>
               </div>
            </div>
         </div>
      )}

      {/* Main Two-Panel Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 relative z-10">
         
         {/* Left Panel */}
         <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none opacity-50"></div>
            <div className="relative z-10 flex flex-col h-full">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#080810]/50">
               <h3 className="font-bold text-slate-200">Your text</h3>
               <button onClick={() => setInput('')} className="text-xs font-bold text-slate-400 hover:text-red-400 transition-colors">Clear</button>
            </div>
            <textarea 
               value={input} 
               onChange={e => setInput(e.target.value)} 
               placeholder="Paste or type your text here..." 
               className="flex-1 w-full p-6 resize-none focus:outline-none bg-transparent text-slate-100 leading-relaxed text-lg placeholder:text-slate-500" 
            />
            <div className="px-6 py-4 border-t border-white/10 bg-[#080810]/50 flex justify-between items-center text-xs font-bold text-slate-500">
               <span>{inStats.words} words <span className="mx-2">·</span> {inStats.chars} chars</span>
               <span>~{inStats.readTime} min read</span>
            </div>
            </div>
         </div>

         {/* Middle Action Button on Desktop */}
         <div className="hidden lg:flex flex-col items-center justify-center shrink-0 w-8 z-20">
            {mode === 'paraphrase' ? (
                <Button onClick={runParaphraser} disabled={streaming || !input.trim()} className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center translate-x-3 border border-blue-400/30">
                   <Wand2 className={`w-6 h-6 text-white ${streaming ? 'animate-spin' : ''}`} />
                </Button>
            ) : (
                <Button onClick={runGrammar} disabled={grammarAnalyzing || !input.trim()} className="h-16 w-16 rounded-full bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(5,150,105,0.4)] flex items-center justify-center translate-x-3 border border-emerald-400/30">
                   <SpellCheck className={`w-6 h-6 text-white ${grammarAnalyzing ? 'animate-pulse' : ''}`} />
                </Button>
            )}
         </div>

         {/* Mobile Action Button */}
         <div className="lg:hidden flex justify-center -my-2 z-20">
            {mode === 'paraphrase' ? (
                <Button onClick={runParaphraser} disabled={streaming || !input.trim()} className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30 font-bold">
                   <Wand2 className={`w-5 h-5 mr-2 ${streaming ? 'animate-spin' : ''}`} /> {streaming ? 'Rewriting...' : 'Paraphrase'}
                </Button>
            ) : (
               <Button onClick={runGrammar} disabled={grammarAnalyzing || !input.trim()} className="h-14 px-8 rounded-full bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(5,150,105,0.4)] border border-emerald-400/30 font-bold">
                   <SpellCheck className={`w-5 h-5 mr-2 ${grammarAnalyzing ? 'animate-pulse' : ''}`} /> {grammarAnalyzing ? 'Analyzing...' : 'Check Grammar'}
                </Button>
            )}
         </div>

         {/* Right Panel */}
         <div className="flex-1 flex flex-col bg-[#080810]/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none opacity-50"></div>
            <div className="relative z-10 flex flex-col h-full">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#0c0c16]/50">
               <h3 className="font-bold text-slate-200">{mode === 'paraphrase' ? 'Result' : (showClean ? 'Clean Version' : 'Annotated Text')}</h3>
               
               <div className="flex gap-2">
                  {mode === 'grammar' && grammarIssues.length > 0 && (
                     <button onClick={() => setShowClean(!showClean)} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                        {showClean ? 'Show Annotations' : 'Show Clean Version'}
                     </button>
                  )}
                  {mode === 'paraphrase' && output && (
                     <button onClick={() => { setInput(output); setOutput(''); }} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">Use as Input</button>
                  )}
               </div>
            </div>

            <div className="flex-1 p-6 relative overflow-y-auto">
               
               {mode === 'paraphrase' ? (
                  <div className="text-slate-100 leading-relaxed text-lg whitespace-pre-wrap">{output || <span className="text-slate-600 italic">Your rewritten text will appear here...</span>}</div>
               ) : (
                  <>
                     {grammarAnalyzing ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                           <SpellCheck className="w-12 h-12 animate-bounce" />
                           <p className="font-bold">Analyzing grammar patterns...</p>
                        </div>
                     ) : showClean ? (
                        <div className="text-slate-100 leading-relaxed text-lg whitespace-pre-wrap">{output}</div>
                     ) : (
                        renderAnnotatedText()
                     )}

                     {/* Custom Hover Card for Grammar Issues */}
                     {activeHoverId !== null && grammarIssues[activeHoverId] && (
                        <div className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 md:left-auto md:top-auto md:bottom-8 md:right-8 bg-slate-800 border border-white/10 text-white p-4 rounded-2xl shadow-2xl max-w-sm pointer-events-none backdrop-blur-xl">
                           <div className="flex gap-2 mb-2">
                              <span className="uppercase tracking-widest text-[10px] font-black bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">{grammarIssues[activeHoverId].type}</span>
                           </div>
                           <p className="font-bold mb-2 text-slate-300">Replace: <span className="line-through text-red-400">{grammarIssues[activeHoverId].original_phrase}</span></p>
                           <p className="font-bold mb-4 text-emerald-400">With: {grammarIssues[activeHoverId].suggestion}</p>
                           <p className="text-xs text-slate-400">{grammarIssues[activeHoverId].explanation}</p>
                        </div>
                     )}
                  </>
               )}
            </div>

            <div className="px-6 py-4 border-t border-white/10 bg-[#0c0c16]/50 flex justify-between items-center">
               <div className="text-xs font-bold text-slate-500">
                  <span>{outStats.words} words <span className="mx-2">·</span> {outStats.chars} chars</span>
               </div>
               <Button onClick={() => handleCopy(mode === 'paraphrase' ? output : (showClean ? output : input))} disabled={!output && mode === 'paraphrase'} variant="outline" size="sm" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
                  {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2" />} {copied ? 'Copied' : 'Copy'}
               </Button>
            </div>
            </div>
         </div>

      </div>

    </div>
  );
}

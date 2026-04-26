import { useState, useEffect } from 'react';
import { Bug, Sparkles, Code2, AlertTriangle, Play, Check, Clock, ChevronRight } from 'lucide-react';
import Markdown from 'react-markdown';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || '');

export function ErrorForge({ initialInput = '' }: { initialInput?: string }) {
  const [errorInput, setErrorInput] = useState(initialInput);
  const [codeContext, setCodeContext] = useState('');
  const [envFramework, setEnvFramework] = useState('');
  const [envVersion, setEnvVersion] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [history, setHistory] = useState<{err: string, full: string}[]>([]);

  // Generate automatically if initialInput was pasted from the homepage hero
  useEffect(() => {
    const saved = localStorage.getItem('forgekit_error_history');
    if (saved) {
       setHistory(JSON.parse(saved));
    }
    
    if (initialInput && !output && !loading) {
      analyzeError(initialInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToHistory = (errText: string) => {
     const shortErr = errText.trim().split('\n')[0].substring(0, 50) + '...';
     const newEntry = { err: shortErr, full: errText };
     const newHist = [newEntry, ...history.filter(h => h.err !== shortErr)].slice(0, 4);
     setHistory(newHist);
     localStorage.setItem('forgekit_error_history', JSON.stringify(newHist));
  };

  const loadHistoryItem = (fullErr: string) => {
     setErrorInput(fullErr);
     setOutput('');
  };

  const analyzeError = async (overrideErr?: string) => {
    const targetErr = overrideErr || errorInput;
    if (!targetErr) return;
    setErrorInput(targetErr);
    setLoading(true);
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("API Key Missing. Please set GEMINI_API_KEY.");
      }
      
      const prompt = `You are a Principal Software Architect & Debugging Expert.
Analyze the following error / stack trace. Provide environment-aware fixes if versions are given.

Environment Variables:
- Framework/Language: ${envFramework || 'Not specified'}
- Version/Node Env: ${envVersion || 'Not specified'}

Error / Stack Trace:
${targetErr}

Relevant Code Context:
${codeContext || 'Not provided'}

Return your analysis strictly in Markdown using the following exact structure:
### 1. Plain English Explanation
[Explain the error simply so a junior developer completely grasps it]
### 2. The Root Cause
[Identify exactly what triggered this issue at a technical level]
### 3. Real-World Context (Similar Issues)
[Explain where this usually happens in real projects. E.g., "Common in React 18 when fetching data before mount". Reference typical Stack Overflow patterns]
### 4. The Required Fix
[Provide actionable steps to resolve it]
### 5. Code Diff Implementation
[Show the BEFORE and AFTER code block using markdown \`\`\`diff syntax if relevant. Explicitly use - (red) for lines to remove and + (green) for lines to add.]`;

      const response = await ai.getGenerativeModel({
        model: 'gemini-2.0-flash',
      }).generateContent(prompt);
      setOutput(response.response.text() || 'No response generated.');
      saveToHistory(targetErr);
    } catch (err: any) {
      setOutput(`**Analysis Error:** ${err.message || 'Failed to generate fix.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-start">
      {/* Left: Input Panel */}
      <div className="space-y-6 flex flex-col h-full">
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label className="text-slate-400 text-xs font-bold uppercase tracking-widest">Environment (Optional)</Label>
             <Input 
               placeholder="React, Next.js, Python..." 
               value={envFramework}
               onChange={(e) => setEnvFramework(e.target.value)}
               className="bg-slate-900 border-slate-700" 
             />
           </div>
           <div className="space-y-2">
             <Label className="text-slate-400 text-xs font-bold uppercase tracking-widest">Version (Optional)</Label>
             <Input 
               placeholder="v18, Node 20..." 
               value={envVersion}
               onChange={(e) => setEnvVersion(e.target.value)}
               className="bg-slate-900 border-slate-700" 
             />
           </div>
        </div>

        <div className="space-y-2">
          <Label className="flex justify-between">
            <span className="text-white font-bold text-sm tracking-wide flex items-center gap-2">
              <Bug className="w-4 h-4 text-indigo-400" />
              Stack Trace / Console Error
            </span>
            <span className="text-red-400 text-xs">Required</span>
          </Label>
          <Textarea 
            placeholder="Paste your nasty error log here..."
             value={errorInput}
             onChange={(e) => setErrorInput(e.target.value)}
            className="min-h-[150px] font-mono text-xs leading-relaxed bg-slate-900 border-slate-700 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2 flex-grow">
          <Label className="flex justify-between">
            <span className="text-white font-bold text-sm tracking-wide flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              Relevant Code Context
            </span>
            <span className="text-slate-500 text-xs">Optional</span>
          </Label>
          <Textarea 
            placeholder="Paste the function or file where the error occurred to get a drop-in Diff fix..."
            value={codeContext}
            onChange={(e) => setCodeContext(e.target.value)}
            className="h-full min-h-[150px] font-mono text-xs leading-relaxed bg-slate-900 border-slate-700"
          />
        </div>

        <Button 
          size="lg" 
          onClick={() => analyzeError()} 
          disabled={loading || !errorInput}
          className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 text-white font-bold text-lg h-14"
        >
          {loading ? (
             <span className="flex items-center gap-2 animate-pulse">
               <Sparkles className="w-5 h-5" /> Analyzing Engine Active...
             </span>
          ) : (
            <span className="flex items-center gap-2">
               <Play className="w-5 h-5 fill-white" /> Fix It Now
            </span>
          )}
        </Button>

        {history.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
             <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4"/> Recent Errors</h4>
             <div className="grid grid-cols-1 gap-2">
               {history.map((h, idx) => (
                  <button key={idx} onClick={() => loadHistoryItem(h.full)} className="w-full text-left p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 transition-colors flex items-center justify-between group">
                    <span className="text-slate-400 text-xs font-mono truncate pr-4">{h.err}</span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
                  </button>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* Right: Output Panel */}
      <Card className="h-full min-h-[600px] flex flex-col bg-slate-900/40 border border-slate-800/80 shadow-2xl relative overflow-hidden">
         {!output && !loading && (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')]">
              <AlertTriangle className="w-16 h-16 opacity-20 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Awaiting the Spark</h3>
              <p className="max-w-xs text-sm leading-relaxed">Paste your error on the left and hit the fix button. The AI will tear it apart and rebuild it.</p>
           </div>
         )}
         {loading && (
           <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900/80 backdrop-blur-sm z-10">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
              <h3 className="text-lg font-bold text-indigo-400">Diagnosing Call Stack...</h3>
              <p className="text-sm text-slate-400 mt-2">Connecting to Senior Architect AI.</p>
           </div>
         )}
         {output && (
           <CardContent className="p-0 h-full overflow-y-auto">
             <div className="p-8 prose prose-invert prose-indigo max-w-none prose-headings:font-bold prose-h3:text-indigo-400 prose-h3:border-b prose-h3:border-slate-800 prose-h3:pb-2 prose-h3:mt-8 first:prose-h3:mt-0 prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-slate-800 prose-code:text-emerald-400 prose-a:text-indigo-400">
               <Markdown>{output}</Markdown>
             </div>
           </CardContent>
         )}
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { GitBranch, Sparkles, FolderTree, AlertTriangle, FileText, ArrowRight, Play, Clock, ChevronRight } from 'lucide-react';
import Markdown from 'react-markdown';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export function RepoForge({ initialInput = '' }: { initialInput?: string }) {
  const [repoUrl, setRepoUrl] = useState(initialInput);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [loadingStep, setLoadingStep] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('forgekit_repo_history');
    if (saved) {
       setHistory(JSON.parse(saved));
    }
    
    if (initialInput && !output && !loading) {
      if (initialInput.includes('github.com')) {
        analyzeRepo(initialInput);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToHistory = (url: string) => {
     const newHist = [url, ...history.filter(h => h !== url)].slice(0, 5);
     setHistory(newHist);
     localStorage.setItem('forgekit_repo_history', JSON.stringify(newHist));
  };

  const analyzeRepo = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl || repoUrl;
    if (!targetUrl) return;
    setRepoUrl(targetUrl);
    setLoading(true);
    setOutput('');
    
    try {
      if (!process.env.GEMINI_API_KEY) {
         throw new Error("API Key Missing. Set GEMINI_API_KEY.");
      }

      // 1. Parse GitHub URL
      const match = targetUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) throw new Error("Invalid GitHub Repository URL.");
      const owner = match[1];
      const repo = match[2].replace('.git', '');

      // 2. Fetch README
      setLoadingStep('Fetching README and Metadata...');
      let readme = '';
      try {
        const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`);
        if (readmeRes.ok) {
          const readmeData = await readmeRes.json();
          readme = atob(readmeData.content);
        }
      } catch (e) {
        console.warn("Could not fetch README", e);
      }

      // 3. Fetch Tree
      setLoadingStep('Mapping Repository Structure...');
      let treeStr = '';
      try {
        const defaultBranchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        let branch = 'main';
        if (defaultBranchRes.ok) {
           const repoData = await defaultBranchRes.json();
           branch = repoData.default_branch;
        }
        
        const actualTreeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
        if (actualTreeRes.ok) {
           const treeData = await actualTreeRes.json();
           const files = treeData.tree.filter((t: any) => t.type === 'blob').map((t: any) => t.path);
           treeStr = files.slice(0, 300).join('\n');
           if (files.length > 300) treeStr += `\n...and ${files.length - 300} more files.`;
        }
      } catch (e) {
        console.warn("Could not fetch tree", e);
      }

      if (!readme && !treeStr) {
         throw new Error("Could not access repository data. Ensure the URL is correct and public.");
      }

      // 4. Send to Gemini
      setLoadingStep('AI analyzing architecture...');
      const prompt = `You are a Principal Software Architect. I am giving you the README and File Tree of a GitHub repository (${owner}/${repo}).

Your job is to explain this entire repository to a developer who just joined the team, so they can start working immediately.

README Extract:
${readme.substring(0, 3000)}

File Tree Extract:
${treeStr}

Return your analysis strictly in Markdown using the following exact structure (DO NOT DEVIATE):
### 🗺️ High-Level Architecture
[Explain what this app does and the core tech stack]
### 🚦 Execution Path
[Step-by-step reading flow. E.g., Start here -> index.js. Then this calls -> service -> DB. Explain the lifecycle.]
### ⚙️ Quickstart & Environment
[Extracted install commands, env requirements, and how to run. Provide codeblocks]
### ⚠️ Risk Flags & Chaos Points
[Identify missing tests, messy structure, outdated patterns, or probable tech debt]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setOutput(response.text || 'No response generated.');
      saveToHistory(targetUrl);

    } catch (err: any) {
      setOutput(`**Analysis Error:** ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-start">
      {/* Left */}
      <div className="space-y-6 flex flex-col h-full">
         <div className="space-y-4">
           <Label className="text-white font-bold text-sm tracking-wide flex items-center gap-2">
             <GitBranch className="w-4 h-4 text-emerald-400" />
             Public GitHub URL
           </Label>
           <Input 
             placeholder="https://github.com/facebook/react"
             value={repoUrl}
             onChange={(e) => setRepoUrl(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && analyzeRepo()}
             className="h-14 font-mono text-sm bg-slate-900 border-slate-700 focus:border-emerald-500"
           />
           <div className="flex gap-2">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider pt-2">Examples:</span>
              <button onClick={() => analyzeRepo('https://github.com/vercel/next.js')} className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700">Next.js</button>
              <button onClick={() => analyzeRepo('https://github.com/vuejs/core')} className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700">Vue Core</button>
           </div>
         </div>

         <Button 
          size="lg" 
          onClick={() => analyzeRepo()} 
          disabled={loading || !repoUrl}
          className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 text-white font-bold text-lg h-14 mt-2"
        >
          {loading ? (
             <span className="flex items-center gap-2 animate-pulse">
               <Sparkles className="w-5 h-5" /> Sub-Space Querying...
             </span>
          ) : (
             <span className="flex items-center gap-2">
               <Play className="w-5 h-5 fill-white" /> Map Architecture
             </span>
          )}
        </Button>

        {history.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
             <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4"/> Session Memory</h4>
             <div className="space-y-2">
               {history.map((url, idx) => {
                  const shortName = url.replace('https://github.com/', '');
                  return (
                    <button key={idx} onClick={() => analyzeRepo(url)} className="w-full text-left p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition-colors flex items-center justify-between group">
                      <span className="text-slate-300 text-sm font-mono truncate">{shortName}</span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    </button>
                  );
               })}
             </div>
          </div>
        )}
      </div>

      {/* Right */}
      <Card className="h-full min-h-[600px] flex flex-col bg-slate-900/40 border border-slate-800/80 shadow-2xl relative overflow-hidden">
         {!output && !loading && (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')]">
              <FolderTree className="w-16 h-16 opacity-20 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Awaiting the Repository</h3>
              <p className="max-w-xs text-sm leading-relaxed">Paste a GitHub link. The AI will tear apart the structure and build a learning path instantly.</p>
           </div>
         )}
         {loading && (
           <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900/80 backdrop-blur-sm z-10">
              <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
              <h3 className="text-lg font-bold text-emerald-400">Mapping Architecture...</h3>
              <p className="text-sm text-slate-400 mt-2">{loadingStep}</p>
           </div>
         )}
         {output && (
           <CardContent className="p-0 h-full overflow-y-auto">
             <div className="p-8 prose prose-invert prose-emerald max-w-none prose-headings:font-bold prose-h3:text-emerald-400 prose-h3:border-b prose-h3:border-slate-800 prose-h3:pb-2 prose-h3:mt-8 first:prose-h3:mt-0 prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-slate-800 prose-code:text-indigo-300">
               <Markdown>{output}</Markdown>
             </div>
           </CardContent>
         )}
      </Card>
    </div>
  );
}

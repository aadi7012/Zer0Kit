import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Shield, Copy, RefreshCw, Check, AlertCircle, Settings2, Download, List } from 'lucide-react';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';

const EFF_WORDS = [
  "abacus", "abdomen", "ability", "abnormal", "absorb", "abstract", "academic", "academy", "accent", "accept",
  "access", "accident", "account", "acid", "acorn", "acoustic", "acquire", "action", "active", "actor",
  "actual", "adapt", "add", "address", "adjust", "admire", "admit", "adult", "advance", "advice",
  "aerobic", "affair", "afford", "afraid", "again", "age", "agent", "agree", "ahead", "aim",
  "air", "airport", "aisle", "alarm", "album", "alcohol", "alert", "alien", "alive", "alley",
  "allow", "almost", "alone", "alpha", "already", "also", "alter", "always", "amateur", "amazing",
  "among", "amount", "amused", "analyst", "anchor", "ancient", "anger", "angle", "angry", "animal",
  "ankle", "announce", "annual", "another", "answer", "antenna", "antique", "anxiety", "any", "apart",
  "apology", "appear", "apple", "approve", "april", "arch", "arctic", "area", "arena", "argue",
  "arm", "armed", "armor", "army", "around", "arrange", "arrest", "arrive", "arrow", "art",
  "baby", "bachelor", "back", "backup", "bacon", "badge", "baffle", "bag", "bait", "balance",
  "balcony", "ball", "bamboo", "banana", "banner", "bar", "barely", "bargain", "barrel", "base",
  "basic", "basket", "battle", "beach", "bean", "bear", "beat", "beautiful", "beauty", "become",
  "beef", "before", "begin", "behave", "behind", "believe", "below", "belt", "bench", "benefit",
  "best", "betray", "better", "between", "beyond", "bicycle", "bid", "bike", "bind", "biology",
  "bird", "birth", "bitter", "black", "blade", "blame", "blank", "blast", "blend", "bless",
  "blind", "blood", "blossom", "blouse", "blue", "blur", "board", "boat", "body", "boil"
  // Small sample to reduce file size, in production we'd use the full 7776 word EFF list
];

export function PasswordGeneratorApp() {
  const [mode, setMode] = useState<'password' | 'passphrase'>('password');
  
  // Password State
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  
  // Passphrase State
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(true);
  const [addNumber, setAddNumber] = useState(false);
  
  // Results
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [batchCount, setBatchCount] = useState(5);
  const [batchResults, setBatchResults] = useState<string[]>([]);
  
  const generateOne = (isPassphrase: boolean): string => {
    if (isPassphrase) {
       let words = [];
       const arr = new Uint32Array(wordCount);
       window.crypto.getRandomValues(arr);
       
       for (let i = 0; i < wordCount; i++) {
          let word = EFF_WORDS[arr[i] % EFF_WORDS.length];
          if (capitalize) word = word.charAt(0).toUpperCase() + word.slice(1);
          words.push(word);
       }
       
       let final = words.join(separator === 'space' ? ' ' : separator === 'none' ? '' : separator);
       if (addNumber) {
          const numArr = new Uint8Array(1);
          window.crypto.getRandomValues(numArr);
          final += `${separator === 'space' ? ' ' : separator === 'none' ? '' : separator}${numArr[0] % 100}`;
       }
       return final;
    } else {
       let chars = "";
       if (useLower) chars += "abcdefghijklmnopqrstuvwxyz";
       if (useUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
       if (useNumbers) chars += "0123456789";
       if (useSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
       
       if (excludeAmbiguous) {
          chars = chars.replace(/[Il1O0]/g, '');
       }
       
       if (!chars) return "Enable at least one character type";
       
       const arr = new Uint32Array(length);
       window.crypto.getRandomValues(arr);
       let pass = "";
       for (let i = 0; i < length; i++) {
          pass += chars[arr[i] % chars.length];
       }
       return pass;
    }
  };

  const regenerate = () => {
     setResult(generateOne(mode === 'passphrase'));
     setCopied(false);
     
     if (batchResults.length > 0) {
        const newBatch = Array.from({ length: batchCount }).map(() => generateOne(mode === 'passphrase'));
        setBatchResults(newBatch);
     }
  };

  useEffect(() => {
     regenerate();
  }, [mode, length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous, wordCount, separator, capitalize, addNumber]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculateEntropy = () => {
     if (mode === 'passphrase') {
        let pool = EFF_WORDS.length;
        let entropy = Math.log2(Math.pow(pool, wordCount));
        if (addNumber) entropy += Math.log2(100);
        return Math.round(entropy);
     } else {
        let pool = 0;
        if (useLower) pool += 26;
        if (useUpper) pool += 26;
        if (useNumbers) pool += 10;
        if (useSymbols) pool += 26;
        if (excludeAmbiguous) pool -= 5;
        if (pool === 0) return 0;
        return Math.round(Math.log2(Math.pow(pool, length)));
     }
  };

  const entropy = calculateEntropy();
  
  let strengthLabel = "Weak";
  let strengthColor = "bg-red-500 shadow-red-500/50";
  let strengthWidth = "20%";
  let crackTime = "Instantly";

  if (entropy > 40) { strengthLabel = "Fair"; strengthColor = "bg-orange-500 shadow-orange-500/50"; strengthWidth = "40%"; crackTime = "Hours to days"; }
  if (entropy > 60) { strengthLabel = "Good"; strengthColor = "bg-yellow-400 shadow-yellow-400/50"; strengthWidth = "60%"; crackTime = "Years"; }
  if (entropy > 80) { strengthLabel = "Strong"; strengthColor = "bg-emerald-500 shadow-emerald-500/50"; strengthWidth = "85%"; crackTime = "Millions of years"; }
  if (entropy > 100) { strengthLabel = "Very Strong"; strengthColor = "bg-cyan-500 shadow-cyan-500/50"; strengthWidth = "100%"; crackTime = "Billions of years"; }

  const handleBatchGenerate = () => {
    const newBatch = Array.from({ length: batchCount }).map(() => generateOne(mode === 'passphrase'));
    setBatchResults(newBatch);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Mode Switcher */}
      <div className="flex justify-center mb-8">
         <div className="bg-white/5 border border-white/10 p-1.5 rounded-full flex max-w-sm w-full backdrop-blur-md shadow-inner">
            <button onClick={() => setMode('password')} className={`flex-1 py-3 text-sm font-bold rounded-full transition-all duration-300 ${mode === 'password' ? 'bg-white/10 text-white shadow ring-1 ring-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Password</button>
            <button onClick={() => setMode('passphrase')} className={`flex-1 py-3 text-sm font-bold rounded-full transition-all duration-300 ${mode === 'passphrase' ? 'bg-white/10 text-white shadow ring-1 ring-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Passphrase</button>
         </div>
      </div>

      {/* Main Generator Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative group">
         <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none opacity-50"></div>
         <div className="p-8 md:p-12 text-center border-b border-white/10 relative z-10">
            <div className="relative inline-block w-full max-w-2xl mx-auto mt-4">
               <input 
                 type="text" 
                 readOnly 
                 value={result} 
                 onClick={(e) => (e.target as HTMLInputElement).select()}
                 className={`w-full text-center bg-[#0c0c16]/80 backdrop-blur-md border-2 rounded-2xl py-6 px-16 ${mode === 'password' ? 'font-mono tracking-widest text-2xl md:text-3xl' : 'text-xl md:text-2xl font-bold'} text-slate-100 shadow-inner focus:outline-none transition-all`} 
                 style={{ borderLeftColor: strengthColor.includes('cyan-500') ? '#06b6d4' : strengthColor.includes('emerald-500') ? '#10b981' : strengthColor.includes('yellow-400') ? '#fbbf24' : '#ef4444', borderColor: 'rgba(255,255,255,0.1)' }}
               />
               <button onClick={() => copyToClipboard(result)} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all">
                  {copied ? <Check className="w-6 h-6 text-emerald-400"/> : <Copy className="w-6 h-6"/>}
               </button>
               <button onClick={regenerate} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all active:rotate-180 duration-300">
                  <RefreshCw className="w-6 h-6"/>
               </button>
            </div>
            {copied && <p className="text-emerald-400 font-bold mt-4 animate-in fade-in slide-in-from-bottom-2 drop-shadow-md">Copied to clipboard!</p>}
         </div>

         {/* Strength Bar */}
         <div className="p-6 md:px-10 border-b border-white/5 bg-[#080810]/50 relative z-10">
            <div className="flex items-end justify-between mb-3">
               <div>
                  <h3 className={`font-black text-xl ${strengthLabel === 'Very Strong' ? 'text-cyan-400' : strengthLabel === 'Strong' ? 'text-emerald-400' : 'text-slate-200'}`}>{strengthLabel}</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Crack time: {crackTime}</p>
               </div>
               <div className="text-right">
                  <span className="text-2xl font-black text-white">~{entropy}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Bits of Entropy</span>
               </div>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
               <div className={`h-full ${strengthColor} transition-all duration-500 ease-out shadow-lg`} style={{ width: strengthWidth }}></div>
            </div>
            <details className="mt-5 text-sm text-slate-400 cursor-pointer group outline-none">
               <summary className="font-bold flex items-center gap-1 hover:text-cyan-400 list-none outline-none"><Settings2 className="w-4 h-4"/> Why is this strong? ▼</summary>
               <div className="pt-3 pl-5 space-y-2 text-xs bg-black/20 p-4 rounded-xl mt-2 border border-white/5">
                  <p>• <strong className="text-slate-300">Entropy</strong> measures true randomness. Anything over 80 bits is highly secure.</p>
                  <p>• Generated using <strong className="text-slate-300">crypto.getRandomValues()</strong> - cryptographically secure, fully offline.</p>
               </div>
            </details>
         </div>

         {/* Settings Array */}
         <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            
            {mode === 'password' ? (
              <>
                 <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2"><Label className="text-slate-300">Length</Label><span className="font-bold text-cyan-400 text-xl">{length}</span></div>
                      <input type="range" min="4" max="64" value={length} onChange={e => setLength(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                      <div className="flex gap-2 mt-4">
                         {[12, 16, 20, 32].map(l => (
                            <button key={l} onClick={() => setLength(l)} className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-md text-xs font-bold transition-colors border border-white/5">{l}</button>
                         ))}
                      </div>
                    </div>
                    <div>
                       <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={excludeAmbiguous} onChange={e => setExcludeAmbiguous(e.target.checked)} className="w-4 h-4 accent-cyan-500"/> <span className="text-sm font-semibold text-slate-300">Exclude confusing (0,O,l,1,I)</span></label>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                      <span className="font-bold text-slate-200">Uppercase (A-Z)</span>
                      <input type="checkbox" checked={useUpper} onChange={e => { if(!e.target.checked && !useLower && !useNumbers && !useSymbols) return; setUseUpper(e.target.checked) }} className="w-5 h-5 accent-cyan-500" />
                    </label>
                    <label className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                      <span className="font-bold text-slate-200">Lowercase (a-z)</span>
                      <input type="checkbox" checked={useLower} onChange={e => { if(!e.target.checked && !useUpper && !useNumbers && !useSymbols) return; setUseLower(e.target.checked) }} className="w-5 h-5 accent-cyan-500" />
                    </label>
                    <label className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                      <span className="font-bold text-slate-200">Numbers (0-9)</span>
                      <input type="checkbox" checked={useNumbers} onChange={e => { if(!e.target.checked && !useUpper && !useLower && !useSymbols) return; setUseNumbers(e.target.checked) }} className="w-5 h-5 accent-cyan-500" />
                    </label>
                    <label className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                      <span className="font-bold text-slate-200">Symbols (!@#$)</span>
                      <input type="checkbox" checked={useSymbols} onChange={e => { if(!e.target.checked && !useUpper && !useLower && !useNumbers) return; setUseSymbols(e.target.checked) }} className="w-5 h-5 accent-cyan-500" />
                    </label>
                 </div>
              </>
            ) : (
              <>
                 <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2"><Label className="text-slate-300">Word Count</Label><span className="font-bold text-cyan-400 text-xl">{wordCount}</span></div>
                      <input type="range" min="3" max="8" value={wordCount} onChange={e => setWordCount(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                    </div>
                    <div>
                       <Label className="mb-2 block text-slate-300">Separator</Label>
                       <div className="flex gap-2">
                          {[{id: '-', l: 'Hyphen'}, {id: '.', l: 'Dot'}, {id: '_', l: 'Under'}, {id: 'space', l: 'Space'}, {id: 'none', l: 'None'}].map(s => (
                             <button key={s.id} onClick={() => setSeparator(s.id)} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${separator === s.id ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                               {s.l}
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                      <span className="font-bold text-slate-200">Capitalize words</span>
                      <input type="checkbox" checked={capitalize} onChange={e => setCapitalize(e.target.checked)} className="w-5 h-5 accent-cyan-500" />
                    </label>
                    <label className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                      <span className="font-bold text-slate-200">Add random number</span>
                      <input type="checkbox" checked={addNumber} onChange={e => setAddNumber(e.target.checked)} className="w-5 h-5 accent-cyan-500" />
                    </label>
                 </div>
              </>
            )}

         </div>
      </div>

      {/* Batch Generator */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-lg relative overflow-hidden mt-8">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 relative z-10 gap-4">
            <div>
               <h3 className="text-xl font-bold text-white flex items-center gap-2"><List className="w-5 h-5 text-emerald-400"/> Batch Generate</h3>
               <p className="text-slate-400 text-sm mt-1">Need multiple? Generate up to 50 at once using current settings.</p>
            </div>
            <div className="flex gap-4 items-center">
               <input type="number" min="1" max="50" value={batchCount} onChange={e => setBatchCount(Number(e.target.value))} className="w-20 h-10 border border-white/10 bg-[#0c0c16] rounded-lg text-center font-bold text-white focus:border-emerald-500 focus:outline-none" />
               <Button onClick={handleBatchGenerate} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 shadow-lg shadow-emerald-600/20 border-none">Generate {batchCount}</Button>
            </div>
         </div>
         
         {batchResults.length > 0 && (
            <div className="space-y-2 mt-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
               {batchResults.map((p, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-[#080810]/80 rounded-xl font-mono text-sm border border-white/5 hover:border-emerald-500/50 hover:bg-[#0c0c16] transition-colors group">
                     <span className="truncate text-slate-200">{p}</span>
                     <button onClick={() => copyToClipboard(p)} className="px-3 py-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg text-xs font-bold uppercase flex gap-1 transition-colors">
                        Copy
                     </button>
                  </div>
               ))}
               <div className="flex justify-end mt-6 pt-6 border-t border-white/10">
                  <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => {
                     const all = batchResults.join('\n');
                     copyToClipboard(all);
                  }}><Copy className="w-4 h-4 mr-2"/> Copy All</Button>
               </div>
            </div>
         )}
      </div>

    </div>
  );
}

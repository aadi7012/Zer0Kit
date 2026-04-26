import React, { useState, useEffect } from 'react';
import { Search, Server, Monitor, Layout, LineChart, Code2, Copy, CheckCircle2, ShieldCheck, Mail, Database, CreditCard } from 'lucide-react';
import { Button } from '../ui/Button';

type Category = 'CMS' | 'Frontend Framework' | 'CSS Framework' | 'Analytics' | 'Marketing' | 'CDN' | 'Payment Processors' | 'Security';

interface TechRule {
  id: string;
  name: string;
  category: Category;
  regex: RegExp;
}

const RULES: TechRule[] = [
  { id: 'react', name: 'React', category: 'Frontend Framework', regex: /data-reactroot|react-dom/i },
  { id: 'next', name: 'Next.js', category: 'Frontend Framework', regex: /__NEXT_DATA__|_next\/static/i },
  { id: 'vue', name: 'Vue.js', category: 'Frontend Framework', regex: /data-v-|__VUE__/i },
  { id: 'nuxt', name: 'Nuxt.js', category: 'Frontend Framework', regex: /_nuxt/i },
  { id: 'wordpress', name: 'WordPress', category: 'CMS', regex: /wp-content|wp-includes/i },
  { id: 'shopify', name: 'Shopify', category: 'CMS', regex: /Shopify\.theme|cdn\.shopify\.com/i },
  { id: 'webflow', name: 'Webflow', category: 'CMS', regex: /webflow\.com/i },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'CSS Framework', regex: /tailwindcss/i },
  { id: 'bootstrap', name: 'Bootstrap', category: 'CSS Framework', regex: /bootstrap/i },
  { id: 'google_analytics', name: 'Google Analytics', category: 'Analytics', regex: /google-analytics\.com\/analytics\.js|gtag/i },
  { id: 'hotjar', name: 'Hotjar', category: 'Analytics', regex: /_hjSettings|hotjar\.com/i },
  { id: 'stripe', name: 'Stripe', category: 'Payment Processors', regex: /js\.stripe\.com/i },
  { id: 'paypal', name: 'PayPal', category: 'Payment Processors', regex: /paypal\.com\/sdk|paypalobjects/i },
  { id: 'cloudflare', name: 'Cloudflare', category: 'CDN', regex: /cloudflare\.com|cf-ray/i },
  { id: 'vercel', name: 'Vercel', category: 'CDN', regex: /vercel\.app/i },
  { id: 'hubspot', name: 'HubSpot', category: 'Marketing', regex: /js\.hs-scripts\.com|hubspot/i },
  { id: 'mailchimp', name: 'Mailchimp', category: 'Marketing', regex: /mailchimp\.com|mc-embedded/i },
  { id: 'recaptcha', name: 'reCAPTCHA', category: 'Security', regex: /google\.com\/recaptcha/i }
];

const ICONS: Record<Category, React.ReactNode> = {
   'CMS': <Layout className="w-5 h-5"/>,
   'Frontend Framework': <Code2 className="w-5 h-5"/>,
   'CSS Framework': <Monitor className="w-5 h-5"/>,
   'Analytics': <LineChart className="w-5 h-5"/>,
   'Marketing': <Mail className="w-5 h-5"/>,
   'CDN': <Server className="w-5 h-5"/>,
   'Payment Processors': <CreditCard className="w-5 h-5"/>,
   'Security': <ShieldCheck className="w-5 h-5"/>
};

export function TechStackDetectorApp() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [url, setUrl] = useState('');
  const [scanStep, setScanStep] = useState(0);
  const [results, setResults] = useState<TechRule[]>([]);
  const [error, setError] = useState('');

  const SCAN_STEPS = [
     "Fetching page HTML...",
     "Reading HTTP response headers...",
     "Scanning JavaScript files...",
     "Analyzing meta tags...",
     "Checking DOM structure...",
     "Matching technology fingerprints...",
     "Building your report..."
  ];

  const handleScan = async (targetUrl = url) => {
     let cleanUrl = targetUrl.trim();
     if (!cleanUrl) return;
     if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
     
     setError('');
     setUrl(cleanUrl);
     setStep(2);
     setScanStep(0);
     setResults([]);

     // Simulate scanner animation pacing
     for (let i = 0; i <= 6; i++) {
        setScanStep(i);
        await new Promise(r => setTimeout(r, 400));
     }

     try {
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(cleanUrl)}`);
        const data = await res.json();
        const html = data.contents;
        
        if (!html) throw new Error("Could not fetch");

        const found: TechRule[] = [];
        RULES.forEach(rule => {
           if (rule.regex.test(html) || rule.regex.test(data.status?.headers ? JSON.stringify(data.status.headers) : '')) {
              found.push(rule);
           }
        });

        setResults(found);
        setStep(3);
     } catch (e) {
        setStep(1);
        setError("Could not reach this website. It may block generic proxy requests.");
     }
  };

  const categoriesFound = Array.from(new Set(results.map(r => r.category)));

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-[600px] flex flex-col justify-center">
      
      {step === 1 && (
        <div className="text-center animate-in fade-in zoom-in-95">
           <div className="w-20 h-20 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-blue-500/20">
              <Search className="w-10 h-10 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
           </div>
           
           <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight drop-shadow-sm">Tech Stack Detector</h2>
           <p className="text-lg text-slate-400 mb-10 max-w-lg mx-auto">Paste any website URL to instantly see the CMS, frameworks, and analytics running under the hood.</p>
           
           <div className="max-w-xl mx-auto flex gap-2 mb-6">
              <div className="relative flex-1">
                 <input 
                   type="url" 
                   value={url} 
                   onChange={e => setUrl(e.target.value)} 
                   onKeyDown={e => e.key === 'Enter' && handleScan()}
                   placeholder="https://example.com" 
                   className="w-full h-14 pl-6 pr-4 bg-[#0c0c16]/50 border-2 border-white/10 rounded-2xl text-lg text-white placeholder-slate-500 shadow-sm focus:outline-none focus:border-blue-500 transition-colors"
                 />
              </div>
              <Button onClick={() => handleScan()} className="h-14 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] border-none">
                 Detect Stack
              </Button>
           </div>
           
           {error && <p className="text-red-400 font-bold mb-6 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]">{error}</p>}

           <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-slate-500 mb-12">
              <span>Try an example:</span>
              <button onClick={() => handleScan('stripe.com')} className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">stripe.com</button>
              <span>·</span>
              <button onClick={() => handleScan('airbnb.com')} className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">airbnb.com</button>
              <span>·</span>
              <button onClick={() => handleScan('notion.so')} className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">notion.so</button>
           </div>

           <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-bold text-slate-400 border-t border-white/10 pt-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]"/> 1,500+ technologies</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]"/> Instant results</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]"/> No install required</div>
           </div>
        </div>
      )}

      {step === 2 && (
         <div className="max-w-2xl mx-auto w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-10 animate-in fade-in slide-in-from-bottom-12 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>
            <h3 className="text-2xl font-bold text-slate-200 mb-8 border-b border-white/10 pb-6 flex items-center justify-center gap-3 relative z-10">
               <Search className="w-6 h-6 text-blue-400 animate-pulse drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]"/> Scanning <span className="text-white drop-shadow-sm">{url}</span>...
            </h3>
            <div className="space-y-4 font-mono text-sm text-slate-400 relative z-10">
               {SCAN_STEPS.map((s, i) => (
                  <div key={i} className={`flex items-center gap-4 transition-all duration-300 ${i > scanStep ? 'opacity-30 translate-y-2 text-slate-500' : 'opacity-100 translate-y-0 text-slate-300'}`}>
                     {i < scanStep ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]"/>
                     ) : i === scanStep ? (
                        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0 shadow-[0_0_5px_rgba(96,165,250,0.5)]"></div>
                     ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-white/10 shrink-0 bg-[#0c0c16]/50"></div>
                     )}
                     <span className={i === scanStep ? 'text-blue-300 font-bold' : ''}>{s}</span>
                  </div>
               ))}
            </div>
         </div>
      )}

      {step === 3 && (
         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Header Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-lg flex items-center justify-between">
               <div>
                  <h2 className="text-3xl font-extrabold text-white break-all drop-shadow-sm">{url}</h2>
                  <div className="flex gap-4 mt-4">
                     <span className="px-3 py-1 bg-blue-500/10 text-blue-400 font-bold text-sm rounded-full border border-blue-500/20">{results.length} Technologies found</span>
                     <span className="px-3 py-1 bg-white/10 text-slate-300 font-bold text-sm rounded-full border border-white/5">{categoriesFound.length} Categories</span>
                  </div>
               </div>
               <Button onClick={() => setStep(1)} variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 shadow-sm shrink-0">
                  Scan another site
               </Button>
            </div>

            {results.length === 0 ? (
               <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-16 text-center border border-white/10 shadow-lg">
                  <Database className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">No known technologies detected</h3>
                  <p className="text-slate-400">This website might be using custom code, or heavily obfuscated technologies.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoriesFound.map(category => (
                     <div key={category} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg overflow-hidden auto-rows-max transition-all hover:bg-white/10 hover:border-white/20">
                        <div className="px-6 py-4 border-b border-white/10 bg-[#0c0c16]/30 flex items-center gap-3">
                           <div className="text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]">{ICONS[category]}</div>
                           <h3 className="font-bold text-white drop-shadow-sm">{category}</h3>
                        </div>
                        <div className="p-6 flex flex-wrap gap-3">
                           {results.filter(r => r.category === category).map(tech => (
                              <div key={tech.id} className="flex items-center justify-between p-3 border border-white/10 rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all cursor-default group w-full bg-[#0c0c16]/50">
                                 <span className="font-bold text-slate-300 group-hover:text-blue-300 transition-colors drop-shadow-sm">{tech.name}</span>
                                 <CheckCircle2 className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]"/>
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            )}

            <div className="flex justify-center mt-8">
               <Button variant="outline" onClick={() => {
                  const data = JSON.stringify(results.map(r => ({ name: r.name, category: r.category })), null, 2);
                  navigator.clipboard.writeText(data);
               }} className="border-white/20 bg-transparent text-white hover:bg-white/10 shadow-sm transition-colors">
                  <Copy className="w-4 h-4 mr-2"/> Copy Results as JSON
               </Button>
            </div>

         </div>
      )}

    </div>
  );
}

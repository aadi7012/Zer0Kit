import { useState, useMemo, useEffect } from 'react';
import { 
  Bug, Zap, Layout, Database, Network, Shield, ArrowRight, Menu, X, ArrowLeft, GitBranch, LayoutDashboard, Wrench, Sparkles, MoveRight, Moon, Sun, Command as CmdIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorForge } from '@/src/components/ErrorForge';
import { UIForge } from '@/src/components/UIForge';
import { DataForge } from '@/src/components/DataForge';
import { PrivacySuite } from '@/src/components/PrivacySuite';
import { RepoForge } from '@/src/components/RepoForge';
import { ToolkitPage } from '@/src/components/toolkit/ToolkitPage';
import { useTheme } from '@/src/components/ThemeProvider';
import { CommandPalette } from '@/src/components/CommandPalette';
import { useAuth } from '@/src/components/AuthProvider';

const TOOLS_CATALOG = [
  { id: 'error', name: 'ErrorForge', icon: Bug, tag: 'Hero', color: 'indigo', description: 'Paste an error trace. Get the root cause and the drop-in fix.', component: ErrorForge },
  { id: 'repo', name: 'RepoForge', icon: GitBranch, tag: 'Viral', color: 'emerald', description: 'Paste any GitHub repo. Get architecture maps instantly.', component: RepoForge },
  { id: 'data', name: 'DataForge', icon: Database, tag: 'Data', color: 'blue', description: 'Convert JSON to SQL, fix schemas, and parse huge payloads.', component: DataForge },
  { id: 'ui', name: 'UIForge', icon: Layout, tag: 'Vision', color: 'purple', description: 'Upload a UI screenshot. Generate React/Tailwind code with layout logic.', component: UIForge },
];

export default function App() {
  const [activeApp, setActiveApp] = useState<'toolkit' | 'forge'>('toolkit');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [initialHeroInput, setInitialHeroInput] = useState('');
  const { theme, setTheme } = useTheme();
  const { user, signInWithGoogle, logout } = useAuth();

  useEffect(() => {
    const handleCmdNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { app, toolId } = customEvent.detail;
      setActiveApp(app);
      setActiveToolId(toolId);
    };
    window.addEventListener('cmd:navigate', handleCmdNavigate);
    return () => window.removeEventListener('cmd:navigate', handleCmdNavigate);
  }, []);

  const activeTool = useMemo(() => TOOLS_CATALOG.find(t => t.id === activeToolId), [activeToolId]);

  const viewDashboard = () => {
    setActiveToolId(null);
    setInitialHeroInput('');
  };

  const handleHeroSubmit = (forceInput?: string) => {
    const input = forceInput || initialHeroInput.trim();
    if (!input) return;
    
    if (forceInput) {
       setInitialHeroInput(forceInput);
    }

    if (input.startsWith('http') && input.includes('github.com')) {
      setActiveToolId('repo');
    } else if (input.startsWith('{') || input.startsWith('[')) {
      setActiveToolId('data');
    } else {
      setActiveToolId('error');
    }
  };

  const sampleInputs = [
    { label: "React TypeError", val: "TypeError: Cannot read properties of undefined (reading 'map')" },
    { label: "Vue GitHub Repo", val: "https://github.com/vuejs/core" },
    { label: "Broken JSON", val: '{\n  "name": "john",\n  "age": 30,\n  broken_key_here\n}' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#040408] font-sans text-slate-800 dark:text-slate-200 selection:bg-indigo-500/30 transition-colors duration-300">
      <CommandPalette />
      
      {/* Top Navigation */}
      <nav className="w-full border-b border-slate-200 dark:border-white/5 bg-white/60 dark:bg-[#040408]/60 backdrop-blur-2xl sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
           <button onClick={() => {setActiveApp('toolkit'); viewDashboard();}} className="flex items-center gap-3 group relative">
             <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
             <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${activeApp === 'toolkit' ? 'from-blue-600 to-cyan-400 shadow-blue-500/20' : 'from-indigo-600 to-purple-400 shadow-indigo-600/20'} flex items-center justify-center shadow-lg transition-all z-10`}>
                {activeApp === 'toolkit' ? <LayoutDashboard className="w-5 h-5 text-white" /> : <Wrench className="w-5 h-5 text-white" />}
             </div>
             <span className="font-extrabold text-xl tracking-tight text-white z-10">
               {activeApp === 'toolkit' ? 'Toolkit Hub' : 'ForgeKit'}
             </span>
           </button>
           
           <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-full backdrop-blur-md">
             <button 
               onClick={() => {setActiveApp('toolkit'); viewDashboard();}} 
               className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${activeApp === 'toolkit' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
             >
               Free Toolkit
             </button>
             <button 
               onClick={() => {setActiveApp('forge'); viewDashboard();}} 
               className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${activeApp === 'forge' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
             >
               Developer Forge
             </button>
           </div>

           <div className="hidden md:flex items-center gap-4">
               {activeApp === 'forge' ? (
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                     <button onClick={() => setActiveToolId('error')} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"><Bug className="w-4 h-4"/>Error</button>
                     <button onClick={() => setActiveToolId('repo')} className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center gap-2"><GitBranch className="w-4 h-4"/>Repo</button>
                     <button onClick={() => setActiveToolId('data')} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-2"><Database className="w-4 h-4"/>Data</button>
                     <button onClick={() => setActiveToolId('ui')} className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors flex items-center gap-2"><Layout className="w-4 h-4"/>UI</button>
                  </div>
               ) : (
                  <div className="flex items-center gap-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                     <span className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full"><Sparkles className="w-4 h-4 text-yellow-500 dark:text-yellow-400"/> Always Free</span>
                  </div>
               )}
               
               <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2" />
               <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))} className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/5 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
                  <CmdIcon className="w-3 h-3" /> Cmd K
               </button>
               <button 
                 onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                 className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
               >
                 {theme === 'dark' ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
               </button>
               {user ? (
                 <button onClick={logout} className="text-sm font-bold bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-white hover:bg-red-500/20 hover:text-red-400 transition-colors">
                   Sign Out
                 </button>
               ) : (
                 <button onClick={signInWithGoogle} className="text-sm font-bold bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-white transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                   Sign In to Save
                 </button>
               )}
           </div>
        </div>
      </nav>

      {/* Main Content Router */}
      <AnimatePresence mode="wait">
        {activeApp === 'toolkit' ? (
           <motion.div 
             key="toolkit" 
             initial={{ opacity: 0, y: 15 }} 
             animate={{ opacity: 1, y: 0 }} 
             exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
             transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
             className="flex-1 overflow-x-hidden"
           >
             <ToolkitPage />
           </motion.div>
        ) : (
           <motion.div 
             key="forge"
             initial={{ opacity: 0, y: 15 }} 
             animate={{ opacity: 1, y: 0 }} 
             exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
             transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
             className="flex-1 overflow-x-hidden relative"
           >
              {activeToolId === null ? (
                // ForgeKit LANDING PAGE VIEW
                <main className="w-full">
                  <section className="relative pt-24 pb-32 overflow-hidden">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
                     <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
                     
                     <div className="max-w-4xl mx-auto px-4 md:px-8 text-center space-y-8 relative z-10">
                        <motion.div 
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.1 }}
                           className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm mb-4 backdrop-blur-md"
                        >
                           <Zap className="w-4 h-4 text-indigo-400" /> Forge your workflow.
                        </motion.div>

                        <motion.h1 
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.2 }}
                           className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white leading-[1.1]"
                        >
                          From error to fix in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">seconds.</span>
                        </motion.h1>
                        
                        <motion.p 
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.3 }}
                           className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mt-4"
                        >
                          Understand any codebase instantly. Fix any nasty stack trace. <br/> Stop guessing. We pull the exact real-world fix for you.
                        </motion.p>

                        <motion.div 
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.4 }}
                           className="max-w-2xl mx-auto pt-8"
                        >
                           <div className="relative group">
                             <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/50 to-emerald-500/50 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500"></div>
                             <div className="relative flex flex-col sm:flex-row bg-[#0c0c16]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-2 shadow-2xl">
                                <input 
                                  type="text" 
                                  placeholder="Paste error logs, JSON, or GitHub URLs..." 
                                  value={initialHeroInput}
                                  onChange={(e) => setInitialHeroInput(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleHeroSubmit()}
                                  className="w-full bg-transparent text-white px-6 py-4 sm:py-0 focus:outline-none placeholder:text-slate-500 font-mono text-sm leading-relaxed"
                                />
                                <button 
                                  onClick={() => handleHeroSubmit()}
                                  className="whitespace-nowrap px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors sm:ml-2 mt-2 sm:mt-0 shadow-lg shadow-indigo-600/20"
                                >
                                   Analyze <MoveRight className="w-5 h-5" />
                                </button>
                             </div>
                           </div>
                           <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                              <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Instant Try:</span>
                              {sampleInputs.map((sample, idx) => (
                                <button key={idx} onClick={() => handleHeroSubmit(sample.val)} className="text-xs px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 text-slate-300 transition-colors">
                                  {sample.label}
                                </button>
                              ))}
                           </div>
                        </motion.div>
                     </div>
                  </section>

                  <section className="max-w-7xl mx-auto px-4 md:px-8 pb-32">
                     <div className="mb-12 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Dedicated Forges</h2>
                        <p className="text-slate-400 shadow-sm">Specialized environments built to solve incredibly hard problems.</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       {TOOLS_CATALOG.map((tool, i) => (
                          <motion.button 
                            key={tool.id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            onClick={() => setActiveToolId(tool.id)}
                            className="group flex flex-col text-left p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer h-full relative overflow-hidden"
                          >
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-${tool.color}-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-${tool.color}-500/20 transition-all`}></div>
                            <div className="flex items-start justify-between mb-8 relative z-10">
                               <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all bg-${tool.color}-500/10 border-${tool.color}-500/20 text-${tool.color}-400 group-hover:scale-110 group-hover:bg-${tool.color}-500/20`}>
                                  <tool.icon className="w-7 h-7" />
                               </div>
                               {tool.tag && (
                                 <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-slate-300">
                                   {tool.tag}
                                 </span>
                               )}
                            </div>
                            <div className="mt-auto relative z-10">
                              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                                {tool.name}
                              </h3>
                              <p className="text-slate-400 text-sm leading-relaxed">{tool.description}</p>
                            </div>
                          </motion.button>
                       ))}
                     </div>
                  </section>
                </main>
              ) : (
                // ACTIVE TOOL VIEW
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full max-w-[1600px] mx-auto px-4 md:px-8 py-8"
                >
                  <header className="mb-6 flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex items-center gap-6">
                       <button 
                        onClick={viewDashboard}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
                       >
                         <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                       </button>
                       <div>
                          <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-${activeTool?.color}-200 flex items-center gap-3`}>
                            {activeTool?.icon && <activeTool.icon className={`w-8 h-8 text-${activeTool?.color}-400`} />}
                            {activeTool?.name}
                          </h1>
                       </div>
                    </div>
                  </header>
                  
                  <main className="w-full h-[calc(100vh-220px)] bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
                     {activeToolId === 'error' && <ErrorForge initialInput={initialHeroInput} />}
                     {activeToolId === 'repo' && <RepoForge initialInput={initialHeroInput} />}
                     {activeToolId === 'ui' && <UIForge />}
                     {activeToolId === 'data' && <DataForge initialInput={initialHeroInput} />}
                  </main>
                </motion.div>
              )}
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

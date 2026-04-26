import React, { useState, useMemo } from 'react';
import { FileText, Image as ImageIcon, QrCode, Search, FileSignature, Shield, Wand2, Globe, LayoutDashboard, ArrowLeft, MoveRight } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'motion/react';

// Tools Imports
import { PdfCompressor, ResumeBuilder, BackgroundRemover, ImageConverter } from './Tools1';
import { QRCodeAdvanced, AIParaphraser, TechStackDetector, PasswordGenLight } from './Tools2';

const TOOLS_DATABASE = [
  { id: 'pdf', title: 'PDF Compressor', desc: 'Reduce PDF file sizes instantly. No limits or watermarks.', icon: FileText, category: 'PDF', component: PdfCompressor, hot: true, color: 'blue' },
  { id: 'resume', title: 'Resume Builder', desc: 'Create and download a professional PDF resume for free.', icon: FileSignature, category: 'Career', component: ResumeBuilder, hot: true, color: 'indigo' },
  { id: 'bg-remove', title: 'Background Remover', desc: 'Remove image backgrounds entirely in your browser.', icon: ImageIcon, category: 'Images', component: BackgroundRemover, hot: false, color: 'purple' },
  { id: 'image-conv', title: 'Image Converter', desc: 'Convert PNG, JPG, WebP directly. Zero ad clutter.', icon: ImageIcon, category: 'Images', component: ImageConverter, hot: false, color: 'pink' },
  { id: 'qr', title: 'QR Code Generator', desc: 'Custom colors and high-res vector output.', icon: QrCode, category: 'Marketing', component: QRCodeAdvanced, hot: false, color: 'emerald' },
  { id: 'paraphrase', title: 'AI Paraphraser', desc: 'Fix grammar and rewrite text to sound professional.', icon: Wand2, category: 'AI', component: AIParaphraser, hot: true, color: 'cyan' },
  { id: 'tech-stack', title: 'Tech Stack Detector', desc: 'Discover what tech is running any website.', icon: Globe, category: 'Developer', component: TechStackDetector, hot: false, color: 'orange' },
  { id: 'password', title: 'Password Generator', desc: 'Instant, secure passwords with zero tracking.', icon: Shield, category: 'Security', component: PasswordGenLight, hot: false, color: 'emerald' }
];

const CATEGORIES = ['All', 'PDF', 'Images', 'AI', 'Developer', 'Security', 'Career', 'Marketing'];

export function ToolkitPage() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filteredTools = useMemo(() => {
    return TOOLS_DATABASE.filter(t => 
      (activeTab === 'All' || t.category === activeTab) &&
      (t.title.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, activeTab]);

  const activeTool = useMemo(() => TOOLS_DATABASE.find(t => t.id === activeToolId), [activeToolId]);

  return (
    <div className="min-h-screen bg-transparent text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-500/30">
      <AnimatePresence mode="wait">
      {activeToolId === null ? (
        <motion.main 
          key="toolkit-home"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {/* Hero Section */}
          <section className="relative pt-24 pb-20 px-4 text-center max-w-5xl mx-auto space-y-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
            
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 text-cyan-600 dark:text-cyan-300 font-semibold text-sm mb-4 backdrop-blur-md"
            >
              <Shield className="w-4 h-4"/> No login. No watermarks. Free forever.
            </motion.div>

            <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tighter leading-[1.1]"
            >
              Every utility you need.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">None of the paywalls.</span>
            </motion.h1>

            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="text-xl text-slate-400 max-w-2xl mx-auto"
            >
              60+ free tools for developers, creators, and students.
            </motion.p>
            
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
               className="max-w-2xl mx-auto mt-8 relative group"
            >
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-2xl blur-lg opacity-20 group-hover:opacity-50 transition duration-500"></div>
               <div className="relative">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"/>
                 <input 
                   placeholder="Search for PDF, Image Converter, Passwords..." 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   className="w-full h-16 pl-14 pr-6 text-lg bg-white/80 dark:bg-[#0c0c16]/80 border border-slate-200 dark:border-white/10 focus:border-blue-500/50 rounded-2xl shadow-xl transition-all text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none backdrop-blur-xl"
                 />
               </div>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
               className="flex flex-wrap justify-center gap-4 text-sm font-bold text-slate-600 pt-6"
            >
              <span>60+ tools</span>
              <span>·</span>
              <span>0 sign-ups</span>
              <span>·</span>
              <span>2M files processed</span>
            </motion.div>
          </section>

          {/* Catalog Section */}
          <section className="max-w-7xl mx-auto px-4 md:px-8 pb-32">
             {/* Category Tabs */}
             <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-white/5 pb-4 mb-10 custom-scrollbar">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveTab(cat)}
                    className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 ${activeTab === cat ? 'bg-slate-900 dark:bg-white/10 text-white shadow-sm ring-1 ring-slate-900 dark:ring-white/10' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>

             {/* Tools Grid */}
             {filteredTools.length === 0 ? (
                <div className="text-center py-20 text-slate-500">No tools found matching your search.</div>
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredTools.map((tool, i) => (
                    <motion.button 
                      key={tool.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setActiveToolId(tool.id)}
                      className="group flex flex-col text-left p-8 bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer h-full relative overflow-hidden shadow-sm dark:shadow-none"
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-${tool.color}-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-${tool.color}-500/20 transition-all`}></div>
                      <div className="flex items-start justify-between mb-8 relative z-10">
                         <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all bg-${tool.color}-500/10 border-${tool.color}-500/20 text-${tool.color}-600 dark:text-${tool.color}-400 group-hover:scale-110 group-hover:bg-${tool.color}-500/20 shadow-lg`}>
                            <tool.icon className="w-7 h-7" />
                         </div>
                         {tool.hot && (
                           <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                             Hot
                           </span>
                         )}
                      </div>
                      <div className="mt-auto relative z-10">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors flex items-center justify-between">
                          {tool.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{tool.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
             )}

             {/* Suggest CTA */}
             <div className="mt-24 text-center p-12 bg-white dark:bg-[#0c0c16]/50 border border-slate-200 dark:border-white/10 rounded-3xl backdrop-blur-xl relative overflow-hidden shadow-sm dark:shadow-none">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
                <div className="relative z-10">
                   <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Can't find what you need?</h3>
                   <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto text-lg">We build new tools based on community requests. Tell us what you're looking for.</p>
                   <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 px-10 rounded-xl text-lg shadow-lg shadow-blue-600/20 inline-flex items-center gap-2">Suggest a Tool <MoveRight className="w-5 h-5"/></Button>
                </div>
             </div>
          </section>
        </motion.main>
      ) : (
        /* Active Tool View */
        <motion.div 
          key="tool-view"
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full max-w-[1600px] mx-auto px-4 md:px-8 py-8"
        >
          <header className="mb-6 flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-6">
            <div className="flex items-center gap-6">
               <button 
                onClick={() => setActiveToolId(null)}
                className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all group"
               >
                 <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
               </button>
               <div>
                  <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-900 dark:from-white to-${activeTool?.color || 'blue'}-500 dark:to-${activeTool?.color || 'blue'}-200 flex items-center gap-3`}>
                    {activeTool?.icon && <activeTool.icon className={`w-8 h-8 text-${activeTool?.color || 'blue'}-500 dark:text-${activeTool?.color || 'blue'}-400`} />}
                    {activeTool?.title}
                  </h1>
               </div>
            </div>
          </header>
          
          <main className="w-full min-h-[calc(100vh-220px)] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden backdrop-blur-md p-6 lg:p-10 shadow-sm dark:shadow-none">
             {activeTool && <activeTool.component />}
          </main>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

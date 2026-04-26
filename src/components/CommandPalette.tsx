import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom'; // Wait, there is no router in this app, App.tsx handles routing manually using state. So we should pass a callback or use an event.
import { Bug, GitBranch, Database, Layout, FileText, FileSignature, Image as ImageIcon, QrCode, Wand2, Globe, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Using a custom event pattern since we don't have a global state router
export const dispatchCommandAction = (app: 'toolkit' | 'forge', toolId: string | null) => {
  window.dispatchEvent(new CustomEvent('cmd:navigate', { detail: { app, toolId } }));
};

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (app: 'toolkit' | 'forge', toolId: string | null) => {
    setOpen(false);
    dispatchCommandAction(app, toolId);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={() => setOpen(false)} 
        />
        
        <Command.Dialog
          open={open}
          onOpenChange={setOpen}
          label="Global Command Menu"
          className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c16] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 overflow-hidden z-10 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center px-4 border-b border-slate-200 dark:border-white/10">
            <Command.Input 
              autoFocus 
              placeholder="Type a command or search..." 
              className="w-full bg-transparent text-slate-900 dark:text-white px-2 py-5 text-lg outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-none">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">No results found.</Command.Empty>
            
            <Command.Group heading="Free Toolkit Elements" className="text-xs font-semibold text-slate-500 dark:text-slate-400 p-2 uppercase tracking-widest">
              <Command.Item onSelect={() => handleSelect('toolkit', null)} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-sm aria-selected:bg-slate-100 dark:aria-selected:bg-white/10 aria-selected:text-blue-500">
                <Globe className="w-4 h-4" /> Go to Toolkit Hub
              </Command.Item>
              <Command.Item onSelect={() => handleSelect('toolkit', 'resume')} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-sm aria-selected:bg-slate-100 dark:aria-selected:bg-white/10 aria-selected:text-blue-500">
                <FileSignature className="w-4 h-4" /> Open Resume Builder
              </Command.Item>
              <Command.Item onSelect={() => handleSelect('toolkit', 'pdf')} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-sm aria-selected:bg-slate-100 dark:aria-selected:bg-white/10 aria-selected:text-blue-500">
                <FileText className="w-4 h-4" /> Open PDF Compressor
              </Command.Item>
              <Command.Item onSelect={() => handleSelect('toolkit', 'bg-remove')} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-sm aria-selected:bg-slate-100 dark:aria-selected:bg-white/10 aria-selected:text-blue-500">
                <ImageIcon className="w-4 h-4" /> Open Background Remover
              </Command.Item>
              <Command.Item onSelect={() => handleSelect('toolkit', 'image-conv')} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-sm aria-selected:bg-slate-100 dark:aria-selected:bg-white/10 aria-selected:text-blue-500">
                <ImageIcon className="w-4 h-4" /> Open Image Converter
              </Command.Item>
              <Command.Item onSelect={() => handleSelect('toolkit', 'qr')} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-sm aria-selected:bg-slate-100 dark:aria-selected:bg-white/10 aria-selected:text-blue-500">
                <QrCode className="w-4 h-4" /> Open QR Code Generator
              </Command.Item>
            </Command.Group>

            <div className="h-[1px] bg-slate-200 dark:bg-white/10 my-2" />

            <Command.Group heading="Developer ForgeKit" className="text-xs font-semibold text-slate-500 dark:text-slate-400 p-2 uppercase tracking-widest">
              <Command.Item onSelect={() => handleSelect('forge', null)} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-sm aria-selected:bg-slate-100 dark:aria-selected:bg-white/10 aria-selected:text-indigo-500">
                <Globe className="w-4 h-4" /> Go to ForgeKit Landing
              </Command.Item>
              <Command.Item onSelect={() => handleSelect('forge', 'error')} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-sm aria-selected:bg-slate-100 dark:aria-selected:bg-white/10 aria-selected:text-indigo-500">
                <Bug className="w-4 h-4" /> Open ErrorForge (Fix Stack Traces)
              </Command.Item>
              <Command.Item onSelect={() => handleSelect('forge', 'repo')} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-sm aria-selected:bg-slate-100 dark:aria-selected:bg-white/10 aria-selected:text-emerald-500">
                <GitBranch className="w-4 h-4" /> Open RepoForge (Map GitHub)
              </Command.Item>
              <Command.Item onSelect={() => handleSelect('forge', 'ui')} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-sm aria-selected:bg-slate-100 dark:aria-selected:bg-white/10 aria-selected:text-purple-500">
                <Layout className="w-4 h-4" /> Open UIForge (Image to Code)
              </Command.Item>
              <Command.Item onSelect={() => handleSelect('forge', 'data')} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-sm aria-selected:bg-slate-100 dark:aria-selected:bg-white/10 aria-selected:text-blue-500">
                <Database className="w-4 h-4" /> Open DataForge (Fix JSON)
              </Command.Item>
            </Command.Group>
          </Command.List>
          
          <div className="bg-slate-100 dark:bg-white/5 px-4 py-3 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 flex justify-between">
            <span>Use <kbd className="font-mono bg-white dark:bg-black/20 px-1 py-0.5 rounded border border-slate-200 dark:border-white/10">↑</kbd> <kbd className="font-mono bg-white dark:bg-black/20 px-1 py-0.5 rounded border border-slate-200 dark:border-white/10">↓</kbd> to navigate</span>
            <span><kbd className="font-mono bg-white dark:bg-black/20 px-1 py-0.5 rounded border border-slate-200 dark:border-white/10">Enter</kbd> to select</span>
          </div>
        </Command.Dialog>
      </div>
    </AnimatePresence>
  );
};

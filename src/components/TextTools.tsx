import { useState, useEffect } from 'react';
import { Type, Check, Copy } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';

export function TextAnalyzer() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    chars: 0,
    charsNoSpaces: 0,
    words: 0,
    lines: 0,
    readingTime: 0,
  });

  useEffect(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;
    const readingTime = Math.ceil(words / 200); // 200 WPM

    setStats({ chars, charsNoSpaces, words, lines, readingTime });
  }, [text]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Text Analyzer</CardTitle>
        <CardDescription>Get detailed word, character, and reading time statistics.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <div className="text-2xl font-bold text-indigo-400">{stats.words}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">Words</div>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <div className="text-2xl font-bold text-indigo-400">{stats.chars}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">Chars</div>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center hidden md:block">
            <div className="text-2xl font-bold text-indigo-400">{stats.charsNoSpaces}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">Chars (No Space)</div>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <div className="text-2xl font-bold text-indigo-400">{stats.lines}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">Lines</div>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <div className="text-2xl font-bold text-indigo-400">{stats.readingTime}m</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">Read Time</div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Your Text</Label>
          <Textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or pasting text..."
            className="min-h-[250px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}

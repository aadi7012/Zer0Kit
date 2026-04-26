import { useState } from 'react';
import { Copy, Check, Wand2, Terminal, Code } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Label } from './ui/Label';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

function AIWrapper({ 
  title, 
  description, 
  promptPrefix, 
  placeholder,
  icon: Icon
}: { 
  title: string; 
  description: string; 
  promptPrefix: string; 
  placeholder: string;
  icon: any;
}) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!input) return;
    setLoading(true);
    setError('');
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured in the environment.');
      }
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${promptPrefix}\n\nUser Input:\n${input}`,
      });
      setOutput(response.text || 'No response generated.');
    } catch (err: any) {
      setError(err.message || 'Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)] bg-slate-900/80 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl text-white">{title}</CardTitle>
            <CardDescription className="text-slate-400">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-300">Input</Label>
          <Textarea 
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] bg-slate-950/50"
          />
        </div>
        
        <Button onClick={generate} disabled={loading || !input} className="w-full h-12 text-sm font-bold tracking-wide">
          {loading ? 'Generating ✨...' : `Generate ${title.split(' ')[1]}`}
        </Button>

        {error && <div className="p-3 text-sm text-red-400 bg-red-400/10 rounded-lg border border-red-400/20">{error}</div>}

        {output && (
          <div className="space-y-2 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <Label className="text-indigo-400">AI Result</Label>
              <Button size="sm" variant="ghost" className="h-8" onClick={copyToClipboard}>
                {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied' : 'Copy Result'}
              </Button>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 whitespace-pre-wrap text-sm leading-relaxed overflow-x-auto">
              {output}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const PromptEnhancer = () => (
  <AIWrapper 
    title="Prompt Enhancer" 
    description="Turn a basic idea into a highly detailed, expert-level AI prompt (usually costs money elsewhere!)."
    placeholder="E.g., Make a prompt for a marketing email about a new privacy tool..."
    promptPrefix="You are an expert prompt engineer. The user will provide a basic, simple prompt. Your task is to rewrite it into a highly detailed, professional, and effective prompt that generates the best possible output from an AI. Provide ONLY the enhanced prompt text, without any conversational filler."
    icon={Wand2}
  />
);

export const CodeExplainer = () => (
  <AIWrapper 
    title="Code Explainer" 
    description="Paste complex or heavily obfuscated code and get a simple, human-readable breakdown."
    placeholder="Paste your nasty JavaScript or Python code here..."
    promptPrefix="You are a senior software engineer. Explain the following code clearly and concisely to a junior developer. Break down what it does step-by-step. Keep it brief but accurate."
    icon={Code}
  />
);

export const RegexGenerator = () => (
  <AIWrapper 
    title="Regex Generator" 
    description="Describe the pattern you want to match in plain English, and get the exact Regular Expression."
    placeholder="E.g., Match a valid IPv4 address..."
    promptPrefix="You are a Regex expert. The user wants a regular expression that matches their description. Provide ONLY the raw regex string (no markdown blocks like ```regex, just the string itself) to be used in JavaScript, followed by a very brief 1-sentence explanation."
    icon={Terminal}
  />
);

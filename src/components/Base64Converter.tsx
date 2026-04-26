import { useState, useEffect } from 'react';
import { Copy, Check, ArrowDownUp } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';

export function Base64Converter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    if (!input) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch (err) {
      setError(`Invalid input for Base64 ${mode}`);
      setOutput('');
    }
  }, [input, mode]);

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Base64 Converter</CardTitle>
        <CardDescription>Encode and decode text to and from Base64.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Input Text</Label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-1 flex">
              <button 
                className={`px-3 py-1 text-xs rounded-md transition-colors ${mode === 'encode' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setMode('encode')}
              >
                Encode
              </button>
              <button 
                className={`px-3 py-1 text-xs rounded-md transition-colors ${mode === 'decode' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setMode('decode')}
              >
                Decode
              </button>
            </div>
          </div>
          <Textarea 
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

        <div className="space-y-2 relative">
          <div className="flex items-center justify-between">
            <Label>Result</Label>
            <Button size="sm" variant="ghost" className="h-8" onClick={copyToClipboard} disabled={!output}>
              {copied ? <Check className="w-4 h-4 mr-2 text-indigo-500" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <Textarea 
            readOnly 
            value={output} 
            className="min-h-[120px] font-mono text-slate-300 bg-slate-950 border-slate-800"
            placeholder="Result will appear here"
          />
        </div>
      </CardContent>
    </Card>
  );
}

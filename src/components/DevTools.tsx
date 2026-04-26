import { useState } from 'react';
import { Copy, Check, FileJson } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';

export function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const format = () => {
    try {
      setError('');
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e: any) {
      setError(e.message || 'Invalid JSON');
      setOutput('');
    }
  };

  const minify = () => {
    try {
      setError('');
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (e: any) {
      setError(e.message || 'Invalid JSON');
      setOutput('');
    }
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>JSON Formatter / Minifier</CardTitle>
        <CardDescription>Format, beautify, and strictly validate JSON data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Raw JSON</Label>
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            className="font-mono min-h-[150px]"
          />
        </div>
        <div className="flex gap-4">
          <Button onClick={format} className="flex-1" variant="outline">Format</Button>
          <Button onClick={minify} className="flex-1" variant="outline">Minify</Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {output && (
          <div className="space-y-2 pt-4 border-t border-slate-800">
             <div className="flex items-center justify-between">
                <Label>Result</Label>
                <Button size="sm" variant="ghost" onClick={copy}>
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
             </div>
             <Textarea 
              readOnly 
              value={output} 
              className="font-mono text-indigo-300 min-h-[200px]" 
             />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

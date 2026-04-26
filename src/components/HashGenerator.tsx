import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';
import { Input } from './ui/Input';

export function HashGenerator() {
  const [input, setInput] = useState('');
  const [algo, setAlgo] = useState('SHA256');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!input) {
      setOutput('');
      return;
    }
    try {
      let hash = '';
      if (algo === 'MD5') hash = CryptoJS.MD5(input).toString();
      else if (algo === 'SHA1') hash = CryptoJS.SHA1(input).toString();
      else if (algo === 'SHA256') hash = CryptoJS.SHA256(input).toString();
      else if (algo === 'SHA512') hash = CryptoJS.SHA512(input).toString();
      setOutput(hash);
    } catch (err) {
      setOutput('Error generating hash');
    }
  }, [input, algo]);

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hash Generator</CardTitle>
        <CardDescription>Generate cryptographic hashes from text.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Input Text</Label>
          <Textarea 
            placeholder="Enter text to hash..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Algorithm</Label>
          <div className="flex space-x-2">
            {['MD5', 'SHA1', 'SHA256', 'SHA512'].map((a) => (
              <Button
                key={a}
                variant={algo === a ? 'default' : 'outline'}
                onClick={() => setAlgo(a)}
                className="flex-1"
              >
                {a}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Output Hash</Label>
          <div className="relative">
            <Input 
              readOnly 
              value={output} 
              className="font-mono text-slate-300 pr-12"
              placeholder="Hash will appear here"
            />
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={copyToClipboard}
              className="absolute right-1 top-1"
              disabled={!output}
            >
              {copied ? <Check className="w-4 h-4 text-indigo-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

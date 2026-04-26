import { useState } from 'react';
import { Copy, Check, Lock, Unlock } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/Card';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';
import { Input } from './ui/Input';

export function TextEncryptor() {
  const [input, setInput] = useState('');
  const [secret, setSecret] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleEncrypt = () => {
    setError('');
    if (!input || !secret) {
      setError('Please enter both text and a secret key.');
      return;
    }
    try {
      const encrypted = CryptoJS.AES.encrypt(input, secret).toString();
      setOutput(encrypted);
    } catch (err) {
      setError('Encryption failed.');
    }
  };

  const handleDecrypt = () => {
    setError('');
    if (!input || !secret) {
      setError('Please enter both text and a secret key.');
      return;
    }
    try {
      const decrypted = CryptoJS.AES.decrypt(input, secret);
      const originalText = decrypted.toString(CryptoJS.enc.Utf8);
      if (!originalText) {
        setError('Decryption failed. Please check your secret key.');
        return;
      }
      setOutput(originalText);
    } catch (err) {
      setError('Decryption failed. Invalid input or secret key.');
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Text Encryptor (AES)</CardTitle>
        <CardDescription>Encrypt and decrypt messages securely using AES encryption.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Message / Ciphertext</Label>
          <Textarea 
            placeholder="Type your message to encrypt or ciphertext to decrypt..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Secret Key</Label>
          <Input 
            type="password"
            placeholder="Enter a strong password..." 
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

        <div className="flex space-x-4">
          <Button onClick={handleEncrypt} className="flex-1 w-full" variant="outline">
            <Lock className="w-4 h-4 mr-2" /> Encrypt
          </Button>
          <Button onClick={handleDecrypt} className="flex-1 w-full" variant="outline">
            <Unlock className="w-4 h-4 mr-2" /> Decrypt
          </Button>
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-800">
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
            className="min-h-[120px] font-mono text-slate-300"
            placeholder="Output will appear here"
          />
        </div>
      </CardContent>
    </Card>
  );
}

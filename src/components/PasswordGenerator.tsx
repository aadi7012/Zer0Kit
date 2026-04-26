import { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Label } from './ui/Label';
import { Slider } from './ui/Slider';
import { Switch } from './ui/Switch';
import { Input } from './ui/Input';

export function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charset = '';
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) charset += '0123456789';
    if (options.symbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (charset === '') {
      setPassword('');
      return;
    }

    let newPassword = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      newPassword += charset[array[i] % charset.length];
    }
    setPassword(newPassword);
    setCopied(false);
  };

  useEffect(() => {
    generatePassword();
  }, [length, options]);

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password Generator</CardTitle>
        <CardDescription>Generate secure, random passwords locally.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <Input 
            readOnly 
            value={password} 
            className="text-lg font-mono text-indigo-400 pr-24"
            placeholder="Select options to generate"
          />
          <div className="absolute right-1 top-1 flex space-x-1">
            <Button size="icon" variant="ghost" onClick={generatePassword} title="Regenerate">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={copyToClipboard} title="Copy">
              {copied ? <Check className="w-4 h-4 text-indigo-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Password Length: {length}</Label>
          </div>
          <Slider 
            min={8} 
            max={64} 
            value={length} 
            onChange={(e) => setLength(Number(e.target.value))} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <Label>Uppercase (A-Z)</Label>
            <Switch 
              checked={options.uppercase} 
              onCheckedChange={(c) => setOptions((o) => ({ ...o, uppercase: c }))} 
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Lowercase (a-z)</Label>
            <Switch 
              checked={options.lowercase} 
              onCheckedChange={(c) => setOptions((o) => ({ ...o, lowercase: c }))} 
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Numbers (0-9)</Label>
            <Switch 
              checked={options.numbers} 
              onCheckedChange={(c) => setOptions((o) => ({ ...o, numbers: c }))} 
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Symbols (!@#)</Label>
            <Switch 
              checked={options.symbols} 
              onCheckedChange={(c) => setOptions((o) => ({ ...o, symbols: c }))} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

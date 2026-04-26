import { useState } from 'react';
import { Copy, Check, QrCode as QrCodeIcon, Fingerprint } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { Slider } from './ui/Slider';

export function UUIDGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generate = () => {
    const newUuids = Array.from({ length: count }, () => uuidv4());
    setUuids(newUuids);
  };

  const copy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>UUID v4 Generator</CardTitle>
        <CardDescription>Generate completely random UUIDs instantly.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Quantity: {count}</Label>
          </div>
          <Slider 
            min={1} 
            max={50} 
            value={count} 
            onChange={(e) => setCount(Number(e.target.value))} 
          />
          <Button onClick={generate} className="w-full">
            <Fingerprint className="w-4 h-4 mr-2" /> Generate {count} UUIDs
          </Button>
        </div>

        {uuids.length > 0 && (
          <div className="space-y-2 pt-4">
            {uuids.map((id, idx) => (
              <div key={idx} className="flex gap-2">
                <Input readOnly value={id} className="font-mono text-indigo-300" />
                <Button size="icon" variant="outline" onClick={() => copy(id, idx)}>
                  {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function QRCodeGenerator() {
  const [input, setInput] = useState('https://zerokit.dev');
  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Generator</CardTitle>
        <CardDescription>Generate a QR Code for any URL or text instantly.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Text or URL</Label>
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text..."
          />
        </div>
        <div className="flex justify-center p-8 bg-white rounded-xl border border-slate-800">
          <QRCodeSVG value={input || ' '} size={200} />
        </div>
      </CardContent>
    </Card>
  );
}

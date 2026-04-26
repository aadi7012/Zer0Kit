import { useState } from 'react';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Textarea } from './ui/Textarea';
import { Input } from './ui/Input';
import { Label } from './ui/Label';

export function PrivacySuite() {
  const [jwt, setJwt] = useState('');
  const [decodedHeader, setDecodedHeader] = useState('');
  const [decodedPayload, setDecodedPayload] = useState('');
  const [jwtError, setJwtError] = useState('');

  const [regexPattern, setRegexPattern] = useState('');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexText, setRegexText] = useState('');

  const parseJwt = (token: string) => {
    setJwt(token);
    try {
      setJwtError('');
      if (!token.includes('.')) {
         setDecodedHeader('');
         setDecodedPayload('');
         return;
      }
      const parts = token.split('.');
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      setDecodedHeader(JSON.stringify(header, null, 2));
      setDecodedPayload(JSON.stringify(payload, null, 2));
    } catch (e) {
      setJwtError('Invalid JWT format.');
    }
  };

  const renderRegexMatch = () => {
    if (!regexPattern || !regexText) return <p className="text-slate-400">{regexText}</p>;
    
    try {
      const re = new RegExp(regexPattern, regexFlags);
      const parts = regexText.split(re);
      const matches = regexText.match(re) || [];

      if (matches.length === 0) return <p className="text-slate-400">{regexText}</p>;

      const res = [];
      for (let i = 0; i < parts.length; i++) {
        res.push(<span key={`t-${i}`} className="text-slate-400">{parts[i]}</span>);
        if (i < matches.length) {
          res.push(<span key={`m-${i}`} className="bg-indigo-500/30 text-indigo-300 rounded px-1">{matches[i]}</span>);
        }
      }
      return <div className="whitespace-pre-wrap">{res}</div>;
    } catch (e) {
      return <p className="text-red-400">Invalid Regular Expression string.</p>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Tool 1: JWT Decoder */}
      <Card className="bg-slate-900 border-slate-800 shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
             <Shield className="w-6 h-6 text-indigo-400" />
             <div>
                <CardTitle>JWT Debugger</CardTitle>
                <CardDescription>Decode JSON Web Tokens 100% locally.</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
              <Label>Encoded Token</Label>
               <Textarea 
                 placeholder="eyJhbG..."
                 onChange={(e) => parseJwt(e.target.value)}
                 value={jwt}
                 className="font-mono text-xs bg-slate-950 border-slate-800 min-h-[100px]"
               />
               {jwtError && <p className="text-xs text-red-500 break-all">{jwtError}</p>}
           </div>
           <div className="space-y-2">
              <Label>Decoded Payload (Data)</Label>
               <Textarea 
                 readOnly
                 value={decodedPayload}
                 placeholder="Payload JSON"
                 className="font-mono text-xs text-emerald-400 bg-slate-950 border-slate-800 min-h-[150px]"
               />
           </div>
        </CardContent>
      </Card>

      {/* Tool 2: Regex Sandbox */}
      <Card className="bg-slate-900 border-slate-800 shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
             <Code className="w-6 h-6 text-purple-400" />
             <div>
                <CardTitle>Regex Sandbox</CardTitle>
                <CardDescription>Safely test regex structures without network payloads.</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex gap-4">
             <div className="flex-1 space-y-2">
               <Label>Regular Expression</Label>
               <Input 
                 placeholder="^([a-zA-Z0-9]+)$"
                 value={regexPattern}
                 onChange={(e) => setRegexPattern(e.target.value)}
                 className="font-mono bg-slate-950 border-slate-800 text-indigo-300 text-sm"
               />
             </div>
             <div className="w-24 space-y-2">
               <Label>Flags</Label>
               <Input 
                 placeholder="g, i, m"
                 value={regexFlags}
                 onChange={(e) => setRegexFlags(e.target.value)}
                 className="font-mono bg-slate-950 border-slate-800 text-center text-sm"
               />
             </div>
           </div>
           
           <div className="space-y-2">
               <Label>Test String</Label>
               <Textarea 
                 placeholder="Test your string here..."
                 value={regexText}
                 onChange={(e) => setRegexText(e.target.value)}
                 className="font-mono text-sm bg-slate-950 border-slate-800 min-h-[100px]"
               />
           </div>

           <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl min-h-[100px] font-mono text-sm">
             {renderRegexMatch()}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add the missing icon to resolve import
const Code = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
);

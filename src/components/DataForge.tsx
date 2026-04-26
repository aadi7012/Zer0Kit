import { useState, useEffect } from 'react';
import { ArrowRightLeft, FileJson, Table2, Wand2, Database } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Label } from './ui/Label';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export function DataForge({ initialInput = '' }: { initialInput?: string }) {
  const [input, setInput] = useState(initialInput);
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'json-csv' | 'csv-json' | 'sql'>('json-csv');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
     if (initialInput && input.trim() && !output) {
        if (input.startsWith('{') || input.startsWith('[')) {
           setMode('json-csv');
        } else {
           setMode('csv-json');
        }
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parseJSONtoCSV = () => {
    try {
      setError('');
      const arr = JSON.parse(input);
      if (!Array.isArray(arr)) throw new Error("JSON must be an array of objects to convert to CSV.");
      if (arr.length === 0) return setOutput('');

      const headers = Object.keys(arr[0]);
      const csvRows = [headers.join(',')];

      for (const row of arr) {
        const values = headers.map(header => {
          const escaped = ('' + row[header]).replace(/"/g, '\\"');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }
      setOutput(csvRows.join('\n'));
    } catch (e: any) {
      setError(e.message || "Invalid JSON array.");
    }
  };

  const parseCSVtoJSON = () => {
    try {
      setError('');
      const lines = input.trim().split('\n');
      if (lines.length === 0) return setOutput('');
      
      const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
      const result = [];

      for (let i = 1; i < lines.length; i++) {
        // Simple distinct CSV parser
        const obj: any = {};
        const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

        for (let j = 0; j < headers.length; j++) {
           obj[headers[j]] = currentline[j] ? currentline[j].replace(/^"|"$/g, '').trim() : '';
        }
        result.push(obj);
      }
      setOutput(JSON.stringify(result, null, 2));
    } catch (e: any) {
      setError("Invalid CSV structure.");
    }
  };

  const generateSQL = () => {
    try {
      setError('');
      const arr = JSON.parse(input);
      if (!Array.isArray(arr)) throw new Error("JSON must be an array to generate SQL.");
      if (arr.length === 0) return setOutput('-- Empty array');

      const headers = Object.keys(arr[0]);
      
      let sql = `CREATE TABLE data_import (\n`;
      headers.forEach((h, i) => {
         // Auto-detect schema basic string/number
         const val = arr[0][h];
         const type = typeof val === 'number' ? 'NUMERIC' : typeof val === 'boolean' ? 'BOOLEAN' : 'VARCHAR(255)';
         sql += `  ${h.replace(/[^z-zA-Z0-9_]/g, '_')} ${type}${i === headers.length - 1 ? '' : ','}\n`;
      });
      sql += `);\n\n`;

      arr.forEach(row => {
         const vals = headers.map(h => `'${String(row[h]).replace(/'/g, "''")}'`).join(', ');
         sql += `INSERT INTO data_import (${headers.map(h => h.replace(/[^z-zA-Z0-9_]/g, '_')).join(', ')}) VALUES (${vals});\n`;
      });

      setOutput(sql);
    } catch (e: any) {
      setError(e.message || "Invalid JSON array.");
    }
  };

  const convert = () => {
    if (!input) return;
    if (mode === 'json-csv') parseJSONtoCSV();
    else if (mode === 'csv-json') parseCSVtoJSON();
    else if (mode === 'sql') generateSQL();
  };

  const autoFixJSON = async () => {
     if (!input) return;
     setLoading(true);
     setError('');
     try {
       if (!process.env.GEMINI_API_KEY) throw new Error("API Key Missing.");
       const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert Data Engineer. I have a broken block of JSON data. Fix it and return ONLY the completely valid, raw JSON array or object. Do not include markdown \`\`\` blocks, just the JSON string.\n\nBroken JSON:\n${input}`,
       });
       const clean = response.text?.replace(/^```json\n|```$/g, '') || '';
       setInput(clean.trim());
     } catch(err: any) {
       setError("Auto-fix failed: " + err.message);
     } finally {
       setLoading(false);
     }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-start">
      {/* Left: Input */}
      <div className="space-y-6 flex flex-col h-full">
        <div className="flex flex-wrap gap-4 items-center justify-between">
           <div className="bg-slate-900 border border-slate-700/50 p-2 rounded-xl flex gap-2 w-max">
             <Button 
               variant={mode === 'json-csv' ? 'default' : 'ghost'} 
               onClick={() => { setMode('json-csv'); setOutput(''); setError(''); }}
               className={`text-xs ${mode === 'json-csv' ? 'bg-blue-600' : 'text-slate-400'}`}
             >
               <FileJson className="w-4 h-4 mr-2" /> JSON to CSV
             </Button>
             <Button 
               variant={mode === 'csv-json' ? 'default' : 'ghost'} 
               onClick={() => { setMode('csv-json'); setOutput(''); setError(''); }}
               className={`text-xs ${mode === 'csv-json' ? 'bg-blue-600' : 'text-slate-400'}`}
             >
               <Table2 className="w-4 h-4 mr-2" /> CSV to JSON
             </Button>
             <Button 
               variant={mode === 'sql' ? 'default' : 'ghost'} 
               onClick={() => { setMode('sql'); setOutput(''); setError(''); }}
               className={`text-xs ${mode === 'sql' ? 'bg-blue-600' : 'text-slate-400'}`}
             >
               <Database className="w-4 h-4 mr-2" /> JSON to SQL
             </Button>
           </div>
           
           <Button variant="outline" size="sm" onClick={autoFixJSON} disabled={loading || !input} className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
             <Wand2 className="w-4 h-4 mr-2" /> {loading ? 'Fixing...' : 'Auto-Fix JSON'}
           </Button>
        </div>

        <div className="space-y-2 flex-grow">
          <Label className="text-white font-bold tracking-wide">
            Input {mode === 'csv-json' ? 'CSV Text' : 'JSON Array'}
          </Label>
          <Textarea 
            placeholder={mode === 'csv-json' ? 'name,age\nJohn,30' : '[\n  { "name": "John", "age": 30 }\n]'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-full min-h-[400px] font-mono text-sm leading-relaxed bg-slate-900 border-slate-700 focus:border-blue-500 whitespace-pre"
          />
        </div>

        <Button 
          size="lg" 
          onClick={convert} 
          className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-lg h-14"
        >
           <ArrowRightLeft className="w-5 h-5 mr-2" /> Instant Convert
        </Button>
      </div>

      {/* Right: Output */}
      <Card className="h-full min-h-[600px] flex flex-col bg-slate-900/40 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <CardContent className="flex flex-col h-full p-6 space-y-4">
          <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-4">
             <span className="font-bold tracking-widest uppercase text-xs">Output</span>
             {error && <span className="text-red-400 text-xs font-bold bg-red-500/10 px-2 py-1 rounded">{error}</span>}
          </div>
          <Textarea 
             readOnly
             value={output}
             placeholder="Converted data will stream here seamlessly."
             className="flex-grow font-mono text-sm bg-transparent border-none p-0 focus-visible:ring-0 resize-none text-blue-300 whitespace-pre"
          />
        </CardContent>
      </Card>
    </div>
  );
}

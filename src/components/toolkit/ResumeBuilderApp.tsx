import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, FileText, Briefcase, GraduationCap, Code, Globe, 
  Award, FolderOpen, Plus, Trash2, Download, Settings, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';

const FONTS = {
  'Arial': 'Arial, Helvetica, sans-serif',
  'Calibri': 'Calibri, sans-serif',
  'Georgia': 'Georgia, serif',
  'Times New Roman': '"Times New Roman", Times, serif',
  'Garamond': 'Garamond, serif'
};

const THEMES = [
  { name: 'Classic Black', hex: '#000000' },
  { name: 'Navy Blue', hex: '#1e3a8a' },
  { name: 'Deep Green', hex: '#064e3b' },
  { name: 'Charcoal', hex: '#334155' },
  { name: 'Burgundy', hex: '#7f1d1d' }
];

const TEMPLATES = ['Classic', 'Modern', 'Minimal'];

type Experience = { id: string, title: string, company: string, location: string, startDate: string, endDate: string, current: boolean, description: string };
type Education = { id: string, degree: string, field: string, institution: string, location: string, startDate: string, endDate: string };
type Project = { id: string, name: string, description: string, url: string };
type Certification = { id: string, name: string, issuer: string, date: string };
type Language = { id: string, name: string, proficiency: string };

type ResumeData = {
  personal: { name: string, title: string, email: string, phone: string, location: string, linkedin: string, portfolio: string };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  settings: { font: string, color: string, template: string };
};

const DEFAULT_DATA: ResumeData = {
  personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', portfolio: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  settings: { font: FONTS['Calibri'], color: '#000000', template: 'Classic' }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export function ResumeBuilderApp() {
  const [data, setData] = useState<ResumeData>(DEFAULT_DATA);
  const [expandedSection, setExpandedSection] = useState<string | null>('personal');
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('forgekit_resume');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem('forgekit_resume', JSON.stringify(data));
    }, 5000);
    return () => clearInterval(timer);
  }, [data]);

  const updatePersonal = (field: string, value: string) => {
    setData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  };

  const updateSettings = (field: string, value: string) => {
    setData(prev => ({ ...prev, settings: { ...prev.settings, [field]: value } }));
  };

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [{ id: generateId(), title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' }, ...prev.experience]
    }));
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [{ id: generateId(), degree: '', field: '', institution: '', location: '', startDate: '', endDate: '' }, ...prev.education]
    }));
  };

  const updateEducation = (id: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      if (!data.skills.includes(skillInput.trim())) {
        setData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const addProject = () => {
    setData(prev => ({
      ...prev,
      projects: [{ id: generateId(), name: '', description: '', url: '' }, ...prev.projects]
    }));
  }

  const updateProject = (id: string, field: string, value: any) => {
    setData(prev => ({
       ...prev,
       projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const removeProject = (id: string) => {
    setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const handlePrint = () => {
    window.print();
  };

  const atsScore = useMemo(() => {
    let score = 0;
    if (data.personal.name) score += 5;
    if (data.personal.email || data.personal.phone) score += 10;
    if (data.summary.length > 20) score += 10;
    if (data.experience.length > 0) score += 20;
    if (data.education.length > 0) score += 10;
    if (data.skills.length >= 5) score += 20;
    
    let bulletScore = 15;
    data.experience.forEach(e => {
       if (e.description.split('\n').length < 2) bulletScore = 0;
    });
    score += bulletScore;

    if (data.settings.template === 'Classic') score += 10;

    return Math.min(100, score);
  }, [data]);

  const SectionCard = ({ id, icon: Icon, title, isRepeatable, children }: any) => (
    <div className="bg-white/5 border text-sm border-white/10 rounded-xl overflow-hidden mb-4 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <button 
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]" />
          <h3 className="font-bold text-slate-200 uppercase tracking-widest text-[11px] drop-shadow-sm">{title}</h3>
        </div>
        {expandedSection === id ? <ChevronUp className="w-4 h-4 text-slate-400"/> : <ChevronDown className="w-4 h-4 text-slate-400"/>}
      </button>
      {expandedSection === id && (
        <div className="p-4 pt-0 border-t border-white/10 bg-[#0c0c16]/30">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-[100vw] ml-[calc(-50vw+50%)] bg-[#040408] mt-[-48px]">
      
      {/* LEFT PANEL - EDITOR */}
      <div className="w-full lg:w-[40%] h-full overflow-y-auto p-6 bg-[#080810] border-r border-white/10 print:hidden flex flex-col pt-12 lg:pt-6">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#080810]/80 backdrop-blur-md z-10 py-4 border-b border-white/10">
          <div>
            <h1 className="text-xl font-bold text-white drop-shadow-sm">Resume Builder</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">ATS Score</span>
              <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-blue-500 transition-all shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ width: `${atsScore}%` }}></div>
              </div>
              <span className="text-xs font-bold text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]">{atsScore}%</span>
            </div>
          </div>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border-none">
            <Download className="w-4 h-4 mr-2"/> Download PDF
          </Button>
        </div>

        <div className="space-y-2 pb-12">
          {/* Settings */}
          <SectionCard id="settings" icon={Settings} title="Layout & Styling">
            <div className="space-y-4 pt-4">
               <div>
                  <Label className="text-xs font-bold text-slate-400 uppercase drop-shadow-sm">Template</Label>
                  <div className="flex gap-2 mt-2">
                     {TEMPLATES.map(t => (
                       <button key={t} onClick={() => updateSettings('template', t)} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${data.settings.template === t ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}>
                         {t}
                       </button>
                     ))}
                  </div>
               </div>
               <div>
                  <Label className="text-xs font-bold text-slate-400 uppercase drop-shadow-sm">Font Family</Label>
                  <select value={data.settings.font} onChange={e => updateSettings('font', e.target.value)} className="w-full mt-2 h-10 px-3 text-sm rounded-lg border border-white/10 bg-[#0c0c16] text-white focus:outline-none focus:border-blue-500 appearance-none">
                     {Object.entries(FONTS).map(([name, val]) => (
                       <option key={name} value={val}>{name}</option>
                     ))}
                  </select>
               </div>
               <div>
                  <Label className="text-xs font-bold text-slate-400 uppercase drop-shadow-sm">Accent Color</Label>
                  <div className="flex gap-3 mt-2 flex-wrap">
                     {THEMES.map(theme => (
                       <button key={theme.hex} onClick={() => updateSettings('color', theme.hex)}
                         className={`w-8 h-8 rounded-full border-2 transition-transform ${data.settings.color === theme.hex ? 'border-blue-400 scale-110 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'border-transparent hover:scale-110'}`}
                         style={{ backgroundColor: theme.hex }}
                         title={theme.name}
                       />
                     ))}
                  </div>
               </div>
            </div>
          </SectionCard>

          {/* Personal Info */}
          <SectionCard id="personal" icon={User} title="Personal Details">
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="col-span-2"><Label className="text-slate-300">Full Name</Label><Input value={data.personal.name} onChange={e => updatePersonal('name', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500"/></div>
              <div className="col-span-2"><Label className="text-slate-300">Target Job Title</Label><Input value={data.personal.title} onChange={e => updatePersonal('title', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500"/></div>
              <div><Label className="text-slate-300">Email</Label><Input value={data.personal.email} onChange={e => updatePersonal('email', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500"/></div>
              <div><Label className="text-slate-300">Phone</Label><Input value={data.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500"/></div>
              <div className="col-span-2"><Label className="text-slate-300">Location (City, State)</Label><Input value={data.personal.location} onChange={e => updatePersonal('location', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500"/></div>
              <div><Label className="text-slate-300">LinkedIn URL</Label><Input value={data.personal.linkedin} onChange={e => updatePersonal('linkedin', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500"/></div>
              <div><Label className="text-slate-300">Portfolio URL</Label><Input value={data.personal.portfolio} onChange={e => updatePersonal('portfolio', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500"/></div>
            </div>
          </SectionCard>

          {/* Professional Summary */}
          <SectionCard id="summary" icon={FileText} title="Professional Summary">
            <div className="pt-4">
               <Textarea 
                 value={data.summary} 
                 onChange={e => setData(prev => ({...prev, summary: e.target.value}))}
                 placeholder="Write 3-5 sentences about your core strengths, experience, and what makes you a strong candidate."
                 className="min-h-[120px] bg-[#0c0c16]/50 border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
               />
               <p className="text-[10px] text-slate-500 text-right mt-1">{data.summary.length} / 500 chars</p>
            </div>
          </SectionCard>

          {/* Experience */}
          <SectionCard id="experience" icon={Briefcase} title="Work Experience">
            <div className="pt-4 space-y-6">
              {data.experience.map((exp, i) => (
                <div key={exp.id} className="p-4 bg-white/5 border border-white/10 rounded-xl relative group">
                  <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2"><Label className="text-slate-300">Job Title</Label><Input value={exp.title} onChange={e => updateExperience(exp.id, 'title', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500"/></div>
                    <div className="col-span-1"><Label className="text-slate-300">Company</Label><Input value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500"/></div>
                    <div className="col-span-1"><Label className="text-slate-300">Location</Label><Input value={exp.location} onChange={e => updateExperience(exp.id, 'location', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500"/></div>
                    <div className="col-span-1"><Label className="text-slate-300">Start Date</Label><Input placeholder="e.g. Jan 2020" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500 placeholder-slate-500"/></div>
                    <div className="col-span-1">
                      <Label className="text-slate-300">End Date</Label>
                      <Input placeholder="e.g. Present" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} disabled={exp.current} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500 placeholder-slate-500 disabled:opacity-50"/>
                      <label className="flex items-center gap-2 mt-2 text-xs text-slate-400 cursor-pointer"><input type="checkbox" checked={exp.current} onChange={e => updateExperience(exp.id, 'current', e.target.checked)} className="accent-blue-500 border-white/20 bg-white/10"/> I currently work here</label>
                    </div>
                    <div className="col-span-2">
                       <Label className="text-slate-300">Bullet Points</Label>
                       <Textarea value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} placeholder="• Developed feature X resulting in Y% growth..." className="min-h-[100px] font-mono text-xs bg-[#0c0c16]/50 border-white/10 text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"/>
                    </div>
                  </div>
                </div>
              ))}
              <Button onClick={addExperience} variant="outline" className="w-full border-dashed border-white/20 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors"><Plus className="w-4 h-4 mr-2"/> Add Position</Button>
            </div>
          </SectionCard>

          {/* Education */}
          <SectionCard id="education" icon={GraduationCap} title="Education">
             <div className="pt-4 space-y-6">
              {data.education.map((edu, i) => (
                <div key={edu.id} className="p-4 bg-white/5 border border-white/10 rounded-xl relative group">
                  <button onClick={() => removeEducation(edu.id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1"><Label className="text-slate-300">Degree</Label><Input placeholder="B.S." value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500 placeholder-slate-500"/></div>
                    <div className="col-span-1"><Label className="text-slate-300">Field of Study</Label><Input placeholder="Computer Science" value={edu.field} onChange={e => updateEducation(edu.id, 'field', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500 placeholder-slate-500"/></div>
                    <div className="col-span-2"><Label className="text-slate-300">Institution</Label><Input value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500"/></div>
                    <div className="col-span-1"><Label className="text-slate-300">Start Date</Label><Input placeholder="2016" value={edu.startDate} onChange={e => updateEducation(edu.id, 'startDate', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500 placeholder-slate-500"/></div>
                    <div className="col-span-1"><Label className="text-slate-300">End Date / Expected</Label><Input placeholder="2020" value={edu.endDate} onChange={e => updateEducation(edu.id, 'endDate', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500 placeholder-slate-500"/></div>
                  </div>
                </div>
              ))}
              <Button onClick={addEducation} variant="outline" className="w-full border-dashed border-white/20 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors"><Plus className="w-4 h-4 mr-2"/> Add Education</Button>
            </div>
          </SectionCard>

          {/* Skills */}
          <SectionCard id="skills" icon={Code} title="Skills (Required for ATS)">
             <div className="pt-4">
               <Label className="text-slate-300">Add a skill and press Enter</Label>
               <Input 
                 placeholder="e.g. React.js, Python, SEO..." 
                 value={skillInput} 
                 onChange={e => setSkillInput(e.target.value)} 
                 onKeyDown={addSkill} 
                 className="mb-4 bg-[#0c0c16]/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500"
               />
               <div className="flex flex-wrap gap-2">
                  {data.skills.map(s => (
                    <span key={s} className="px-3 py-1 bg-white/10 text-slate-200 border border-white/5 shadow-sm text-xs font-bold rounded-full flex items-center gap-2">
                      {s} <button onClick={() => removeSkill(s)} className="hover:text-red-400 transition-colors"><XIcon /></button>
                    </span>
                  ))}
               </div>
             </div>
          </SectionCard>

          {/* Projects */}
          <SectionCard id="projects" icon={FolderOpen} title="Projects (Optional)">
            <div className="pt-4 space-y-6">
              {data.projects.map((proj, i) => (
                <div key={proj.id} className="p-4 bg-white/5 border border-white/10 rounded-xl relative group">
                  <button onClick={() => removeProject(proj.id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                  <div className="grid grid-cols-1 gap-4">
                    <div><Label className="text-slate-300">Project Name</Label><Input value={proj.name} onChange={e => updateProject(proj.id, 'name', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500"/></div>
                    <div><Label className="text-slate-300">Description / Details</Label><Textarea value={proj.description} onChange={e => updateProject(proj.id, 'description', e.target.value)} className="min-h-[80px] bg-[#0c0c16]/50 border-white/10 text-white focus:outline-none focus:border-blue-500" /></div>
                    <div><Label className="text-slate-300">URL</Label><Input value={proj.url} onChange={e => updateProject(proj.id, 'url', e.target.value)} className="bg-[#0c0c16]/50 border-white/10 text-white focus:border-blue-500"/></div>
                  </div>
                </div>
              ))}
              <Button onClick={addProject} variant="outline" className="w-full border-dashed border-white/20 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors"><Plus className="w-4 h-4 mr-2"/> Add Project</Button>
            </div>
          </SectionCard>

          <button onClick={() => { localStorage.removeItem('forgekit_resume'); setData(DEFAULT_DATA); }} className="w-full text-xs text-slate-500 hover:text-red-400 transition-colors text-center mt-8">
            Clear all data and start over
          </button>
        </div>
      </div>

      {/* RIGHT PANEL - LIVE PREVIEW */}
      <div className="w-full lg:w-[60%] h-full overflow-y-auto bg-[#040408] p-8 flex justify-center items-start print:p-0 print:bg-white print:m-0 print:block print:absolute print:inset-0 print:z-[9999] print:overflow-visible">
         {/* A4 Document Container */}
         <div 
           id="resume-preview" 
           className="w-full max-w-[794px] min-h-[1123px] bg-white shadow-2xl print:shadow-none print:w-full print:max-w-none print:min-h-0 relative"
           style={{ fontFamily: data.settings.font, color: '#111827' }}
         >
            {/* Modern Template Sidebar accent */}
            {data.settings.template === 'Modern' && (
              <div className="absolute left-0 top-0 bottom-0 w-3" style={{ backgroundColor: data.settings.color }}></div>
            )}

            <div className={`p-10 ${data.settings.template === 'Modern' ? 'pl-14' : ''}`}>
               {/* HEADER */}
               <div className={`border-b-2 pb-4 mb-4 ${data.settings.template === 'Minimal' ? 'border-transparent pb-1' : ''}`} style={{ borderColor: data.settings.color }}>
                  <h1 className={`font-black uppercase tracking-tight ${data.settings.template === 'Minimal' ? 'text-2xl' : 'text-3xl'}`} style={{ color: data.settings.color }}>
                    {data.personal.name || 'John Doe'}
                  </h1>
                  {data.personal.title && (
                    <h2 className="text-sm font-semibold tracking-widest uppercase text-slate-600 mt-1">
                      {data.personal.title}
                    </h2>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[11px] text-slate-600">
                    {data.personal.email && <span>{data.personal.email}</span>}
                    {data.personal.email && data.personal.phone && <span>•</span>}
                    {data.personal.phone && <span>{data.personal.phone}</span>}
                    {(data.personal.email || data.personal.phone) && data.personal.location && <span>•</span>}
                    {data.personal.location && <span>{data.personal.location}</span>}
                    
                    {data.personal.linkedin && <span className="ml-auto text-blue-700">{data.personal.linkedin}</span>}
                    {data.personal.portfolio && <span className="ml-2 text-blue-700">{data.personal.portfolio}</span>}
                  </div>
               </div>

               {/* SUMMARY */}
               {data.summary && (
                 <div className="mb-5">
                   <h3 className="uppercase font-bold text-xs tracking-widest mb-2 border-b pb-1" style={{ borderColor: data.settings.color, color: data.settings.color }}>Professional Summary</h3>
                   <p className="text-[11px] leading-relaxed text-slate-800">{data.summary}</p>
                 </div>
               )}

               {/* EXPERIENCE */}
               {data.experience.length > 0 && (
                 <div className="mb-5">
                   <h3 className="uppercase font-bold text-xs tracking-widest mb-3 border-b pb-1" style={{ borderColor: data.settings.color, color: data.settings.color }}>Experience</h3>
                   <div className="space-y-4">
                     {data.experience.map((exp, idx) => (
                       <div key={idx}>
                         <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-[12px] text-slate-900">{exp.title} <span className="font-normal mx-1">at</span> {exp.company}</h4>
                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                         </div>
                         {exp.location && <p className="text-[10px] text-slate-500 mb-2 italic">{exp.location}</p>}
                         <div className="text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap pl-3">
                           {exp.description}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* SKILLS */}
               {data.skills.length > 0 && (
                 <div className="mb-5">
                    <h3 className="uppercase font-bold text-xs tracking-widest mb-2 border-b pb-1" style={{ borderColor: data.settings.color, color: data.settings.color }}>Technical Skills</h3>
                    <p className="text-[11px] leading-relaxed text-slate-800">
                      {data.skills.join('  •  ')}
                    </p>
                 </div>
               )}

               {/* EDUCATION */}
               {data.education.length > 0 && (
                 <div className="mb-5">
                   <h3 className="uppercase font-bold text-xs tracking-widest mb-3 border-b pb-1" style={{ borderColor: data.settings.color, color: data.settings.color }}>Education</h3>
                   <div className="space-y-3">
                     {data.education.map((edu, idx) => (
                       <div key={idx}>
                         <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-[12px] text-slate-900">{edu.institution}</h4>
                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{edu.startDate} - {edu.endDate}</span>
                         </div>
                         <p className="text-[11px] text-slate-800">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* PROJECTS */}
               {data.projects.length > 0 && (
                 <div className="mb-5">
                   <h3 className="uppercase font-bold text-xs tracking-widest mb-3 border-b pb-1" style={{ borderColor: data.settings.color, color: data.settings.color }}>Selected Projects</h3>
                   <div className="space-y-4">
                     {data.projects.map((proj, idx) => (
                       <div key={idx}>
                         <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-[12px] text-slate-900">{proj.name}</h4>
                            {proj.url && <span className="text-[10px] text-blue-700">{proj.url}</span>}
                         </div>
                         <div className="text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                           {proj.description}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

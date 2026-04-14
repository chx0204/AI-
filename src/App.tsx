/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Film, 
  Sparkles, 
  RotateCcw, 
  Play, 
  Clapperboard, 
  ChevronRight,
  Info,
  History,
  Download,
  Languages,
  Clock,
  Type as TypeIcon
} from 'lucide-react';
import { generateScript, Script } from './services/geminiService';

const STYLES = [
  { id: 'noir', name: 'Film Noir', icon: '🕶️' },
  { id: 'scifi', name: 'Sci-Fi', icon: '🚀' },
  { id: 'drama', name: 'Drama', icon: '🎭' },
  { id: 'comedy', name: 'Dark Comedy', icon: '🤡' },
  { id: 'horror', name: 'Psychological Horror', icon: '👁️' },
  { id: 'fantasy', name: 'Fantasy', icon: '✨' },
];

const EXAMPLES: Script[] = [
  {
    title: "The Last Guest",
    genre: "Drama / Twist",
    logline: "An old man prepares a lavish dinner for a guest who is long overdue.",
    scenes: [
      {
        location: "INT. DINING ROOM",
        time: "NIGHT",
        action: "ARTHUR (70s) carefully places a single rose in a vase. The table is set for two. Candles flicker.",
        dialogue: [
          { character: "ARTHUR", text: "You're always late, Mary. But I don't mind." }
        ]
      },
      {
        location: "INT. DINING ROOM",
        time: "LATER",
        action: "Arthur sits alone. He pours wine into two glasses. He clinks his glass against the empty one.",
        dialogue: [
          { character: "ARTHUR", text: "To forty years. Even if you're not here to see it." }
        ]
      }
    ],
    twist: "Arthur stands up, walks to the mirror, and we see Mary's reflection instead of his. He was the one who died; she is the one living in the house, unable to see him."
  }
];

export default function App() {
  const [theme, setTheme] = useState('');
  const [style, setStyle] = useState('noir');
  const [duration, setDuration] = useState([60]); // seconds
  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Script[]>([]);

  const handleGenerate = async () => {
    if (!theme) return;
    setLoading(true);
    try {
      const durationText = duration[0] >= 60 
        ? `${duration[0] / 60} minute${duration[0] === 60 ? '' : 's'}` 
        : `${duration[0]} seconds`;
      const newScript = await generateScript(theme, style, durationText);
      setScript(newScript);
      setHistory(prev => [newScript, ...prev].slice(0, 5));
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!script) return;

    let content = `TITLE: ${script.title}\n`;
    content += `GENRE: ${script.genre}\n`;
    content += `LOGLINE: ${script.logline}\n\n`;
    content += `--------------------------------------------------\n\n`;

    script.scenes.forEach((scene) => {
      content += `${scene.location} - ${scene.time}\n\n`;
      content += `${scene.action}\n\n`;
      if (scene.dialogue) {
        scene.dialogue.forEach(d => {
          content += `\t\t${d.character.toUpperCase()}\n`;
          content += `\t"${d.text}"\n\n`;
        });
      }
      content += `\n`;
    });

    content += `--------------------------------------------------\n`;
    content += `THE TWIST:\n${script.twist}\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${script.title.replace(/\s+/g, '_')}_Script.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleTranslate = async () => {
    if (!script || loading) return;
    setLoading(true);
    try {
      const prompt = `Translate the following movie script into Chinese. 
      Keep the cinematic tone and professional script format.
      Return ONLY the JSON object matching the original structure.
      
      Script to translate:
      ${JSON.stringify(script)}`;

      const response = await generateScript(prompt, "Translation to Chinese");
      setScript(response);
    } catch (error) {
      console.error("Translation failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-4"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium uppercase tracking-widest">AI Script Master</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl cinematic-text mb-4"
        >
          The Art of the <span className="text-primary italic">Twist</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground max-w-2xl mx-auto text-lg"
        >
          Generate Oscar-quality 1-minute short film scripts. 
          Cinematic imagery, tight dialogue, and unexpected endings.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass border-white/5 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-sm font-medium flex items-center gap-2">
                <Clapperboard className="w-4 h-4" />
                Production Details
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Theme / Keyword</label>
                <input 
                  placeholder="e.g. A forgotten key, Time travel, Loneliness..." 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:ring-primary outline-none"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Cinematic Style</label>
                <select 
                  value={style} 
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-sm focus:ring-primary outline-none appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                >
                  {STYLES.map(s => (
                    <option key={s.id} value={s.id} className="bg-zinc-900 text-white">
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Target Duration
                  </label>
                  <span className="text-xs font-mono text-primary">
                    {duration[0] >= 60 ? `${duration[0] / 60}m` : `${duration[0]}s`}
                  </span>
                </div>
                <input
                  type="range"
                  value={duration[0]}
                  onChange={(e) => setDuration([parseInt(e.target.value)])}
                  max={120}
                  min={30}
                  step={15}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary my-4"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-tighter">
                  <span>30s</span>
                  <span>1m</span>
                  <span>2m</span>
                </div>
              </div>

              <button 
                onClick={handleGenerate} 
                disabled={loading || !theme}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-12 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <RotateCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {loading ? 'Directing...' : 'Generate Script'}
              </button>
            </div>
          </div>

          {/* History / Examples */}
          <div className="glass border-white/5 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-sm font-medium flex items-center gap-2">
                <History className="w-4 h-4" />
                Recent Scripts
              </h2>
            </div>
            <div className="p-6">
              <div className="h-[200px] pr-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {(history.length > 0 ? history : EXAMPLES).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setScript(s)}
                      className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm line-clamp-1">{s.title}</span>
                        <span className="px-2 py-0.5 rounded-full border border-white/10 text-[10px] uppercase">{s.genre}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{s.logline}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Script Display */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {script ? (
              <motion.div
                key={script.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="glass border-white/5 rounded-xl overflow-hidden">
                  <div className="h-1 w-full bg-primary/20">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1 }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <div className="p-8 border-b border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                        {script.genre}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          className="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
                          onClick={handleTranslate}
                          disabled={loading}
                          title="Translate to Chinese"
                        >
                          <Languages className="w-4 h-4" />
                        </button>
                        <button 
                          className="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
                          onClick={handleDownload}
                          title="Download as Text"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors">
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h2 className="text-3xl cinematic-text">{script.title}</h2>
                    <p className="italic text-muted-foreground mt-2">
                      "{script.logline}"
                    </p>
                  </div>
                  <div className="p-8">
                    <div className="h-[500px] pr-6 overflow-y-auto custom-scrollbar">
                      <div className="space-y-8 script-font">
                        {script.scenes.map((scene, idx) => (
                          <div key={idx} className="space-y-4">
                            <div className="flex items-center gap-4 text-primary/80 font-bold">
                              <span>{scene.location}</span>
                              <span className="h-px flex-1 bg-white/5" />
                              <span>{scene.time}</span>
                            </div>
                            <p className="text-foreground/90">{scene.action}</p>
                            {scene.dialogue && scene.dialogue.length > 0 && (
                              <div className="space-y-4 pl-8 md:pl-24 pr-8 md:pr-24">
                                {scene.dialogue.map((d, dIdx) => (
                                  <div key={dIdx} className="text-center">
                                    <span className="block font-bold uppercase mb-1 text-xs tracking-widest">{d.character}</span>
                                    <p className="text-foreground/80 italic">"{d.text}"</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Twist Section */}
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className="pt-12 mt-12 border-t border-dashed border-white/10"
                        >
                          <div className="flex items-center gap-2 mb-4 text-primary">
                            <Sparkles className="w-5 h-5" />
                            <span className="font-bold uppercase tracking-tighter text-lg">The Twist</span>
                          </div>
                          <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 italic text-lg leading-relaxed text-primary-foreground/90">
                            {script.twist}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 glass rounded-3xl border-white/5 border-dashed border-2"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Film className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl cinematic-text mb-2">Ready for Action?</h3>
                <p className="text-muted-foreground max-w-xs">
                  Enter a theme and select a style to generate your next award-winning short film script.
                </p>
                <div className="mt-8 flex gap-4">
                  <button 
                    onClick={() => setScript(EXAMPLES[0])} 
                    className="px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
                  >
                    View Example
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-white/5 text-center text-muted-foreground text-xs uppercase tracking-[0.2em]">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="flex items-center gap-1"><Info className="w-3 h-3" /> 1 Minute Runtime</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Directed</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="flex items-center gap-1"><TypeIcon className="w-3 h-3" /> Twist Guaranteed</span>
        </div>
        &copy; 2026 AI Script Master &bull; Powered by Gemini
      </footer>
    </div>
  );
}

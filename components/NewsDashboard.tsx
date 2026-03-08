'use client';

import { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Lightbulb, Leaf, Smile, Sparkles, RefreshCw, Globe, User, ArrowRight, ExternalLink } from 'lucide-react';

type Lens = {
  id: string;
  name: string;
  author: string;
  description: string;
  prompt: string;
  icon: any;
  color: string;
  activeColor: string;
};

const LENSES: Lens[] = [
  {
    id: 'optimist',
    name: 'The Optimist',
    author: 'System',
    description: 'Finds the silver lining and human resilience in any situation.',
    prompt: 'Rewrite this news story to focus entirely on the positive aspects, the silver lining, human resilience, and hope. Make it uplifting and encouraging. Keep it factual but change the tone to be highly optimistic.',
    icon: Sun,
    color: 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100',
    activeColor: 'bg-amber-100 border-amber-400 ring-2 ring-amber-400/20'
  },
  {
    id: 'innovator',
    name: 'The Innovator',
    author: 'System',
    description: 'Focuses on technological progress and problem-solving.',
    prompt: 'Rewrite this news story through the lens of technological progress and innovation. Focus on how this presents an opportunity for problem-solving, future advancements, and human ingenuity.',
    icon: Lightbulb,
    color: 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100',
    activeColor: 'bg-blue-100 border-blue-400 ring-2 ring-blue-400/20'
  },
  {
    id: 'environmentalist',
    name: 'The Earth Lover',
    author: 'System',
    description: 'Highlights sustainability, nature recovery, and green efforts.',
    prompt: "Rewrite this news story to highlight any positive environmental impacts, sustainability efforts, or how nature is recovering or benefiting. If not directly related to environment, frame it around how it might indirectly benefit our planet or society's harmony with nature.",
    icon: Leaf,
    color: 'bg-green-50 text-green-900 border-green-200 hover:bg-green-100',
    activeColor: 'bg-green-100 border-green-400 ring-2 ring-green-400/20'
  },
  {
    id: 'comedian',
    name: 'The Comedian',
    author: 'System',
    description: 'A lighthearted, humorous, and uplifting spin.',
    prompt: 'Rewrite this news story with a lighthearted, humorous, and uplifting spin. Make the reader smile or laugh while still understanding the core facts. Use witty observations.',
    icon: Smile,
    color: 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100',
    activeColor: 'bg-purple-100 border-purple-400 ring-2 ring-purple-400/20'
  },
  {
    id: 'custom_mike',
    name: "Mike's Lens",
    author: 'Mike O.',
    description: 'Focuses on actionable takeaways and personal growth.',
    prompt: 'Rewrite this news story to focus on what an individual can learn from it. Highlight actionable takeaways, personal growth opportunities, and how this news can inspire someone to be better today.',
    icon: User,
    color: 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100',
    activeColor: 'bg-rose-100 border-rose-400 ring-2 ring-rose-400/20'
  }
];

type NewsStory = {
  id: string;
  originalTitle: string;
  originalSummary: string;
  source: string;
  url: string;
  reframedTitle?: string;
  reframedSummary?: string;
  isReframing?: boolean;
  error?: string;
};

export default function NewsDashboard() {
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [selectedLens, setSelectedLens] = useState<Lens | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setIsLoadingNews(true);
    setSelectedLens(null);
    setShowOriginal(false);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `Search Google for 5 recent, notable global news stories (mix of different topics like world, tech, science, health).
You MUST respond ONLY with a valid JSON array of objects. Do not include markdown formatting like \`\`\`json.
Each object must have these exact keys:
"originalTitle": "The headline of the story",
"originalSummary": "A 2-3 sentence summary of the story",
"source": "The news publisher",
"url": "The URL to the story"

Return ONLY the JSON array.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.2,
        }
      });

      let text = response.text || '[]';
      // Clean up potential markdown
      text = text.replace(/^```json\\n/, '').replace(/\\n```$/, '').trim();
      
      let parsedStories: any[] = [];
      try {
        parsedStories = JSON.parse(text);
      } catch (e) {
        // Fallback regex extraction if it still returned markdown
        const match = text.match(/\\[[\\s\\S]*\\]/);
        if (match) {
          parsedStories = JSON.parse(match[0]);
        } else {
          throw new Error("Failed to parse news JSON.");
        }
      }

      const formattedStories: NewsStory[] = parsedStories.map((s, i) => ({
        id: `story-${i}-${Date.now()}`,
        originalTitle: s.originalTitle,
        originalSummary: s.originalSummary,
        source: s.source || 'Global News',
        url: s.url || '#',
      }));

      setStories(formattedStories);
    } catch (error) {
      console.error("Error fetching news:", error);
      // Fallback data if API fails or parsing fails
      setStories([
        {
          id: 'fallback-1',
          originalTitle: 'Global Markets See Unexpected Shift Amidst Policy Changes',
          originalSummary: 'Major indices experienced volatility today following announcements from central banks regarding interest rate adjustments. Analysts remain divided on the long-term impact.',
          source: 'Financial Times',
          url: '#'
        },
        {
          id: 'fallback-2',
          originalTitle: 'New Study Reveals Concerning Trends in Ocean Temperatures',
          originalSummary: 'Researchers have published a comprehensive report showing that ocean surface temperatures have reached record highs for the third consecutive month, raising alarms about marine ecosystems.',
          source: 'Science Daily',
          url: '#'
        },
        {
          id: 'fallback-3',
          originalTitle: 'Tech Giant Announces Major Restructuring and Layoffs',
          originalSummary: 'In a move to streamline operations, a leading technology company has announced plans to lay off 5% of its global workforce and pivot towards artificial intelligence initiatives.',
          source: 'TechCrunch',
          url: '#'
        }
      ]);
    } finally {
      setIsLoadingNews(false);
    }
  };

  const handleLensSelect = async (lens: Lens) => {
    if (selectedLens?.id === lens.id) return;
    
    setSelectedLens(lens);
    setShowOriginal(false);
    
    // Mark all stories as reframing
    setStories(prev => prev.map(s => ({ ...s, isReframing: true, reframedTitle: undefined, reframedSummary: undefined, error: undefined })));

    // Reframe stories in parallel
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    
    stories.forEach(async (story) => {
      try {
        const prompt = `You are an AI that reframes news stories.
Original Title: ${story.originalTitle}
Original Summary: ${story.originalSummary}

Lens Instructions: ${lens.prompt}

Please rewrite the title and summary based on the Lens Instructions.
Respond ONLY with a valid JSON object containing two keys: "reframedTitle" and "reframedSummary".
Do not include markdown formatting.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reframedTitle: { type: Type.STRING },
                reframedSummary: { type: Type.STRING }
              },
              required: ['reframedTitle', 'reframedSummary']
            }
          }
        });

        const data = JSON.parse(response.text || '{}');
        
        setStories(prev => prev.map(s => 
          s.id === story.id 
            ? { ...s, reframedTitle: data.reframedTitle, reframedSummary: data.reframedSummary, isReframing: false }
            : s
        ));
      } catch (error) {
        console.error("Error reframing story:", error);
        setStories(prev => prev.map(s => 
          s.id === story.id 
            ? { ...s, isReframing: false, error: "Failed to reframe this story." }
            : s
        ));
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row max-w-7xl mx-auto">
      {/* Sidebar / Topbar */}
      <aside className="w-full md:w-80 p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#1a1a1a]/10 flex flex-col gap-8 bg-white/50 backdrop-blur-sm sticky top-0 md:h-screen overflow-y-auto z-10">
        <div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight mb-2">OnlyGreatNews</h1>
          <p className="text-sm text-[#1a1a1a]/60 font-medium">The world&apos;s news, reframed for optimism and progress.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/50">Choose Your Lens</h2>
          </div>
          
          <div className="flex flex-col gap-3">
            {LENSES.map((lens) => {
              const Icon = lens.icon;
              const isActive = selectedLens?.id === lens.id;
              return (
                <button
                  key={lens.id}
                  onClick={() => handleLensSelect(lens)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 ${isActive ? lens.activeColor : lens.color}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{lens.name}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider opacity-60 font-medium bg-black/5 px-2 py-1 rounded-full">
                      By {lens.author}
                    </span>
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed">{lens.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-[#1a1a1a]/10">
          <button 
            onClick={fetchNews}
            disabled={isLoadingNews}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-[#1a1a1a]/90 transition-colors disabled:opacity-50`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingNews ? 'animate-spin' : ''}`} />
            {isLoadingNews ? 'Scouting News...' : 'Fetch Latest News'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-serif text-3xl font-light">
              {isLoadingNews ? 'Scouting the globe...' : selectedLens ? `Viewing through ${selectedLens.name}` : 'Latest Global News'}
            </h2>
            
            {selectedLens && !isLoadingNews && stories.length > 0 && (
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="text-xs font-medium uppercase tracking-wider px-4 py-2 rounded-full border border-[#1a1a1a]/20 hover:bg-[#1a1a1a]/5 transition-colors"
              >
                {showOriginal ? 'Show Reframed' : 'Show Original'}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-8">
            <AnimatePresence mode="popLayout">
              {isLoadingNews ? (
                // Loading Skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <motion.div 
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 md:p-8 bg-white rounded-3xl shadow-sm border border-[#1a1a1a]/5 animate-pulse"
                  >
                    <div className="h-4 w-24 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-8 w-3/4 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 w-full bg-gray-200 rounded-full mb-2"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded-full"></div>
                  </motion.div>
                ))
              ) : (
                stories.map((story, i) => {
                  const isReframing = story.isReframing;
                  const showReframed = selectedLens && !showOriginal && !isReframing && story.reframedTitle;
                  
                  return (
                    <motion.article 
                      key={story.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group relative p-6 md:p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-[#1a1a1a]/5"
                    >
                      {/* Source Tag */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#1a1a1a]/40 bg-[#1a1a1a]/5 px-3 py-1 rounded-full">
                          {story.source}
                        </span>
                        {showReframed && (
                          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                            <Sparkles className="w-3 h-3" />
                            Reframed
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="relative">
                        {isReframing ? (
                          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                            <RefreshCw className="w-8 h-8 text-[#1a1a1a]/20 animate-spin" />
                            <p className="text-sm font-medium text-[#1a1a1a]/60">Applying {selectedLens?.name}...</p>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key={showReframed ? 'reframed' : 'original'}
                          >
                            <h3 className="font-serif text-2xl md:text-3xl font-medium leading-snug mb-4 text-[#1a1a1a]">
                              {showReframed ? story.reframedTitle : story.originalTitle}
                            </h3>
                            <p className="text-[#1a1a1a]/70 leading-relaxed text-lg">
                              {showReframed ? story.reframedSummary : story.originalSummary}
                            </p>
                          </motion.div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-6 pt-6 border-t border-[#1a1a1a]/5 flex items-center justify-between">
                        <a 
                          href={story.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors"
                        >
                          Read original source
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </motion.article>
                  );
                })
              )}
            </AnimatePresence>

            {!isLoadingNews && stories.length === 0 && (
              <div className="text-center py-20">
                <Globe className="w-12 h-12 text-[#1a1a1a]/20 mx-auto mb-4" />
                <h3 className="font-serif text-2xl text-[#1a1a1a]/60">No news found</h3>
                <p className="text-[#1a1a1a]/40 mt-2">Try fetching the latest news again.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

import os

filepath = r"C:\Users\Aayush Sinha\Desktop\RoboLearn\robo-learn-frontend\src\pages\student\CodingWorkspace.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Icons and imports
content = content.replace("Clock3\n} from 'lucide-react';", "Clock3,\n  Bot,\n  Sparkles,\n  ChevronDown,\n  ChevronUp\n} from 'lucide-react';\nimport { studentApi } from '../../api/studentApi';")

# 2. State variables
content = content.replace("const [wsConnected, setWsConnected] = useState(false);", "const [wsConnected, setWsConnected] = useState(false);\n  const [aiResponse, setAiResponse] = useState('');\n  const [isAiLoading, setIsAiLoading] = useState(false);")

# 3. AI Handle Review logic
ai_logic = """
  const handleAiReview = async () => {
    try {
      setIsAiLoading(true);
      setActiveTab('ai-mentor');
      const prompt = `Act as an expert Code Mentor. I am working on the problem "${problem?.title}".\\n\\nProblem Description:\\n${problem?.description}\\n\\nMy Code:\\n${code}\\n\\nPlease analyze my code, identify any syntax errors, logic flaws, or time/space complexity improvements. Do not give me the full direct answer, but guide me with hints and point out what lines I should check! Format with markdown.`;
      const response = await studentApi.aiChat(prompt);
      setAiResponse(response.response);
    } catch (err) {
      console.error(err);
      toast.error('AI Mentor is currently sleeping.');
      setAiResponse('Error reaching AI Mentor. Please try again later.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const getLanguageId = (lang) => {"""
content = content.replace("const getLanguageId = (lang) => {", ai_logic)

# 4. Tabs update
tabs_original = "{['description', 'editorial', 'submissions'].map(t => ("
tabs_new = "{['description', 'editorial', 'submissions', 'ai-mentor'].map(t => ("
content = content.replace(tabs_original, tabs_new)

tabs_text_orig = "{t}"
tabs_text_new = "{t === 'ai-mentor' ? 'AI Mentor' : t}"
content = content.replace(tabs_text_orig, tabs_text_new, 1)

# 5. AI Mentor view under tabs content
ai_view = """
            {activeTab === 'ai-mentor' && (
              <div className="p-6 animate-in fade-in duration-300">
                <div className="prose prose-invert max-w-none text-gray-300">
                  <div className="bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-500/20 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Bot className="w-24 h-24" />
                    </div>
                    <h3 className="text-xl font-bold text-fuchsia-400 flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5" />
                      AI Code Analysis
                    </h3>
                    
                    {isAiLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full blur opacity-75 animate-pulse"></div>
                          <Bot className="w-12 h-12 text-white relative animate-bounce" />
                        </div>
                        <p className="text-fuchsia-300 animate-pulse font-medium">Analyzing your code structure and complexity...</p>
                      </div>
                    ) : aiResponse ? (
                      <div className="relative z-10 whitespace-pre-wrap leading-relaxed text-[15px]">
                        {aiResponse}
                      </div>
                    ) : (
                      <div className="text-center py-10 z-10 relative">
                        <p className="text-gray-400 mb-6">Want feedback on your code before submitting?</p>
                        <button 
                          onClick={handleAiReview}
                          className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(217,70,239,0.3)] hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] flex items-center gap-2 mx-auto"
                        >
                          <Sparkles className="w-4 h-4" />
                          Analyze My Code
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
"""
content = content.replace("          </div>\n        </div>\n\n        {/* Right: Code Editor & Console */}", ai_view + "        </div>\n\n        {/* Right: Code Editor & Console */}")

# 6. Button in the action bar
action_button_orig = """              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleExecute(true)}"""
action_button_new = """              <div className="flex items-center gap-3">
                <button
                  onClick={handleAiReview}
                  disabled={isExecuting || isAiLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-fuchsia-500/20 text-gray-300 hover:text-fuchsia-400 rounded-lg font-medium transition-all border border-zinc-700 hover:border-fuchsia-500/50"
                >
                  <Bot className="w-4 h-4" />
                  Ask AI
                </button>
                <button
                  onClick={() => handleExecute(true)}"""
content = content.replace(action_button_orig, action_button_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Workspace.")

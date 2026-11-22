import { useState } from 'react'
import {
  Smartphone,
  Monitor,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Layers,
  Sliders,
  Play,
  RotateCcw,
  Bell,
  Heart,
  Share2,
  ChevronRight
} from 'lucide-react'

export function App() {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState<'flow' | 'components' | 'overview'>('overview')
  const [step, setStep] = useState(1)
  const [toggleState, setToggleState] = useState(true)
  const [sliderVal, setSliderVal] = useState(65)
  const [likes, setLikes] = useState(12)
  const [liked, setLiked] = useState(false)

  const handleLike = () => {
    setLiked(!liked)
    setLikes(prev => (liked ? prev - 1 : prev + 1))
  }

  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border border-indigo-500/20 p-6">
            <div className="flex items-center gap-2 text-indigo-500 text-xs font-semibold tracking-wider uppercase mb-2">
              <Sparkles className="w-4 h-4" />
              Interactive Prototype Sandbox
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Ready for Testing & Exploration
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              This is a live scaffold running React, Vite, Tailwind CSS, and GitHub Actions. Modify components in <code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-xs font-mono">src/App.tsx</code> to test your ideas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Pipeline Status</span>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">GitHub Pages CI/CD</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Stack</span>
              <div className="mt-2 font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                React 19 + Tailwind v4
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-xs">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3">Quick Interactive Demo</h3>
            <div className="flex items-center justify-between gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-sm text-zinc-600 dark:text-zinc-300">Tap to react</span>
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  liked
                    ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/50'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                {likes}
              </button>
            </div>
            <div className="flex items-center justify-between gap-4 py-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-300">Feature Toggle</span>
              <button
                onClick={() => setToggleState(!toggleState)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  toggleState ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    toggleState ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (activeTab === 'flow') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Step {step} of 3
            </span>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-4">
            {step === 1 && (
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white text-base">Step 1: Define Intent</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Start mapping your user journey and experiment with user triggers.
                </p>
              </div>
            )}
            {step === 2 && (
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white text-base">Step 2: Collect User Input</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Simulate form actions, sliders, or onboarding answers right here.
                </p>
                <div className="mt-4">
                  <label className="text-xs font-medium text-zinc-500">Value: {sliderVal}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderVal}
                    onChange={(e) => setSliderVal(Number(e.target.value))}
                    className="w-full mt-1 accent-indigo-600"
                  />
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-semibold text-zinc-900 dark:text-white text-base">Journey Complete!</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  You successfully reached the end of the prototype test flow.
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition shadow-xs"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 transition"
                >
                  Start Over
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">Sample Components</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Push Notifications</span>
            <Bell className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Share Results</span>
            <Share2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Navigation Item</span>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased">
      {/* Top Navigation */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              P
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-zinc-900 dark:text-white">Prototype Lab</h1>
              <span className="text-xs text-zinc-500">lucafioriniux/prototype</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport switch */}
            <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition ${
                  viewMode === 'desktop'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
                title="Full Screen Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition ${
                  viewMode === 'mobile'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
                title="Mobile Frame Preview"
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
            </div>

            <a
              href="https://github.com/lucafioriniux/prototype"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 bg-zinc-200/60 dark:bg-zinc-800/60 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition ${
              activeTab === 'flow'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Play className="w-3.5 h-3.5" /> User Flow
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition ${
              activeTab === 'components'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Components
          </button>
        </div>

        {/* Viewport Frame */}
        {viewMode === 'mobile' ? (
          <div className="w-[375px] min-h-[667px] bg-white dark:bg-zinc-900 border-[6px] border-zinc-800 dark:border-zinc-700 rounded-[40px] shadow-2xl p-6 flex flex-col relative overflow-hidden transition-all duration-300">
            {/* Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-zinc-800 dark:bg-zinc-700 rounded-full" />
            <div className="pt-4 flex-1">{renderContent()}</div>
          </div>
        ) : (
          <div className="w-full max-w-2xl transition-all duration-300">
            {renderContent()}
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-4 text-center text-xs text-zinc-400">
        Deployed automatically with GitHub Pages & GitHub Actions
      </footer>
    </div>
  )
}

export default App

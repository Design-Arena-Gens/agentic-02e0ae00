'use client'

import { useState, useRef } from 'react'

interface GenerationResult {
  status: 'idle' | 'generating' | 'completed' | 'error'
  videoUrl?: string
  error?: string
  progress?: number
}

interface ExamplePrompt {
  title: string
  prompt: string
  icon: string
}

const examplePrompts: ExamplePrompt[] = [
  {
    title: 'Ocean Sunset',
    prompt: 'A breathtaking sunset over a calm ocean, golden and pink hues reflecting on gentle waves, cinematic 4K',
    icon: '🌅'
  },
  {
    title: 'Cyberpunk City',
    prompt: 'A futuristic cyberpunk cityscape at night with neon lights, flying cars, and holographic advertisements',
    icon: '🌃'
  },
  {
    title: 'Forest Journey',
    prompt: 'A mystical enchanted forest with glowing mushrooms, fireflies, and rays of sunlight through ancient trees',
    icon: '🌲'
  },
  {
    title: 'Space Adventure',
    prompt: 'A spacecraft traveling through a colorful nebula, stars and cosmic dust swirling around, epic sci-fi scene',
    icon: '🚀'
  },
  {
    title: 'Underwater World',
    prompt: 'A vibrant coral reef teeming with tropical fish, sea turtles, and dancing jellyfish, crystal clear water',
    icon: '🐠'
  },
  {
    title: 'Mountain Peak',
    prompt: 'A majestic snow-capped mountain at sunrise, clouds rolling through valleys, golden light illuminating peaks',
    icon: '🏔️'
  }
]

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<GenerationResult>({ status: 'idle' })
  const [history, setHistory] = useState<Array<{ prompt: string; videoUrl: string }>>([])
  const videoRef = useRef<HTMLVideoElement>(null)

  const generateVideo = async () => {
    if (!prompt.trim()) return

    setResult({ status: 'generating', progress: 0 })

    // Simulate progress
    const progressInterval = setInterval(() => {
      setResult(prev => ({
        ...prev,
        progress: Math.min((prev.progress || 0) + Math.random() * 15, 90)
      }))
    }, 1000)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      clearInterval(progressInterval)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video')
      }

      setResult({
        status: 'completed',
        videoUrl: data.videoUrl,
        progress: 100
      })

      setHistory(prev => [{ prompt, videoUrl: data.videoUrl }, ...prev.slice(0, 4)])
    } catch (error) {
      clearInterval(progressInterval)
      setResult({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      })
    }
  }

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt)
  }

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI Video Generator
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transform your ideas into stunning videos with the power of AI. Simply describe what you want to see.
          </p>
        </header>

        {/* Main Input Section */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-3">
            Describe your video
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A majestic dragon flying through a sunset sky, scales shimmering with golden light, cinematic 4K quality..."
              className="w-full h-32 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none transition-all"
              disabled={result.status === 'generating'}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              {prompt.length}/500
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-sm text-gray-400">
              💡 Tip: Be specific about style, lighting, and mood for better results
            </p>
            <button
              onClick={generateVideo}
              disabled={!prompt.trim() || result.status === 'generating'}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
            >
              {result.status === 'generating' ? (
                <>
                  <span className="loader w-5 h-5 border-2"></span>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Video
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generation Status */}
        {result.status === 'generating' && (
          <div className="glass-card rounded-2xl p-8 mb-8 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
                  <span className="loader"></span>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 px-3 py-1 rounded-full text-sm font-medium text-violet-400">
                  {Math.round(result.progress || 0)}%
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Creating your video...</h3>
                <p className="text-gray-400">This may take 30-60 seconds. Our AI is crafting something amazing!</p>
              </div>
              <div className="w-full max-w-md bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500 ease-out"
                  style={{ width: `${result.progress || 0}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Video Result */}
        {result.status === 'completed' && result.videoUrl && (
          <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Your Video is Ready!
              </h3>
              <a
                href={result.videoUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            </div>
            <div className="video-container">
              <video
                ref={videoRef}
                src={result.videoUrl}
                controls
                autoPlay
                loop
                className="w-full rounded-lg"
                style={{ maxHeight: '500px' }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="mt-4 text-gray-400 text-sm">
              <span className="font-medium text-gray-300">Prompt:</span> {prompt}
            </p>
          </div>
        )}

        {/* Error State */}
        {result.status === 'error' && (
          <div className="glass-card rounded-2xl p-6 mb-8 border border-red-500/30 bg-red-500/5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-1">Generation Failed</h3>
                <p className="text-gray-400">{result.error}</p>
                <button
                  onClick={() => setResult({ status: 'idle' })}
                  className="mt-3 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Try again →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Example Prompts */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Example Prompts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example.prompt)}
                className="glass-card rounded-xl p-4 text-left hover:bg-white/10 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{example.icon}</span>
                  <h3 className="font-medium text-white group-hover:text-violet-300 transition-colors">
                    {example.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">{example.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Generation History */}
        {history.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Generations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item, index) => (
                <div key={index} className="glass-card rounded-xl overflow-hidden group">
                  <div className="aspect-video bg-gray-900">
                    <video
                      src={item.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause()
                        e.currentTarget.currentTime = 0
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-400 line-clamp-2">{item.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Why Choose Our AI Video Generator?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-medium text-white mb-1">Lightning Fast</h3>
              <p className="text-sm text-gray-400">Generate videos in seconds with our optimized AI models</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-white mb-1">High Quality</h3>
              <p className="text-sm text-gray-400">Stunning visuals with cinematic quality output</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="font-medium text-white mb-1">Customizable</h3>
              <p className="text-sm text-gray-400">Fine-tune your prompts for perfect results</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-medium text-white mb-1">Secure</h3>
              <p className="text-sm text-gray-400">Your data is protected with enterprise-grade security</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Powered by advanced AI video generation technology</p>
          <p className="mt-1">© 2024 AI Video Generator. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}

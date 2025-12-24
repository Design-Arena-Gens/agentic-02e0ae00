import { NextResponse } from 'next/server'
import Replicate from 'replicate'

export const maxDuration = 300 // 5 minutes timeout for video generation

// Demo video URLs for fallback/demo mode
const demoVideos = [
  'https://replicate.delivery/pbxt/AYMAYNMpYNzZKVCWXZtGZ2xCNiHCXMqcCUPQ4xaCLT3lR4hJA/output.mp4',
  'https://replicate.delivery/pbxt/IJEVwT0ew3q5YnEVZWLQ3DPyBYHQ9cqYgpFmXJZDtFLkU2AAA/output.mp4',
  'https://replicate.delivery/pbxt/DLvVoJo5VjXIEAWKJjmXF0m1Z0aXrPgKKbSYxMRSmxGaR4hJA/output.mp4',
]

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN

    // If no API token, return a demo video
    if (!replicateToken) {
      console.log('No REPLICATE_API_TOKEN found, returning demo video')
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const randomVideo = demoVideos[Math.floor(Math.random() * demoVideos.length)]
      return NextResponse.json({ 
        videoUrl: randomVideo,
        demo: true,
        message: 'Demo mode: Add REPLICATE_API_TOKEN environment variable for real AI video generation'
      })
    }

    const replicate = new Replicate({
      auth: replicateToken,
    })

    // Using Stable Video Diffusion model for text-to-video generation
    // This model generates short video clips from text descriptions
    const output = await replicate.run(
      "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
      {
        input: {
          prompt: prompt,
          num_frames: 24,
          fps: 8,
          width: 576,
          height: 320,
          num_inference_steps: 50,
          guidance_scale: 17.5,
        }
      }
    )

    // The output is typically a URL to the generated video
    const videoUrl = Array.isArray(output) ? output[0] : output

    if (!videoUrl) {
      throw new Error('No video URL returned from the API')
    }

    return NextResponse.json({ videoUrl })
  } catch (error) {
    console.error('Video generation error:', error)
    
    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('authentication') || error.message.includes('401')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your REPLICATE_API_TOKEN.' },
          { status: 401 }
        )
      }
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate video. Please try again.' },
      { status: 500 }
    )
  }
}

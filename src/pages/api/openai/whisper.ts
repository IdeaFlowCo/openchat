import axios from 'axios'
import FormData from 'form-data'
import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '24mb',
    },
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(400).json({ error: {
      message: 'Only POST is allowed'
    }})
  }
  const audio = req.body.file
  if (!audio || typeof audio !== 'string') {
    res.status(400).json({
      error: {
        message: 'Please send valid speech data in base64.',
      },
    })
    return
  }

  try {
    const base64data = audio.replace('data:audio/mpeg;base64,', '')
    let file = Buffer.from(base64data, 'base64')
    console.log({ in: file.byteLength })

    const body = new FormData()
    body.append('file', file, { filename: 'speech.mp3' })
    body.append('model', 'whisper-1')
    body.append('temperature', '0.1')
    body.append('language', 'en')
    const headers = {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'multipart/form-data',
    }
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      body,
      { headers }
    )
    const { text } = await response.data
    console.log('onTrascribing', { text })
    if (text) {
      res.status(200).json({ text })
    } else {
      res.status(204).json({ text: null })
    }
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`)
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        },
      })
    }
  }
}

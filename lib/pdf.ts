import { validateEnv } from './env'

export interface PDFOptions {
  html: string
  filename?: string
  landscape?: boolean
  format?: 'A4' | 'Letter'
}

export async function generatePDF(options: PDFOptions): Promise<Buffer> {
  const env = validateEnv()
  
  if (!env.PDFSHIFT_API_KEY) {
    throw new Error('PDF generation is not configured. Please contact support.')
  }
  
  try {
    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`api:${env.PDFSHIFT_API_KEY}`).toString('base64')}`,
      },
      body: JSON.stringify({
        source: options.html,
        landscape: options.landscape ?? false,
        format: options.format ?? 'A4',
      }),
    })
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('PDFShift API error:', errorText)
      
      if (response.status === 401) {
        throw new Error('PDF generation service authentication failed. Please try again later.')
      }
      
      if (response.status === 429) {
        throw new Error('PDF generation rate limit exceeded. Please try again in a few minutes.')
      }
      
      if (response.status >= 500) {
        throw new Error('PDF generation service is temporarily unavailable. Please try again later.')
      }
      
      throw new Error('Failed to generate PDF. Please check your content and try again.')
    }
    
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    // If it's already a user-friendly PDF error, re-throw it
    if (error instanceof Error && error.message.includes('PDF generation')) {
      throw error
    }
    
    // Transform network and other errors into user-friendly messages
    console.error('Unexpected PDF generation error:', error)
    throw new Error('Failed to generate PDF. Please try again later.')
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { generatePDF } from '@/lib/pdf'

export async function POST(req: NextRequest) {
  try {
    // Extract IP address for rate limiting
    const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? 'unknown'
    
    // Check rate limit
    const { success, limit, remaining, reset } = await checkRateLimit(ip)
    
    // Always include rate limit headers
    const headers = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    }
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetAt: new Date(reset * 1000).toISOString()
        },
        { 
          status: 429,
          headers
        }
      )
    }
    
    // Parse request body
    const body = await req.json().catch(() => null)
    
    if (!body || typeof body.html !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request. HTML content is required.' },
        { status: 400, headers }
      )
    }
    
    // Generate PDF
    const pdfBuffer = await generatePDF({
      html: body.html,
      filename: body.filename,
      landscape: body.landscape,
      format: body.format,
    })
    
    // Return PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${body.filename || 'document.pdf'}"`,
      },
    })
  } catch (error) {
    console.error('PDF API error:', error)
    
    // Return user-friendly error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred. Please try again later.'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

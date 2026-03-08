import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { generatePDF } from '@/lib/pdf'

// Mock the global fetch function
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('PDF generation wrapper', () => {
  beforeEach(() => {
    // Set up test environment variables
    process.env.PDFSHIFT_API_KEY = 'test-api-key'
    process.env.CONVEX_DEPLOYMENT = 'test-deployment'
    process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test.convex.cloud'
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_123'
    process.env.CLERK_SECRET_KEY = 'sk_test_123'
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
    process.env.POLAR_ACCESS_TOKEN = 'test-access-token'
    process.env.POLAR_WEBHOOK_SECRET = 'test-webhook-secret'
    process.env.NODE_ENV = 'test'
    
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should call PDFShift API with correct parameters', async () => {
    const mockPdfContent = 'mock-pdf-content'
    const mockPdfBuffer = Buffer.from(mockPdfContent)
    const mockArrayBuffer = mockPdfBuffer.buffer.slice(
      mockPdfBuffer.byteOffset,
      mockPdfBuffer.byteOffset + mockPdfBuffer.byteLength
    )
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => mockArrayBuffer,
    })

    await generatePDF({
      html: '<h1>Test</h1>',
      landscape: true,
      format: 'Letter',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.pdfshift.io/v3/convert/pdf',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Basic'),
        }),
        body: JSON.stringify({
          source: '<h1>Test</h1>',
          landscape: true,
          format: 'Letter',
        }),
      })
    )
  })

  it('should return Buffer on success', async () => {
    const mockPdfContent = 'mock-pdf-content'
    const mockPdfBuffer = Buffer.from(mockPdfContent)
    const mockArrayBuffer = mockPdfBuffer.buffer.slice(
      mockPdfBuffer.byteOffset,
      mockPdfBuffer.byteOffset + mockPdfBuffer.byteLength
    )
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => mockArrayBuffer,
    })

    const result = await generatePDF({
      html: '<h1>Test</h1>',
    })

    expect(result).toBeInstanceOf(Buffer)
    expect(result.toString()).toBe(mockPdfContent)
  })

  it('should throw user-friendly error on 401 API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    })

    await expect(
      generatePDF({ html: '<h1>Test</h1>' })
    ).rejects.toThrow('PDF generation service authentication failed')
  })

  it('should throw user-friendly error on 429 rate limit', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => 'Rate limit exceeded',
    })

    await expect(
      generatePDF({ html: '<h1>Test</h1>' })
    ).rejects.toThrow('PDF generation rate limit exceeded')
  })

  it('should throw user-friendly error on 500 server error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal server error',
    })

    await expect(
      generatePDF({ html: '<h1>Test</h1>' })
    ).rejects.toThrow('PDF generation service is temporarily unavailable')
  })

  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(
      generatePDF({ html: '<h1>Test</h1>' })
    ).rejects.toThrow('Failed to generate PDF. Please try again later.')
  })

  it('should use default values for optional parameters', async () => {
    const mockPdfContent = 'mock-pdf-content'
    const mockPdfBuffer = Buffer.from(mockPdfContent)
    const mockArrayBuffer = mockPdfBuffer.buffer.slice(
      mockPdfBuffer.byteOffset,
      mockPdfBuffer.byteOffset + mockPdfBuffer.byteLength
    )
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => mockArrayBuffer,
    })

    await generatePDF({
      html: '<h1>Test</h1>',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.pdfshift.io/v3/convert/pdf',
      expect.objectContaining({
        body: JSON.stringify({
          source: '<h1>Test</h1>',
          landscape: false,
          format: 'A4',
        }),
      })
    )
  })
})

import { NextRequest, NextResponse } from 'next/server'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { api } from '@/convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('webhook-signature')
  
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }
  
  try {
    const event = validateEvent(
      body,
      { 'webhook-signature': signature },
      process.env.POLAR_WEBHOOK_SECRET!
    )
    
    switch (event.type) {
      case 'subscription.created':
      case 'subscription.updated':
        await convex.mutation(api.users.updateSubscription, {
          userId: event.data.customerId,
          subscriptionId: event.data.id,
          status: event.data.status as 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid',
        })
        break
        
      case 'order.created':
        // Handle order completion (similar to checkout.completed)
        await convex.mutation(api.users.handleCheckout, {
          userId: event.data.customerId,
          checkoutId: event.data.id,
        })
        break
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
}

import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const updateSubscription = mutation({
  args: {
    userId: v.string(),
    subscriptionId: v.string(),
    status: v.union(
      v.literal('active'),
      v.literal('canceled'),
      v.literal('past_due'),
      v.literal('trialing'),
      v.literal('incomplete'),
      v.literal('incomplete_expired'),
      v.literal('unpaid')
    ),
  },
  handler: async (ctx, args) => {
    // Find user by Clerk ID (userId is customer_id from Polar)
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), args.userId))
      .first()

    if (!user) {
      throw new Error(`User not found: ${args.userId}`)
    }

    // Update subscription information
    await ctx.db.patch(user._id, {
      subscriptionId: args.subscriptionId,
      subscriptionStatus: args.status,
      updatedAt: Date.now(),
    })
  },
})

export const handleCheckout = mutation({
  args: {
    userId: v.string(),
    checkoutId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by Clerk ID (userId is customer_id from Polar)
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), args.userId))
      .first()

    if (!user) {
      throw new Error(`User not found: ${args.userId}`)
    }

    // Handle checkout completion
    // This could involve activating a subscription, granting access, etc.
    await ctx.db.patch(user._id, {
      updatedAt: Date.now(),
    })
  },
})

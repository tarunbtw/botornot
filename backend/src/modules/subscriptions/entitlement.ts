import { db } from '../../db/index.js'
import { userProfile } from '../../db/schema/users.js'
import { subscription } from '../../db/schema/subscriptions.js'
import { eq, and, gt } from 'drizzle-orm'

export const entitlementService = {
  async hasActivePro(userId: string): Promise<boolean> {
    const profile = await db.query.userProfile.findFirst({
      where: eq(userProfile.userId, userId),
    })

    if (!profile) return false

    // Direct pro flag check
    if (profile.isPro) {
      if (!profile.proExpiresAt || new Date(profile.proExpiresAt) > new Date()) {
        return true
      }
    }

    // Active subscription check
    const activeSub = await db.query.subscription.findFirst({
      where: and(
        eq(subscription.userId, userId),
        eq(subscription.status, 'active'),
        gt(subscription.expiresAt, new Date()),
      ),
    })

    return !!activeSub
  },
}

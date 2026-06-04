/**
 * Hook: useBadgeVariant
 * Manages badge variant assignment and tracking for the current user
 */

import { useEffect, useState } from 'react';
import { BadgeType } from '@/app/generated/prisma/client';
import {
  getUserBadgeVariant,
  getBadgeImagePath,
  type BadgeVariant,
} from '@/lib/badge-variant-config';
import { logBadgeVariantViewed } from '@/lib/badge-variants-service';

interface UseBadgeVariantOptions {
  studentId?: string;
  badgeType?: BadgeType;
  autoTrackView?: boolean;
}

export function useBadgeVariant({
  studentId,
  badgeType,
  autoTrackView = true,
}: UseBadgeVariantOptions = {}) {
  const [variant, setVariant] = useState<BadgeVariant>('current');
  const [imagePath, setImagePath] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get the user's assigned variant
    const userVariant = getUserBadgeVariant(studentId);
    setVariant(userVariant);

    // Set image path if badge type is provided
    if (badgeType) {
      const path = getBadgeImagePath(badgeType, userVariant);
      setImagePath(path);

      // Auto-track view
      if (autoTrackView && studentId) {
        logBadgeVariantViewed(studentId, badgeType, userVariant);
      }
    }

    setIsLoading(false);
  }, [studentId, badgeType, autoTrackView]);

  return {
    variant,
    imagePath,
    isLoading,
  };
}

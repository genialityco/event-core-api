import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY = 'feature_required';

/**
 * Decorador para marcar un endpoint o controller como dependiente de un feature flag.
 * Úsalo junto con FeatureGuard.
 *
 * Ejemplo:
 *   @UseGuards(FirebaseAuthGuard, FeatureGuard)
 *   @FeatureRequired('travel')
 *   @Get()
 *   findAll() { ... }
 */
export const FeatureRequired = (feature: string) =>
  SetMetadata(FEATURE_KEY, feature);

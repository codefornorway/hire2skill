import type { IconProps, IconWeight } from '@phosphor-icons/react'

/** Visual defaults for category tiles (Phosphor icons). */
export const CATEGORY_ICON_WEIGHT: IconWeight = 'fill'

export function categoryIconProps(
  size: number,
  color: string,
  overrides?: Partial<Pick<IconProps, 'weight' | 'mirrored'>>,
): Pick<IconProps, 'size' | 'color' | 'weight' | 'mirrored'> {
  return {
    size,
    color,
    weight: overrides?.weight ?? CATEGORY_ICON_WEIGHT,
    mirrored: overrides?.mirrored,
  }
}

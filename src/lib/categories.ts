import type { ElementType } from 'react'
import {
  AppWindow,
  Baby,
  Broom,
  Cake,
  ChalkboardTeacher,
  Camera,
  Car,
  Confetti,
  CookingPot,
  Couch,
  Dog,
  FlowerTulip,
  HairDryer,
  Hammer,
  HandHeart,
  Laptop,
  MusicNotes,
  Needle,
  Package,
  PaintBrushBroad,
  PaintRoller,
  PawPrint,
  PersonSimpleRun,
  Snowflake,
  ShoppingBag,
  SteeringWheel,
  Truck,
  Yarn,
} from '@phosphor-icons/react'

export type CategoryDefinition = {
  key: string
  label: string
  bg: string
  color: string
  Icon: ElementType
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  { key: 'cleaning', label: 'Cleaning', bg: '#ECFDF3', color: '#047857', Icon: Broom },
  { key: 'moving', label: 'Moving', bg: '#EFF6FF', color: '#1D4ED8', Icon: Truck },
  { key: 'tutoring', label: 'Tutoring', bg: '#FFFBEB', color: '#B45309', Icon: ChalkboardTeacher },
  { key: 'delivery', label: 'Delivery', bg: '#FFF7ED', color: '#C2410C', Icon: Package },
  { key: 'handyman', label: 'Handyman', bg: '#F5F3FF', color: '#6D28D9', Icon: Hammer },
  { key: 'events', label: 'Events', bg: '#FFF1F2', color: '#BE123C', Icon: Confetti },
  { key: 'it', label: 'IT & Tech', bg: '#F0F9FF', color: '#0C4A6E', Icon: Laptop },
  { key: 'gardening', label: 'Gardening', bg: '#F0FDF4', color: '#166534', Icon: FlowerTulip },
  { key: 'petcare', label: 'Pet Care', bg: '#FFF7ED', color: '#C2410C', Icon: PawPrint },
  { key: 'cooking', label: 'Cooking', bg: '#FEF2F2', color: '#B91C1C', Icon: CookingPot },
  { key: 'shopping', label: 'Shopping', bg: '#F5F3FF', color: '#7C3AED', Icon: ShoppingBag },
  { key: 'knitting', label: 'Knitting', bg: '#FDF4FF', color: '#A21CAF', Icon: Yarn },
  { key: 'sewing', label: 'Sewing', bg: '#ECFEFF', color: '#0E7490', Icon: Needle },
  { key: 'kidscare', label: 'Kids Care', bg: '#FEFCE8', color: '#A16207', Icon: Baby },
  { key: 'carwash', label: 'Car Wash', bg: '#E0F2FE', color: '#0369A1', Icon: Car },
  { key: 'painting', label: 'Painting', bg: '#EEF2FF', color: '#4338CA', Icon: PaintRoller },
  { key: 'makeup', label: 'Makeup Artist', bg: '#FDF2F8', color: '#BE185D', Icon: PaintBrushBroad },
  { key: 'hairdresser', label: 'Hair Dresser', bg: '#F3E8FF', color: '#7E22CE', Icon: HairDryer },
  { key: 'snowremoval', label: 'Snow Removal', bg: '#EFF6FF', color: '#1E3A8A', Icon: Snowflake },
  { key: 'dogwalking', label: 'Dog Walking', bg: '#FEF9C3', color: '#854D0E', Icon: Dog },
  { key: 'furnitureassembly', label: 'Furniture Assembly', bg: '#F5F3FF', color: '#5B21B6', Icon: Couch },
  { key: 'windowcleaning', label: 'Window Cleaning', bg: '#ECFEFF', color: '#155E75', Icon: AppWindow },
  { key: 'photography', label: 'Photography', bg: '#FFF1F2', color: '#9F1239', Icon: Camera },
  { key: 'personaltraining', label: 'Personal Training', bg: '#ECFDF3', color: '#166534', Icon: PersonSimpleRun },
  { key: 'eldercare', label: 'Elder Care', bg: '#FFF7ED', color: '#9A3412', Icon: HandHeart },
  { key: 'musiclessons', label: 'Music Lessons', bg: '#EEF2FF', color: '#3730A3', Icon: MusicNotes },
  { key: 'baking', label: 'Baking', bg: '#FDF4FF', color: '#A21CAF', Icon: Cake },
  { key: 'drivinglessons', label: 'Driving Lessons', bg: '#FEF9C3', color: '#713F12', Icon: SteeringWheel },
]

export const CATEGORY_BY_KEY: Record<string, CategoryDefinition> = Object.fromEntries(
  CATEGORY_DEFINITIONS.map((cat) => [cat.key, cat]),
)

export const CATEGORY_KEY_BY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORY_DEFINITIONS.map((cat) => [cat.label, cat.key]),
)

export const CATEGORY_LABEL_BY_KEY: Record<string, string> = Object.fromEntries(
  CATEGORY_DEFINITIONS.map((cat) => [cat.key, cat.label]),
)

export const CATEGORY_LABELS = CATEGORY_DEFINITIONS.map((cat) => cat.label)
export const CATEGORY_KEYS = CATEGORY_DEFINITIONS.map((cat) => cat.key)

export function toCategoryKey(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (CATEGORY_BY_KEY[trimmed]) return trimmed
  if (CATEGORY_KEY_BY_LABEL[trimmed]) return CATEGORY_KEY_BY_LABEL[trimmed]
  return trimmed.toLowerCase().replace(/\s+/g, '').replace('&', '')
}

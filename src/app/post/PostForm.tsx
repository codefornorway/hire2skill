'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CATEGORY_LABELS, CATEGORY_BY_KEY, toCategoryKey } from '@/lib/categories'
import { categoryIconProps } from '@/lib/category-icon'
import { useLanguage } from '@/context/LanguageContext'
import { formatDateByLocale } from '@/lib/i18n/date'

const CATEGORIES: { key: string; bg: string; color: string; Icon: React.ElementType }[] = CATEGORY_LABELS
  .map((label) => {
    const meta = CATEGORY_BY_KEY[toCategoryKey(label)]
    if (!meta) return null
    return { key: label, bg: meta.bg, color: meta.color, Icon: meta.Icon }
  })
  .filter((cat): cat is { key: string; bg: string; color: string; Icon: React.ElementType } => Boolean(cat))

type ScopingQ = { id: string; label: string; options: string[] }
const SCOPING_QUESTIONS: Record<string, ScopingQ[]> = {
  'Cleaning': [
    { id: 'size',     label: 'Property size',        options: ['Studio / 1 room', '2 rooms', '3 rooms', '4 rooms', '5+ rooms'] },
    { id: 'type',     label: 'Type of clean',        options: ['Regular clean', 'Deep clean', 'Move-in/out clean', 'After-party clean'] },
    { id: 'supplies', label: 'Cleaning supplies',    options: ['I have supplies', 'Helper should bring supplies'] },
  ],
  'Moving': [
    { id: 'size',     label: 'Property size',        options: ['Studio / 1 room', '2 rooms', '3 rooms', '4+ rooms'] },
    { id: 'distance', label: 'Moving distance',      options: ['Same building', 'Same neighbourhood', 'Same city', 'Different city'] },
    { id: 'elevator', label: 'Elevator available?',  options: ['Yes – elevator', 'No – stairs only'] },
    { id: 'packing',  label: 'Packing help needed?', options: ['Yes, help with packing', 'No, just transport'] },
  ],
  'Handyman': [
    { id: 'jobType',  label: 'Type of job',          options: ['Repair', 'Installation', 'Assembly', 'Other'] },
    { id: 'urgency',  label: 'How urgent?',           options: ['Today / ASAP', 'This week', 'Flexible timing'] },
  ],
  'Tutoring': [
    { id: 'subject',  label: 'Subject',               options: ['Maths', 'Science', 'English', 'Norwegian', 'History', 'Other'] },
    { id: 'level',    label: 'Student level',         options: ['Primary school', 'Secondary school', 'Videregående', 'University / Adult'] },
  ],
  'Gardening': [
    { id: 'area',     label: 'Garden size',           options: ['Small (< 50m²)', 'Medium (50–200m²)', 'Large (200m²+)'] },
    { id: 'task',     label: 'Main task',             options: ['Lawn mowing', 'Weeding', 'Planting', 'General tidy-up', 'Everything'] },
  ],
  'Furniture Assembly': [
    { id: 'items',    label: 'Number of items',       options: ['1 item', '2–3 items', '4–6 items', '7+ items'] },
    { id: 'brand',    label: 'Brand / type',          options: ['IKEA flat-pack', 'Other flat-pack', 'Bespoke furniture'] },
  ],
  'Painting': [
    { id: 'scope',    label: 'What to paint',         options: ['Single wall', 'Full room', 'Multiple rooms', 'Exterior'] },
    { id: 'prep',     label: 'Surface prep needed?',  options: ['Yes – sanding / filling', 'No – ready to paint'] },
  ],
  'Dog Walking': [
    { id: 'dogs',     label: 'Number of dogs',        options: ['1 dog', '2 dogs', '3+ dogs'] },
    { id: 'duration', label: 'Walk duration',         options: ['30 minutes', '1 hour', 'Over 1 hour'] },
  ],
  'IT & Tech': [
    { id: 'task',     label: 'What do you need help with?', options: ['Computer / laptop', 'WiFi / network', 'Software / apps', 'TV / smart home', 'Phone / tablet', 'Other'] },
  ],
  'Personal Training': [
    { id: 'where',    label: 'Where to train?',       options: ['At home', 'In a park / outdoors', 'At a gym (I provide access)'] },
    { id: 'goal',     label: 'Main goal',             options: ['Weight loss', 'Strength & muscle', 'Fitness & endurance', 'Rehabilitation'] },
  ],
  'Snow Removal': [
    { id: 'area',     label: 'Area to clear',         options: ['Driveway only', 'Walkway / entrance', 'Roof snow', 'Everything'] },
    { id: 'urgency',  label: 'Urgency',               options: ['Today / ASAP', 'Within 24h', 'Flexible'] },
  ],
  'Window Cleaning': [
    { id: 'count',    label: 'Number of windows',     options: ['1–5 windows', '6–15 windows', '16+ windows'] },
    { id: 'floors',   label: 'Floor level',           options: ['Ground floor only', 'Up to 2nd floor', 'Higher floors (specialist needed)'] },
  ],
  'Kids Care': [
    { id: 'kids',     label: 'Number of children',    options: ['1 child', '2 children', '3+ children'] },
    { id: 'age',      label: 'Age of youngest child', options: ['Under 2 years', '2–5 years', '6–10 years', '11+ years'] },
  ],
  'Elder Care': [
    { id: 'type',     label: 'Type of assistance',    options: ['Companionship / visits', 'Errands & shopping', 'Meal preparation', 'Personal care support', 'Transport'] },
    { id: 'freq',     label: 'Frequency',             options: ['One-off visit', 'A few times per week', 'Daily'] },
  ],
}

const SCOPING_TRANSLATIONS: Record<'no' | 'da' | 'sv', Record<string, string>> = {
  no: {
    'Property size': 'Boligstørrelse',
    'Studio / 1 room': 'Hybel / 1 rom',
    '2 rooms': '2 rom',
    '3 rooms': '3 rom',
    '4 rooms': '4 rom',
    '5+ rooms': '5+ rom',
    'Type of clean': 'Type rengjøring',
    'Regular clean': 'Vanlig rengjøring',
    'Deep clean': 'Grundig rengjøring',
    'Move-in/out clean': 'Inn-/utflyttingsvask',
    'After-party clean': 'Etter-fest rengjøring',
    'Cleaning supplies': 'Rengjøringsutstyr',
    'I have supplies': 'Jeg har utstyr',
    'Helper should bring supplies': 'Hjelper bør ta med utstyr',
    'Moving distance': 'Flytteavstand',
    'Same building': 'Samme bygning',
    'Same neighbourhood': 'Samme nabolag',
    'Same city': 'Samme by',
    'Different city': 'Annen by',
    'Elevator available?': 'Heis tilgjengelig?',
    'Yes – elevator': 'Ja – heis',
    'No – stairs only': 'Nei – kun trapper',
    'Packing help needed?': 'Trenger du pakkehjelp?',
    'Yes, help with packing': 'Ja, hjelp med pakking',
    'No, just transport': 'Nei, kun transport',
    'Type of job': 'Type jobb',
    Repair: 'Reparasjon',
    Installation: 'Installasjon',
    Assembly: 'Montering',
    Other: 'Annet',
    'How urgent?': 'Hvor haster det?',
    'Today / ASAP': 'I dag / ASAP',
    'This week': 'Denne uken',
    'Flexible timing': 'Fleksibelt tidspunkt',
    Subject: 'Fag',
    Maths: 'Matte',
    Science: 'Naturfag',
    English: 'Engelsk',
    Norwegian: 'Norsk',
    History: 'Historie',
    'Student level': 'Nivå',
    'Primary school': 'Barneskole',
    'Secondary school': 'Ungdomsskole',
    Videregående: 'Videregående',
    'University / Adult': 'Universitet / Voksen',
    'Garden size': 'Hagestørrelse',
    'Small (< 50m²)': 'Liten (< 50m²)',
    'Medium (50–200m²)': 'Middels (50–200m²)',
    'Large (200m²+)': 'Stor (200m²+)',
    'Main task': 'Hovedoppgave',
    'Lawn mowing': 'Plenklipping',
    Weeding: 'Luking',
    Planting: 'Planting',
    'General tidy-up': 'Generell rydding',
    Everything: 'Alt',
    'Number of items': 'Antall møbler',
    '1 item': '1 møbel',
    '2–3 items': '2–3 møbler',
    '4–6 items': '4–6 møbler',
    '7+ items': '7+ møbler',
    'Brand / type': 'Merke / type',
    'IKEA flat-pack': 'IKEA flatpakke',
    'Other flat-pack': 'Annen flatpakke',
    'Bespoke furniture': 'Spesialtilpassede møbler',
    'What to paint': 'Hva skal males',
    'Single wall': 'En vegg',
    'Full room': 'Hele rommet',
    'Multiple rooms': 'Flere rom',
    Exterior: 'Utvendig',
    'Surface prep needed?': 'Trengs overflateforberedelse?',
    'Yes – sanding / filling': 'Ja – sliping / sparkling',
    'No – ready to paint': 'Nei – klart til maling',
    'Number of dogs': 'Antall hunder',
    '1 dog': '1 hund',
    '2 dogs': '2 hunder',
    '3+ dogs': '3+ hunder',
    'Walk duration': 'Varighet på tur',
    '30 minutes': '30 minutter',
    '1 hour': '1 time',
    'Over 1 hour': 'Over 1 time',
    'What do you need help with?': 'Hva trenger du hjelp med?',
    'Computer / laptop': 'Datamaskin / laptop',
    'WiFi / network': 'WiFi / nettverk',
    'Software / apps': 'Programvare / apper',
    'TV / smart home': 'TV / smarthjem',
    'Phone / tablet': 'Telefon / nettbrett',
    'Where to train?': 'Hvor vil du trene?',
    'At home': 'Hjemme',
    'In a park / outdoors': 'I park / utendørs',
    'At a gym (I provide access)': 'På treningssenter (jeg ordner tilgang)',
    'Main goal': 'Hovedmål',
    'Weight loss': 'Vektnedgang',
    'Strength & muscle': 'Styrke og muskler',
    'Fitness & endurance': 'Kondisjon og utholdenhet',
    Rehabilitation: 'Rehabilitering',
    'Area to clear': 'Område som skal ryddes',
    'Driveway only': 'Kun innkjørsel',
    'Walkway / entrance': 'Gangvei / inngang',
    'Roof snow': 'Snø på tak',
    Urgency: 'Hast',
    'Within 24h': 'Innen 24 t',
    Flexible: 'Fleksibelt',
    'Number of windows': 'Antall vinduer',
    '1–5 windows': '1–5 vinduer',
    '6–15 windows': '6–15 vinduer',
    '16+ windows': '16+ vinduer',
    'Floor level': 'Etasje',
    'Ground floor only': 'Kun bakkeplan',
    'Up to 2nd floor': 'Opptil 2. etasje',
    'Higher floors (specialist needed)': 'Høyere etasjer (spesialist trengs)',
    'Number of children': 'Antall barn',
    '1 child': '1 barn',
    '2 children': '2 barn',
    '3+ children': '3+ barn',
    'Age of youngest child': 'Alder på yngste barn',
    'Under 2 years': 'Under 2 år',
    '2–5 years': '2–5 år',
    '6–10 years': '6–10 år',
    '11+ years': '11+ år',
    'Type of assistance': 'Type hjelp',
    'Companionship / visits': 'Selskap / besøk',
    'Errands & shopping': 'Ærend og handling',
    'Meal preparation': 'Matlaging',
    'Personal care support': 'Personlig omsorg',
    Transport: 'Transport',
    Frequency: 'Hyppighet',
    'One-off visit': 'Engangsbesøk',
    'A few times per week': 'Noen ganger per uke',
    Daily: 'Daglig',
  },
  da: {
    'Property size': 'Boligstørrelse',
    'Studio / 1 room': 'Studio / 1 værelse',
    '2 rooms': '2 værelser',
    '3 rooms': '3 værelser',
    '4 rooms': '4 værelser',
    '5+ rooms': '5+ værelser',
    'Type of clean': 'Type rengøring',
    'Regular clean': 'Almindelig rengøring',
    'Deep clean': 'Hovedrengøring',
    'Move-in/out clean': 'Flytte-rengøring',
    'After-party clean': 'Efter-fest rengøring',
    'Cleaning supplies': 'Rengøringsmidler',
    'I have supplies': 'Jeg har rengøringsmidler',
    'Helper should bring supplies': 'Hjælper skal medbringe rengøringsmidler',
    'Moving distance': 'Flytteafstand',
    'Same building': 'Samme bygning',
    'Same neighbourhood': 'Samme kvarter',
    'Same city': 'Samme by',
    'Different city': 'Anden by',
    'Elevator available?': 'Er der elevator?',
    'Yes – elevator': 'Ja – elevator',
    'No – stairs only': 'Nej – kun trapper',
    'Packing help needed?': 'Behov for pakkehjælp?',
    'Yes, help with packing': 'Ja, hjælp med pakning',
    'No, just transport': 'Nej, kun transport',
    'Type of job': 'Jobtype',
    Repair: 'Reparation',
    Installation: 'Installation',
    Assembly: 'Montering',
    Other: 'Andet',
    'How urgent?': 'Hvor akut?',
    'Today / ASAP': 'I dag / hurtigst muligt',
    'This week': 'Denne uge',
    'Flexible timing': 'Fleksibelt tidspunkt',
    Subject: 'Fag',
    Maths: 'Matematik',
    Science: 'Naturfag',
    English: 'Engelsk',
    Norwegian: 'Norsk',
    History: 'Historie',
    'Student level': 'Niveau',
    'Primary school': 'Folkeskole (indskoling)',
    'Secondary school': 'Folkeskole (udskoling)',
    Videregående: 'Gymnasium',
    'University / Adult': 'Universitet / Voksen',
    'Garden size': 'Havestørrelse',
    'Small (< 50m²)': 'Lille (< 50m²)',
    'Medium (50–200m²)': 'Mellem (50–200m²)',
    'Large (200m²+)': 'Stor (200m²+)',
    'Main task': 'Hovedopgave',
    'Lawn mowing': 'Græsslåning',
    Weeding: 'Lugning',
    Planting: 'Plantning',
    'General tidy-up': 'Generel oprydning',
    Everything: 'Alt',
    'Number of items': 'Antal møbler',
    '1 item': '1 møbel',
    '2–3 items': '2–3 møbler',
    '4–6 items': '4–6 møbler',
    '7+ items': '7+ møbler',
    'Brand / type': 'Mærke / type',
    'IKEA flat-pack': 'IKEA flatpack',
    'Other flat-pack': 'Anden flatpack',
    'Bespoke furniture': 'Specialfremstillede møbler',
    'What to paint': 'Hvad skal males',
    'Single wall': 'En væg',
    'Full room': 'Hele rummet',
    'Multiple rooms': 'Flere rum',
    Exterior: 'Udvendigt',
    'Surface prep needed?': 'Skal overfladen forberedes?',
    'Yes – sanding / filling': 'Ja – slibning / spartling',
    'No – ready to paint': 'Nej – klar til maling',
    'Number of dogs': 'Antal hunde',
    '1 dog': '1 hund',
    '2 dogs': '2 hunde',
    '3+ dogs': '3+ hunde',
    'Walk duration': 'Gåturens varighed',
    '30 minutes': '30 minutter',
    '1 hour': '1 time',
    'Over 1 hour': 'Over 1 time',
    'What do you need help with?': 'Hvad har du brug for hjælp til?',
    'Computer / laptop': 'Computer / laptop',
    'WiFi / network': 'WiFi / netværk',
    'Software / apps': 'Software / apps',
    'TV / smart home': 'TV / smart home',
    'Phone / tablet': 'Telefon / tablet',
    'Where to train?': 'Hvor vil du træne?',
    'At home': 'Hjemme',
    'In a park / outdoors': 'I en park / udendørs',
    'At a gym (I provide access)': 'I fitnesscenter (jeg sørger for adgang)',
    'Main goal': 'Hovedmål',
    'Weight loss': 'Vægttab',
    'Strength & muscle': 'Styrke og muskler',
    'Fitness & endurance': 'Kondition og udholdenhed',
    Rehabilitation: 'Rehabilitering',
    'Area to clear': 'Område der skal ryddes',
    'Driveway only': 'Kun indkørsel',
    'Walkway / entrance': 'Gangsti / indgang',
    'Roof snow': 'Sne på tag',
    Urgency: 'Haster',
    'Within 24h': 'Inden for 24 t',
    Flexible: 'Fleksibelt',
    'Number of windows': 'Antal vinduer',
    '1–5 windows': '1–5 vinduer',
    '6–15 windows': '6–15 vinduer',
    '16+ windows': '16+ vinduer',
    'Floor level': 'Etage',
    'Ground floor only': 'Kun stueplan',
    'Up to 2nd floor': 'Op til 2. sal',
    'Higher floors (specialist needed)': 'Højere etager (specialist kræves)',
    'Number of children': 'Antal børn',
    '1 child': '1 barn',
    '2 children': '2 børn',
    '3+ children': '3+ børn',
    'Age of youngest child': 'Alder på yngste barn',
    'Under 2 years': 'Under 2 år',
    '2–5 years': '2–5 år',
    '6–10 years': '6–10 år',
    '11+ years': '11+ år',
    'Type of assistance': 'Type hjælp',
    'Companionship / visits': 'Selskab / besøg',
    'Errands & shopping': 'Ærinder og indkøb',
    'Meal preparation': 'Madlavning',
    'Personal care support': 'Personlig pleje',
    Transport: 'Transport',
    Frequency: 'Frekvens',
    'One-off visit': 'Engangsbesøg',
    'A few times per week': 'Et par gange om ugen',
    Daily: 'Dagligt',
  },
  sv: {
    'Property size': 'Bostadens storlek',
    'Studio / 1 room': 'Studio / 1 rum',
    '2 rooms': '2 rum',
    '3 rooms': '3 rum',
    '4 rooms': '4 rum',
    '5+ rooms': '5+ rum',
    'Type of clean': 'Typ av städning',
    'Regular clean': 'Vanlig städning',
    'Deep clean': 'Djuprengöring',
    'Move-in/out clean': 'Flyttstädning',
    'After-party clean': 'Efter-fest städning',
    'Cleaning supplies': 'Städmaterial',
    'I have supplies': 'Jag har material',
    'Helper should bring supplies': 'Hjälparen ska ta med material',
    'Moving distance': 'Flyttavstånd',
    'Same building': 'Samma byggnad',
    'Same neighbourhood': 'Samma område',
    'Same city': 'Samma stad',
    'Different city': 'Annan stad',
    'Elevator available?': 'Finns hiss?',
    'Yes – elevator': 'Ja – hiss',
    'No – stairs only': 'Nej – endast trappor',
    'Packing help needed?': 'Behövs hjälp med packning?',
    'Yes, help with packing': 'Ja, hjälp med packning',
    'No, just transport': 'Nej, bara transport',
    'Type of job': 'Typ av jobb',
    Repair: 'Reparation',
    Installation: 'Installation',
    Assembly: 'Montering',
    Other: 'Annat',
    'How urgent?': 'Hur brådskande?',
    'Today / ASAP': 'Idag / ASAP',
    'This week': 'Den här veckan',
    'Flexible timing': 'Flexibel tid',
    Subject: 'Ämne',
    Maths: 'Matematik',
    Science: 'Naturvetenskap',
    English: 'Engelska',
    Norwegian: 'Norska',
    History: 'Historia',
    'Student level': 'Nivå',
    'Primary school': 'Lågstadiet',
    'Secondary school': 'Högstadiet',
    Videregående: 'Gymnasiet',
    'University / Adult': 'Universitet / Vuxen',
    'Garden size': 'Trädgårdens storlek',
    'Small (< 50m²)': 'Liten (< 50m²)',
    'Medium (50–200m²)': 'Mellan (50–200m²)',
    'Large (200m²+)': 'Stor (200m²+)',
    'Main task': 'Huvuduppgift',
    'Lawn mowing': 'Gräsklippning',
    Weeding: 'Rensning',
    Planting: 'Plantering',
    'General tidy-up': 'Allmän uppsnyggning',
    Everything: 'Allt',
    'Number of items': 'Antal möbler',
    '1 item': '1 möbel',
    '2–3 items': '2–3 möbler',
    '4–6 items': '4–6 möbler',
    '7+ items': '7+ möbler',
    'Brand / type': 'Märke / typ',
    'IKEA flat-pack': 'IKEA flatpack',
    'Other flat-pack': 'Annan flatpack',
    'Bespoke furniture': 'Specialbeställda möbler',
    'What to paint': 'Vad ska målas',
    'Single wall': 'En vägg',
    'Full room': 'Hela rummet',
    'Multiple rooms': 'Flera rum',
    Exterior: 'Utomhus',
    'Surface prep needed?': 'Behövs förarbete?',
    'Yes – sanding / filling': 'Ja – slipning / spackling',
    'No – ready to paint': 'Nej – redo att måla',
    'Number of dogs': 'Antal hundar',
    '1 dog': '1 hund',
    '2 dogs': '2 hundar',
    '3+ dogs': '3+ hundar',
    'Walk duration': 'Promenadlängd',
    '30 minutes': '30 minuter',
    '1 hour': '1 timme',
    'Over 1 hour': 'Över 1 timme',
    'What do you need help with?': 'Vad behöver du hjälp med?',
    'Computer / laptop': 'Dator / laptop',
    'WiFi / network': 'WiFi / nätverk',
    'Software / apps': 'Programvara / appar',
    'TV / smart home': 'TV / smart hem',
    'Phone / tablet': 'Telefon / surfplatta',
    'Where to train?': 'Var vill du träna?',
    'At home': 'Hemma',
    'In a park / outdoors': 'I park / utomhus',
    'At a gym (I provide access)': 'På gym (jag ordnar tillgång)',
    'Main goal': 'Huvudmål',
    'Weight loss': 'Viktnedgång',
    'Strength & muscle': 'Styrka och muskler',
    'Fitness & endurance': 'Kondition och uthållighet',
    Rehabilitation: 'Rehabilitering',
    'Area to clear': 'Område att röja',
    'Driveway only': 'Endast uppfart',
    'Walkway / entrance': 'Gångväg / entré',
    'Roof snow': 'Snö på tak',
    Urgency: 'Brådska',
    'Within 24h': 'Inom 24 h',
    Flexible: 'Flexibelt',
    'Number of windows': 'Antal fönster',
    '1–5 windows': '1–5 fönster',
    '6–15 windows': '6–15 fönster',
    '16+ windows': '16+ fönster',
    'Floor level': 'Våningsplan',
    'Ground floor only': 'Endast bottenplan',
    'Up to 2nd floor': 'Upp till 2:a våningen',
    'Higher floors (specialist needed)': 'Högre våningar (specialist krävs)',
    'Number of children': 'Antal barn',
    '1 child': '1 barn',
    '2 children': '2 barn',
    '3+ children': '3+ barn',
    'Age of youngest child': 'Yngsta barnets ålder',
    'Under 2 years': 'Under 2 år',
    '2–5 years': '2–5 år',
    '6–10 years': '6–10 år',
    '11+ years': '11+ år',
    'Type of assistance': 'Typ av hjälp',
    'Companionship / visits': 'Sällskap / besök',
    'Errands & shopping': 'Ärenden och handling',
    'Meal preparation': 'Matlagning',
    'Personal care support': 'Personlig omsorg',
    Transport: 'Transport',
    Frequency: 'Frekvens',
    'One-off visit': 'Engångsbesök',
    'A few times per week': 'Några gånger per vecka',
    Daily: 'Dagligen',
  },
}

function localizeScopingText(text: string, locale: 'no' | 'en' | 'da' | 'sv') {
  if (locale === 'en') return text
  const mapped = SCOPING_TRANSLATIONS[locale]?.[text]
  return mapped ?? text
}

const NORWAY_LOCATIONS = [
  'Oslo – Sentrum', 'Oslo – Grünerløkka', 'Oslo – Grønland', 'Oslo – Tøyen',
  'Oslo – Frogner', 'Oslo – Majorstuen', 'Oslo – Skøyen', 'Oslo – Bygdøy',
  'Oslo – Sagene', 'Oslo – Nydalen', 'Oslo – Storo', 'Oslo – Furuset',
  'Oslo – Grorud', 'Oslo – Stovner', 'Oslo – Nordstrand', 'Oslo – Holmlia',
  'Bergen – Sentrum', 'Bergen – Bergenhus', 'Bergen – Sandviken', 'Bergen – Fana',
  'Bergen – Fyllingsdalen', 'Bergen – Åsane', 'Bergen – Arna', 'Bergen – Laksevåg',
  'Trondheim – Midtbyen', 'Trondheim – Nedre Elvehavn', 'Trondheim – Lerkendal',
  'Trondheim – Heimdal', 'Trondheim – Byåsen', 'Trondheim – Strindheim',
  'Stavanger – Sentrum', 'Stavanger – Storhaug', 'Stavanger – Madla',
  'Stavanger – Eiganes', 'Stavanger – Hundvåg', 'Stavanger – Tasta',
  'Kristiansand', 'Tromsø', 'Sandnes', 'Fredrikstad', 'Sarpsborg',
  'Bodø', 'Ålesund', 'Tønsberg', 'Drammen', 'Moss', 'Hamar',
  'Lillehammer', 'Molde', 'Harstad', 'Gjøvik', 'Kongsberg',
  'Bærum', 'Asker', 'Lillestrøm', 'Lørenskog', 'Ski',
]

type Step = 1 | 2 | 3 | 4

type Helper = {
  id: string
  name: string
  avatarUrl: string | null
  categories: string[]
  location: string
  hourlyRate: number | null
}

const AVATAR_COLORS = ['#2563EB', '#16A34A', '#7C3AED', '#D97706', '#E11D48', '#0284C7']

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

function getPostFormUi(locale: 'no' | 'en' | 'da' | 'sv') {
  if (locale === 'no') {
    return {
      steps: ['Velg tjeneste', 'Oppdragsdetaljer', 'Bla gjennom hjelpere', 'Bekreft'],
      titleChoose: 'Hva trenger du hjelp med?',
      subtitleChoose: 'Velg en tjenestekategori for å komme i gang.',
      taskIntro: 'Fortell oss hva du trenger gjort',
      quickQuestions: 'Korte spørsmål',
      taskTitle: 'Oppdragstittel',
      taskDescription: 'Beskriv oppdraget ditt',
      taskDescriptionPlaceholder: 'Gi detaljer om hva som skal gjøres, spesielle krav og omfang...',
      locationSearch: 'Søk by eller nabolag...',
      searchingAddresses: 'Søker etter flere adresser i nærheten…',
      budget: 'Budsjett',
      preferredDate: 'Foretrukket dato',
      optional: '(valgfritt)',
      back: '← Tilbake',
      browseHelpers: 'Bla gjennom hjelpere →',
      taskSummary: 'Oppdragssammendrag',
      budgetSummary: (value: string) => `${value} NOK budsjett`,
      fillSummary: 'Fyll ut skjemaet for å se sammendrag her.',
      availableHelpersFor: (category: string) => `Tilgjengelige hjelpere for ${category}`,
      loading: 'Laster...',
      helpersFound: (count: number, location: string) => `${count} hjelper${count !== 1 ? 'e' : ''} funnet${location ? ` nær ${location}` : ''}`,
      skipPublic: 'Hopp over → publiser offentlig',
      noHelpersFor: (category: string) => `Ingen hjelpere tilgjengelige ennå for ${category}`,
      postPublicHint: 'Publiser offentlig — hjelpere i området ditt ser og svarer på oppdraget.',
      postPublic: 'Publiser offentlig →',
      hourlyFallback: 'Kan forhandles',
      nokPerHour: 'NOK/time',
      viewProfile: 'Se profil →',
      continueWith: (name: string) => `Fortsett med ${name} →`,
      continue: 'Fortsett →',
      confirmTask: 'Bekreft oppdraget ditt',
      sectionCategory: 'Kategori',
      sectionTaskDetails: 'Oppdragsdetaljer',
      sectionSendingTo: 'Sender forespørsel til',
      change: 'Endre',
      visibility: 'Synlighet',
      visibilityHint: 'Offentlig annonse — hjelpere i ditt område vil se og svare på oppdraget ditt.',
      posting: 'Publiserer...',
      sendRequestTo: (name: string) => `Send forespørsel til ${name}`,
      postTaskPublicly: 'Publiser oppdrag offentlig',
      whatNext: 'Hva skjer videre?',
      stepNotifyWithName: (name: string) => `${name} blir varslet om forespørselen din`,
      stepNotifyPublic: 'Hjelpere nær deg blir varslet',
      stepReview: 'De vurderer oppdraget ditt og svarer',
      stepChat: 'Chat direkte for å avtale detaljer',
      stepDone: 'Få det gjort trygt — gi vurdering når det er fullført',
      messagingIncluded: '💬 Meldinger inkludert.',
      messagingBody: 'Når en hjelper svarer, kan dere chatte direkte i Hire2Skill — ingen telefonnummer trengs.',
      helperDefault: 'Hjelper',
      locationFallbackCountry: 'Norge',
      locationFallbackCity: 'Oslo',
      submitFailed: 'Kunne ikke publisere oppdraget.',
    }
  }
  return {
    steps: ['Choose service', 'Task details', 'Browse helpers', 'Confirm'],
    titleChoose: 'What do you need help with?',
    subtitleChoose: 'Pick a service category to get started.',
    taskIntro: 'Tell us what you need done',
    quickQuestions: 'Quick questions',
    taskTitle: 'Task title',
    taskDescription: 'Describe your task',
    taskDescriptionPlaceholder: 'Give details about what needs to be done, any special requirements, size of the job...',
    locationSearch: 'Search city or neighbourhood...',
    searchingAddresses: 'Searching more nearby addresses…',
    budget: 'Budget',
    preferredDate: 'Preferred date',
    optional: '(optional)',
    back: '← Back',
    browseHelpers: 'Browse helpers →',
    taskSummary: 'Task summary',
    budgetSummary: (value: string) => `${value} NOK budget`,
    fillSummary: 'Fill in the form to see your summary here.',
    availableHelpersFor: (category: string) => `Available helpers for ${category}`,
    loading: 'Loading...',
    helpersFound: (count: number, location: string) => `${count} helper${count !== 1 ? 's' : ''} found${location ? ` near ${location}` : ''}`,
    skipPublic: 'Skip → post publicly',
    noHelpersFor: (category: string) => `No helpers available yet for ${category}`,
    postPublicHint: 'Post publicly — helpers in your area will see and respond to your task.',
    postPublic: 'Post publicly →',
    hourlyFallback: 'Negotiable',
    nokPerHour: 'NOK/hr',
    viewProfile: 'View profile →',
    continueWith: (name: string) => `Continue with ${name} →`,
    continue: 'Continue →',
    confirmTask: 'Confirm your task',
    sectionCategory: 'Category',
    sectionTaskDetails: 'Task details',
    sectionSendingTo: 'Sending request to',
    change: 'Change',
    visibility: 'Visibility',
    visibilityHint: 'Public listing — helpers in your area will see and respond to your task.',
    posting: 'Posting...',
    sendRequestTo: (name: string) => `Send request to ${name}`,
    postTaskPublicly: 'Post task publicly',
    whatNext: 'What happens next?',
    stepNotifyWithName: (name: string) => `${name} gets notified of your request`,
    stepNotifyPublic: 'Helpers near you are notified',
    stepReview: 'They review your task and respond',
    stepChat: 'Chat directly to agree on details',
    stepDone: 'Get it done safely — rate when complete',
    messagingIncluded: '💬 Messaging included.',
    messagingBody: 'Once a helper responds, you can message each other directly through Hire2Skill — no phone number needed.',
    helperDefault: 'Helper',
    locationFallbackCountry: 'Norway',
    locationFallbackCity: 'Oslo',
    submitFailed: 'Failed to post task.',
  }
}

function ProgressBar({ step, labels }: { step: Step; labels: string[] }) {
  return (
    <div className="border-b border-gray-100 bg-white px-6 py-4 sticky top-18.25 z-40">
      <div className="flex items-center max-w-4xl mx-auto">
        {labels.map((label, i) => {
          const num = (i + 1) as Step
          const done = num < step
          const active = num === step
          return (
            <div key={label} className="flex items-center flex-1 min-w-0">
              <div className={`flex items-center gap-2 shrink-0 ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${
                  active ? 'border-blue-600 bg-blue-600 text-white'
                  : done  ? 'border-green-500 bg-green-500 text-white'
                  :         'border-gray-300 bg-white text-gray-400'
                }`}>
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : num}
                </div>
                <span className={`text-xs font-semibold hidden sm:block truncate ${active ? 'text-blue-700' : done ? 'text-green-700' : 'text-gray-400'}`}>{label}</span>
              </div>
              {i < 3 && (
                <div className={`h-px flex-1 mx-2 sm:mx-3 ${num < step ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function PostForm() {
  const { locale, t } = useLanguage()
  const ui = useMemo(() => getPostFormUi(locale), [locale])
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null)
  const [allHelpers, setAllHelpers] = useState<Helper[]>([])
  const [loadingHelpers, setLoadingHelpers] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [scopingAnswers, setScopingAnswers] = useState<Record<string, string>>({})
  const [locSuggestions, setLocSuggestions] = useState<string[]>([])
  const [showLocSuggestions, setShowLocSuggestions] = useState(false)
  const [locSearching, setLocSearching] = useState(false)
  const locRef = useRef<HTMLDivElement>(null)
  const locAbortRef = useRef<AbortController | null>(null)
  const localizedScopingQuestions = useMemo(() => {
    return Object.fromEntries(
      Object.entries(SCOPING_QUESTIONS).map(([cat, questions]) => [
        cat,
        questions.map((q) => ({
          ...q,
          label: localizeScopingText(q.label, locale),
          options: q.options.map((opt) => localizeScopingText(opt, locale)),
        })),
      ]),
    ) as Record<string, ScopingQ[]>
  }, [locale])

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (locRef.current && !locRef.current.contains(e.target as Node)) setShowLocSuggestions(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  useEffect(() => {
    if (step !== 3 || allHelpers.length > 0) return
    void Promise.resolve().then(() => setLoadingHelpers(true))
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('id, display_name, avatar_url, categories, location, hourly_rate')
      .eq('role', 'helper')
      .not('display_name', 'is', null)
      .order('created_at', { ascending: false })
      .limit(24)
      .then(({ data }) => {
        setAllHelpers((data ?? []).map(p => ({
          id: p.id,
          name: p.display_name ?? ui.helperDefault,
          avatarUrl: p.avatar_url ?? null,
          categories: (p.categories as string[] | null) ?? [],
          location: p.location ?? ui.locationFallbackCountry,
          hourlyRate: p.hourly_rate ?? null,
        })))
        setLoadingHelpers(false)
      })
  }, [step, allHelpers.length, ui.helperDefault, ui.locationFallbackCountry])

  const filteredHelpers = useMemo(() =>
    allHelpers.filter(h =>
      !category || h.categories.some(c => c.toLowerCase() === category.toLowerCase())
    ),
  [allHelpers, category])

  useEffect(() => {
    const raw = location.trim()
    if (raw.length < 3) return

    const timeout = window.setTimeout(async () => {
      try {
        locAbortRef.current?.abort()
        const controller = new AbortController()
        locAbortRef.current = controller
        setLocSearching(true)
        const staticMatches = NORWAY_LOCATIONS
          .filter(l => l.toLowerCase().includes(raw.toLowerCase()))
          .slice(0, 8)
        const localizedLang =
          locale === 'no' ? 'nb-NO' : locale === 'da' ? 'da-DK' : locale === 'sv' ? 'sv-SE' : 'en-GB'

        // Query a few Norway-focused variants so partial street inputs (e.g. "Karihaugen", "Ekebergveien 5B")
        // still resolve even when users don't include city/country in the text field.
        const queryVariants = [...new Set([
          raw,
          `${raw}, Oslo`,
          `${raw}, Oslo, Norway`,
          `${raw}, Norway`,
        ])]

        const dynamic: string[] = []
        for (const q of queryVariants) {
          const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=no&addressdetails=0&limit=6&accept-language=${encodeURIComponent(localizedLang)}&q=${encodeURIComponent(q)}`
          const res = await fetch(url, { signal: controller.signal })
          if (!res.ok) continue
          const data = (await res.json()) as Array<{ display_name?: string }>
          dynamic.push(
            ...data
              .map(item => item.display_name?.split(',').slice(0, 3).join(',').trim() ?? '')
              .filter(Boolean),
          )
          if (dynamic.length >= 12) break
        }

        const merged = [...new Set([...staticMatches, ...dynamic])].slice(0, 10)
        setLocSuggestions(merged)
        setShowLocSuggestions(merged.length > 0)
      } catch {
        // Ignore network/geocoder issues and keep static matches.
      } finally {
        setLocSearching(false)
      }
    }, 280)

    return () => window.clearTimeout(timeout)
  }, [locale, location])

  function handleLocChange(val: string) {
    setLocation(val)
    if (errors.location) setErrors(prev => ({ ...prev, location: '' }))
    if (!val.trim()) {
      setLocSuggestions([])
      setShowLocSuggestions(false)
      return
    }
    const matches = NORWAY_LOCATIONS
      .filter(l => l.toLowerCase().includes(val.toLowerCase()))
      .slice(0, 8)
    setLocSuggestions(matches)
    setShowLocSuggestions(matches.length > 0)
  }

  function validateStep2() {
    const e: Record<string, string> = {}
    if (!title.trim() || title.trim().length < 3) e.title = t.post.errors.title
    if (!description.trim() || description.trim().length < 10) e.description = t.post.errors.description
    if (!location.trim()) e.location = t.post.errors.location
    return e
  }

  async function handleConfirm() {
    setSubmitting(true)
    setSubmitError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login?next=/post'); return }

    const scopingSummary = Object.entries(scopingAnswers)
      .filter(([, v]) => v)
      .map(([k, v]) => {
        const q = localizedScopingQuestions[category]?.find(q => q.id === k)
        return q ? `${q.label}: ${v}` : null
      })
      .filter(Boolean)
      .join(' · ')

    const fullDescription = [scopingSummary, description.trim()].filter(Boolean).join('\n\n')

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: fullDescription,
        category,
        price: budget ? Number(budget) : null,
        location: location.trim(),
      })
      .select('id')
      .single()

    if (postError || !post) {
      setSubmitError(postError?.message ?? ui.submitFailed)
      setSubmitting(false)
      return
    }

    if (selectedHelper && isUuid(selectedHelper.id)) {
      await supabase.from('bookings').insert({
        post_id: post.id,
        poster_id: user.id,
        helper_id: selectedHelper.id,
        status: 'pending',
      })
    }

    router.push('/dashboard?posted=1')
  }

  const selectedCat = CATEGORIES.find(c => c.key === category)

  // ── Step 1 ──────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div>
        <ProgressBar step={1} labels={ui.steps} />
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1 text-center">{ui.titleChoose}</h1>
          <p className="text-sm text-gray-400 mb-8 text-center">{ui.subtitleChoose}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {CATEGORIES.map(cat => (
              <button key={cat.key} type="button"
                onClick={() => { setCategory(cat.key); setStep(2) }}
                className="flex flex-col items-center gap-3 rounded-2xl bg-white border-2 border-gray-100 px-3 py-5 hover:border-blue-400 hover:shadow-lg transition-all duration-200 text-center group">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: cat.bg }}>
                  <cat.Icon {...categoryIconProps(26, cat.color)} />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">{cat.key}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Step 2 ──────────────────────────────────────────────────────
  if (step === 2) {
    const cat = selectedCat!
    return (
      <div>
        <ProgressBar step={2} labels={ui.steps} />
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat.bg }}>
                  <cat.Icon {...categoryIconProps(20, cat.color)} />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-gray-900">{category}</h1>
                  <p className="text-xs text-gray-400">{ui.taskIntro}</p>
                </div>
              </div>

              {/* Scoping questions */}
              {localizedScopingQuestions[category] && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 flex flex-col gap-5">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">{ui.quickQuestions}</p>
                  {localizedScopingQuestions[category].map(q => (
                    <div key={q.id}>
                      <p className="text-sm font-semibold text-gray-800 mb-2">{q.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {q.options.map(opt => {
                          const selected = scopingAnswers[q.id] === opt
                          return (
                            <button key={opt} type="button"
                              onClick={() => setScopingAnswers(prev => ({ ...prev, [q.id]: selected ? '' : opt }))}
                              className="rounded-full px-3 py-1.5 text-xs font-semibold border transition-all"
                              style={selected
                                ? { background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)', color: '#fff', borderColor: 'transparent' }
                                : { background: '#fff', color: '#374151', borderColor: '#D1D5DB' }}>
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">{ui.taskTitle} <span className="text-red-500">*</span></label>
                <input type="text" value={title}
                  onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(p => ({ ...p, title: '' })) }}
                  placeholder={`e.g. Need help with ${category.toLowerCase()} in ${location || ui.locationFallbackCity}`}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition ${errors.title ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'}`} />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">{ui.taskDescription} <span className="text-red-500">*</span></label>
                <textarea rows={4} value={description}
                  onChange={e => { setDescription(e.target.value); if (errors.description) setErrors(p => ({ ...p, description: '' })) }}
                  placeholder={ui.taskDescriptionPlaceholder}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none transition ${errors.description ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'}`} />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">{t.post.location} <span className="text-red-500">*</span></label>
                <div ref={locRef} className="relative">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <input type="text" value={location} onChange={e => handleLocChange(e.target.value)}
                      onFocus={() => { if (location.length >= 1) setShowLocSuggestions(locSuggestions.length > 0) }}
                      placeholder={ui.locationSearch}
                      style={{ paddingLeft: '2.25rem' }}
                      className={`w-full rounded-xl border pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition ${errors.location ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'}`} />
                  </div>
                  {showLocSuggestions && locSuggestions.length > 0 && (
                    <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {locSuggestions.map(loc => (
                        <li key={loc}>
                          <button type="button" onMouseDown={() => { setLocation(loc); setShowLocSuggestions(false) }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-blue-50 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span className="font-medium text-gray-700">{loc}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {locSearching && (
                  <p className="mt-1 text-xs text-gray-400">{ui.searchingAddresses}</p>
                )}
                {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
              </div>

              {/* Budget + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">{ui.budget} <span className="text-gray-400 font-normal text-xs">{ui.optional}</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">NOK</span>
                    <input type="number" min="0" value={budget} onChange={e => setBudget(e.target.value)}
                      placeholder="350"
                      className="w-full rounded-xl border border-gray-200 pl-12 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">{ui.preferredDate} <span className="text-gray-400 font-normal text-xs">{ui.optional}</span></label>
                  <input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)}
                  className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  {ui.back}
                </button>
                <button type="button"
                  onClick={() => {
                    const errs = validateStep2()
                    if (Object.keys(errs).length) { setErrors(errs); return }
                    setErrors({})
                    setStep(3)
                  }}
                  className="btn-primary flex-1 py-3">
                  {ui.browseHelpers}
                </button>
              </div>
            </div>

            {/* Summary panel */}
            <div className="hidden lg:block">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 sticky top-32">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">{ui.taskSummary}</p>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat.bg }}>
                    <cat.Icon {...categoryIconProps(18, cat.color)} />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{category}</span>
                </div>
                {title && <p className="text-sm font-semibold text-gray-800 mb-2 truncate">{title}</p>}
                {location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {location}
                  </div>
                )}
                {budget && <p className="text-xs font-bold text-green-600 mb-2">{ui.budgetSummary(budget)}</p>}
                {preferredDate && <p className="text-xs text-gray-500">{formatDateByLocale(preferredDate, locale, { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                {!title && !location && (
                  <p className="text-xs text-gray-400 italic">{ui.fillSummary}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 3 ──────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div>
        <ProgressBar step={3} labels={ui.steps} />
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">{ui.availableHelpersFor(category)}</h1>
              <p className="text-sm text-gray-400 mt-1">
                {loadingHelpers ? ui.loading : ui.helpersFound(filteredHelpers.length, location)}
              </p>
            </div>
            <button type="button" onClick={() => { setSelectedHelper(null); setStep(4) }}
              className="shrink-0 text-sm font-semibold text-blue-600 hover:underline whitespace-nowrap">
              {ui.skipPublic}
            </button>
          </div>

          {loadingHelpers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-48" />)}
            </div>
          ) : filteredHelpers.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-700 mb-1">{ui.noHelpersFor(category)}</p>
              <p className="text-xs text-gray-400 mb-5">{ui.postPublicHint}</p>
              <button type="button" onClick={() => { setSelectedHelper(null); setStep(4) }} className="btn-primary px-8 py-2.5">
                {ui.postPublic}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHelpers.map(helper => {
                const isSelected = selectedHelper?.id === helper.id
                return (
                  <div key={helper.id}
                    onClick={() => setSelectedHelper(isSelected ? null : helper)}
                    className={`rounded-2xl border-2 bg-white p-5 cursor-pointer transition-all select-none ${
                      isSelected ? 'border-blue-500 shadow-lg shadow-blue-100/60' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}>
                    <div className="flex items-center gap-3 mb-3">
                      {helper.avatarUrl ? (
                        <Image src={helper.avatarUrl} alt={helper.name} width={48} height={48} className="h-12 w-12 rounded-2xl object-cover shrink-0" />
                      ) : (
                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ background: avatarColor(helper.name) }}>
                          {initials(helper.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{helper.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          {helper.location}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3 min-h-5.5">
                      {helper.categories.slice(0, 3).map(c => (
                        <span key={c} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{c}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-base font-extrabold" style={{ color: '#16A34A' }}>
                        {helper.hourlyRate ? `${helper.hourlyRate} ${ui.nokPerHour}` : ui.hourlyFallback}
                      </span>
                      <Link href={`/taskers/${helper.id}`} onClick={e => e.stopPropagation()}
                        className="text-xs font-semibold text-blue-600 hover:underline">
                        {ui.viewProfile}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex items-center gap-3 mt-8">
            <button type="button" onClick={() => setStep(2)}
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              {ui.back}
            </button>
            <button type="button" onClick={() => setStep(4)} className="btn-primary flex-1 py-3">
              {selectedHelper ? ui.continueWith(selectedHelper.name.split(' ')[0]) : ui.continue}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 4 ──────────────────────────────────────────────────────
  const cat4 = selectedCat!
  return (
    <div>
      <ProgressBar step={4} labels={ui.steps} />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-xl font-extrabold text-gray-900 mb-6">{ui.confirmTask}</h1>

            {submitError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
              {/* Category row */}
              <div className="flex items-center gap-4 p-5">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat4.bg }}>
                  <cat4.Icon {...categoryIconProps(20, cat4.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{ui.sectionCategory}</p>
                  <p className="text-sm font-bold text-gray-900">{category}</p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600 font-semibold hover:underline shrink-0">{ui.change}</button>
              </div>

              {/* Task details row */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{ui.sectionTaskDetails}</p>
                  <button type="button" onClick={() => setStep(2)} className="text-xs text-blue-600 font-semibold hover:underline">{ui.change}</button>
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {location}
                  </span>
                  {budget && <span className="font-bold text-green-600">{budget} NOK</span>}
                  {preferredDate && (
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {formatDateByLocale(preferredDate + 'T00:00:00', locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Helper row */}
              {selectedHelper ? (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{ui.sectionSendingTo}</p>
                    <button type="button" onClick={() => setStep(3)} className="text-xs text-blue-600 font-semibold hover:underline">{ui.change}</button>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedHelper.avatarUrl ? (
                      <Image src={selectedHelper.avatarUrl} alt={selectedHelper.name} width={44} height={44} className="h-11 w-11 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ background: avatarColor(selectedHelper.name) }}>
                        {initials(selectedHelper.name)}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{selectedHelper.name}</p>
                      <p className="text-xs text-gray-400">{selectedHelper.location}</p>
                    </div>
                    <span className="text-sm font-extrabold text-green-600 shrink-0">
                      {selectedHelper.hourlyRate ? `${selectedHelper.hourlyRate} ${ui.nokPerHour}` : ui.hourlyFallback}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{ui.visibility}</p>
                  <p className="text-sm text-gray-500">{ui.visibilityHint}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button type="button" onClick={() => setStep(3)}
                className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                {ui.back}
              </button>
              <button type="button" onClick={handleConfirm} disabled={submitting}
                className={`btn-primary flex-1 py-3 ${submitting ? 'opacity-60' : ''}`}>
                {submitting ? ui.posting : selectedHelper
                  ? ui.sendRequestTo(selectedHelper.name.split(' ')[0])
                  : ui.postTaskPublicly}
              </button>
            </div>
          </div>

          {/* What happens next */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 sticky top-32">
              <p className="text-sm font-bold text-blue-900 mb-4">{ui.whatNext}</p>
              <div className="flex flex-col gap-3">
                {[
                  selectedHelper ? ui.stepNotifyWithName(selectedHelper.name.split(' ')[0]) : ui.stepNotifyPublic,
                  ui.stepReview,
                  ui.stepChat,
                  ui.stepDone,
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-xs text-blue-800 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-blue-200 bg-white p-3">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-bold text-gray-800">{ui.messagingIncluded}</span>{' '}
                  {ui.messagingBody}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

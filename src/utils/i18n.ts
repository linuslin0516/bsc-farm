import * as OpenCC from 'opencc-js';
import type { Language } from '../store/useLanguageStore';
import type { CropRarity } from '../types';
import { RARITY_NAMES } from '../types';

const converter = OpenCC.Converter({ from: 'tw', to: 'cn' });

export const toSimplified = (text: string): string => converter(text);

export const localizeZh = (text: string, language: Language): string =>
  language === 'zh-CN' ? toSimplified(text) : text;

export const localizeText = (language: Language, en: string, zhTw: string): string =>
  language === 'en' ? en : localizeZh(zhTw, language);

const RARITY_LABELS_EN: Record<CropRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export const getRarityLabel = (rarity: CropRarity, language: Language): string =>
  language === 'en' ? RARITY_LABELS_EN[rarity] : localizeZh(RARITY_NAMES[rarity], language);

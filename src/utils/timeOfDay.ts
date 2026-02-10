// Time of day utilities

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

/**
 * Get current time of day based on local time
 */
export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

/**
 * Get a friendly greeting based on time of day
 */
export function getTimeGreeting(): string {
  const timeOfDay = getTimeOfDay();
  switch (timeOfDay) {
    case 'dawn':
      return '早安';
    case 'day':
      return '你好';
    case 'dusk':
      return '傍晚好';
    case 'night':
      return '晚安';
  }
}

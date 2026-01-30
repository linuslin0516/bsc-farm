// Time of day utilities for dynamic sky effects

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export interface SkyColors {
  from: string;
  via: string;
  to: string;
  cloudColor: string;
  cloudOpacity: number;
  showStars: boolean;
}

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
 * Get sky gradient colors based on time of day
 */
export function getSkyColors(timeOfDay: TimeOfDay): SkyColors {
  switch (timeOfDay) {
    case 'dawn':
      return {
        from: '#FF6B35', // Orange
        via: '#F7C59F', // Light peach
        to: '#7DD3FC',  // Light blue
        cloudColor: '#FED7AA',
        cloudOpacity: 0.9,
        showStars: false,
      };
    case 'day':
      return {
        from: '#0EA5E9', // Sky blue
        via: '#38BDF8', // Light sky
        to: '#7DD3FC',  // Pale blue
        cloudColor: '#FFFFFF',
        cloudOpacity: 0.95,
        showStars: false,
      };
    case 'dusk':
      return {
        from: '#7C3AED', // Purple
        via: '#F472B6', // Pink
        to: '#FB923C',  // Orange
        cloudColor: '#DDD6FE',
        cloudOpacity: 0.8,
        showStars: false,
      };
    case 'night':
      return {
        from: '#1E1B4B', // Dark indigo
        via: '#312E81', // Indigo
        to: '#1E3A5F',  // Dark blue
        cloudColor: '#4B5563',
        cloudOpacity: 0.4,
        showStars: true,
      };
  }
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

/**
 * Get sun/moon position (0-1) based on time
 * 0 = horizon (left), 0.5 = zenith, 1 = horizon (right)
 */
export function getCelestialPosition(): number {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  const totalMinutes = hour * 60 + minute;

  // Sun rises at 6am (360 min), peaks at 12pm (720 min), sets at 6pm (1080 min)
  if (totalMinutes >= 360 && totalMinutes <= 1080) {
    return (totalMinutes - 360) / 720; // 0 to 1 during day
  }

  // Moon rises at 6pm, peaks at midnight, sets at 6am
  if (totalMinutes > 1080) {
    return (totalMinutes - 1080) / 720;
  }
  // Before 6am
  return (totalMinutes + 360) / 720;
}

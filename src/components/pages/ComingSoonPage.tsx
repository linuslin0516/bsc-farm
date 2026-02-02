import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../game/Logo';
import { LAUNCH_DATE } from '../../config/constants';
import { useLanguageStore, LANGUAGE_NAMES, Language } from '../../store/useLanguageStore';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (): TimeLeft | null => {
  const difference = new Date(LAUNCH_DATE).getTime() - new Date().getTime();

  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

export const ComingSoonPage: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft());
  const { language, setLanguage } = useLanguageStore();
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const languages: Language[] = ['zh-CN', 'zh-TW', 'en'];

  // Translations for coming soon page
  const comingSoonText = {
    'zh-CN': {
      title: '即将上线',
      subtitle: 'BSC链上的Play-to-Earn农场游戏',
      description: '种植作物，收获$FARM代币，与好友互动，开启你的链上农场之旅！',
      whitepaper: '查看白皮书',
      followUs: '关注我们',
      countdown: {
        days: '天',
        hours: '时',
        minutes: '分',
        seconds: '秒',
      },
      features: {
        plant: '种植作物',
        plantDesc: '多种作物可选择，不同生长周期和收益',
        earn: '赚取代币',
        earnDesc: '收成作物获得GOLD，可提现为$FARM',
        social: '社交互动',
        socialDesc: '添加好友，互相访问，偷菜乐趣无穷',
        upgrade: '升级成长',
        upgradeDesc: '提升等级，解锁更多高级作物',
      },
    },
    'zh-TW': {
      title: '即將上線',
      subtitle: 'BSC鏈上的Play-to-Earn農場遊戲',
      description: '種植作物，收穫$FARM代幣，與好友互動，開啟你的鏈上農場之旅！',
      whitepaper: '查看白皮書',
      followUs: '關注我們',
      countdown: {
        days: '天',
        hours: '時',
        minutes: '分',
        seconds: '秒',
      },
      features: {
        plant: '種植作物',
        plantDesc: '多種作物可選擇，不同生長週期和收益',
        earn: '賺取代幣',
        earnDesc: '收成作物獲得GOLD，可提現為$FARM',
        social: '社交互動',
        socialDesc: '添加好友，互相訪問，偷菜樂趣無窮',
        upgrade: '升級成長',
        upgradeDesc: '提升等級，解鎖更多高級作物',
      },
    },
    'en': {
      title: 'Coming Soon',
      subtitle: 'Play-to-Earn Farming Game on BSC',
      description: 'Plant crops, harvest $FARM tokens, interact with friends, and start your on-chain farming journey!',
      whitepaper: 'Read Whitepaper',
      followUs: 'Follow Us',
      countdown: {
        days: 'days',
        hours: 'hrs',
        minutes: 'min',
        seconds: 'sec',
      },
      features: {
        plant: 'Plant Crops',
        plantDesc: 'Various crops with different growth cycles and yields',
        earn: 'Earn Tokens',
        earnDesc: 'Harvest crops for GOLD, withdraw as $FARM',
        social: 'Social Interaction',
        socialDesc: 'Add friends, visit farms, steal crops for fun',
        upgrade: 'Level Up',
        upgradeDesc: 'Increase level to unlock premium crops',
      },
    },
  };

  const text = comingSoonText[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0E11] via-[#1a1d21] to-[#0B0E11] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">
          🌽
        </div>
        <div className="absolute top-40 right-20 text-5xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>
          🥕
        </div>
        <div className="absolute bottom-40 left-20 text-7xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>
          🍅
        </div>
        <div className="absolute bottom-20 right-10 text-5xl opacity-10 animate-float" style={{ animationDelay: '1.5s' }}>
          🌾
        </div>
        <div className="absolute top-1/3 left-1/4 text-4xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>
          🥬
        </div>
        <div className="absolute top-1/2 right-1/3 text-5xl opacity-10 animate-float" style={{ animationDelay: '0.8s' }}>
          🍆
        </div>
      </div>

      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="glass-panel px-4 py-2 rounded-lg text-gray-300 hover:text-white flex items-center gap-2"
          >
            <span>🌐</span>
            <span>{LANGUAGE_NAMES[language]}</span>
          </button>
          {showLangMenu && (
            <div className="absolute right-0 mt-2 glass-panel rounded-lg py-2 min-w-[120px]">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 ${
                    language === lang ? 'text-binance-yellow' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {LANGUAGE_NAMES[lang]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Logo */}
        <div className="mb-8">
          <Logo size="lg" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-binance-yellow mb-4 text-center">
          {text.title}
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-2 text-center">
          {text.subtitle}
        </p>
        <p className="text-gray-400 mb-8 max-w-xl text-center">
          {text.description}
        </p>

        {/* Countdown Timer */}
        {timeLeft && (
          <div className="flex gap-4 mb-12">
            <div className="glass-panel p-4 rounded-xl text-center min-w-[80px]">
              <div className="text-3xl md:text-4xl font-bold text-binance-yellow">{timeLeft.days}</div>
              <div className="text-xs text-gray-400">{text.countdown.days}</div>
            </div>
            <div className="glass-panel p-4 rounded-xl text-center min-w-[80px]">
              <div className="text-3xl md:text-4xl font-bold text-binance-yellow">{timeLeft.hours}</div>
              <div className="text-xs text-gray-400">{text.countdown.hours}</div>
            </div>
            <div className="glass-panel p-4 rounded-xl text-center min-w-[80px]">
              <div className="text-3xl md:text-4xl font-bold text-binance-yellow">{timeLeft.minutes}</div>
              <div className="text-xs text-gray-400">{text.countdown.minutes}</div>
            </div>
            <div className="glass-panel p-4 rounded-xl text-center min-w-[80px]">
              <div className="text-3xl md:text-4xl font-bold text-binance-yellow">{timeLeft.seconds}</div>
              <div className="text-xs text-gray-400">{text.countdown.seconds}</div>
            </div>
          </div>
        )}

        {/* Whitepaper Button */}
        <Link
          to="/whitepaper"
          className="mb-8 px-8 py-3 bg-binance-yellow text-binance-dark font-bold rounded-xl hover:bg-binance-yellow/90 transition-colors text-lg"
        >
          {text.whitepaper}
        </Link>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mb-12">
          <div className="glass-panel p-4 rounded-xl text-center">
            <div className="text-3xl mb-2">🌱</div>
            <h3 className="text-white font-bold mb-1">{text.features.plant}</h3>
            <p className="text-xs text-gray-400">{text.features.plantDesc}</p>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="text-white font-bold mb-1">{text.features.earn}</h3>
            <p className="text-xs text-gray-400">{text.features.earnDesc}</p>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="text-white font-bold mb-1">{text.features.social}</h3>
            <p className="text-xs text-gray-400">{text.features.socialDesc}</p>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="text-white font-bold mb-1">{text.features.upgrade}</h3>
            <p className="text-xs text-gray-400">{text.features.upgradeDesc}</p>
          </div>
        </div>

        {/* Social Links */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">{text.followUs}</p>
          <div className="flex gap-4 justify-center">
            {/* Twitter/X */}
            <a
              href="https://twitter.com/bscfarm"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-panel p-3 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* Telegram */}
            <a
              href="https://t.me/bscfarm"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-panel p-3 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </a>
            {/* Discord */}
            <a
              href="https://discord.gg/bscfarm"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-panel p-3 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-gray-500 text-sm">
        Powered by $FARM on BSC
      </div>
    </div>
  );
};

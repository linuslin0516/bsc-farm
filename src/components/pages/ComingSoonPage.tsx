import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../game/Logo';
import { useLanguageStore, LANGUAGE_NAMES, Language } from '../../store/useLanguageStore';

export const ComingSoonPage: React.FC = () => {
  const { language, setLanguage } = useLanguageStore();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages: Language[] = ['zh-CN', 'zh-TW', 'en'];

  const comingSoonText = {
    'zh-CN': {
      title: '即将上线',
      subtitle: '太空农场探险游戏',
      description: '种植宇宙作物，探索星际农场，与好友互动，开启你的太空农场之旅！',
      whitepaper: '了解更多',
      followUs: '关注我们',
      features: {
        plant: '培育作物',
        plantDesc: '多种宇宙作物可选择，不同生长周期和收益',
        earn: '赚取奖励',
        earnDesc: '收成作物获得 GOLD，登上排行榜赢取 BNB 空投',
        social: '社交互动',
        socialDesc: '添加好友，互相拜访，掠夺资源乐趣无穷',
        upgrade: '升级成长',
        upgradeDesc: '提升等级，解锁更多高级宇宙作物',
      },
    },
    'zh-TW': {
      title: '即將上線',
      subtitle: '太空農場探險遊戲',
      description: '種植宇宙作物，探索星際農場，與好友互動，開啟你的太空農場之旅！',
      whitepaper: '了解更多',
      followUs: '關注我們',
      features: {
        plant: '培育作物',
        plantDesc: '多種宇宙作物可選擇，不同生長週期和收益',
        earn: '賺取獎勵',
        earnDesc: '收成作物獲得 GOLD，登上排行榜贏取 BNB 空投',
        social: '社交互動',
        socialDesc: '添加好友，互相拜訪，掠奪資源樂趣無窮',
        upgrade: '升級成長',
        upgradeDesc: '提升等級，解鎖更多高級宇宙作物',
      },
    },
    'en': {
      title: 'Coming Soon',
      subtitle: 'Space Farming Adventure Game',
      description: 'Grow cosmic crops, explore interstellar farms, interact with friends, and start your space farming journey!',
      whitepaper: 'Learn More',
      followUs: 'Follow Us',
      features: {
        plant: 'Grow Crops',
        plantDesc: 'Various cosmic crops with different growth cycles and yields',
        earn: 'Earn Rewards',
        earnDesc: 'Harvest crops for GOLD, climb leaderboards to win BNB airdrops',
        social: 'Social Interaction',
        socialDesc: 'Add friends, visit farms, raid resources for fun',
        upgrade: 'Level Up',
        upgradeDesc: 'Increase level to unlock premium cosmic crops',
      },
    },
  };

  const text = comingSoonText[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-space-dark via-[#1E1B4B] to-space-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">
          🚀
        </div>
        <div className="absolute top-40 right-20 text-5xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>
          🪐
        </div>
        <div className="absolute bottom-40 left-20 text-7xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>
          🌌
        </div>
        <div className="absolute bottom-20 right-10 text-5xl opacity-10 animate-float" style={{ animationDelay: '1.5s' }}>
          ⭐
        </div>
        <div className="absolute top-1/3 left-1/4 text-4xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>
          🛸
        </div>
        <div className="absolute top-1/2 right-1/3 text-5xl opacity-10 animate-float" style={{ animationDelay: '0.8s' }}>
          ☄️
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
                    language === lang ? 'text-space-cyan' : 'text-gray-300 hover:text-white'
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
        <h1 className="text-4xl md:text-6xl font-bold text-space-cyan mb-4 text-center">
          {text.title}
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-2 text-center">
          {text.subtitle}
        </p>
        <p className="text-gray-400 mb-12 max-w-xl text-center">
          {text.description}
        </p>

        {/* Learn More Button */}
        <Link
          to="/whitepaper"
          className="mb-12 px-8 py-3 bg-space-cyan text-space-dark font-bold rounded-xl hover:bg-space-cyan/90 transition-colors text-lg"
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
            <div className="text-3xl mb-2">⚡</div>
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
              href="https://x.com/SpaceFarmGame"
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
              href="https://t.me/SpaceFarmGame"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-panel p-3 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-gray-500 text-sm">
        Space Farm - Cosmic Crops Adventure
      </div>
    </div>
  );
};

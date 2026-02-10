import { Link } from 'react-router-dom';
import { Logo } from '../game/Logo';
import { useLanguageStore, LANGUAGE_NAMES, Language } from '../../store/useLanguageStore';
import { useState } from 'react';

export const WhitepaperPage: React.FC = () => {
  const { language, setLanguage } = useLanguageStore();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages: Language[] = ['zh-CN', 'zh-TW', 'en'];

  const content = {
    'zh-CN': {
      title: 'Space Farm 游戏指南',
      version: 'v2.0',
      backToHome: '返回首页',
      toc: '目录',
      sections: [
        {
          id: 'overview',
          title: '1. 项目概述',
          content: `Space Farm 是一款太空农场模拟游戏。玩家通过种植、收成、交易宇宙作物来获得游戏内货币 GOLD，并通过排行榜竞争赢取 BNB 空投奖励。

游戏融合了经典农场游戏的休闲玩法与太空探索的科幻元素，为玩家提供一个既有趣又有收益潜力的游戏体验。`,
        },
        {
          id: 'gameplay',
          title: '2. 游戏玩法',
          content: `**2.1 基础玩法**

- **培育**: 玩家在自己的太空站上选择种子进行培育
- **等待**: 不同作物有不同的生长周期（3分钟 - 1小时不等）
- **采集**: 作物成熟后可进行采集，获得 GOLD 奖励
- **升级**: 通过培育和采集累积经验值，提升等级解锁更多作物

**2.2 太空站系统**

- 新玩家初始获得 3x3（9格）太空站
- 可通过消耗 GOLD 升级太空站至最大 6x6（36格）
- 太空站升级需要达到对应等级要求

**2.3 社交功能**

- **好友系统**: 通过 6 位数 ID 互加好友
- **拜访太空站**: 可访问好友的太空站
- **掠夺玩法**: 可从好友太空站掠夺少量成熟作物（每日有限制）

**2.4 每日任务与成就**

- 每日任务提供额外 GOLD 和经验奖励
- 完成各类成就可获得特殊奖励
- 排行榜竞争激励活跃玩家`,
        },
        {
          id: 'economy',
          title: '3. 经济系统',
          content: `**3.1 游戏货币**

| 货币 | 用途 |
|------|------|
| GOLD | 购买种子、升级太空站、游戏内一切交易 |

**3.2 BNB 空投奖励**

- 管理员每日查看排行榜
- 根据排名给予 BNB 空投奖励
- 玩家需要在个人设置中填写 BNB 收款地址
- 空投发放后会在系统中记录

**3.3 收益来源**

玩家在游戏中的 GOLD 来源于：

1. **采集作物**: 不同作物有不同收益
2. **每日任务**: 完成任务获得额外奖励
3. **成就系统**: 达成成就解锁一次性奖励
4. **掠夺好友**: 从好友太空站获取少量资源`,
        },
        {
          id: 'crops',
          title: '4. 作物系统',
          content: `**4.1 作物属性**

每种作物具有以下属性：
- **种子价格**: 购买种子所需 GOLD
- **生长时间**: 从种植到成熟的时间
- **采集价格**: 成熟后卖出可获得的 GOLD
- **解锁等级**: 需要达到的玩家等级
- **稀有度**: 普通、优良、稀有、史诗、传说

**4.2 稀有度系统**

- 普通（灰色）: 基础作物，快速生长
- 优良（绿色）: 中等收益，适中周期
- 稀有（蓝色）: 较高收益，较长周期
- 史诗（紫色）: 高收益，需要耐心
- 传说（青色）: 最高收益，最长周期

**4.3 作物策略**

- 短周期作物适合活跃玩家，需要频繁操作
- 长周期作物适合休闲玩家，收益更稳定
- 高级作物利润率更高，但需要更高等级`,
        },
        {
          id: 'technical',
          title: '5. 技术架构',
          content: `**5.1 前端技术**

- **框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **部署**: Vercel

**5.2 后端服务**

- **数据库**: Firebase Firestore
- **认证**: Firebase Auth (Twitter OAuth)
- **实时同步**: Firestore 实时监听

**5.3 安全措施**

- 游戏数据加密存储
- 服务器端验证防止作弊
- Twitter OAuth 安全认证`,
        },
        {
          id: 'roadmap',
          title: '6. 发展路线图',
          content: `**Phase 1: 基础版本 (已完成)**
- 核心太空农场玩法
- Twitter 登录
- 好友系统

**Phase 2: 社交增强 (已完成)**
- 排行榜系统
- 每日任务
- 成就系统
- 多语言支持

**Phase 3: BNB 空投 (进行中)**
- 管理员后台
- 排行榜空投
- CSV 导出功能

**Phase 4: 玩法拓展 (计划中)**
- 季节系统
- 特殊活动
- 市场交易`,
        },
        {
          id: 'disclaimer',
          title: '7. 免责声明',
          content: `**风险提示**

- BNB 空投奖励由管理员根据排行榜发放
- 游戏内收益不构成投资建议
- 本游戏仅供娱乐目的

**合规声明**

- 用户需遵守当地法律法规
- 禁止使用本游戏进行任何非法活动
- 项目方保留修改游戏规则的权利

---

*本指南最后更新: 2025年2月*
*如有任何变更，请以最新版本为准*`,
        },
      ],
    },
    'zh-TW': {
      title: 'Space Farm 遊戲指南',
      version: 'v2.0',
      backToHome: '返回首頁',
      toc: '目錄',
      sections: [
        {
          id: 'overview',
          title: '1. 專案概述',
          content: `Space Farm 是一款太空農場模擬遊戲。玩家通過種植、收成、交易宇宙作物來獲得遊戲內貨幣 GOLD，並通過排行榜競爭贏取 BNB 空投獎勵。

遊戲融合了經典農場遊戲的休閒玩法與太空探索的科幻元素，為玩家提供一個既有趣又有收益潛力的遊戲體驗。`,
        },
        {
          id: 'gameplay',
          title: '2. 遊戲玩法',
          content: `**2.1 基礎玩法**

- **培育**: 玩家在自己的太空站上選擇種子進行培育
- **等待**: 不同作物有不同的生長週期（3分鐘 - 1小時不等）
- **採集**: 作物成熟後可進行採集，獲得 GOLD 獎勵
- **升級**: 通過培育和採集累積經驗值，提升等級解鎖更多作物

**2.2 太空站系統**

- 新玩家初始獲得 3x3（9格）太空站
- 可通過消耗 GOLD 升級太空站至最大 6x6（36格）
- 太空站升級需要達到對應等級要求

**2.3 社交功能**

- **好友系統**: 通過 6 位數 ID 互加好友
- **拜訪太空站**: 可訪問好友的太空站
- **掠奪玩法**: 可從好友太空站掠奪少量成熟作物（每日有限制）

**2.4 每日任務與成就**

- 每日任務提供額外 GOLD 和經驗獎勵
- 完成各類成就可獲得特殊獎勵
- 排行榜競爭激勵活躍玩家`,
        },
      ],
    },
    'en': {
      title: 'Space Farm Game Guide',
      version: 'v2.0',
      backToHome: 'Back to Home',
      toc: 'Table of Contents',
      sections: [
        {
          id: 'overview',
          title: '1. Project Overview',
          content: `Space Farm is a space farming simulation game. Players earn GOLD, the in-game currency, by growing, harvesting, and trading cosmic crops. Compete on leaderboards to win BNB airdrop rewards.

The game combines the casual gameplay of classic farming games with sci-fi space exploration elements, providing players with an entertaining experience with earning potential.`,
        },
        {
          id: 'gameplay',
          title: '2. Gameplay',
          content: `**2.1 Basic Mechanics**

- **Growing**: Players select seeds to grow on their space station
- **Waiting**: Different crops have different growth cycles (3 minutes to 1 hour)
- **Harvesting**: Mature crops can be harvested for GOLD rewards
- **Leveling**: Accumulate XP through growing and harvesting to unlock more crops

**2.2 Space Station System**

- New players start with 3x3 (9 plots) space station
- Space station can be upgraded up to 6x6 (36 plots) using GOLD
- Upgrades require reaching corresponding level requirements

**2.3 Social Features**

- **Friend System**: Add friends using 6-digit IDs
- **Station Visits**: Visit friends' space stations
- **Raiding**: Raid small amounts of mature crops from friends (daily limits apply)

**2.4 Daily Tasks & Achievements**

- Daily tasks provide extra GOLD and XP rewards
- Complete achievements for special rewards
- Leaderboard competition incentivizes active players`,
        },
        {
          id: 'economy',
          title: '3. Economy',
          content: `**3.1 Game Currency**

| Currency | Purpose |
|----------|---------|
| GOLD | Buy seeds, upgrade station, all in-game transactions |

**3.2 BNB Airdrop Rewards**

- Admin reviews leaderboard daily
- BNB airdrops distributed based on rankings
- Players must enter BNB address in profile settings
- Airdrop records are tracked in the system

**3.3 Income Sources**

Player GOLD income comes from:

1. **Harvesting**: Different crops yield different amounts
2. **Daily Tasks**: Complete tasks for bonus rewards
3. **Achievements**: Unlock one-time rewards
4. **Raiding Friends**: Gain small resources from friend stations`,
        },
        {
          id: 'technical',
          title: '4. Technical Architecture',
          content: `**4.1 Frontend**

- **Framework**: React 18 + TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

**4.2 Backend Services**

- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Twitter OAuth)
- **Real-time Sync**: Firestore listeners

**4.3 Security Measures**

- Encrypted game data storage
- Server-side validation prevents cheating
- Twitter OAuth secure authentication`,
        },
        {
          id: 'roadmap',
          title: '5. Roadmap',
          content: `**Phase 1: Foundation (Complete)**
- Core space farming gameplay
- Twitter login
- Friend system

**Phase 2: Social Enhancement (Complete)**
- Leaderboard system
- Daily tasks
- Achievement system
- Multi-language support

**Phase 3: BNB Airdrops (In Progress)**
- Admin dashboard
- Leaderboard airdrops
- CSV export functionality

**Phase 4: Gameplay Expansion (Planned)**
- Season system
- Special events
- Marketplace trading`,
        },
        {
          id: 'disclaimer',
          title: '6. Disclaimer',
          content: `**Notice**

- BNB airdrop rewards are distributed by admin based on leaderboard rankings
- In-game earnings do not constitute investment advice
- This game is for entertainment purposes only

**Compliance Statement**

- Users must comply with local laws and regulations
- Using this game for any illegal activity is prohibited
- The project team reserves the right to modify game rules

---

*Last updated: February 2025*
*Please refer to the latest version for any changes*`,
        },
      ],
    },
  };

  const c = content[language] || content['zh-CN'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-space-dark via-[#1E1B4B] to-space-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-gray-400 text-sm">{c.backToHome}</span>
          </Link>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-white flex items-center gap-2 text-sm"
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
                    className={`w-full text-left px-4 py-2 text-sm ${
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
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-space-cyan mb-2">{c.title}</h1>
          <p className="text-gray-400">{c.version}</p>
        </div>

        {/* Table of Contents */}
        <div className="glass-panel rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">{c.toc}</h2>
          <ul className="space-y-2">
            {c.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-gray-300 hover:text-space-cyan transition-colors"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        {c.sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-12">
            <h2 className="text-2xl font-bold text-space-cyan mb-4">{section.title}</h2>
            <div className="glass-panel rounded-xl p-6">
              <div className="prose prose-invert max-w-none">
                {section.content.split('\n').map((paragraph, idx) => {
                  const stripStars = (text: string) => text.replace(/\*/g, '');

                  if (paragraph.trim().startsWith('```')) {
                    return null;
                  }
                  if (paragraph.startsWith('**') && paragraph.endsWith('**') && !paragraph.slice(2, -2).includes('**')) {
                    return (
                      <h3 key={idx} className="text-lg font-bold text-white mt-6 mb-3">
                        {stripStars(paragraph)}
                      </h3>
                    );
                  }
                  if (paragraph.trim().startsWith('-')) {
                    return (
                      <p key={idx} className="text-gray-300 ml-4">
                        {stripStars(paragraph)}
                      </p>
                    );
                  }
                  if (paragraph.includes('|')) {
                    return (
                      <p key={idx} className="text-gray-300 font-mono text-sm">
                        {stripStars(paragraph)}
                      </p>
                    );
                  }
                  if (paragraph.trim()) {
                    return (
                      <p key={idx} className="text-gray-300 mb-4">
                        {stripStars(paragraph)}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </section>
        ))}

        {/* Back to top */}
        <div className="text-center">
          <a
            href="#"
            className="inline-block px-6 py-2 glass-panel rounded-lg text-gray-300 hover:text-white transition-colors"
          >
            ↑ Back to Top
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Space Farm - Cosmic Crops Adventure</p>
        </div>
      </footer>
    </div>
  );
};

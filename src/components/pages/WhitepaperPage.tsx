import { Link } from 'react-router-dom';
import { Logo } from '../game/Logo';
import { useLanguageStore, LANGUAGE_NAMES, Language } from '../../store/useLanguageStore';
import { useState } from 'react';

export const WhitepaperPage: React.FC = () => {
  const { language, setLanguage } = useLanguageStore();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages: Language[] = ['zh-CN', 'zh-TW', 'en'];

  // Whitepaper content in different languages
  const content = {
    'zh-CN': {
      title: 'BSC Farm 白皮书',
      version: 'v1.0',
      backToHome: '返回首页',
      toc: '目录',
      sections: [
        {
          id: 'overview',
          title: '1. 项目概述',
          content: `BSC Farm 是一款建立在 BNB Smart Chain（BSC）上的 Play-to-Earn 农场模拟游戏。玩家通过种植、收成、交易虚拟作物来获得游戏内货币 GOLD，并可将 GOLD 兑换成链上代币 $FARM 进行提现。

游戏融合了经典农场游戏的休闲玩法与区块链技术的透明性和可验证性，为玩家提供一个既有趣又有收益潜力的游戏体验。`,
        },
        {
          id: 'gameplay',
          title: '2. 游戏玩法',
          content: `**2.1 基础玩法**

- **种植**: 玩家在自己的农地上选择种子进行种植
- **等待**: 不同作物有不同的生长周期（30秒 - 数小时不等）
- **收成**: 作物成熟后可进行收成，获得 GOLD 奖励
- **升级**: 通过种植和收成积累经验值，提升等级解锁更多作物

**2.2 农地系统**

- 新玩家初始获得 3x3（9格）农地
- 可通过消耗 GOLD 升级农地至最大 6x6（36格）
- 农地升级需要达到对应等级要求

**2.3 社交功能**

- **好友系统**: 通过 6 位数 ID 互加好友
- **拜访农场**: 可访问好友的农场
- **偷菜玩法**: 可从好友农场偷取少量成熟作物（每日有限制）

**2.4 每日任务与成就**

- 每日任务提供额外 GOLD 和经验奖励
- 完成各类成就可获得特殊奖励
- 排行榜竞争激励活跃玩家`,
        },
        {
          id: 'tokenomics',
          title: '3. 代币经济学',
          content: `**3.1 双代币系统**

BSC Farm 采用双代币模型：

| 代币 | 类型 | 用途 |
|------|------|------|
| $FARM | 链上代币 (BEP-20) | 充值、提现、交易 |
| GOLD | 游戏内货币 | 购买种子、升级农地 |

**3.2 $FARM 代币**

- 合约标准: BEP-20
- 网络: BNB Smart Chain
- 用途:
  - 充值到游戏获得 GOLD
  - 从游戏提现获得 $FARM
  - DEX 自由交易

**3.3 代币分配**

- Dev 初始购买: 20%（全部转入金库钱包）
- 公开流通: 80%

**3.4 交易税收分配**

- 金库收益: 用于玩家提现和生态建设
- Dev 钱包: 3%（用于回购代币、稳定金库）

**3.5 GOLD 游戏币**

- 中心化管理，存储在游戏服务器
- 用途:
  - 购买种子
  - 升级农地
  - 兑换 $FARM 提现

**3.6 兑换汇率**

- 基准汇率: 1,000,000 $FARM = 20 GOLD
- 兑换手续费: 5%
- 汇率会根据金库健康度动态调整`,
        },
        {
          id: 'economy',
          title: '4. 经济循环',
          content: `**4.1 资金流向**

\`\`\`
玩家充值 $FARM → 金库 → 兑换为 GOLD
         ↑                    ↓
    玩家提现 ←── 金库 ←── 玩家赚取 GOLD
                  ↑
            交易税收 (3% → Dev)
            Dev 回购代币 → 金库
\`\`\`

**4.2 Dev 金库策略**

- Dev 在发售时购买 20% 代币，全部转入金库钱包
- 交易税收的 3% 进入 Dev 钱包
- Dev 使用税收收益回购 $FARM 代币
- 回购的代币注入金库，稳定金库储备

**4.3 收益来源**

玩家在游戏中的 ROI（投资回报）来源于：

1. **交易税收**: DEX 交易税收自动分配（3% 进 Dev 钱包用于回购）
2. **Dev 回购**: Dev 使用税收收益持续回购代币注入金库
3. **新玩家充值**: 新玩家的充值增加金库储备

**4.4 金库健康机制**

- 金库 $FARM 储备量影响兑换汇率
- 储备充足时，玩家获得更好的提现汇率
- 储备不足时，汇率会自动调整以保护金库
- 透明公开的金库地址可供查验
- Dev 持续回购机制确保金库长期稳定

**4.5 防通胀机制**

- 作物售价设计确保合理的 ROI
- 兑换手续费作为系统收入
- 动态汇率防止金库枯竭
- Dev 回购形成代币正向循环`,
        },
        {
          id: 'crops',
          title: '5. 作物系统',
          content: `**5.1 作物属性**

每种作物具有以下属性：
- **种子价格**: 购买种子所需 GOLD
- **生长时间**: 从种植到成熟的时间
- **收成价格**: 成熟后卖出可获得的 GOLD
- **解锁等级**: 需要达到的玩家等级
- **稀有度**: 普通、稀有、史诗、传说

**5.2 部分作物列表**

| 作物 | 种子价格 | 生长时间 | 收成价格 | 解锁等级 |
|------|----------|----------|----------|----------|
| 萝卜 | 50 GOLD | 30秒 | 60 GOLD | Lv.1 |
| 白菜 | 100 GOLD | 2分钟 | 130 GOLD | Lv.2 |
| 玉米 | 200 GOLD | 5分钟 | 280 GOLD | Lv.5 |
| 番茄 | 500 GOLD | 15分钟 | 700 GOLD | Lv.10 |

*完整作物列表请参考游戏内图鉴*

**5.3 作物策略**

- 短周期作物适合活跃玩家，需要频繁操作
- 长周期作物适合休闲玩家，收益更稳定
- 高级作物利润率更高，但需要更高等级`,
        },
        {
          id: 'technical',
          title: '6. 技术架构',
          content: `**6.1 前端技术**

- **框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **Web3**: ethers.js
- **部署**: Vercel

**6.2 后端服务**

- **数据库**: Firebase Firestore
- **认证**: Firebase Auth (Twitter OAuth)
- **实时同步**: Firestore 实时监听

**6.3 智能合约**

- **网络**: BNB Smart Chain (BSC)
- **代币标准**: BEP-20
- **金库**: 多签钱包保障安全

**6.4 安全措施**

- 钱包连接采用标准 EIP-1193 协议
- 所有链上交易需要用户签名确认
- 游戏数据加密存储
- 服务器端验证防止作弊`,
        },
        {
          id: 'roadmap',
          title: '7. 发展路线图',
          content: `**Phase 1: 基础版本 (已完成)**
- 核心农场玩法
- 钱包连接与 Twitter 登录
- 基础代币兑换系统
- 好友系统

**Phase 2: 社交增强 (进行中)**
- 排行榜系统
- 每日任务
- 成就系统
- 多语言支持

**Phase 3: 玩法拓展 (计划中)**
- 季节系统
- 特殊活动
- 市场交易
- NFT 整合

**Phase 4: 生态扩展 (远期)**
- 跨链支持
- 治理代币
- DAO 社区治理
- 更多 GameFi 元素`,
        },
        {
          id: 'faq',
          title: '8. 常见问题',
          content: `**Q: 如何开始游戏？**
A: 连接 MetaMask 钱包或使用 Twitter 登录，然后绑定钱包即可开始。

**Q: 新玩家有免费 GOLD 吗？**
A: 目前新玩家需要充值 $FARM 兑换 GOLD 才能开始种植。

**Q: 最小充值/提现金额是多少？**
A: 充值最少 100,000 $FARM，提现最少 100 GOLD。

**Q: 我的数据安全吗？**
A: 游戏数据存储在 Firebase 云端，钱包私钥始终保存在您的钱包中，我们无法访问。

**Q: 如何联系客服？**
A: 可通过 Twitter 或 Telegram 社群联系我们。

**Q: 游戏是否开源？**
A: 智能合约代码已在 BSCScan 上验证公开。`,
        },
        {
          id: 'disclaimer',
          title: '9. 免责声明',
          content: `**风险提示**

- 加密货币投资存在风险，$FARM 代币价格可能波动
- 游戏内收益不构成投资建议
- 请根据自身风险承受能力参与
- 本游戏仅供娱乐目的

**合规声明**

- 用户需遵守当地法律法规
- 禁止使用本游戏进行任何非法活动
- 项目方保留修改游戏规则的权利

---

*本白皮书最后更新: 2025年2月*
*如有任何变更，请以最新版本为准*`,
        },
      ],
    },
    'zh-TW': {
      title: 'BSC Farm 白皮書',
      version: 'v1.0',
      backToHome: '返回首頁',
      toc: '目錄',
      sections: [
        {
          id: 'overview',
          title: '1. 專案概述',
          content: `BSC Farm 是一款建立在 BNB Smart Chain（BSC）上的 Play-to-Earn 農場模擬遊戲。玩家通過種植、收成、交易虛擬作物來獲得遊戲內貨幣 GOLD，並可將 GOLD 兌換成鏈上代幣 $FARM 進行提現。

遊戲融合了經典農場遊戲的休閒玩法與區塊鏈技術的透明性和可驗證性，為玩家提供一個既有趣又有收益潛力的遊戲體驗。`,
        },
        {
          id: 'gameplay',
          title: '2. 遊戲玩法',
          content: `**2.1 基礎玩法**

- **種植**: 玩家在自己的農地上選擇種子進行種植
- **等待**: 不同作物有不同的生長週期（30秒 - 數小時不等）
- **收成**: 作物成熟後可進行收成，獲得 GOLD 獎勵
- **升級**: 通過種植和收成累積經驗值，提升等級解鎖更多作物

**2.2 農地系統**

- 新玩家初始獲得 3x3（9格）農地
- 可通過消耗 GOLD 升級農地至最大 6x6（36格）
- 農地升級需要達到對應等級要求

**2.3 社交功能**

- **好友系統**: 通過 6 位數 ID 互加好友
- **拜訪農場**: 可訪問好友的農場
- **偷菜玩法**: 可從好友農場偷取少量成熟作物（每日有限制）

**2.4 每日任務與成就**

- 每日任務提供額外 GOLD 和經驗獎勵
- 完成各類成就可獲得特殊獎勵
- 排行榜競爭激勵活躍玩家`,
        },
        // ... more sections (similar to zh-CN but in Traditional Chinese)
      ],
    },
    'en': {
      title: 'BSC Farm Whitepaper',
      version: 'v1.0',
      backToHome: 'Back to Home',
      toc: 'Table of Contents',
      sections: [
        {
          id: 'overview',
          title: '1. Project Overview',
          content: `BSC Farm is a Play-to-Earn farming simulation game built on BNB Smart Chain (BSC). Players earn GOLD, the in-game currency, by planting, harvesting, and trading virtual crops. GOLD can be exchanged for the on-chain token $FARM for withdrawal.

The game combines the casual gameplay of classic farming games with the transparency and verifiability of blockchain technology, providing players with an entertaining experience with earning potential.`,
        },
        {
          id: 'gameplay',
          title: '2. Gameplay',
          content: `**2.1 Basic Mechanics**

- **Planting**: Players select seeds to plant on their farmland
- **Waiting**: Different crops have different growth cycles (30 seconds to several hours)
- **Harvesting**: Mature crops can be harvested for GOLD rewards
- **Leveling**: Accumulate XP through planting and harvesting to unlock more crops

**2.2 Farmland System**

- New players start with 3x3 (9 plots) farmland
- Farmland can be upgraded up to 6x6 (36 plots) using GOLD
- Farmland upgrades require reaching corresponding level requirements

**2.3 Social Features**

- **Friend System**: Add friends using 6-digit IDs
- **Farm Visits**: Visit friends' farms
- **Crop Stealing**: Steal small amounts of mature crops from friends (daily limits apply)

**2.4 Daily Tasks & Achievements**

- Daily tasks provide extra GOLD and XP rewards
- Complete achievements for special rewards
- Leaderboard competition incentivizes active players`,
        },
        {
          id: 'tokenomics',
          title: '3. Tokenomics',
          content: `**3.1 Dual Token System**

BSC Farm uses a dual token model:

| Token | Type | Purpose |
|-------|------|---------|
| $FARM | On-chain (BEP-20) | Deposit, withdraw, trade |
| GOLD | In-game currency | Buy seeds, upgrade farm |

**3.2 $FARM Token**

- Standard: BEP-20
- Network: BNB Smart Chain
- Uses:
  - Deposit to game for GOLD
  - Withdraw from game as $FARM
  - Free trading on DEX

**3.3 Token Allocation**

- Dev Initial Purchase: 20% (all transferred to treasury wallet)
- Public Circulation: 80%

**3.4 Transaction Tax Distribution**

- Treasury Revenue: For player withdrawals and ecosystem development
- Dev Wallet: 3% (used for token buyback and treasury stabilization)

**3.5 GOLD In-game Currency**

- Centrally managed, stored on game servers
- Uses:
  - Purchase seeds
  - Upgrade farmland
  - Exchange for $FARM withdrawal

**3.6 Exchange Rate**

- Base rate: 1,000,000 $FARM = 20 GOLD
- Exchange fee: 5%
- Rate adjusts dynamically based on treasury health`,
        },
        {
          id: 'economy',
          title: '4. Economic Cycle',
          content: `**4.1 Fund Flow**

\`\`\`
Player deposits $FARM → Treasury → Converts to GOLD
         ↑                              ↓
    Player withdraws ←── Treasury ←── Player earns GOLD
                           ↑
                    Trading Tax (3% → Dev)
                    Dev buyback → Treasury
\`\`\`

**4.2 Dev Treasury Strategy**

- Dev purchases 20% of tokens at launch, all transferred to treasury wallet
- 3% of transaction tax goes to Dev wallet
- Dev uses tax revenue to buy back $FARM tokens
- Bought-back tokens are injected into treasury to stabilize reserves

**4.3 Revenue Sources**

Player ROI (Return on Investment) comes from:

1. **Trading Tax**: DEX trading taxes auto-distributed (3% to Dev wallet for buyback)
2. **Dev Buyback**: Dev continuously buys back tokens using tax revenue to inject into treasury
3. **New Player Deposits**: New player deposits increase treasury reserves

**4.4 Treasury Health Mechanism**

- Treasury $FARM reserves affect exchange rate
- Sufficient reserves = better withdrawal rate for players
- Insufficient reserves = automatic rate adjustment to protect treasury
- Transparent, publicly viewable treasury address
- Continuous Dev buyback mechanism ensures long-term treasury stability

**4.5 Anti-inflation Mechanism**

- Crop prices designed for reasonable ROI
- Exchange fees as system revenue
- Dynamic rates prevent treasury depletion
- Dev buyback creates positive token cycle`,
        },
        {
          id: 'technical',
          title: '5. Technical Architecture',
          content: `**5.1 Frontend**

- **Framework**: React 18 + TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Web3**: ethers.js
- **Deployment**: Vercel

**5.2 Backend Services**

- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Twitter OAuth)
- **Real-time Sync**: Firestore listeners

**5.3 Smart Contracts**

- **Network**: BNB Smart Chain (BSC)
- **Token Standard**: BEP-20
- **Treasury**: Multi-sig wallet for security

**5.4 Security Measures**

- Wallet connection uses standard EIP-1193 protocol
- All on-chain transactions require user signature
- Encrypted game data storage
- Server-side validation prevents cheating`,
        },
        {
          id: 'roadmap',
          title: '6. Roadmap',
          content: `**Phase 1: Foundation (Complete)**
- Core farming gameplay
- Wallet connection & Twitter login
- Basic token exchange system
- Friend system

**Phase 2: Social Enhancement (In Progress)**
- Leaderboard system
- Daily tasks
- Achievement system
- Multi-language support

**Phase 3: Gameplay Expansion (Planned)**
- Season system
- Special events
- Marketplace trading
- NFT integration

**Phase 4: Ecosystem Expansion (Future)**
- Cross-chain support
- Governance token
- DAO community governance
- More GameFi elements`,
        },
        {
          id: 'disclaimer',
          title: '7. Disclaimer',
          content: `**Risk Warning**

- Cryptocurrency investments carry risks; $FARM token price may fluctuate
- In-game earnings do not constitute investment advice
- Please participate according to your risk tolerance
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

  // Use simplified Chinese sections as fallback
  const c = content[language] || content['zh-CN'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0E11] via-[#1a1d21] to-[#0B0E11]">
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
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-binance-yellow mb-2">{c.title}</h1>
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
                  className="text-gray-300 hover:text-binance-yellow transition-colors"
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
            <h2 className="text-2xl font-bold text-binance-yellow mb-4">{section.title}</h2>
            <div className="glass-panel rounded-xl p-6">
              <div className="prose prose-invert max-w-none">
                {section.content.split('\n').map((paragraph, idx) => {
                  // Helper to strip all asterisks used by markdown
                  const stripStars = (text: string) => text.replace(/\*/g, '');

                  // Handle code blocks
                  if (paragraph.trim().startsWith('```')) {
                    return null;
                  }
                  // Handle headers (lines that start and end with **)
                  if (paragraph.startsWith('**') && paragraph.endsWith('**') && !paragraph.slice(2, -2).includes('**')) {
                    return (
                      <h3 key={idx} className="text-lg font-bold text-white mt-6 mb-3">
                        {stripStars(paragraph)}
                      </h3>
                    );
                  }
                  // Handle list items
                  if (paragraph.trim().startsWith('-')) {
                    return (
                      <p key={idx} className="text-gray-300 ml-4">
                        {stripStars(paragraph)}
                      </p>
                    );
                  }
                  // Handle tables (simple markdown)
                  if (paragraph.includes('|')) {
                    return (
                      <p key={idx} className="text-gray-300 font-mono text-sm">
                        {stripStars(paragraph)}
                      </p>
                    );
                  }
                  // Regular paragraph
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
          <p>BSC Farm - Play-to-Earn Farming Game on BNB Smart Chain</p>
          <p className="mt-2">Powered by $FARM</p>
        </div>
      </footer>
    </div>
  );
};

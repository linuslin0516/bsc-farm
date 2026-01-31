# BSC Happy Farm - Tokenomics Model
# 代幣經濟學模型

> 最後更新: 2026-01-30

---

## 1. 雙幣系統架構

### 1.1 代幣概覽

| 代幣 | 類型 | 用途 | 區塊鏈 |
|------|------|------|--------|
| **$GOLD** | 軟幣 (Soft Currency) | 遊戲內經濟活動 | 鏈下 (Firebase) |
| **$FARM** | 硬幣 (Hard Currency) | 鏈上交易、提現 | BNB Chain (BSC) |

### 1.2 為什麼要雙幣系統？

根據 [Axie Infinity 的教訓](https://www.immutable.com/blog/tokenomics-in-web3-gaming-explained)，單幣系統容易導致：
- 無限通膨 → 代幣價值暴跌 95%+
- 投機者主導 → 破壞遊戲體驗
- 無法控制遊戲經濟

**雙幣系統優勢：**
- $GOLD 可無限生成（遊戲內用）
- $FARM 有限供應（鏈上稀缺性）
- 兌換機制控制通膨

---

## 2. $FARM 代幣 (主幣 - 鏈上)

### 2.1 代幣發行 (在 FLAP 平台)

根據 [FLAP 平台機制](https://dappbay.bnbchain.org/detail/flap)，以下是建議的發行策略：

| 項目 | 數值 | 說明 |
|------|------|------|
| **總供應量** | 1,000,000,000 $FARM | 10億代幣 |
| **初始流通量** | 200,000,000 $FARM | 20% (由 Dev 購買) |
| **發行成本** | < $1 USD | FLAP 平台優勢 |

### 2.2 買賣稅機制 (3%)

```
買入稅: 3%
├── 1.5% → 回購池 (Buyback Pool)
├── 1.0% → 開發基金 (Dev Fund)
└── 0.5% → 營銷錢包 (Marketing)

賣出稅: 3%
├── 2.0% → 回購池 (Buyback Pool)
├── 0.5% → 開發基金 (Dev Fund)
└── 0.5% → 持有者分紅 (Holder Rewards)
```

### 2.3 代幣分配

```
總量: 1,000,000,000 $FARM

┌─────────────────────────────────────────┐
│  20% │ Dev 初始購買 (鎖倉 6 個月)        │
│  30% │ 遊戲獎勵池 (2年線性釋放)          │
│  20% │ 流動性池 (永久鎖定)               │
│  15% │ 社區空投 & 活動                   │
│  10% │ 團隊 (12個月懸崖 + 24個月線性)    │
│   5% │ 生態合作 & 夥伴關係               │
└─────────────────────────────────────────┘
```

### 2.4 通縮機制 (Deflationary)

為避免 Axie 的通膨問題，我們採用多重銷毀機制：

1. **回購銷毀** - 每週用稅收回購並銷毀
2. **兌換銷毀** - $GOLD → $FARM 時銷毀 5% $FARM
3. **稀有作物銷毀** - 解鎖傳說作物消耗 $FARM

---

## 3. $GOLD 代幣 (遊戲幣 - 鏈下)

### 3.1 獲取方式

| 來源 | 獲得量 | 冷卻時間 |
|------|--------|----------|
| 收成作物 | 依作物價值 | 無 |
| 每日任務 | 50-500 $GOLD | 24小時 |
| 成就獎勵 | 100-5000 $GOLD | 一次性 |
| 偷菜成功 | 目標作物 10% | 每人每日3次 |
| 等級獎勵 | 等級 x 100 | 升級時 |

### 3.2 消耗方式 (Sinks)

| 用途 | 消耗量 | 重要性 |
|------|--------|--------|
| 購買種子 | 10-5000 $GOLD | 核心 |
| 擴建農地 | 500-10000 $GOLD | 核心 |
| 購買道具 | 50-500 $GOLD | 中等 |
| 加速生長 | 時間 x 2 $GOLD | 低 |
| 兌換 $FARM | 依匯率 | 核心 |

---

## 4. $GOLD ↔ $FARM 兌換機制

### 4.1 動態匯率系統

匯率會根據以下因素動態調整：

```
基礎匯率: 10,000 $GOLD = 1 $FARM

調整因素:
├── 每日兌換量 ↑ → 匯率 ↑ (需要更多 $GOLD)
├── $FARM 價格 ↑ → 匯率 ↑
├── 遊戲活躍用戶 ↑ → 匯率微調 ↑
└── 銷毀速度 ↑ → 匯率 ↓ (獎勵通縮)
```

### 4.2 兌換限制 (防刷機制)

| 限制類型 | 數值 | 目的 |
|----------|------|------|
| 每日兌換上限 | 100 $FARM / 玩家 | 防止鯨魚操控 |
| 最小兌換量 | 0.1 $FARM | 減少交易垃圾 |
| 兌換手續費 | 5% (銷毀) | 通縮壓力 |
| 冷卻時間 | 1小時 / 次 | 防機器人 |
| 帳號年齡要求 | 7天以上 | 防小號 |

### 4.3 兌換流程

```
玩家 $GOLD → 智能合約驗證 → 扣除手續費 → 發送 $FARM → 記錄到區塊鏈

詳細流程:
1. 玩家在遊戲內申請兌換 (例: 100,000 $GOLD)
2. 系統檢查:
   - 帳號年齡 ≥ 7天 ✓
   - 未達每日上限 ✓
   - 冷卻時間已過 ✓
3. 計算匯率: 100,000 ÷ 10,500 = 9.52 $FARM (含市場調整)
4. 扣除手續費: 9.52 × 5% = 0.476 $FARM (銷毀)
5. 玩家收到: 9.52 - 0.476 = 9.04 $FARM
6. 玩家可在 PancakeSwap 賣出 $FARM 換 BNB
```

---

## 5. 遊戲經濟平衡 (調整節奏)

### 5.1 問題：當前節奏太快

**現有成長時間 (太快!):**
| 稀有度 | 現有時間 | 問題 |
|--------|----------|------|
| Common | 1-2 分鐘 | 一小時可收成30+次 |
| Uncommon | 3-4 分鐘 | 太容易賺錢 |
| Rare | 5-7 分鐘 | 沒有稀缺感 |
| Epic | 10-14 分鐘 | 不夠"史詩" |
| Legendary | 20-60 分鐘 | 應該是半天 |

### 5.2 建議：新的成長時間

**調整後成長時間 (適合長期遊玩):**
| 稀有度 | 新時間 | 倍率 | 說明 |
|--------|--------|------|------|
| Common | 30-60 分鐘 | x30 | 每小時1-2次 |
| Uncommon | 2-4 小時 | x40 | 每天6-12次 |
| Rare | 6-12 小時 | x50 | 每天1-2次 |
| Epic | 24-36 小時 | x60 | 需要過夜 |
| Legendary | 48-72 小時 | x72 | 2-3天一次 |

### 5.3 新的作物定價

**調整後種子成本 & 售價:**
```javascript
// 新經濟數值 (建議)
const BALANCED_CROPS = {
  // Common - 基礎穩定收入
  carrot:     { cost: 50,    sellPrice: 80,    profit: 30,   ROI: "60%" },
  tomato:     { cost: 100,   sellPrice: 180,   profit: 80,   ROI: "80%" },

  // Uncommon - 中等風險收益
  corn:       { cost: 300,   sellPrice: 550,   profit: 250,  ROI: "83%" },
  potato:     { cost: 500,   sellPrice: 900,   profit: 400,  ROI: "80%" },

  // Rare - 高風險高回報
  strawberry: { cost: 1000,  sellPrice: 2000,  profit: 1000, ROI: "100%" },
  watermelon: { cost: 2000,  sellPrice: 4500,  profit: 2500, ROI: "125%" },

  // Epic - 需要長時間投資
  pumpkin:    { cost: 5000,  sellPrice: 12000, profit: 7000, ROI: "140%" },
  golden_wheat: { cost: 8000, sellPrice: 20000, profit: 12000, ROI: "150%" },

  // Legendary - 終極挑戰
  rainbow_rose:   { cost: 15000, sellPrice: 40000,  profit: 25000,  ROI: "167%" },
  cosmic_fruit:   { cost: 50000, sellPrice: 150000, profit: 100000, ROI: "200%" },
};
```

---

## 6. 真實供需定價系統

### 6.1 問題：當前系統是假的

現有的 `marketService.ts` 使用正弦波生成假價格，沒有反映真實供需。

### 6.2 解決方案：真實數據驅動

```typescript
// 新的供需定價邏輯
interface CropSupplyDemand {
  cropId: string;
  totalPlanted: number;      // 過去24小時種植數
  totalHarvested: number;    // 過去24小時收成數
  totalSold: number;         // 過去24小時出售數
  priceMultiplier: number;   // 1.0 = 基礎價
}

// 價格計算公式
function calculatePrice(crop: CropSupplyDemand): number {
  const supplyRatio = crop.totalHarvested / Math.max(crop.totalPlanted, 1);
  const demandRatio = crop.totalSold / Math.max(crop.totalHarvested, 1);

  // 供過於求 → 價格下跌
  // 供不應求 → 價格上漲
  const multiplier = (demandRatio / supplyRatio) * 0.5 + 0.75;

  // 限制波動範圍 (±30%)
  return Math.max(0.7, Math.min(1.3, multiplier));
}
```

### 6.3 需要追蹤的數據

| 事件 | 記錄到 Firebase | 用途 |
|------|-----------------|------|
| 種植作物 | crops_planted/{date} | 計算供應量 |
| 收成作物 | crops_harvested/{date} | 計算產出量 |
| 出售作物 | crops_sold/{date} | 計算需求量 |
| 偷菜 | crops_stolen/{date} | 影響供應 |

---

## 7. 防作弊 & 經濟安全

### 7.1 多重驗證機制

1. **服務端驗證** - 所有交易由 Firebase Functions 驗證
2. **時間戳檢查** - 作物不能在種植前收成
3. **頻率限制** - 每秒最多 1 個操作
4. **金額上限** - 單筆交易上限

### 7.2 異常檢測

```typescript
// 可疑行為標記
const SUSPICIOUS_PATTERNS = {
  rapidHarvests: 10,        // 1分鐘內收成超過10次
  impossibleBalance: 1000000, // 餘額異常高
  tooManyDevices: 3,        // 同時登入超過3台設備
};
```

---

## 8. 發幣流程 (FLAP 平台)

### 8.1 發幣步驟

1. **準備**
   - 設計代幣 logo (512x512 PNG)
   - 準備代幣名稱: `Happy Farm Token`
   - 準備符號: `FARM`

2. **在 FLAP 創建代幣**
   - 訪問 [flap.sh](https://flap.sh)
   - 連接錢包 (需要 BNB 作為 gas)
   - 填入代幣資訊
   - 設置 3% 買賣稅

3. **Dev 購買 20%**
   - 在 Bonding Curve 階段購買
   - 成本約 $XXX (依市場決定)

4. **畢業到 PancakeSwap**
   - 達到市值門檻後自動畢業
   - 流動性自動添加

### 8.2 稅收設置 (FLAP Tax as Funds)

```
FLAP 平台設置:
├── Enable Tax: ✓
├── Buy Tax: 3%
├── Sell Tax: 3%
├── Tax Recipient: [你的回購錢包]
└── Auto Dividend: ✓ (達到閾值自動分發)
```

---

## 9. 經濟模型數學驗證

### 9.1 日收益估算 (調整後)

假設玩家每天玩 2 小時：

| 活動 | 次數 | 單次收益 | 日收益 |
|------|------|----------|--------|
| Common 收成 | 4次 | 30 $GOLD | 120 |
| Uncommon 收成 | 2次 | 250 $GOLD | 500 |
| Rare 收成 | 0.5次 | 1000 $GOLD | 500 |
| 每日任務 | 3個 | 150 $GOLD | 450 |
| 偷菜 | 5次 | 50 $GOLD | 250 |
| **日總計** | - | - | **~1,820 $GOLD** |

### 9.2 轉換為 $FARM

```
日收益: 1,820 $GOLD
匯率: 10,000 $GOLD = 1 $FARM
日 $FARM: 0.182 $FARM

月收益: ~5.5 $FARM
年收益: ~66 $FARM
```

### 9.3 經濟可持續性

```
假設:
- 活躍玩家: 1,000 人
- 日均提現: 0.1 $FARM/人
- 總日提現: 100 $FARM

稅收補充 (3%):
- 假設日交易量: 10,000 $FARM
- 稅收: 300 $FARM
- 用於回購: ~250 $FARM

結論: 稅收 > 提現 = 可持續 ✓
```

---

## 10. 實施優先順序

### Phase 1: 基礎建設 (Week 1-2)
- [ ] 添加 $GOLD 代幣系統
- [ ] 調整作物成長時間
- [ ] 調整作物價格

### Phase 2: 數據追蹤 (Week 2-3)
- [ ] 實現真實供需追蹤
- [ ] 建立價格計算服務
- [ ] 添加異常檢測

### Phase 3: 鏈上整合 (Week 3-4)
- [ ] 在 FLAP 發行 $FARM
- [ ] 實現 $GOLD → $FARM 兌換
- [ ] 連接 PancakeSwap

### Phase 4: 優化 (Week 5+)
- [ ] 監控經濟數據
- [ ] 調整參數
- [ ] 添加更多消耗機制

---

## 參考資源

- [Immutable - Web3 Gaming Tokenomics](https://www.immutable.com/blog/tokenomics-in-web3-gaming-explained)
- [FLAP Platform - DappBay](https://dappbay.bnbchain.org/detail/flap)
- [GameFi 2.0 Token Economics](https://web3.gate.com/crypto-wiki/article/gamefi-2-0-why-token-economics-will-decide-the-future-of-blockchain-gaming-20251231)
- [Axie Infinity Lessons Learned](https://www.ainvest.com/news/role-tokenomics-user-engagement-web3-gaming-growth-cycle-2511/)

---

*此文檔由 Claude Code 協助生成，基於 Web3 遊戲代幣經濟學最佳實踐。*

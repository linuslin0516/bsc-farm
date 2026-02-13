# 🚀 Space Farm — Technical Specification

> **Deep Space Sci-Fi Farming Simulation Game**
> Project: BSC Farm | Version 0.1.0 | Firebase: `bscfarm-f83b4`

---

## 目錄

- [技術架構總覽](#技術架構總覽)
- [技術棧詳情](#技術棧詳情)
- [專案結構](#專案結構)
- [核心功能模組](#核心功能模組)
- [Firebase 後端架構](#firebase-後端架構)
- [狀態管理](#狀態管理)
- [遊戲資料定義](#遊戲資料定義)
- [元件架構](#元件架構)
- [工具函式與 Hooks](#工具函式與-hooks)
- [樣式與動畫系統](#樣式與動畫系統)
- [路由與權限控制](#路由與權限控制)
- [雲端函式（Cloud Functions）](#雲端函式cloud-functions)
- [環境變數配置](#環境變數配置)
- [建置與部署](#建置與部署)
- [遊戲機制摘要](#遊戲機制摘要)
- [關鍵技術決策](#關鍵技術決策)

---

## 技術架構總覽

| 層級 | 技術 | 版本 |
|------|------|------|
| **前端框架** | React | 18.3.1 |
| **程式語言** | TypeScript | ~5.6.2 |
| **建置工具** | Vite | 6.0.5 |
| **CSS 框架** | Tailwind CSS | 3.4.17 |
| **狀態管理** | Zustand | 5.0.0 |
| **路由** | React Router DOM | 7.13.0 |
| **後端服務** | Firebase (Firestore + Auth) | 12.8.0 |
| **雲端函式** | Firebase Cloud Functions | 4.5.0 |
| **區塊鏈** | ethers.js (BSC) | 6.13.4 |
| **國際化** | opencc-js | 1.0.5 |
| **程式碼檢查** | ESLint | 9.17.0 |
| **CSS 後處理** | PostCSS + Autoprefixer | 8.4.49 / 10.4.20 |

---

## 技術棧詳情

### Production Dependencies

| 套件 | 版本 | 用途 |
|------|------|------|
| `react` | ^18.3.1 | UI 框架 |
| `react-dom` | ^18.3.1 | React DOM 渲染 |
| `react-router-dom` | ^7.13.0 | 客戶端路由 |
| `firebase` | ^12.8.0 | 雲端資料庫、驗證、服務 |
| `firebase-admin` | ^13.6.0 | Cloud Functions Admin SDK |
| `zustand` | ^5.0.0 | 輕量級狀態管理 |
| `opencc-js` | ^1.0.5 | 繁簡中文轉換 |

### Dev Dependencies

| 套件 | 版本 | 用途 |
|------|------|------|
| `typescript` | ~5.6.2 | TypeScript 編譯器 |
| `vite` | ^6.0.5 | 建置工具與開發伺服器 |
| `@vitejs/plugin-react` | ^4.3.4 | Vite React 插件（Fast Refresh） |
| `tailwindcss` | ^3.4.17 | Utility-first CSS 框架 |
| `postcss` | ^8.4.49 | CSS 轉換處理 |
| `autoprefixer` | ^10.4.20 | 自動添加瀏覽器前綴 |
| `eslint` | ^9.17.0 | 程式碼品質檢查 |
| `@eslint/js` | ^9.17.0 | ESLint 基礎配置 |
| `eslint-plugin-react-hooks` | ^5.0.0 | React Hooks 規則 |
| `eslint-plugin-react-refresh` | ^0.4.16 | React Fast Refresh 支援 |
| `typescript-eslint` | ^8.18.2 | TypeScript ESLint 整合 |
| `globals` | ^15.14.0 | 全域變數定義 |
| `dotenv` | ^17.2.3 | 環境變數載入 |
| `@types/react` | ^18.3.18 | React 型別定義 |
| `@types/react-dom` | ^18.3.5 | React DOM 型別定義 |

---

## 專案結構

```
bsc_farm/
├── public/                          # 靜態資源
├── functions/                       # Firebase Cloud Functions
│   ├── index.js                     #   雲端函式定義（提款處理）
│   └── package.json                 #   Cloud Functions 依賴
├── src/
│   ├── components/                  # React 元件（36 個 .tsx 檔案）
│   │   ├── pages/                   #   頁面元件（7 個）
│   │   │   ├── LoginPage.tsx        #     Twitter 登入頁
│   │   │   ├── SetupPage.tsx        #     初始設定頁
│   │   │   ├── GamePage.tsx         #     主遊戲頁面
│   │   │   ├── FriendFarmPage.tsx   #     好友農場頁
│   │   │   ├── AdminPage.tsx        #     管理員後台
│   │   │   ├── WhitepaperPage.tsx   #     白皮書頁
│   │   │   └── ComingSoonPage.tsx   #     即將推出頁
│   │   ├── game/                    #   遊戲元件（21 個）
│   │   │   ├── AnimatedBackground.tsx   #  太空背景動畫
│   │   │   ├── HUD.tsx              #     抬頭顯示器
│   │   │   ├── IsometricFarm.tsx    #     等距農場渲染
│   │   │   ├── IsometricCell.tsx    #     等距格子渲染
│   │   │   ├── IsometricCrop.tsx    #     作物視覺化
│   │   │   ├── FarmGrid.tsx         #     農場格線容器
│   │   │   ├── FarmCell.tsx         #     農場格子
│   │   │   ├── FarmCamera.tsx       #     鏡頭控制
│   │   │   ├── CropToolbar.tsx      #     作物選擇工具列
│   │   │   ├── ToolToolbar.tsx      #     工具選擇工具列
│   │   │   ├── CropIcon.tsx         #     作物圖示
│   │   │   ├── CropCodex.tsx        #     作物圖鑑
│   │   │   ├── Shop.tsx             #     商店介面
│   │   │   ├── UpgradeShopPanel.tsx #     升級面板
│   │   │   ├── ActiveBonusesPanel.tsx #   活躍加成顯示
│   │   │   ├── CharacterStatsPanel.tsx #  角色數據面板
│   │   │   ├── LeaderboardPanel.tsx #     排行榜
│   │   │   ├── DailyTasksPanel.tsx  #     每日任務
│   │   │   ├── AchievementPanel.tsx #     成就系統
│   │   │   ├── Header.tsx           #     頂部欄位
│   │   │   └── Logo.tsx             #     遊戲 Logo
│   │   ├── social/                  #   社交元件（4 個）
│   │   │   ├── FriendPanel.tsx      #     好友管理面板
│   │   │   ├── FriendList.tsx       #     好友列表
│   │   │   ├── FriendRequests.tsx   #     好友請求
│   │   │   └── AddFriend.tsx        #     添加好友
│   │   └── ui/                      #   通用 UI 元件（4 個）
│   │       ├── Button.tsx           #     按鈕
│   │       ├── Modal.tsx            #     彈窗對話框
│   │       ├── Notification.tsx     #     通知提示
│   │       └── UnlockAnimation.tsx  #     解鎖動畫
│   ├── config/                      # 配置
│   │   ├── firebase.ts              #   Firebase 初始化
│   │   └── constants.ts             #   遊戲常數設定
│   ├── data/                        # 遊戲資料定義
│   │   ├── crops.ts                 #   作物定義（24+ 種）
│   │   ├── achievements.ts          #   成就定義
│   │   ├── dailyTasks.ts            #   每日任務定義
│   │   ├── shop.ts                  #   商店物品定義
│   │   └── upgrades.ts              #   升級系統定義
│   ├── hooks/                       # React Hooks
│   │   └── useFriendFarm.ts         #   好友農場訪問邏輯
│   ├── services/                    # Firebase 服務層（9 個）
│   │   ├── authService.ts           #   Twitter 身份驗證
│   │   ├── userService.ts           #   使用者資料管理
│   │   ├── achievementService.ts    #   成就追蹤
│   │   ├── dailyTaskService.ts      #   每日任務追蹤
│   │   ├── friendService.ts         #   好友系統
│   │   ├── stealService.ts          #   偷菜系統
│   │   ├── leaderboardService.ts    #   排行榜服務
│   │   ├── marketService.ts         #   動態市場定價
│   │   └── adminService.ts          #   管理員功能
│   ├── store/                       # Zustand 狀態管理（3 個）
│   │   ├── useGameStore.ts          #   遊戲狀態
│   │   ├── useAuthStore.ts          #   驗證狀態
│   │   └── useLanguageStore.ts      #   語言設定
│   ├── types/                       # TypeScript 型別定義
│   │   └── index.ts                 #   所有型別定義
│   ├── utils/                       # 工具函式
│   │   ├── i18n.ts                  #   國際化 (繁/簡/英)
│   │   ├── isometric.ts             #   等距渲染計算
│   │   └── timeOfDay.ts             #   時間相關工具
│   ├── App.tsx                      # 主應用入口與路由
│   ├── index.css                    # 全域樣式與動畫
│   └── main.tsx                     # React DOM 入口
├── firestore.rules                  # Firestore 安全規則
├── firestore.indexes.json           # Firestore 索引定義
├── firebase.json                    # Firebase 專案配置
├── tailwind.config.js               # Tailwind CSS 配置
├── tsconfig.json                    # TypeScript 配置
├── vite.config.ts                   # Vite 建置配置
├── postcss.config.js                # PostCSS 配置
├── eslint.config.js                 # ESLint 配置
├── package.json                     # 專案依賴與腳本
└── .env                             # 環境變數
```

---

## 核心功能模組

### 1. 身份驗證系統 (`authService.ts`)

- **驗證方式**：Twitter OAuth（Popup 優先，失敗時 fallback 到 Redirect）
- **Firebase Auth** 整合，提取 Twitter 個人資料
- 中文錯誤訊息處理

```typescript
// 核心函式
signInWithTwitter()        // Twitter 登入
checkRedirectResult()      // 處理 OAuth 重定向
signOut()                  // 登出
onAuthStateChanged(cb)     // 監聽驗證狀態
getTwitterProfile(user)    // 提取 Twitter 個人資料
getCurrentUser()           // 取得目前使用者
```

### 2. 使用者系統 (`userService.ts`)

- 自動生成 6 位數唯一 ID (`oderId`)
- 初始農場網格生成
- 使用者資料 CRUD

```typescript
// 核心函式
generateUserId()                    // 生成 6 位 ID
createUser()                        // 建立新使用者
getUserById(oderId)                 // 按 ID 查詢
getUserByTwitterUid(twitterUid)     // 按 Twitter UID 查詢
updateUser()                        // 更新使用者資料
updateFarmCells()                   // 同步農場狀態
updateBalance()                     // 更新 GOLD 餘額
updateBnbAddress()                  // 更新錢包地址
updateLastOnline()                  // 更新在線時間
isUserOnline()                      // 判斷是否在線（5 分鐘內）
```

### 3. 農場系統 (`useGameStore.ts`)

- 3×3 到 6×6 可擴展農場網格
- 種植 → 生長 → 收穫 完整流程
- 施肥加速、動態市場定價
- LocalStorage 持久化 + Firebase 雲端同步

### 4. 偷菜系統 (`stealService.ts`)

- 偷取作物售價的 10%–20%
- 每位好友 30 分鐘冷卻時間
- 同一格子不可重複偷取

```typescript
// 核心函式
canStealFromCell(oderId, targetId, position)    // 檢查是否可偷
checkStealCooldown(oderId, targetId)            // 冷卻時間檢查
stealCrop(oderId, targetId, position)           // 執行偷取
getStolenCellsForTarget(oderId, targetId)       // 已偷位置記錄
getHarvestValueAfterSteals(oderId, pos, value)  // 計算被偷後價值
```

### 5. 好友系統 (`friendService.ts`)

- 好友請求 / 接受 / 拒絕 / 刪除
- 雙方互發請求時自動加為好友
- 在線狀態追蹤（5 分鐘視窗）

```typescript
// 核心函式
sendFriendRequest(fromId, toId)           // 發送好友請求
acceptFriendRequest(myId, requesterId)    // 接受請求
rejectFriendRequest(myId, requesterId)    // 拒絕請求
removeFriend(myId, friendId)              // 刪除好友
getFriendListWithDetails(oderId)          // 好友列表含在線狀態
getPendingRequestsWithDetails(oderId)     // 待處理請求
```

### 6. 成就系統 (`achievementService.ts`)

- 農場、社交、收集、里程碑 四大類別
- 自動追蹤進度並解鎖
- 獎勵發放：經驗值 + GOLD 代幣

```typescript
// 追蹤類型
plant | harvest | steal | earn | login | discover_crop | level
```

### 7. 每日任務 (`dailyTaskService.ts`)

- 每天隨機生成 3–5 個任務
- UTC 午夜自動重置
- 防止重複領取獎勵

### 8. 排行榜 (`leaderboardService.ts`)

- 分數公式：`(等級 × 100) + (收穫次數 × 10) + (偷取次數 × 5)`
- 5 分鐘快取機制
- 支援多維度排序：分數 / 等級 / 收穫

### 9. 動態市場 (`marketService.ts`)

- 基於正弦波的時間定價波動
- 普通作物波動 0%–10%，傳說作物最高 +35%
- 保證最低 10% 利潤
- 1 小時更新週期

### 10. 管理員系統 (`adminService.ts`)

- 基於 Twitter UID 的管理員驗證
- 儀表板統計數據
- 玩家搜尋
- 空投 CSV 匯出與記錄

---

## Firebase 後端架構

### Firestore 集合結構

```
Firestore Database
├── users/{oderId}                     # 使用者帳號資料
├── players/{oderId}                   # 遺留玩家集合
├── dailyTasks/{oderId}                # 每日任務進度
├── achievements/{oderId}              # 成就追蹤資料
├── playerStats/{oderId}               # 排行榜統計數據
├── leaderboardCache/{document}        # 排行榜快取
├── friends/{oderId}                   # 好友列表與請求
├── steal_records/{document}           # 偷取歷史記錄
├── market/{document}                  # 動態作物定價
├── exchange/{document}                # 匯率資料（唯讀）
├── user_exchange/{userId}             # 使用者兌換歷史
├── airdropHistory/{document}          # 空投記錄（管理員）
├── withdrawal_requests/{requestId}    # 提款請求
└── exchange_transactions/{txId}       # 兌換交易記錄
```

### Firestore 索引

| 集合 | 欄位組合 | 排序 |
|------|---------|------|
| `withdrawal_requests` | userId (ASC) + createdAt (DESC) | Composite |
| `exchange_transactions` | userId (ASC) + timestamp (DESC) | Composite |

### 安全規則

目前所有集合均為 `allow read, write: if true`（開發模式），僅以下例外：
- `exchange/{document}`：**唯讀**（`write: false`），僅管理員可修改
- `withdrawal_requests/{requestId}`：可讀取、可建立，**不可更新**（僅 Cloud Functions 可更新）
- `exchange_transactions/{txId}`：可讀取、可建立，**不可更新**

---

## 狀態管理

### Zustand Store 架構

#### `useGameStore` — 遊戲核心狀態

| 狀態 | 型別 | 說明 |
|------|------|------|
| `player` | `Player \| null` | 玩家資料 |
| `goldBalance` | `number` | GOLD 餘額 |
| `farmCells` | `FarmCell[]` | 農場格子陣列 |
| `selectedCrop` | `string \| null` | 已選作物 ID |
| `selectedTool` | `string \| null` | 已選工具 ID |
| `inventory` | `InventoryItem[]` | 背包物品 |
| `transactions` | `Transaction[]` | 交易記錄 |
| `playerUpgrades` | `PlayerUpgrades` | 升級等級與花費 |

**持久化**：LocalStorage（Key: `space_farm_state`）

#### `useAuthStore` — 驗證狀態

| 狀態 | 型別 | 說明 |
|------|------|------|
| `firebaseUser` | `User \| null` | Firebase 使用者物件 |
| `twitterProfile` | `TwitterProfile \| null` | Twitter 個人資料 |
| `isAuthenticating` | `boolean` | 驗證中狀態 |
| `isInitialized` | `boolean` | 初始化完成 |
| `error` | `string \| null` | 錯誤訊息 |

#### `useLanguageStore` — 語言設定

| 狀態 | 型別 | 說明 |
|------|------|------|
| `language` | `'zh-CN' \| 'zh-TW' \| 'en'` | 當前語言 |

**持久化**：LocalStorage（Key: `bsc-farm-language`）

---

## 遊戲資料定義

### 作物系統 (`crops.ts`) — 24+ 種作物

| 稀有度 | 生長時間 | 範例作物 |
|--------|---------|---------|
| **Common** | 180–300 秒 | 太空芽 🌱、月光草 🍃、泡泡果 🫧、冰晶花 🧊 |
| **Uncommon** | 300–420 秒 | 星塵蘑菇 🔮、電漿莓 ⚡、漩渦藤蔓 |
| **Rare** | 600–900 秒 | 藍莓、草莓、南瓜、西瓜、葡萄 |
| **Epic** | 1200–1800 秒 | 鑽石蘋果、鳳凰羽毛、宇宙虛空豆 |
| **Legendary** | 2700–3600 秒 | 彩虹玫瑰、黃金蘋果、鳳凰花、月光蘭花、宇宙果 |

**作物屬性**：id、name、nameCn、cost、growthTime、sellPrice、experience、rarity、unlockLevel、emoji、stages

### 成就系統 (`achievements.ts`)

| 類別 | 成就範例 |
|------|---------|
| **Farming** | 首次種植、種植 10/50/200/1000、收穫 10/50/100 |
| **Social** | 偷取 5/25/100、好友 5/10 |
| **Collection** | 收集全部、收集傳說、收集普通、收集稀有 |
| **Milestone** | 連續登入 3/10/30、等級 10/25/50 |

### 每日任務 (`dailyTasks.ts`)

任務池：種植 3/5/10、收穫 3/5/10、偷取 1/3/5、賺取 500/1000/2000 GOLD、訪問 1/2 位好友

### 升級系統 (`upgrades.ts`) — 8 種升級

| 分類 | 升級 | 最大等級 | 效果 |
|------|------|---------|------|
| **生產** | 溫室 | 3 | 生長時間 -10%/-20%/-30% |
| **生產** | 灑水器 | 3 | 售價 +8%/+16%/+24% |
| **生產** | 肥料站 | 3 | 經驗值 +15%/+30%/+45% |
| **生產** | 黃金工具 | 3 | 稀有+作物加成 +12%/+24%/+36% |
| **防護** | 稻草人 | 3 | 防盜機率 +15%/+30%/+45% |
| **防護** | 看門狗 | 3 | 額外防盜 +10%/+20%/+30% |
| **擴展** | 倉庫 | 3 | 農場格數 +2/+4/+6 |
| **特殊** | 加速器 / 幸運草 | — | 特殊效果 |

### 商店 (`shop.ts`)

- **土地擴展**：4×4（500 GOLD）、5×5（2,000 GOLD）、6×6（5,000 GOLD）
- **工具**：肥料（50）、超級肥料（150）、黃金水等
- **加成道具**：各種效果

---

## 元件架構

### 頁面元件（7 個）

| 元件 | 檔案 | 說明 |
|------|------|------|
| LoginPage | `pages/LoginPage.tsx` | Twitter OAuth 登入 |
| SetupPage | `pages/SetupPage.tsx` | 新使用者初始設定 |
| GamePage | `pages/GamePage.tsx` | 主遊戲介面（含好友訪問整合） |
| FriendFarmPage | `pages/FriendFarmPage.tsx` | 好友農場（遺留） |
| AdminPage | `pages/AdminPage.tsx` | 管理員儀表板 |
| WhitepaperPage | `pages/WhitepaperPage.tsx` | 白皮書 |
| ComingSoonPage | `pages/ComingSoonPage.tsx` | 即將推出頁 |

### 遊戲元件（21 個）

| 元件 | 說明 |
|------|------|
| `AnimatedBackground` | 深空背景：星星閃爍、星雲漂移、流星動畫 |
| `HUD` | 抬頭顯示器：左側玩家面板 + 右側功能按鈕 |
| `IsometricFarm` | 等距 2.5D 農場渲染引擎 |
| `IsometricCell` | 單個等距格子（小行星岩石材質） |
| `IsometricCrop` | 作物動畫渲染 |
| `FarmGrid` | 農場格線容器 |
| `FarmCell` | 單個農場格子 |
| `FarmCamera` | 鏡頭平移與縮放控制 |
| `CropToolbar` | 作物選擇工具列 |
| `ToolToolbar` | 工具選擇工具列 |
| `CropIcon` | 作物圖示顯示 |
| `CropCodex` | 作物圖鑑（百科全書） |
| `Shop` | 商店介面 |
| `UpgradeShopPanel` | 農場升級面板 |
| `ActiveBonusesPanel` | 活躍加成顯示 |
| `CharacterStatsPanel` | 角色數據面板 |
| `LeaderboardPanel` | 排行榜（分數/等級/收穫） |
| `DailyTasksPanel` | 每日任務追蹤 |
| `AchievementPanel` | 成就系統 |
| `Header` | 頂部欄位 |
| `Logo` | 遊戲 Logo |

### 社交元件（4 個）

| 元件 | 說明 |
|------|------|
| `FriendPanel` | 好友管理主面板 |
| `FriendList` | 好友列表（含在線狀態） |
| `FriendRequests` | 待處理好友請求 |
| `AddFriend` | 添加好友介面 |

### 通用 UI 元件（4 個）

| 元件 | 說明 |
|------|------|
| `Button` | 可復用按鈕元件 |
| `Modal` | 彈窗對話框 |
| `Notification` | Toast 通知提示 |
| `UnlockAnimation` | 解鎖特效動畫 |

---

## 工具函式與 Hooks

### `utils/i18n.ts` — 國際化

- 支援語言：`zh-CN`（簡體中文）、`zh-TW`（繁體中文）、`en`（英文）
- 整合 `opencc-js` 進行繁簡轉換
- 函式：`toSimplified()`、`localizeZh()`、`localizeText()`、`getRarityLabel()`

### `utils/isometric.ts` — 等距渲染

- 常數：`CELL_WIDTH = 80`、`CELL_HEIGHT = 40`
- 座標轉換：`screenToIso()`、`isoToScreen()`
- 碰撞檢測：`isPointInDiamond()`、`getCellAtScreenPosition()`

### `utils/timeOfDay.ts` — 時間工具

- 時段判定：`getTimeOfDay()` → dawn / morning / afternoon / evening / night
- 問候語：`getTimeGreeting()` → 對應中文問候

### `hooks/useFriendFarm.ts` — 好友農場

- 載入好友農場資料
- 每秒更新作物生長階段
- 偷取操作（整合成就 + 每日任務 + 排行榜追蹤）
- 回傳：`friendFarm`、`stolenPositions`、`isLoading`、`friendLevel`、`handleSteal`、`stolenCount`、`stealableCount`

---

## 樣式與動畫系統

### Tailwind 自定義主題色

```javascript
// 太空主題色
space-blue: '#0EA5E9'        space-cyan: '#22D3EE'
space-purple: '#8B5CF6'      space-dark: '#0F172A'
space-deep: '#050510'        space-gray: '#1E293B'
space-glow: '#67E8F9'        space-pink: '#EC4899'
space-indigo: '#6366F1'

// 生物發光色
space-bio-cyan: '#00f5d4'    space-bio-purple: '#9b5de5'

// 能量色
space-energy-glow: '#00bbf9'

// 岩石材質色
space-rock-dark: '#2a2a3e'   space-rock-mid: '#3a3a52'

// 農場色系
farm-green-light/dark, farm-sky, farm-soil, farm-grass
```

### 自定義動畫

| 動畫 | 說明 |
|------|------|
| `bounce-slow` | 緩慢彈跳 |
| `pulse-glow` | 脈衝發光 |
| `grow` | 生長效果 |
| `shake` | 搖晃效果 |
| `float` | 漂浮效果 |
| `sparkle` | 閃爍效果 |
| `sway` | 搖擺效果 |
| `twinkle` / `twinkle-slow` / `twinkle-fast` | 星星閃爍（三種速度） |
| `nebula-drift` / `nebula-drift-reverse` | 星雲漂移 |
| `crack-pulse` | 裂紋脈衝（生物發光） |

### CSS 自定義類別

| 類別 | 說明 |
|------|------|
| `.hud-panel` | 玻璃態射面板（backdrop-blur、半透明邊框） |
| `.glass-panel` / `.glass-panel-solid` | 玻璃效果面板 |
| `.visit-banner` | 好友訪問紅色橫幅 |
| `.btn-primary` | 主要藍色按鈕 |
| `.btn-secondary` | 次要青色邊框按鈕 |
| `.farm-cell` | 農場格子（含 planted、mature 狀態） |

### 字體

```javascript
fontFamily: {
  game: ['Comic Sans MS', 'Chalkboard SE', 'cursive']
}
```

---

## 路由與權限控制

### 路由配置 (`App.tsx`)

| 路徑 | 元件 | 保護機制 |
|------|------|---------|
| `/login` | LoginPage | `LoginRoute`（已登入則重定向） |
| `/setup` | SetupPage | `SetupRoute`（需 Twitter，無玩家資料） |
| `/game` | GamePage | `ProtectedRoute`（需完整玩家資料） |
| `/whitepaper` | WhitepaperPage | 公開 |
| `/admin` | AdminPage | 公開（內部檢查管理員身份） |
| `/` | — | 重定向至 `/game` 或 `/login` |
| `*` | — | 重定向至 `/` |

### COMING_SOON 模式

啟用時（`VITE_COMING_SOON=true`）僅允許：`/whitepaper`、`/admin`、`/coming-soon`

---

## 雲端函式（Cloud Functions）

### `processWithdrawal`

- **觸發器**：`onDocumentCreated` — `withdrawal_requests/{requestId}`
- **區域**：`asia-east1`
- **網路**：BSC Testnet（支援切換至 Mainnet）
- **依賴**：`ethers.js` ^6.13.4

**處理流程**：

```
1. 驗證請求狀態（pending）和必要欄位
2. 透過 ethers.js 連接 BSC 網路
3. 使用 Treasury 錢包發送 ERC20 代幣
4. 檢查餘額和最低利潤
5. 更新狀態：pending → processing → completed / failed
6. 成功時更新 user_exchange 資料
```

**安全**：Treasury 私鑰透過 Firebase Secret Manager 管理（`TREASURY_PRIVATE_KEY`）

---

## 環境變數配置

| 變數 | 說明 |
|------|------|
| `VITE_FIREBASE_API_KEY` | Firebase API 金鑰 |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth 網域 |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 專案 ID（`bscfarm-f83b4`） |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage 位址 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging 發送者 ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_ADMIN_TWITTER_UIDS` | 管理員 Twitter UID（逗號分隔） |
| `VITE_COMING_SOON` | 即將推出模式開關（`true`/`false`） |

---

## 建置與部署

### NPM 腳本

```bash
npm run dev        # 啟動 Vite 開發伺服器
npm run build      # TypeScript 編譯 + Vite 生產建置
npm run lint       # ESLint 程式碼檢查
npm run preview    # 預覽生產建置
```

### TypeScript 配置重點

- **Target**：ES2020
- **Module**：ESNext（bundler 解析）
- **JSX**：react-jsx（自動模式）
- **嚴格模式**：啟用
- **路徑別名**：`@/*` → `src/*`

### Vite 配置

- **插件**：`@vitejs/plugin-react`（Fast Refresh）
- **路徑解析**：`@` 指向 `./src`

---

## 遊戲機制摘要

| 機制 | 細節 |
|------|------|
| **農場規模** | 3×3 → 4×4 → 5×5 → 6×6（需購買擴展） |
| **最高等級** | 50 級 |
| **升級經驗公式** | `Math.floor(100 × 1.5^(level-1))` |
| **初始餘額** | 500 GOLD |
| **偷取比例** | 作物售價的 10%–20% |
| **偷取冷卻** | 每位好友 30 分鐘 |
| **市場波動** | 正弦波，普通 0%–10%，傳說最高 +35% |
| **最低利潤** | 保證售價高於成本 10% |
| **排行榜分數** | `(等級 × 100) + (收穫 × 10) + (偷取 × 5)` |
| **每日任務** | 每天 3–5 個，UTC 午夜重置 |
| **在線判定** | 5 分鐘內有活動視為在線 |

---

## 關鍵技術決策

| 決策 | 理由 |
|------|------|
| **Zustand 而非 Redux** | 輕量、API 簡潔、最少樣板程式碼 |
| **Firestore 而非傳統資料庫** | 即時同步、無伺服器、按用量計費 |
| **僅 Twitter OAuth** | 簡化驗證流程，符合目標用戶群 |
| **等距渲染** | 2.5D 視覺效果，增強農場遊戲體驗 |
| **客戶端狀態 + 雲端同步** | 即時 UI 回應 + 伺服器持久化 |
| **正弦波定價** | 確定性、可預測，無需複雜供需計算 |
| **Cloud Functions 處理區塊鏈** | 保護私鑰安全，伺服器端執行 |
| **LocalStorage 持久化** | 離線感知，減少 API 請求 |
| **繁簡中文 + opencc-js** | 繁體中文為主，自動轉換為簡體 |
| **太空主題** | 現代科幻美學，區別於傳統農場遊戲 |

---

> 最後更新：2026-02-12

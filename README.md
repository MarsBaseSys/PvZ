# PvZ Web

一个用纯 TypeScript + HTML5 Canvas 实现的《植物大战僵尸》网页版克隆，附带一个复用同一批素材的双语英语学习小游戏。

- 在线仓库：https://github.com/MarsBaseSys/PvZ

## 技术栈

- **纯 TypeScript + HTML5 Canvas**（不依赖 Phaser 等游戏引擎）
- **Vite** 作为构建工具 / 开发服务器
- 面向对象 + 简单的 Entity-Component 风格主循环
- Web Audio API 做音效，Web Speech API 做英语语音播报

## 环境要求

- Node.js（建议 18+）与 npm

## 快速开始

```bash
npm install
npm run dev
```

启动后在浏览器打开终端输出的地址（默认 `http://localhost:5173`）即可开始游戏。

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器（带热更新） |
| `npm run build` | 先跑 `tsc --noEmit` 类型检查，再执行生产构建，产物输出到 `dist/` |
| `npm run preview` | 本地预览 `build` 产物 |

## 怎么玩

1. **收集阳光**：屏幕上会自然掉落阳光，点击它即可收集（+25）；向日葵也会持续产出阳光。
2. **选择植物**：点击顶部卡槽里的植物卡片进行选择（需要阳光足够且不在冷却中）。
3. **种植**：选中植物后，点击草坪上高亮的格子即可种下。
4. **抵御僵尸**：僵尸会从右侧向左移动，进入你的草坪并攻击植物；若僵尸越过草坪左边界，游戏失败。
5. **通关**：清空当前关卡所有波次的僵尸后，会出现一张奖励卡片，点击收集即可解锁新植物。

当前可用植物：

| 植物 | 花费 | 作用 |
| --- | --- | --- |
| 向日葵 Sunflower | 50 | 定期产出阳光 |
| 豌豆射手 Peashooter | 100 | 向同一行的僵尸发射豌豆 |
| 坚果墙 Wall-nut | 50 | 高血量，阻挡僵尸但不攻击 |

僵尸类型：普通僵尸（Basic）、路障僵尸（Conehead，带额外护甲）。

游戏过程中会有英文语音播报（种植植物、收集阳光、僵尸出现等事件），可用于顺带磨耳朵。

## 项目结构

```
├── index.html              # 游戏主页面
├── english-demo.html        # 英语学习 Demo 入口
├── src/
│   ├── main.ts              # 游戏入口
│   ├── config/               # 数值配置（植物/僵尸参数、关卡数据）
│   ├── engine/                # 核心引擎：GameEngine 主循环、Grid、LevelManager、InputManager
│   ├── objects/               # 游戏实体：Plant、Zombie、Pea、Sun、RewardCard...
│   ├── utils/                  # 工具：音效引擎、语音播报、通用数学函数等
│   └── english-demo/           # 英语学习 Demo 独立小应用
└── vite.config.ts
```

## 彩蛋：英语学习 Demo

主页面右上角有一个「🔤 学英语 Demo」入口（对应 `english-demo.html`），复用游戏里的植物/僵尸/阳光图标做成一个英语单词选择题小游戏，并配有英文语音朗读，适合边玩边学单词。

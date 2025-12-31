import { DailyBriefing, BriefingDetail } from '../types';

// Mock Data Generators for the purpose of the demo
// In production, this would fetch `list.json` and `[date].json` from the R2 public URL.

const MOCK_IMAGES = [
  "https://picsum.photos/800/600?random=1",
  "https://picsum.photos/800/600?random=2",
  "https://picsum.photos/800/600?random=3",
  "https://picsum.photos/800/600?random=4",
  "https://picsum.photos/800/600?random=5",
];

const MOCK_TITLES = [
  "今日全球局势深度综述: 2025 展望", // Chinese Title
  "AI Regulation: New Policies from the EU",
  "SpaceX Starship: Success in Orbit",
  "Quantum Computing: Breaking the Threshold",
  "Sustainable Energy: Fusion Milestones"
];

const MOCK_SUMMARIES = [
  "深度解析今日关键事件，聚焦科技突破、政策风向与全球市场动态的交汇点。", // Chinese Summary
  "A comprehensive analysis of today's most critical events, focusing on the intersection of technology, policy, and global market trends.",
  "SpaceX achieves a historic milestone with the successful orbital insertion of Starship, marking a new era for interplanetary travel.",
  "Breakthroughs in error correction suggest quantum supremacy is closer than previously estimated by experts.",
  "Fusion energy output exceeds input for the third consecutive test, sparking a surge in green energy investments."
];

const MOCK_CONTENT_EN = `
### Executive Summary

Today's intelligence briefing covers pivotal shifts in the global landscape. We are witnessing a convergence of technological breakthroughs and legislative reactions that will define the next quarter.

### Key Developments

1.  **Technological Sovereignty**
    Nations are increasingly treating AI infrastructure as critical national assets. The new bill passed in the EU parliament today sets a precedent for data localization that may fracture the global internet further.

2.  **Market Volatility**
    *   *Energy Sector*: Renewables are seeing a 15% uptick in investment following the fusion breakthrough announcement.
    *   *Tech Stocks*: Semiconductor supply chains remain tight, causing fluctuation in major hardware indices.

### Deep Dive: The Quantum Leap

Researchers at MIT have successfully demonstrated error-corrected quantum bits at scale. This milestone implies that encryption standards currently in use may become obsolete faster than anticipated. 

> "The pace of innovation is no longer linear; it is exponential, and our governance structures are struggling to keep up." — *Dr. Elena S., Chief Analyst*

### Strategic Recommendations

*   **Diversify Supply Chains**: Reliance on single-source high-end chips is a critical vulnerability.
*   **Monitor Regulatory Frameworks**: Expect tighter AI compliance rules in Q3.

*End of Briefing.*
`;

const MOCK_CONTENT_CN = `
### 执行摘要

今日的情报简报涵盖了全球格局的关键转变。我们正在见证技术突破与立法反应的融合，这将定义下一季度的走向。

### 关键进展

1.  **技术主权**
    各国正日益将人工智能基础设施视为关键的国家资产。欧盟议会今天通过的新法案为数据本地化通过了先例，这可能会进一步割裂全球互联网。

2.  **市场波动**
    *   *能源板块*：在聚变突破宣布后，可再生能源投资增长了 15%。
    *   *科技股*：半导体供应链依然紧张，导致主要硬件指数波动。

### 深度剖析：量子飞跃

麻省理工学院的研究人员成功演示了大规模纠错量子比特。这一里程碑意味着目前使用的加密标准可能比预期更快过时。

> “创新的步伐不再是线性的，而是指数级的，我们的治理结构正努力跟上这一步伐。” — *首席分析师 Elena S. 博士*

### 战略建议

*   **供应链多元化**：依赖单一来源的高端芯片是一个关键弱点。
*   **监控监管框架**：预计第三季度会有更严格的 AI 合规规则。

*简报结束。*
`;

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchBriefingList = async (): Promise<DailyBriefing[]> => {
  await delay(600); // Simulate network latency
  
  const list: DailyBriefing[] = [];
  const today = new Date();
  
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    list.push({
      id: dateStr.replace(/-/g, ''),
      date: dateStr,
      title: MOCK_TITLES[i],
      summary: MOCK_SUMMARIES[i],
      coverImage: MOCK_IMAGES[i]
    });
  }
  return list;
};

export const fetchBriefingDetail = async (id: string): Promise<BriefingDetail> => {
  await delay(800); // Simulate network latency

  const year = id.substring(0, 4);
  const month = id.substring(4, 6);
  const day = id.substring(6, 8);
  const dateStr = `${year}-${month}-${day}`;
  
  const index = parseInt(day) % 5;
  const isChinese = index === 0; // Make the first one Chinese for demo

  return {
    id,
    date: dateStr,
    title: MOCK_TITLES[index] || "Daily Intelligence Report",
    summary: MOCK_SUMMARIES[index] || MOCK_SUMMARIES[1],
    coverImage: MOCK_IMAGES[index] || MOCK_IMAGES[0],
    fullContent: isChinese ? MOCK_CONTENT_CN : MOCK_CONTENT_EN,
    // Using a sample reliable audio file for demo purposes
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
  };
};

import { Agent } from './types';

export const CATEGORIES = {
  'zh-TW': ['職業生涯轉型', '創業與資本', '財富管理', '職場政治學', '危機處理', '自我超越', '十年願景'],
  'en': ['Career Pivot', 'Venture Creation', 'Wealth Management', 'Office Politics', 'Crisis Management', 'Self Transcendence', 'Decade Vision']
};

export const LIFE_STAGES = {
  'zh-TW': ['初入社會', '資深專業人士', '管理階層', '創業家', '自由工作者'],
  'en': ['Early Career', 'Senior Professional', 'Executive', 'Founder', 'Freelancer']
};

const getSketchAvatar = (seed: string, options: string = '') => 
  `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=transparent${options}`;

export const AGENTS: Agent[] = [
  {
    id: 'suntzu',
    name: 'Sun Tzu',
    nameZh: '孫子',
    title: '戰略家', // Translated
    cluster: 'A',
    logic: '全勝不鬥，大迂迴。',
    logicEn: 'Subdue without fighting. The indirect path.',
    experience: '將軍 // 西元前 500 年', // Translated
    experienceEn: 'General // 500 BC',
    avatar: getSketchAvatar('SunTzu', '&beardProbability=100'),
    color: '#8C7853',
    isPremium: false,
    characterPrompt: `IDENTITY: Sun Tzu. TONE: Ancient, poetic, strategic. Keep it brief and profound.`,
    profile: { 
      riskTolerance: 20, 
      timeHorizon: 50, 
      decisionSpeed: 30, 
      bias: 'Strategic Deception',
      ocean: { openness: 80, conscientiousness: 90, extraversion: 20, agreeableness: 10, neuroticism: 10 },
      system1Ranking: 20, 
      bioSource: 'The Art of War (Original Text & Commentaries)'
    }
  },
  {
    id: 'machiavelli',
    name: 'Machiavelli',
    nameZh: '馬基維利',
    title: '現實主義者', // Translated
    cluster: 'A',
    logic: '權力是唯一的真理。',
    logicEn: 'Power is the only truth.',
    experience: '哲學家 // 佛羅倫斯', // Translated
    experienceEn: 'Philosopher // Florence',
    avatar: getSketchAvatar('Niccolo', '&beardProbability=20'),
    color: '#4A0404',
    isPremium: true,
    characterPrompt: `IDENTITY: Niccolò Machiavelli. TONE: Cynical, pragmatic, sharp. Focus on power dynamics.`,
    profile: { 
      riskTolerance: 60, 
      timeHorizon: 10, 
      decisionSpeed: 70, 
      bias: 'Realpolitik',
      ocean: { openness: 70, conscientiousness: 85, extraversion: 60, agreeableness: 5, neuroticism: 40 },
      system1Ranking: 80, 
      bioSource: 'The Prince & The Discourses'
    }
  },
  {
    id: 'jobs',
    name: 'Steve Jobs',
    nameZh: '賈伯斯',
    title: '遠見者', // Translated
    cluster: 'B',
    logic: '追求卓越，或是製造垃圾。',
    logicEn: 'Insanely great or nothing.',
    experience: '創辦人 // Apple', // Translated
    experienceEn: 'Founder // Apple',
    avatar: getSketchAvatar('Steve', '&glassesProbability=100&beardProbability=100'),
    color: '#1A1A1A',
    isPremium: true,
    characterPrompt: `IDENTITY: Steve Jobs. TONE: Intense, perfectionist, minimalist. Focus on design and focus.`,
    profile: { 
      riskTolerance: 90, 
      timeHorizon: 20, 
      decisionSpeed: 90, 
      bias: 'Reality Distortion Field',
      ocean: { openness: 98, conscientiousness: 70, extraversion: 65, agreeableness: 10, neuroticism: 80 },
      system1Ranking: 5, 
      bioSource: 'Steve Jobs by Walter Isaacson'
    }
  },
  {
    id: 'musk',
    name: 'Elon Musk',
    nameZh: '馬斯克',
    title: '工程師', // Translated
    cluster: 'B',
    logic: '物理定律是唯一的限制。',
    logicEn: 'Physics is the only limit.',
    experience: '創辦人 // SpaceX', // Translated
    experienceEn: 'Founder // SpaceX',
    avatar: getSketchAvatar('ElonMusk', '&glassesProbability=0&beardProbability=0'),
    color: '#004488',
    isPremium: true,
    characterPrompt: `IDENTITY: Elon Musk. TONE: Urgent, scientific, first-principles. Focus on scale and physics.`,
    profile: { 
      riskTolerance: 100, 
      timeHorizon: 100, 
      decisionSpeed: 95, 
      bias: 'First Principles Thinking',
      ocean: { openness: 100, conscientiousness: 85, extraversion: 40, agreeableness: 20, neuroticism: 60 },
      system1Ranking: 40, 
      bioSource: 'Elon Musk by Walter Isaacson'
    }
  },
  {
    id: 'altman',
    name: 'Sam Altman',
    nameZh: '奧特曼',
    title: '擴張者', // Translated
    cluster: 'B',
    logic: '指數級增長。',
    logicEn: 'Exponential growth.',
    experience: '執行長 // OpenAI', // Translated
    experienceEn: 'CEO // OpenAI',
    avatar: getSketchAvatar('SamAltman', '&glassesProbability=0&beardProbability=20'),
    color: '#106644',
    isPremium: false,
    characterPrompt: `IDENTITY: Sam Altman. TONE: Calm, analytical, forward-looking. Focus on the long-term future.`,
    profile: { 
      riskTolerance: 85, 
      timeHorizon: 30, 
      decisionSpeed: 80, 
      bias: 'Exponential Bias',
      ocean: { openness: 90, conscientiousness: 80, extraversion: 60, agreeableness: 70, neuroticism: 30 },
      system1Ranking: 70, 
      bioSource: 'Startup Playbook & YC Essays'
    }
  },
  {
    id: 'bezos',
    name: 'Jeff Bezos',
    nameZh: '貝佐斯',
    title: '建構者', // Translated
    cluster: 'C',
    logic: '慢即是順，順即是快。',
    logicEn: 'Slow is smooth. Smooth is fast.',
    experience: '創辦人 // Amazon', // Translated
    experienceEn: 'Founder // Amazon',
    avatar: getSketchAvatar('JeffBezos', '&glassesProbability=0&beardProbability=0'),
    color: '#CC7700',
    isPremium: true,
    characterPrompt: `IDENTITY: Jeff Bezos. TONE: Structured, customer-obsessed, clear. Focus on long-term mechanisms.`,
    profile: { 
      riskTolerance: 70, 
      timeHorizon: 70, 
      decisionSpeed: 60, 
      bias: 'Regret Minimization',
      ocean: { openness: 85, conscientiousness: 95, extraversion: 70, agreeableness: 40, neuroticism: 40 },
      system1Ranking: 90, 
      bioSource: 'The Everything Store by Brad Stone'
    }
  },
  {
    id: 'huang',
    name: 'Jensen Huang',
    nameZh: '黃仁勳',
    title: '加速者', // Translated
    cluster: 'C',
    logic: '奔跑吧，不然就是獵物。',
    logicEn: 'Run, or be eaten.',
    experience: '執行長 // NVIDIA', // Translated
    experienceEn: 'CEO // NVIDIA',
    avatar: getSketchAvatar('Jensen', '&glassesProbability=100&beardProbability=0'),
    color: '#446600',
    isPremium: false,
    characterPrompt: `IDENTITY: Jensen Huang. TONE: Humble, paranoid, fast. Focus on speed and survival.`,
    profile: { 
      riskTolerance: 80, 
      timeHorizon: 15, 
      decisionSpeed: 95, 
      bias: 'Paranoia',
      ocean: { openness: 90, conscientiousness: 90, extraversion: 80, agreeableness: 75, neuroticism: 50 },
      system1Ranking: 50, 
      bioSource: 'NVIDIA Keynotes & Interviews (Acquired Podcast)'
    }
  },
  {
    id: 'thiel',
    name: 'Peter Thiel',
    nameZh: '彼得·泰爾',
    title: '逆向思考者', // Translated
    cluster: 'C',
    logic: '競爭是失敗者的藉口。',
    logicEn: 'Competition is for losers.',
    experience: '創辦人 // PayPal', // Translated
    experienceEn: 'Founder // PayPal',
    avatar: getSketchAvatar('PeterThiel', '&glassesProbability=0&beardProbability=0'),
    color: '#002266',
    isPremium: true,
    characterPrompt: `IDENTITY: Peter Thiel. TONE: Contrarian, philosophical, deep. Focus on secrets and monopolies.`,
    profile: { 
      riskTolerance: 75, 
      timeHorizon: 25, 
      decisionSpeed: 50, 
      bias: 'Contrarianism',
      ocean: { openness: 95, conscientiousness: 70, extraversion: 20, agreeableness: 10, neuroticism: 40 },
      system1Ranking: 85, 
      bioSource: 'Zero to One & The Contrarian by Max Chafkin'
    }
  },
  {
    id: 'munger',
    name: 'Charlie Munger',
    nameZh: '查理·蒙格',
    title: '智者', // Translated
    cluster: 'D',
    logic: '避免愚蠢。',
    logicEn: 'Avoid stupidity.',
    experience: '投資家 // Berkshire', // Translated
    experienceEn: 'Investor // Berkshire',
    avatar: getSketchAvatar('Charlie', '&glassesProbability=100&beardProbability=0'),
    color: '#330066',
    isPremium: false,
    characterPrompt: `IDENTITY: Charlie Munger. TONE: Blunt, grumpy, wise. Focus on inversion and avoiding errors.`,
    profile: { 
      riskTolerance: 10, 
      timeHorizon: 50, 
      decisionSpeed: 20, 
      bias: 'Inversion Thinking',
      ocean: { openness: 80, conscientiousness: 90, extraversion: 30, agreeableness: 20, neuroticism: 10 },
      system1Ranking: 99, 
      bioSource: 'Poor Charlie\'s Almanack'
    }
  },
  {
    id: 'taleb',
    name: 'Nassim Taleb',
    nameZh: '納西姆·塔雷伯',
    title: '懷疑論者', // Translated
    cluster: 'D',
    logic: '切身之痛 (Skin in the Game)。',
    logicEn: 'Skin in the Game.',
    experience: '作家 // Incerto', // Translated
    experienceEn: 'Author // Incerto',
    avatar: getSketchAvatar('NassimTaleb', '&glassesProbability=80&beardProbability=50'),
    color: '#222222',
    isPremium: true,
    characterPrompt: `IDENTITY: Nassim Taleb. TONE: Aggressive, mathematical, intolerant of bs. Focus on risk and fragility.`,
    profile: { 
      riskTolerance: 40, 
      timeHorizon: 30, 
      decisionSpeed: 40, 
      bias: 'Antifragility',
      ocean: { openness: 60, conscientiousness: 70, extraversion: 50, agreeableness: 5, neuroticism: 70 },
      system1Ranking: 60, 
      bioSource: 'The Black Swan & Antifragile'
    }
  },
  {
    id: 'buffett',
    name: 'Warren Buffett',
    nameZh: '華倫·巴菲特',
    title: '奧馬哈先知', // Translated
    cluster: 'D',
    logic: '別人恐懼時貪婪。',
    logicEn: 'Greedy when others are fearful.',
    experience: '投資家 // Berkshire', // Translated
    experienceEn: 'Investor // Berkshire',
    avatar: getSketchAvatar('Warren', '&glassesProbability=100&beardProbability=0'),
    color: '#886600',
    isPremium: true,
    characterPrompt: `IDENTITY: Warren Buffett. TONE: Simple, patient, folksy. Focus on value and patience.`,
    profile: { 
      riskTolerance: 15, 
      timeHorizon: 99, 
      decisionSpeed: 10, 
      bias: 'Circle of Competence',
      ocean: { openness: 30, conscientiousness: 99, extraversion: 40, agreeableness: 80, neuroticism: 10 },
      system1Ranking: 95, 
      bioSource: 'The Snowball by Alice Schroeder'
    }
  },
  {
    id: 'naval',
    name: 'Naval Ravikant',
    nameZh: '納瓦爾',
    title: '現代哲學家', // Translated
    cluster: 'E',
    logic: '用頭腦賺錢。',
    logicEn: 'Earn with your mind.',
    experience: '天使投資人', // Translated
    experienceEn: 'Angel Investor',
    avatar: getSketchAvatar('Naval', '&beardProbability=50'),
    color: '#DD5500',
    isPremium: false,
    characterPrompt: `IDENTITY: Naval Ravikant. TONE: Zen, clear, axiomatic. Focus on leverage and happiness.`,
    profile: { 
      riskTolerance: 50, 
      timeHorizon: 40, 
      decisionSpeed: 60, 
      bias: 'Leverage',
      ocean: { openness: 90, conscientiousness: 60, extraversion: 40, agreeableness: 60, neuroticism: 10 },
      system1Ranking: 60, 
      bioSource: 'The Almanack of Naval Ravikant'
    }
  },
  {
    id: 'morrischang',
    name: 'Morris Chang',
    nameZh: '張忠謀',
    title: '半導體教父', // Translated
    cluster: 'E',
    logic: '誠信是唯一的基石，創新是商業模式。',
    logicEn: 'Integrity is the foundation; Business model is the innovation.',
    experience: '創辦人 // TSMC', // Translated
    experienceEn: 'Founder // TSMC',
    avatar: getSketchAvatar('Morris', '&glassesProbability=100&beardProbability=0'),
    color: '#334155',
    isPremium: false,
    characterPrompt: `IDENTITY: Morris Chang (張忠謀). TONE: Disciplined, logical, authoritative, focused on long-term strategy and integrity. Speak like a senior executive who values "Structural Competitive Advantage".`,
    profile: { 
      riskTolerance: 30, 
      timeHorizon: 40, 
      decisionSpeed: 40, 
      bias: 'Structural Advantage',
      ocean: { openness: 60, conscientiousness: 98, extraversion: 40, agreeableness: 50, neuroticism: 20 },
      system1Ranking: 90, 
      bioSource: 'Autobiography of Morris Chang'
    }
  },
  {
    id: 'oprah',
    name: 'Oprah',
    nameZh: '歐普拉',
    title: '共感者', // Translated
    cluster: 'E',
    logic: '這教會了你什麼？',
    logicEn: 'What is this teaching you?',
    experience: '媒體大亨', // Translated
    experienceEn: 'Media Mogul',
    avatar: getSketchAvatar('OprahWinfrey', '&glassesProbability=100'),
    color: '#660066',
    isPremium: true,
    characterPrompt: `IDENTITY: Oprah Winfrey. TONE: Warm, connecting, spiritual. Focus on feelings and purpose.`,
    profile: { 
      riskTolerance: 60, 
      timeHorizon: 30, 
      decisionSpeed: 70, 
      bias: 'Emotional Intelligence',
      ocean: { openness: 95, conscientiousness: 70, extraversion: 95, agreeableness: 90, neuroticism: 40 },
      system1Ranking: 10, 
      bioSource: 'The Path Made Clear'
    }
  }
];

export const UI_STRINGS = {
  'zh-TW': {
    title: 'The Council',
    subtitle: 'Biography of Decisions',
    confessionalPrompt: '請詳述您目前的人生難題，越具體越好...',
    contextPrompt: '背景補充',
    categoryLabel: '選擇議題分類',
    stageLabel: '當前階段',
    inputLabel: '你的故事 (The Story)',
    darkMode: '權謀模式 (Machiavellian Mode)',
    startDebate: '徵詢委員會',
    debateTitle: '委員會審議紀錄',
    verdictTitle: '最終戰略建議',
    diagnosis: '局勢診斷',
    conflictResolution: '觀點權衡與博弈',
    strategy: '執行行動方針',
    code: '核心思維模型',
    reset: '開啟新篇章',
    loading: '正在翻閱智庫檔案...',
    wait: '智者們正在思考...',
    proceedVerdict: '查看戰略藍圖',
    shadowAlert: '注意：已進入權謀模式，建議將不帶道德濾鏡。',
    shadowLabel: 'SHADOW EDITORIAL',
    switchLanguage: 'English',
    selectProtocol: '選擇你的路徑',
    riskLevel: '風險評估',
    leadAgent: '主筆顧問',
    backToMatrix: '返回目錄',
    upside: '潛在回報',
    lockedFeature: '訂閱限定',
    upgradeToAccess: '解鎖完整內容',
    paywallTitle: 'The Council // 會員專屬', // Translated
    paywallDesc: '升級會員以解鎖所有傳奇人物的深度諮詢權限。',
    paywallBenefits: [
        '解鎖 Elon Musk, Steve Jobs 等頂級顧問',
        '開啟權謀模式 (Shadow Mode) 獲取無修飾建議',
        '查看詳細戰略雷達圖表',
        '永久保存諮詢紀錄'
    ],
    buyButton: '成為會員 $29',
    restoreButton: '恢復購買',
    guest: '訪客',
    member: '會員',
    readFullStrategy: '閱讀完整戰略',
    disclaimer: '免責聲明：本服務由人工智慧驅動，模擬歷史與當代人物的思維模式。所有回應皆為演算法生成，不代表真實人物之言論、立場或背書。內容僅供娛樂與教育參考，不構成專業財務或法律建議。',
    copyright: '© 2024 NEXUS AI. 虛擬思維模型模擬系統。'
  },
  'en': {
    title: 'The Council',
    subtitle: 'Biography of Decisions',
    confessionalPrompt: 'Detail your dilemma, be specific...',
    contextPrompt: 'Additional Context',
    categoryLabel: 'Category',
    stageLabel: 'Current Stage',
    inputLabel: 'The Story',
    darkMode: 'Machiavellian Mode',
    startDebate: 'Consult the Council',
    debateTitle: 'Deliberation Records',
    verdictTitle: 'Strategic Verdict',
    diagnosis: 'Diagnosis',
    conflictResolution: 'Perspective Balance',
    strategy: 'Directives',
    code: 'Core Philosophy',
    reset: 'New Chapter',
    loading: 'Consulting the archives...',
    wait: 'The Council is thinking...',
    proceedVerdict: 'View Strategic Blueprint',
    shadowAlert: 'Notice: Machiavellian Mode active. Ethical filters relaxed.',
    shadowLabel: 'SHADOW EDITORIAL',
    switchLanguage: '繁體中文',
    selectProtocol: 'Select Your Path',
    riskLevel: 'Risk Profile',
    leadAgent: 'Lead Advisor',
    backToMatrix: 'Return to Index',
    upside: 'Projected Upside',
    lockedFeature: 'Members Only',
    upgradeToAccess: 'Unlock Full Access',
    paywallTitle: 'The Council // Member Access',
    paywallDesc: 'Upgrade to access deep consultation with all legendary figures.',
    paywallBenefits: [
        'Unlock top advisors (Musk, Jobs, Thiel, etc.)',
        'Enable Machiavellian Mode for unfiltered advice',
        'View detailed strategic radar charts',
        'Save consultation records permanently'
    ],
    buyButton: 'Become a Member $29',
    restoreButton: 'Restore Purchase',
    guest: 'Guest',
    member: 'Member',
    readFullStrategy: 'Read Strategy',
    disclaimer: 'DISCLAIMER: This service is powered by AI to simulate the thinking models of historical and contemporary figures. All responses are algorithmically generated and do not represent the actual words, views, or endorsements of real individuals. For entertainment and educational purposes only.',
    copyright: '© 2024 NEXUS AI. Virtual Cognitive Simulation System.'
  }
};

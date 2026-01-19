
import React, { useState, useEffect, useRef } from 'react';
import { UI_STRINGS, AGENTS, CATEGORIES, LIFE_STAGES } from './constants';
import { AppState, Language, StrategicPath, StrategicMetrics, UserTier, Agent, ConflictDimension } from './types';
import { generateCouncilResponse } from './services/geminiService';

// --- Enhanced Sound System (ASMR Paper & Graphite) ---
const soundManager = {
    ctx: null as AudioContext | null,
    scratchBuffer: null as AudioBuffer | null,

    init: () => {
        try {
            if (!soundManager.ctx) {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                    soundManager.ctx = new AudioContextClass();
                    const bufferSize = soundManager.ctx.sampleRate * 2;
                    const buffer = soundManager.ctx.createBuffer(1, bufferSize, soundManager.ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        const white = Math.random() * 2 - 1;
                        data[i] = (lastOut + (0.02 * white)) / 1.02;
                        lastOut = data[i];
                        data[i] *= 3.5;
                    }
                    soundManager.scratchBuffer = buffer;
                }
            }
            if (soundManager.ctx && soundManager.ctx.state === 'suspended') soundManager.ctx.resume();
        } catch (e) {
            console.warn("Audio Context failed to initialize", e);
        }
    },

    playClick: () => {
        try {
            soundManager.init();
            if (!soundManager.ctx) return;

            const osc = soundManager.ctx.createOscillator();
            const gain = soundManager.ctx.createGain();

            osc.frequency.setValueAtTime(100, soundManager.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, soundManager.ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.02, soundManager.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, soundManager.ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(soundManager.ctx.destination);
            osc.start();
            osc.stop(soundManager.ctx.currentTime + 0.1);
        } catch (e) { }
    },

    playScratch: () => {
        try {
            soundManager.init();
            if (!soundManager.ctx || !soundManager.scratchBuffer) return;

            const noise = soundManager.ctx.createBufferSource();
            noise.buffer = soundManager.scratchBuffer;

            const noiseFilter = soundManager.ctx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.value = 800;

            const noiseGain = soundManager.ctx.createGain();
            const duration = 0.05 + Math.random() * 0.05;

            noiseGain.gain.setValueAtTime(0.03, soundManager.ctx.currentTime);
            noiseGain.gain.linearRampToValueAtTime(0, soundManager.ctx.currentTime + duration);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(soundManager.ctx.destination);

            noise.start();
            noise.stop(soundManager.ctx.currentTime + duration);
        } catch (e) { }
    }
};

let lastOut = 0;

// --- Components ---

const ErrorModal = ({ error, onClose, lang }: { error: string, onClose: () => void, lang: Language }) => {
    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm fade-in-up">
            <div className="bg-white max-w-sm w-full p-6 border-l-4 border-red-600 shadow-2xl relative torn-paper">
                <h3 className="text-xl serif-tc font-bold text-red-800 mb-2">{lang === 'zh-TW' ? '系統中斷' : 'System Interruption'}</h3>
                <p className="text-base text-gray-800 serif-tc mb-4 break-words leading-relaxed">
                    {error}
                </p>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-600 mb-4 overflow-x-auto">
                    Suggest: Check API Key in Cloudflare/Vite settings.
                </div>
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-[#1A1A1A] text-white text-sm font-bold uppercase tracking-widest hover:bg-red-800 transition-colors"
                >
                    {lang === 'zh-TW' ? '重新連線' : 'Reconnect'}
                </button>
            </div>
        </div>
    );
};

const SubscriptionModal = ({ onClose, onPurchase, lang }: { onClose: () => void, onPurchase: () => void, lang: Language }) => {
    const t = UI_STRINGS[lang];
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-white/95 backdrop-blur-md fade-in-up">
            <div className="bg-white max-w-md w-full p-10 border border-[#1A1A1A] shadow-2xl relative torn-paper">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black serif-tc text-2xl">✕</button>

                <div className="text-center mb-8">
                    <div className="w-16 h-1 bg-[#1A1A1A] mx-auto mb-6"></div>
                    <h2 className="text-3xl serif-tc font-bold text-[#1A1A1A] mb-3 tracking-wide">{t.paywallTitle}</h2>
                    <p className="text-gray-700 serif-tc italic">{t.paywallDesc}</p>
                </div>

                <div className="space-y-4 mb-10 border-t border-b border-gray-100 py-6">
                    {t.paywallBenefits.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <span className="text-[#8C7853] serif-tc font-bold mt-1">✦</span>
                            <span className="text-base text-gray-800 tracking-wide serif-tc">{benefit}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => { soundManager.playClick(); onPurchase(); }}
                    className="w-full py-4 bg-[#1A1A1A] text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#8C7853] transition-colors shadow-lg"
                >
                    {t.buyButton}
                </button>
                <button onClick={onPurchase} className="w-full mt-4 text-xs text-gray-500 uppercase tracking-widest hover:text-black">{t.restoreButton}</button>
            </div>
        </div>
    );
};

const AgentDetailModal = ({ agent, onClose, lang, userTier }: { agent: Agent, onClose: () => void, lang: Language, userTier: UserTier }) => {
    const t = UI_STRINGS[lang];
    const isLocked = agent.isPremium && userTier === 'OBSERVER';
    const displayName = lang === 'zh-TW' ? agent.nameZh : agent.name;
    const experience = lang === 'zh-TW' ? agent.experience : agent.experienceEn;
    const title = lang === 'zh-TW' ? agent.title : agent.title;

    const OceanBar = ({ label, value }: { label: string, value: number }) => (
        <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 w-8">{label}</span>
            <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#1A1A1A]" style={{ width: `${value}%` }}></div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm fade-in-up" onClick={onClose}>
            <div className="bg-[#F7F5F0] max-w-sm w-full p-8 border border-[#1A1A1A] shadow-2xl relative torn-paper" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black serif-tc text-2xl">✕</button>

                <div className="flex flex-col items-center text-center space-y-4">
                    <SketchAvatar
                        src={agent.avatar}
                        alt={displayName}
                        isActive={true}
                        isPremium={agent.isPremium}
                        isLocked={false}
                        size="w-24 h-24"
                    />

                    <div>
                        <h2 className="text-3xl serif-tc font-bold text-[#1A1A1A]">{displayName}</h2>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#8C7853] mt-2 font-bold">{title}</p>
                    </div>

                    <div className="w-8 h-[1px] bg-gray-300"></div>

                    <div className="space-y-6 py-2 w-full text-left">
                        {/* Core Bio */}
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold">
                                {lang === 'zh-TW' ? '傳記資料來源' : 'Biography Source'}
                            </p>
                            <p className="serif-tc text-sm text-gray-800 italic border-l-2 border-[#8C7853] pl-3 leading-snug">
                                {agent.profile.bioSource}
                            </p>
                        </div>

                        {/* OCEAN Model */}
                        <div className="bg-white/50 p-4 rounded border border-gray-100">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-bold text-center border-b border-gray-200 pb-2">
                                {lang === 'zh-TW' ? '五大性格特質 (OCEAN)' : 'Kosinski\'s OCEAN Model'}
                            </p>
                            <OceanBar label="O" value={agent.profile.ocean.openness} />
                            <OceanBar label="C" value={agent.profile.ocean.conscientiousness} />
                            <OceanBar label="E" value={agent.profile.ocean.extraversion} />
                            <OceanBar label="A" value={agent.profile.ocean.agreeableness} />
                            <OceanBar label="N" value={agent.profile.ocean.neuroticism} />
                        </div>

                        {/* System 1 vs 2 */}
                        <div>
                            <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-1.5">
                                <span>{lang === 'zh-TW' ? '直覺思維 (System 1)' : 'Intuition (Sys 1)'}</span>
                                <span>{lang === 'zh-TW' ? '邏輯思維 (System 2)' : 'Logic (Sys 2)'}</span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full relative">
                                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#8C7853] rounded-full border-2 border-white shadow-sm" style={{ left: `calc(${agent.profile.system1Ranking}% - 8px)` }}></div>
                            </div>
                        </div>
                    </div>

                    {isLocked && (
                        <div className="bg-gray-100 px-4 py-3 rounded-sm border border-gray-200 mt-4 w-full text-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-600 flex items-center justify-center gap-2">
                                <span>🔒</span> {t.lockedFeature}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SketchAvatar = ({ src, alt, isActive, isPremium, isLocked, size = "w-16 h-16" }: { src: string, alt: string, isActive: boolean, isPremium?: boolean, isLocked?: boolean, size?: string }) => {
    return (
        <div className={`relative ${size} flex-shrink-0 sketch-avatar-wrapper ${isActive ? 'sketch-active' : ''}`}>
            <div className={`w-full h-full rounded-full overflow-hidden border transition-all duration-700 bg-[#F5F5F0] relative
        ${isActive ? 'border-[#1A1A1A] shadow-md' : 'border-[#E0E0E0]'}
        ${isLocked ? 'opacity-50' : ''}
      `}>
                <img
                    src={src}
                    className="w-full h-full object-cover sketch-avatar"
                    alt={alt}
                    loading="lazy"
                />
                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                        <span className="text-2xl">🔒</span>
                    </div>
                )}
            </div>
            {isPremium && !isLocked && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center border border-white shadow-sm z-10">
                    <span className="text-[9px] serif-tc italic font-bold">P</span>
                </div>
            )}
        </div>
    );
};

// NEW: Strategic Conflict Table Component
const StrategicTable = ({ matrix, lang }: { matrix: ConflictDimension[], lang: Language }) => {
    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[600px] border border-[#E0E0E0] bg-white/60 shadow-sm torn-paper relative">
                {/* Header */}
                <div className="grid grid-cols-4 bg-[#1A1A1A] text-white border-b border-[#1A1A1A]">
                    <div className="p-4 flex items-center justify-center border-r border-gray-700">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] sans-tc">
                            {lang === 'zh-TW' ? '決策維度' : 'DIMENSION'}
                        </span>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-center border-r border-gray-700 bg-red-900/30">
                        <span className="text-xs font-bold uppercase tracking-widest serif-tc text-red-100">
                            {lang === 'zh-TW' ? '激進路徑' : 'Aggressive'}
                        </span>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-center border-r border-gray-700 bg-blue-900/30">
                        <span className="text-xs font-bold uppercase tracking-widest serif-tc text-blue-100">
                            {lang === 'zh-TW' ? '保守路徑' : 'Conservative'}
                        </span>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-center bg-[#8C7853]/30">
                        <span className="text-xs font-bold uppercase tracking-widest serif-tc text-[#E5E0D6]">
                            {lang === 'zh-TW' ? '側翼路徑' : 'Lateral'}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="divide-y divide-gray-200">
                    {matrix.map((row, idx) => (
                        <div key={idx} className="grid grid-cols-4 group hover:bg-white/80 transition-colors">
                            <div className="p-4 flex items-center justify-center border-r border-gray-200 bg-gray-50/50">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 sans-tc text-center">
                                    {row.dimension}
                                </span>
                            </div>
                            <div className="p-4 border-r border-gray-100">
                                <p className="text-sm serif-tc text-gray-800 leading-relaxed text-center group-hover:text-red-900 transition-colors">
                                    {row.aggressive}
                                </p>
                            </div>
                            <div className="p-4 border-r border-gray-100">
                                <p className="text-sm serif-tc text-gray-800 leading-relaxed text-center group-hover:text-blue-900 transition-colors">
                                    {row.conservative}
                                </p>
                            </div>
                            <div className="p-4">
                                <p className="text-sm serif-tc text-gray-800 leading-relaxed text-center group-hover:text-[#8C7853] transition-colors">
                                    {row.lateral}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const TechnicalRadar = ({ metrics, color, userTier, lang }: { metrics: StrategicMetrics, color: string, userTier: UserTier, lang: Language }) => {
    if (userTier === 'OBSERVER') {
        return (
            <div className="relative w-[240px] h-[240px] flex items-center justify-center border border-dashed border-gray-300 rounded-full bg-gray-50/50">
                <div className="text-center z-10">
                    <span className="text-3xl mb-3 block opacity-30">🔒</span>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        {lang === 'zh-TW' ? '機密資料' : 'Classified Data'}
                    </p>
                </div>
            </div>
        )
    }

    const size = 200;
    const center = size / 2;
    const radius = (size / 2) - 30;

    // Localized Labels
    const labels = lang === 'zh-TW' ?
        { inn: '創新', rsk: '風險', spd: '速度', cap: '資本', res: '韌性' } :
        { inn: 'Innov', rsk: 'Risk', spd: 'Speed', cap: 'Cap', res: 'Resil' };

    const data = [
        { key: labels.inn, label: 'Innovation', value: metrics.innovation },
        { key: labels.rsk, label: 'Risk', value: metrics.risk },
        { key: labels.spd, label: 'Speed', value: metrics.speed },
        { key: labels.cap, label: 'Capital', value: metrics.capital },
        { key: labels.res, label: 'Resilience', value: metrics.resilience }
    ];

    const angleSlice = (Math.PI * 2) / 5;
    const getPoint = (value: number, index: number) => {
        const r = (value / 100) * radius;
        const x = center + r * Math.cos(index * angleSlice - Math.PI / 2);
        const y = center + r * Math.sin(index * angleSlice - Math.PI / 2);
        return { x, y };
    };

    const points = data.map((d, i) => getPoint(d.value, i)).map(p => `${p.x},${p.y}`).join(' ');
    const fullPoints = data.map((d, i) => getPoint(100, i));

    return (
        <div className="flex flex-col items-center w-full">
            <div className="relative mb-6">
                <svg width={size} height={size} className="overflow-visible radar-chart-container">
                    {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
                        <circle key={i} cx={center} cy={center} r={radius * scale} fill="none" stroke="#D1D5DB" strokeDasharray={i === 4 ? "0" : "4,2"} strokeWidth="0.8" opacity={0.6} />
                    ))}
                    {fullPoints.map((p, i) => (
                        <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#E5E7EB" strokeWidth="1" />
                    ))}
                    <polygon points={points} fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
                    {data.map((d, i) => {
                        const p = getPoint(d.value, i);
                        return (
                            <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="2" />
                        );
                    })}
                    {fullPoints.map((p, i) => {
                        const angle = i * angleSlice - Math.PI / 2;
                        const labelX = center + (radius + 25) * Math.cos(angle);
                        const labelY = center + (radius + 15) * Math.sin(angle);
                        return (
                            <g key={i}>
                                <text x={labelX} y={labelY + 2} fill="#4B5563" fontSize="10" fontFamily="Noto Sans TC" textAnchor="middle" fontWeight="bold">
                                    {data[i].key}
                                </text>
                            </g>
                        )
                    })}
                </svg>
            </div>
            <div className="w-full grid grid-cols-2 gap-x-8 gap-y-2 text-left border-t border-gray-100 pt-6 mt-2">
                {data.map((d, i) => (
                    <div key={i} className="flex justify-between items-baseline border-b border-gray-50 pb-1">
                        <span className="text-[10px] uppercase tracking-widest text-gray-600 sans-tc font-semibold">{d.key}</span>
                        <div className="flex items-center gap-2">
                            <div className="h-1 bg-gray-100 w-12 rounded-full overflow-hidden">
                                <div className="h-full" style={{ width: `${d.value}%`, backgroundColor: color, opacity: 0.6 }}></div>
                            </div>
                            <span className="text-xs serif-tc font-bold text-gray-800 w-6 text-right">{d.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WritingLoader = ({ lang }: { lang: Language }) => {
    const [msgIndex, setMsgIndex] = useState(0);
    const messages = lang === 'zh-TW' ? [
        '正在翻閱孫子兵法...',
        '分析歷史市場數據...',
        '解構巴菲特投資模型...',
        '計算黑天鵝風險係數...',
        '模擬賈伯斯思維路徑...',
        '正在召集委員會成員...',
        '墨水未乾，請稍候...'
    ] : [
        'Consulting Sun Tzu\'s Art of War...',
        'Analyzing historical market data...',
        'Deconstructing Buffett models...',
        'Calculating Black Swan risks...',
        'Simulating Jobs\' design thinking...',
        'Summoning the Council...',
        'The ink is still wet...'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % messages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [lang]);

    return (
        <div className="flex flex-col items-center justify-center h-80 fade-in-up">
            <div className="quantum-loader mb-10">
                <div className="quantum-orbit"></div>
                <div className="quantum-orbit"></div>
                <div className="quantum-orbit"></div>
                <div className="quantum-core"></div>
            </div>
            <div className="h-8 flex items-center justify-center">
                <p key={msgIndex} className="text-sm serif-tc text-gray-700 tracking-widest animate-[fadeInUp_0.5s_ease-out] font-medium">
                    {messages[msgIndex]}
                </p>
            </div>
            <div className="w-12 h-[1px] bg-[#8C7853] opacity-30 mt-4"></div>
        </div>
    );
};

const TypewriterText = ({ content, speed = 30, onComplete }: { content: string, speed?: number, onComplete?: () => void }) => {
    const [displayedContent, setDisplayedContent] = useState('');
    useEffect(() => {
        let i = 0;
        setDisplayedContent('');
        const timer = setInterval(() => {
            if (i < content.length) {
                setDisplayedContent(content.slice(0, i + 1));
                if (Math.random() > 0.8) soundManager.playClick();
                else soundManager.playScratch();
                i++;
            } else {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, speed);
        return () => clearInterval(timer);
    }, [content, speed, onComplete]);
    return (<span className="writing-cursor leading-relaxed serif-tc">{displayedContent}</span>);
};

const AgentMarquee = ({
    agents,
    direction,
    onClick,
    userTier,
    lang
}: {
    agents: Agent[],
    direction: 'left' | 'right',
    onClick: (a: Agent) => void,
    userTier: UserTier,
    lang: Language
}) => {
    const displayAgents = [...agents, ...agents, ...agents];

    return (
        <div className="overflow-hidden relative w-full pause-hover">
            <div className={`flex w-max ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}>
                {displayAgents.map((agent, i) => {
                    // Agent titles and names are now fully localized in AGENTS constant based on user request for "All Traditional Chinese"
                    // However, we still support the legacy switch logic if needed, but for now we prioritize Chinese.
                    const displayName = lang === 'zh-TW' ? agent.nameZh : agent.name;
                    const displayTitle = agent.title;

                    return (
                        <div
                            key={`${agent.id}-${i}`}
                            className="w-24 mx-4 flex flex-col items-center cursor-pointer shrink-0 py-2"
                            onClick={() => onClick(agent)}
                        >
                            <SketchAvatar
                                src={agent.avatar}
                                alt={displayName}
                                isActive={false}
                                isPremium={agent.isPremium}
                                isLocked={agent.isPremium && userTier === 'OBSERVER'}
                                size="w-16 h-16"
                            />
                            <div className="mt-3 text-center">
                                <h4 className="serif-tc font-bold text-sm text-[#1A1A1A] truncate w-24">{displayName}</h4>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1 sans-tc truncate w-24 font-bold">{displayTitle}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-[var(--paper)] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-[var(--paper)] to-transparent z-10 pointer-events-none"></div>
        </div>
    );
};

const Footer = ({ lang }: { lang: Language }) => {
    const t = UI_STRINGS[lang];
    return (
        <footer className="bg-[#F7F5F0] border-t border-[#E5E0D6] py-12 px-6">
            <div className="max-w-4xl mx-auto text-center space-y-6">
                <div className="w-8 h-8 bg-[#1A1A1A] text-white flex items-center justify-center brand-font font-bold text-sm mx-auto mb-4">N</div>
                <p className="text-xs text-gray-600 uppercase tracking-widest sans-tc max-w-xl mx-auto leading-relaxed font-medium">
                    {t.disclaimer}
                </p>
                <p className="text-[10px] text-gray-400 serif-tc italic">
                    {t.copyright}
                </p>
            </div>
        </footer>
    );
};

const App: React.FC = () => {
    const [state, setState] = useState<AppState>({
        step: 'confessional',
        input: '',
        context: '',
        language: 'zh-TW',
        isDarkMode: false,
        messages: [],
        finalVerdict: null,
        loading: false,
        currentSpeakerIndex: -1,
        followUpInput: '',
        completedSteps: [],
        selectedPathId: null,
        userTier: 'COMMANDER',
        showPaywall: false
    });

    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [viewingAgent, setViewingAgent] = useState<Agent | null>(null);
    const [errorState, setErrorState] = useState<string | null>(null);
    const debateEndRef = useRef<HTMLDivElement>(null);

    const row1Agents = AGENTS.slice(0, 7);
    const row2Agents = AGENTS.slice(7, 14);

    useEffect(() => {
        if (state.step === 'debate') {
            debateEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [state.currentSpeakerIndex, state.step, state.messages]);

    useEffect(() => {
        if (state.step === 'debate' && state.messages.length > 0) {
            if (state.currentSpeakerIndex === -1) {
                setState(prev => ({ ...prev, currentSpeakerIndex: 0 }));
            } else if (state.currentSpeakerIndex < state.messages.length - 1) {
                const currentMsg = state.messages[state.currentSpeakerIndex];
                const readingTime = Math.max(1500, 1000 + (currentMsg.content.length * 20));
                const timer = setTimeout(() => {
                    setState(prev => ({ ...prev, currentSpeakerIndex: prev.currentSpeakerIndex + 1 }));
                }, readingTime);
                return () => clearTimeout(timer);
            }
        }
    }, [state.step, state.messages, state.currentSpeakerIndex]);

    const toggleDarkMode = () => {
        if (state.userTier === 'OBSERVER') {
            soundManager.playClick();
            setState(prev => ({ ...prev, showPaywall: true }));
        } else {
            soundManager.playClick();
            setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
        }
    };

    const handleReset = () => {
        soundManager.playClick();
        if (window.confirm(state.language === 'zh-TW' ? '確定要重新開始嗎？' : 'Are you sure you want to restart?')) {
            setState(prev => ({
                ...prev,
                step: 'confessional',
                input: '',
                messages: [],
                finalVerdict: null,
                loading: false,
                currentSpeakerIndex: -1,
                selectedPathId: null
            }));
            setSelectedCategory('');
            setErrorState(null);
            window.scrollTo(0, 0);
        }
    };

    const handleStart = async (isFollowUp = false) => {
        soundManager.playClick();
        const query = isFollowUp ? state.followUpInput : (state.input || selectedCategory);
        if (!query) return;

        setState(prev => ({ ...prev, loading: true }));
        setErrorState(null);

        try {
            const result = await generateCouncilResponse(
                query,
                state.context,
                state.isDarkMode,
                state.language,
                isFollowUp ? state.finalVerdict : undefined
            );

            setState(prev => ({
                ...prev,
                messages: result.debate,
                finalVerdict: result.verdict,
                step: 'debate',
                loading: false,
                currentSpeakerIndex: -1,
                followUpInput: '',
                completedSteps: [],
                selectedPathId: null
            }));
        } catch (err: any) {
            console.error(err);
            setState(prev => ({ ...prev, loading: false }));
            setErrorState(err.message || "Unknown error occurred.");
        }
    };

    const t = UI_STRINGS[state.language];

    return (
        <div className="min-h-screen w-full selection:bg-[#F2E8DA] selection:text-black flex flex-col">

            {errorState && (
                <ErrorModal error={errorState} onClose={() => setErrorState(null)} lang={state.language} />
            )}

            {state.showPaywall && (
                <SubscriptionModal
                    onClose={() => setState(p => ({ ...p, showPaywall: false }))}
                    onPurchase={() => setState(p => ({ ...p, userTier: 'COMMANDER', showPaywall: false }))}
                    lang={state.language}
                />
            )}

            {viewingAgent && (
                <AgentDetailModal
                    agent={viewingAgent}
                    onClose={() => setViewingAgent(null)}
                    lang={state.language}
                    userTier={state.userTier}
                />
            )}

            <header className="fixed top-0 w-full z-50 bg-[#F7F5F0]/90 backdrop-blur-md border-b border-[#E5E0D6] py-5 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center gap-4 cursor-pointer" onClick={handleReset}>
                    <div className="w-10 h-10 bg-[#1A1A1A] rounded-sm flex items-center justify-center text-white brand-font font-bold text-xl shadow-lg hover:bg-[#8C7853] transition-colors">N</div>
                    <div className="hidden md:block">
                        <h1 className="text-xl serif-tc font-bold tracking-wide text-[#1A1A1A]">{t.title}</h1>
                        <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mt-0.5 font-bold">{t.subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                    <a href="https://www.buymeacoffee.com/laladoo99" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform hidden md:block">
                        <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=laladoo99&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a pizza" className="h-10" />
                    </a>
                    <button
                        onClick={() => {
                            soundManager.playClick();
                            if (state.userTier === 'OBSERVER') {
                                setState(p => ({ ...p, showPaywall: true }));
                            }
                        }}
                        className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 border transition-colors ${state.userTier === 'COMMANDER' ? 'border-[#8C7853] text-[#8C7853]' : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'}`}
                    >
                        {state.userTier === 'COMMANDER' ? t.member : t.guest}
                    </button>
                    <button onClick={() => setState(p => ({ ...p, language: p.language === 'zh-TW' ? 'en' : 'zh-TW' }))} className="text-xs serif-tc italic text-gray-700 hover:text-black underline decoration-1 underline-offset-4">
                        {t.switchLanguage}
                    </button>
                </div>
            </header>

            <main className="pt-36 pb-24 px-4 md:px-0 max-w-4xl mx-auto flex-grow w-full">

                {state.loading ? (
                    <WritingLoader lang={state.language} />
                ) : (
                    <>
                        {state.step === 'confessional' && (
                            <div className="space-y-20 fade-in-up">
                                <div className="text-center space-y-5 mb-16">
                                    <h2 className="text-4xl md:text-6xl serif-tc font-medium text-[#1A1A1A] leading-[1.2]">
                                        {state.language === 'zh-TW' ? '在混亂中尋找' : 'Find Clarity in'} <br />
                                        <span className="italic text-[#8C7853] font-serif">{state.language === 'zh-TW' ? '永恆的智慧' : 'Eternal Wisdom'}</span>
                                    </h2>
                                    <div className="w-16 h-[1px] bg-gray-300 mx-auto my-6"></div>
                                    <p className="text-gray-600 serif-tc text-lg italic max-w-lg mx-auto leading-relaxed">
                                        {state.language === 'zh-TW' ? '十四位歷史傳奇人物，為您的人生難題提供戰略諮詢。' : 'Fourteen legendary figures ready to strategize your next move.'}
                                    </p>
                                </div>

                                <div className="mb-16 border-b border-gray-200 pb-12">
                                    <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-7 gap-y-10 gap-x-6">
                                        {AGENTS.map(agent => {
                                            const displayName = state.language === 'zh-TW' ? agent.nameZh : agent.name;
                                            return (
                                                <div
                                                    key={agent.id}
                                                    className={`flex flex-col items-center text-center group cursor-pointer transition-all duration-300 ${agent.isPremium && state.userTier === 'OBSERVER' ? 'opacity-80' : 'opacity-100 hover:-translate-y-1'}`}
                                                    onClick={() => {
                                                        soundManager.playClick();
                                                        setViewingAgent(agent);
                                                    }}
                                                >
                                                    <SketchAvatar
                                                        src={agent.avatar}
                                                        alt={displayName}
                                                        isActive={false}
                                                        isPremium={agent.isPremium}
                                                        isLocked={agent.isPremium && state.userTier === 'OBSERVER'}
                                                        size="w-20 h-20"
                                                    />
                                                    <div className="mt-4">
                                                        <h4 className="serif-tc font-bold text-sm text-[#1A1A1A] group-hover:text-[#8C7853] transition-colors">{displayName}</h4>
                                                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1.5 sans-tc font-bold">{agent.title}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="md:hidden space-y-6">
                                        <AgentMarquee
                                            agents={row1Agents}
                                            direction="left"
                                            onClick={(a) => { soundManager.playClick(); setViewingAgent(a); }}
                                            userTier={state.userTier}
                                            lang={state.language}
                                        />
                                        <AgentMarquee
                                            agents={row2Agents}
                                            direction="right"
                                            onClick={(a) => { soundManager.playClick(); setViewingAgent(a); }}
                                            userTier={state.userTier}
                                            lang={state.language}
                                        />
                                    </div>
                                </div>

                                <div className="magazine-card p-10 md:p-16 relative max-w-3xl mx-auto torn-paper">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F7F5F0] px-6 text-xs serif-tc italic text-gray-500 border border-[#E6E1D6] py-1 font-medium">
                                        {t.inputLabel}
                                    </div>

                                    <div className="space-y-12">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-5 sans-tc">{t.categoryLabel}</label>
                                            <div className="flex flex-wrap gap-3">
                                                {CATEGORIES[state.language].map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => { soundManager.playClick(); setSelectedCategory(cat); }}
                                                        className={`px-5 py-2.5 text-sm serif-tc transition-all border ${selectedCategory === cat ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-md' : 'border-[#E0E0E0] text-gray-700 hover:border-[#B0B0B0] bg-white/50'}`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-5 sans-tc">{t.inputLabel}</label>
                                            <textarea
                                                value={state.input}
                                                onChange={e => setState(p => ({ ...p, input: e.target.value }))}
                                                placeholder={t.confessionalPrompt}
                                                className="w-full h-40 bg-transparent border-0 border-b-2 border-gray-200 resize-none serif-tc text-xl leading-relaxed focus:ring-0 focus:border-[#8C7853] placeholder-gray-400 p-2 transition-colors text-gray-800"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                            <button
                                                onClick={toggleDarkMode}
                                                className={`flex items-center gap-3 text-xs font-bold uppercase tracking-widest transition-colors sans-tc ${state.isDarkMode ? 'text-[#8C7000]' : 'text-gray-500 hover:text-black'}`}
                                            >
                                                <span className={`w-3 h-3 rounded-full border ${state.isDarkMode ? 'bg-[#8C7000] border-[#8C7000]' : 'border-gray-500'}`}></span>
                                                {t.darkMode}
                                                {state.userTier === 'OBSERVER' && <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-1">LOCKED</span>}
                                            </button>

                                            <button
                                                onClick={() => handleStart(false)}
                                                disabled={!state.input && !selectedCategory}
                                                className="editorial-btn px-10 py-3.5 text-xs font-bold tracking-[0.25em] disabled:opacity-50"
                                            >
                                                {t.startDebate}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {state.step === 'debate' && (
                            <div className="fade-in-up max-w-3xl mx-auto space-y-16">
                                <div className="text-center border-b border-double border-gray-200 pb-8 mb-12">
                                    <h3 className="serif-tc text-2xl italic text-gray-800 tracking-wide">{t.debateTitle}</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 sans-tc font-bold">{new Date().toLocaleDateString()}</p>
                                </div>

                                <div className="space-y-14">
                                    {state.messages.slice(0, state.currentSpeakerIndex + 1).map((msg, idx) => {
                                        const agent = AGENTS.find(a => a.id === msg.agentId);
                                        const isNew = idx === state.currentSpeakerIndex;
                                        const isLeft = idx % 2 === 0;
                                        const displayName = state.language === 'zh-TW' ? agent?.nameZh : agent?.name;

                                        return (
                                            <div key={idx} id={`msg-${agent?.id}`} className={`flex w-full gap-6 ${isLeft ? 'flex-row' : 'flex-row-reverse'} items-start ${isNew ? 'opacity-100' : 'opacity-90 grayscale-[0.3]'}`}>
                                                <div className="flex-shrink-0 pt-2 flex flex-col items-center gap-2 w-20">
                                                    <SketchAvatar
                                                        src={agent?.avatar || ''}
                                                        alt={displayName || ''}
                                                        isActive={isNew}
                                                        size="w-16 h-16"
                                                    />
                                                    <div className={`text-center ${isNew ? 'opacity-100' : 'opacity-50'}`}>
                                                        <span className="serif-tc font-bold text-xs uppercase tracking-wider text-[#1A1A1A] block">{displayName}</span>
                                                    </div>
                                                </div>

                                                <div className={`flex-grow max-w-[85%] ${isLeft ? 'text-left' : 'text-right'}`}>
                                                    <div className={`relative p-6 magazine-card ${isNew ? 'border-[#8C7853]/30 shadow-md' : 'border-gray-100'}`}>
                                                        <span className={`absolute -top-4 ${isLeft ? 'left-4' : 'right-4'} text-6xl text-[#E5E0D6] serif-tc leading-none z-0`}>“</span>
                                                        <div className="relative z-10 serif-tc text-lg text-[#1F1F1F] leading-loose">
                                                            {isNew ? (
                                                                <TypewriterText content={msg.content} />
                                                            ) : (
                                                                msg.content
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={debateEndRef} className="h-12" />
                                </div>

                                {state.currentSpeakerIndex >= state.messages.length - 1 && (
                                    <div className="flex justify-center pt-12 border-t border-gray-100">
                                        <button onClick={() => { soundManager.playClick(); setState(p => ({ ...p, step: 'verdict' })); }} className="editorial-btn px-12 py-4 text-sm font-bold tracking-[0.25em] shadow-lg">
                                            {t.proceedVerdict}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {state.step === 'verdict' && state.finalVerdict && (
                            <div className="fade-in-up space-y-24">
                                <div className="text-center space-y-8 max-w-4xl mx-auto">
                                    <div className="inline-block border-b-2 border-[#8C7853] pb-2 mb-4 px-6">
                                        <span className="text-xs font-bold uppercase tracking-[0.4em] text-[#8C7853] sans-tc">{state.finalVerdict.isDarkVerdict ? t.shadowLabel : t.verdictTitle}</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl serif-tc font-medium text-[#1A1A1A] leading-tight drop-shadow-sm">
                                        {state.finalVerdict.diagnosis}
                                    </h2>
                                    <div className="max-w-2xl mx-auto">
                                        <p className="text-xl serif-tc italic text-gray-700 leading-loose border-l-4 border-gray-200 pl-6 text-left">
                                            {state.finalVerdict.conflictResolution}
                                        </p>
                                    </div>
                                </div>

                                {/* NEW: Conflict Matrix Visualization */}
                                {state.finalVerdict.matrix && state.finalVerdict.matrix.length > 0 && (
                                    <div className="max-w-5xl mx-auto px-4">
                                        <div className="text-center mb-6">
                                            <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-gray-500 sans-tc mb-2">
                                                {state.language === 'zh-TW' ? '戰略衝突矩陣' : 'Strategic Conflict Matrix'}
                                            </h3>
                                            <div className="w-8 h-[1px] bg-[#8C7853] mx-auto"></div>
                                        </div>
                                        <StrategicTable matrix={state.finalVerdict.matrix} lang={state.language} />
                                    </div>
                                )}

                                {!state.selectedPathId ? (
                                    <>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200 border-t border-b border-gray-200 py-16">
                                            {state.finalVerdict.paths.map((path) => {
                                                const leadAgent = AGENTS.find(a => a.id === path.leadAgentId);
                                                const displayName = state.language === 'zh-TW' ? leadAgent?.nameZh : leadAgent?.name;
                                                return (
                                                    <div key={path.id} className="px-8 py-8 md:py-0 text-center space-y-8 group cursor-pointer hover:bg-white/50 transition-colors" onClick={() => { soundManager.playClick(); setState(p => ({ ...p, selectedPathId: path.id, completedSteps: [] })); window.scrollTo(0, 0); }}>
                                                        <div className="h-0.5 w-16 bg-gray-200 mx-auto group-hover:bg-[#8C7853] transition-colors"></div>
                                                        <div>
                                                            <h3 className="serif-tc text-3xl font-bold text-[#1A1A1A] mb-3 group-hover:text-[#8C7853] transition-colors">{path.title}</h3>
                                                            <p className="text-[10px] uppercase tracking-widest text-gray-500 sans-tc font-bold">{state.language === 'zh-TW' ? '主筆顧問：' : 'Led by'} {displayName}</p>
                                                        </div>
                                                        <div className="flex justify-center transform group-hover:scale-105 transition-transform duration-500">
                                                            <SketchAvatar src={leadAgent?.avatar || ''} alt="" isActive={false} size="w-24 h-24" />
                                                        </div>
                                                        <p className="serif-tc text-gray-700 leading-relaxed text-base px-2">{path.description}</p>
                                                        <div className="pt-6">
                                                            <span className="inline-block px-6 py-3 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#8C7853] transition-colors shadow-sm">
                                                                {t.readFullStrategy}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-center mt-16 pt-8 border-t border-gray-100">
                                            <button
                                                onClick={handleReset}
                                                className="flex flex-col items-center gap-3 group"
                                            >
                                                <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 group-hover:border-[#8C7853] group-hover:text-[#8C7853] transition-colors bg-white">
                                                    <span className="text-xl">↺</span>
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-[#8C7853] transition-colors sans-tc">
                                                    {t.reset}
                                                </span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="max-w-4xl mx-auto space-y-16 animate-ios">
                                        {(() => {
                                            const path = state.finalVerdict.paths.find(p => p.id === state.selectedPathId);
                                            if (!path) return null;
                                            const leadAgent = AGENTS.find(a => a.id === path.leadAgentId);
                                            const color = path.id === 'aggressive' ? '#8B0000' : path.id === 'conservative' ? '#003366' : '#8C7853';
                                            const displayName = state.language === 'zh-TW' ? leadAgent?.nameZh : leadAgent?.name;

                                            return (
                                                <>
                                                    <div className="text-center border-b border-gray-100 pb-16">
                                                        <div className="mb-8 flex justify-center">
                                                            <SketchAvatar src={leadAgent?.avatar || ''} alt={displayName || ''} isActive={true} size="w-32 h-32" />
                                                        </div>
                                                        <h2 className="text-5xl serif-tc font-bold text-[#1A1A1A] mb-6">{path.title}</h2>
                                                        <p className="text-xl text-gray-700 serif-tc italic max-w-2xl mx-auto leading-relaxed">{path.description}</p>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
                                                        <div className="md:col-span-7 space-y-12">
                                                            <div>
                                                                <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-8 border-b border-gray-200 pb-3 sans-tc">{t.strategy}</h4>
                                                                <div className="space-y-10">
                                                                    {path.steps.map((s, i) => (
                                                                        <div key={i} className="flex gap-6 items-start">
                                                                            <span className="flex-shrink-0 serif-tc text-4xl font-bold text-[#E0E0E0] -mt-2">{i + 1}</span>
                                                                            <p className="serif-tc text-lg text-[#1A1A1A] leading-loose drop-cap border-b border-gray-50 pb-6">{s}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="bg-[#F7F5F0] p-10 border border-[#E6E1D6] torn-paper relative">
                                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 border border-[#E6E1D6]">
                                                                    <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 sans-tc">{state.language === 'zh-TW' ? '思維模型演算法' : 'Algorithm'}</h4>
                                                                </div>
                                                                <p className="font-mono text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">{path.code.text}</p>
                                                            </div>
                                                        </div>

                                                        <div className="md:col-span-5 space-y-12">
                                                            <div onClick={() => { if (state.userTier === 'OBSERVER') setState(p => ({ ...p, showPaywall: true })) }} className="cursor-pointer group">
                                                                <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-8 border-b border-gray-200 pb-3 sans-tc">
                                                                    {state.language === 'zh-TW' ? '戰術雷達分析' : 'Tactical Analysis'}
                                                                </h4>
                                                                <div className="bg-white border border-gray-100 p-8 flex justify-center group-hover:shadow-lg transition-all duration-500">
                                                                    <TechnicalRadar metrics={path.metrics} color={color} userTier={state.userTier} lang={state.language} />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4 text-center md:text-left">
                                                                <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-3 sans-tc">{t.upside}</h4>
                                                                <p className="serif-tc text-2xl italic text-[#1A1A1A] leading-relaxed">{path.upside}</p>
                                                            </div>
                                                            <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row gap-6 items-center md:items-start justify-center md:justify-start">
                                                                <button onClick={() => { soundManager.playClick(); setState(p => ({ ...p, selectedPathId: null })); }} className="text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-black sans-tc transition-colors border-b border-transparent hover:border-black pb-1">
                                                                    ← {t.backToMatrix}
                                                                </button>
                                                                <button onClick={handleReset} className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-red-800 sans-tc transition-colors border-b border-transparent hover:border-red-800 pb-1">
                                                                    ↺ {t.reset}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer lang={state.language} />
        </div>
    );
};

export default App;

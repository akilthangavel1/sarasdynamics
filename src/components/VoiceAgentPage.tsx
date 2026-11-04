import React, { useState, useEffect } from "react";
import Navbar1Demo from "@/components/ui/navbar-demo";
import { SiteFooter } from "@/components/ui/site-footer";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  PhoneCall,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  PhoneForwarded,
  Activity,
  Globe2,
  Bot,
  Play,
  Pause,
  RotateCcw,
  Headphones,
  Database,
  Terminal,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface VoiceAgentPageProps {
  onBackToHome?: () => void;
}

interface Persona {
  id: string;
  name: string;
  role: string;
  voice: string;
  sampleText: string;
  metrics: { latency: string; accent: string; domain: string };
  simulatedConversation: Array<{ speaker: "agent" | "caller"; text: string; tool?: string }>;
}

const personas: Persona[] = [
  {
    id: "support",
    name: "Aria",
    role: "Tier-1 Customer Support Specialist",
    voice: "Natural Warmth • Neutral US",
    sampleText: "Hello! Thanks for calling Saras Dynamics Support. I can look up your invoice, check system telemetry, or troubleshoot your API key right away. How can I help?",
    metrics: { latency: "420ms", accent: "Neutral North American", domain: "SaaS & Platform" },
    simulatedConversation: [
      { speaker: "caller", text: "Hey Aria, our webhook delivery to our billing service is failing with a 504 error." },
      { speaker: "agent", text: "I can check that immediately. Let me inspect your production endpoint delivery logs for the past 15 minutes.", tool: "telemetry.queryLogs(status=504, window='15m')" },
      { speaker: "agent", text: "Found it: your receiver timed out on 3 payloads due to a database lock. I've re-queued those 3 webhooks and enabled 2-minute exponential backoff. Would you like me to send the trace IDs to your Slack channel?", tool: "slack.postIncidentSummary(channel='#devops')" },
      { speaker: "caller", text: "That is perfect, please send them over. Thank you!" },
      { speaker: "agent", text: "Done! Trace IDs delivered to #devops. Is there anything else I can optimize for you today?" }
    ]
  },
  {
    id: "sales",
    name: "Marcus",
    role: "Inbound Enterprise SDR",
    voice: "Confident & Crisp • British Executive",
    sampleText: "Hi there! Marcus here from Saras Dynamics. I saw you just requested architectural specs on our low-latency speech pipelines. Do you have 2 minutes to touch on your concurrency targets?",
    metrics: { latency: "460ms", accent: "British Business Neutral", domain: "Enterprise Sales" },
    simulatedConversation: [
      { speaker: "caller", text: "Hi Marcus, we're currently processing 20,000 inbound calls a day and need to automate appointment rescheduling without annoying customers." },
      { speaker: "agent", text: "Understood. At 20k calls daily, sub-second latency and seamless interruption handling are mandatory so customers never feel like they're talking to a rigid IVR.", tool: "crm.lookupAccountTier(domain='healthcare.co')" },
      { speaker: "agent", text: "Our multi-region SIP gateway handles this with 99.99% availability. Can I book you a 20-minute live latency benchmark session with our principal systems engineer tomorrow at 2 PM EST?", tool: "calendar.proposeSlot(time='14:00_EST', engineer='Lead_Architect')" },
      { speaker: "caller", text: "Yes, 2 PM EST works for me and our CTO." },
      { speaker: "agent", text: "Calendar invitations sent to your team with the custom benchmark bridge. Looking forward to speaking tomorrow!" }
    ]
  },
  {
    id: "logistics",
    name: "Elena",
    role: "Multilingual Dispatch & Operations Agent",
    voice: "Direct & Empathetic • Multilingual",
    sampleText: "Good morning! Elena speaking. I manage live fleet dispatch and driver routing updates across English, Spanish, and French with instant CRM record synchronization.",
    metrics: { latency: "390ms", accent: "Bilingual English / Spanish", domain: "Supply Chain" },
    simulatedConversation: [
      { speaker: "caller", text: "Hola Elena, truck 408 is stuck in severe traffic on I-95 North. We might miss the 11 AM delivery window." },
      { speaker: "agent", text: "Entendido. Déjame verificar las rutas alternas y notificar al almacén de Newark de inmediato.", tool: "fleet.rerouteUnit(unit_id='408', avoid='I-95_N')" },
      { speaker: "agent", text: "He recalculado la ruta por la Ruta 1 con solo 14 minutos de demora. El supervisor del muelle 4 ya aprobó la nueva ventana de las 11:20 AM. ¿Procedo a enviar las coordenadas al GPS de la unidad?", tool: "warehouse.updateDockAppointment(dock=4, time='11:20')" },
      { speaker: "caller", text: "Excelente Elena, envíalo ya." },
      { speaker: "agent", text: "Coordenadas enviadas a la terminal del conductor. ¡Conduzca con precaución!" }
    ]
  }
];

const faqs = [
  {
    q: "How fast is Saras Dynamics' voice agent latency?",
    a: "Our speech architecture achieves end-to-end latency between 380ms and 520ms from the instant a user finishes a syllable to the first synthesized audio chunk playing. We bypass conventional HTTP REST polling by orchestrating full-duplex WebSockets and WebRTC audio channels directly connected to high-performance inference clusters."
  },
  {
    q: "How does the voice agent handle natural human interruptions?",
    a: "Unlike legacy IVR bots that talk over callers, our systems run continuous bidirectional Voice Activity Detection (VAD). The millisecond a caller begins speaking mid-sentence, the playback stream instantly terminates with a subtle acoustic taper, and the agent redirects its cognitive context to respond to the new input."
  },
  {
    q: "Can the voice agent execute real-time backend API and database calls?",
    a: "Yes. Using structured tool execution and streaming function calling, the agent queries PostgreSQL, Stripe, Salesforce, HubSpot, or your proprietary GraphQL/REST endpoints while speaking. It can execute actions like booking appointments, running identity verification, or retrieving shipping statuses mid-call."
  },
  {
    q: "What telephony carriers and protocols are supported?",
    a: "We support direct SIP trunking, WebRTC in-browser calling, and turnkey integrations with carriers including Twilio, Telnyx, Plivo, Vonage, and on-premises PBX setups like Asterisk and FreeSWITCH."
  },
  {
    q: "How do you ensure data security, privacy, and compliance?",
    a: "All audio streams and transcripts are end-to-end encrypted with TLS 1.3 and AES-256 at rest. We provide automated real-time PII redaction (masking credit cards, SSNs, phone numbers) before logs are stored. Architectures are deployable within your dedicated VPC or HIPAA/SOC2 compliant environments."
  },
  {
    q: "Can we clone custom brand voices or train on proprietary vocabulary?",
    a: "Absolutely. We can clone executive or brand voices with high fidelity, and fine-tune pronunciation lexicons for specialized medical, financial, or industrial terminology."
  }
];

export function VoiceAgentPage({ onBackToHome }: VoiceAgentPageProps) {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(personas[0]);
  const [isSimulatingCall, setIsSimulatingCall] = useState<boolean>(false);
  const [callStep, setCallStep] = useState<number>(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulatingCall) {
      interval = setInterval(() => {
        setCallStep((prev) => {
          if (prev < selectedPersona.simulatedConversation.length - 1) {
            return prev + 1;
          } else {
            return prev;
          }
        });
      }, 3200);
    }
    return () => clearInterval(interval);
  }, [isSimulatingCall, selectedPersona]);

  const toggleCallSimulation = () => {
    if (isSimulatingCall) {
      setIsSimulatingCall(false);
      setCallStep(0);
    } else {
      setCallStep(0);
      setIsSimulatingCall(true);
    }
  };

  const resetSimulation = () => {
    setIsSimulatingCall(false);
    setCallStep(0);
  };

  return (
    <div
      id="voice-agent-page-wrapper"
      className="w-full min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-zinc-900 selection:text-white transition-colors duration-300"
    >
      {/* Sticky Responsive Header Navigation */}
      <Navbar1Demo />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 w-full flex flex-col">
        {/* ===================== HERO SECTION ===================== */}
        <section
          id="voice-hero"
          className="relative w-full overflow-hidden border-b border-zinc-200/80 dark:border-zinc-800 bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900/60 dark:to-zinc-950 pt-16 pb-20 md:pt-24 md:pb-28"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/10 dark:bg-red-600/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c30000]" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Autonomous Speech Architectures
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Sub-500ms Real-Time Audio
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-zinc-950 dark:text-white uppercase max-w-4xl leading-[1.08]">
              Human-Level Voice AI for Real-Time Scale
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              We engineer, fine-tune, and deploy ultra-low latency voice agents that sound genuinely human, handle interruptions natively, query live enterprise databases, and automate telephony at scale.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a
                href="#contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#c30000] hover:bg-[#a50000] text-white font-bold text-sm tracking-wide shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Deploy Voice Agent</span>
                <ArrowRight className="size-4" />
              </a>

              <a
                href="#voice-simulator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Headphones className="size-4 text-[#c30000]" />
                <span>Test Live Simulator</span>
              </a>
            </div>

            {/* Performance Metrics Row */}
            <div className="mt-14 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md">
              <div className="flex flex-col items-center py-2 px-4 border-r border-zinc-200/60 dark:border-zinc-800/80 last:border-none">
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                  &lt; 420ms
                </span>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">
                  Audio TTFB Latency
                </span>
              </div>

              <div className="flex flex-col items-center py-2 px-4 border-r border-zinc-200/60 dark:border-zinc-800/80 last:border-none">
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                  99.98%
                </span>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">
                  SIP Telephony SLA
                </span>
              </div>

              <div className="flex flex-col items-center py-2 px-4 border-r border-zinc-200/60 dark:border-zinc-800/80 last:border-none">
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                  65+
                </span>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">
                  Languages &amp; Accents
                </span>
              </div>

              <div className="flex flex-col items-center py-2 px-4">
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                  10,000+
                </span>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">
                  Concurrent Calls
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== INTERACTIVE VOICE SIMULATOR ===================== */}
        <section
          id="voice-simulator"
          className="w-full py-16 sm:py-24 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/80"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c30000]">
                Interactive Experience
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                Test Saras Voice Intelligence
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                Experience simulated conversational turns, dynamic interruption response, and real-time backend tool invocation.
              </p>
            </div>

            {/* Persona Selector Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {personas.map((persona) => {
                const isSelected = selectedPersona.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => {
                      setSelectedPersona(persona);
                      setCallStep(0);
                      setIsSimulatingCall(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-md scale-105"
                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700"
                    }`}
                  >
                    <Bot className="size-3.5" />
                    <span>{persona.name}</span>
                    <span className="opacity-60 font-normal">({persona.role.split(" ")[0]})</span>
                  </button>
                );
              })}
            </div>

            {/* Main Console Box */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Voice Call Status & Audio Waveform */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                        {isSimulatingCall ? "Live Call Connected" : "Agent Ready • On Hook"}
                      </span>
                    </div>

                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      SIP: 200 OK
                    </span>
                  </div>

                  <div className="mt-8 flex flex-col items-center text-center">
                    {/* Visualizer Circle */}
                    <div className="relative size-28 sm:size-32 rounded-full border-2 border-dashed border-red-500/40 dark:border-red-500/30 flex items-center justify-center p-2">
                      {isSimulatingCall && (
                        <div className="absolute inset-0 rounded-full bg-red-500/10 dark:bg-red-500/20 animate-ping opacity-60" />
                      )}
                      <div className="size-full rounded-full bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-red-900/30">
                        <Volume2 className={`size-10 sm:size-12 ${isSimulatingCall ? "animate-bounce" : ""}`} />
                      </div>
                    </div>

                    <h3 className="mt-5 text-xl font-black text-zinc-900 dark:text-white">
                      {selectedPersona.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      {selectedPersona.role}
                    </p>
                    <p className="mt-1 text-xs text-[#c30000] font-mono">
                      {selectedPersona.voice}
                    </p>
                  </div>

                  {/* Animated Sound Waves */}
                  <div className="mt-8 flex items-center justify-center gap-1.5 h-12 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
                    {[12, 28, 44, 20, 36, 48, 24, 40, 16, 32, 48, 20, 38, 14, 30].map((h, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          isSimulatingCall
                            ? "bg-red-500 animate-pulse"
                            : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                        style={{
                          height: isSimulatingCall ? `${Math.max(8, (h + (i % 3) * 8) % 48)}px` : "6px",
                          animationDelay: `${i * 70}ms`
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Call Control Buttons */}
                <div className="mt-8 flex items-center gap-3">
                  <button
                    onClick={toggleCallSimulation}
                    className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer ${
                      isSimulatingCall
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {isSimulatingCall ? (
                      <>
                        <PhoneCall className="size-4 rotate-135" />
                        <span>Hang Up Call</span>
                      </>
                    ) : (
                      <>
                        <PhoneCall className="size-4" />
                        <span>Simulate Call</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={resetSimulation}
                    title="Reset conversation"
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="size-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Live Conversation Transcript & Telemetry */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Live Telemetry &amp; Full-Duplex Transcript
                    </span>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Activity className="size-3" />
                        {selectedPersona.metrics.latency}
                      </span>
                      <span className="text-zinc-400">|</span>
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {selectedPersona.metrics.domain}
                      </span>
                    </div>
                  </div>

                  {/* Transcript Scroll Area */}
                  <div className="mt-4 space-y-4 max-h-[380px] overflow-y-auto pr-2">
                    {selectedPersona.simulatedConversation.slice(0, callStep + 1).map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col gap-1.5 ${
                          msg.speaker === "agent" ? "items-start" : "items-end"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          {msg.speaker === "agent" ? (
                            <>
                              <Bot className="size-3 text-[#c30000]" />
                              <span>{selectedPersona.name} (Saras Voice AI)</span>
                            </>
                          ) : (
                            <>
                              <span>Enterprise Caller</span>
                              <PhoneForwarded className="size-3" />
                            </>
                          )}
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[90%] ${
                            msg.speaker === "agent"
                              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-xs"
                              : "bg-red-500 text-white rounded-tr-xs"
                          }`}
                        >
                          {msg.text}
                        </div>

                        {/* Tool Execution Tag */}
                        {msg.tool && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-mono mt-1">
                            <Terminal className="size-3" />
                            <span>Tool Call:</span>
                            <span className="font-semibold">{msg.tool}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Status Ticker */}
                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>Real-Time Neural TTS &bull; Opus 16kHz &bull; WebSockets</span>
                  </div>
                  <div className="font-mono text-[11px]">
                    Step {callStep + 1} of {selectedPersona.simulatedConversation.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SPEECH PIPELINE ARCHITECTURE ===================== */}
        <section
          id="speech-pipeline"
          className="w-full py-16 sm:py-24 border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/30"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c30000]">
                Systems Engineering
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                The Zero-Latency Voice Pipeline
              </h2>
              <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                How our streaming audio loop delivers human conversational cadence without lag, jitter, or robotic speech breaks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between hover:border-red-500/50 transition-colors">
                <div>
                  <div className="size-10 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-4">
                    <PhoneCall className="size-5" />
                  </div>
                  <span className="text-xs font-bold text-red-500 tracking-wider">STAGE 01</span>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                    Telephony &amp; VAD Ingestion
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Dual-channel audio captured via SIP/WebRTC. Client-side Silero Voice Activity Detection filters background noise and monitors speaker turn-taking.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-500">
                  Latency: ~40ms
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between hover:border-red-500/50 transition-colors">
                <div>
                  <div className="size-10 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-4">
                    <Mic className="size-5" />
                  </div>
                  <span className="text-xs font-bold text-red-500 tracking-wider">STAGE 02</span>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                    Streaming Speech-to-Text
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Continuous streaming STT transforms audio into tokenized phonemes in real-time, streaming partial transcripts before the speaker finishes sentences.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-500">
                  Latency: ~120ms
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between hover:border-red-500/50 transition-colors">
                <div>
                  <div className="size-10 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-4">
                    <Cpu className="size-5" />
                  </div>
                  <span className="text-xs font-bold text-red-500 tracking-wider">STAGE 03</span>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                    Reasoning Core &amp; Tools
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    High-throughput LLMs synthesize context, execute parallel database functions, and stream the initial response tokens without blocking.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-500">
                  Latency: ~180ms
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between hover:border-red-500/50 transition-colors">
                <div>
                  <div className="size-10 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-4">
                    <Volume2 className="size-5" />
                  </div>
                  <span className="text-xs font-bold text-red-500 tracking-wider">STAGE 04</span>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                    Neural TTS Synthesizer
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    First token streamed into neural voice synthesis. Natural prosody, breath pauses, and emotive inflection render directly into the audio buffer.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-500">
                  Latency: ~80ms
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== CORE CAPABILITIES GRID ===================== */}
        <section
          id="capabilities"
          className="w-full py-16 sm:py-24 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c30000]">
                Enterprise Features
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                Engineered for Critical Business Workflows
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                Built from the ground up for high concurrency, flawless reliability, and strict enterprise security requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-12 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-6">
                    <Zap className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Full-Duplex Interruption Handling
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Humans constantly talk over one another with clarifications. Saras Voice Agents detect barge-in within 50ms, stop playback smoothly, and dynamically adjust responses without awkward pauses.
                  </p>
                </div>
                <ul className="mt-6 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Real-time acoustic turn-taking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Smart echo cancellation &amp; noise suppression</span>
                  </li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-12 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-6">
                    <Database className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Live Database &amp; Tool Calling
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Don't just answer questions—take immediate actions. The agent triggers SQL queries, issues refund receipts, books calendar meetings, and updates CRM records live during the phone conversation.
                  </p>
                </div>
                <ul className="mt-6 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Salesforce, HubSpot &amp; PostgreSQL sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Custom REST &amp; GraphQL webhook triggers</span>
                  </li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-12 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-6">
                    <Globe2 className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    65+ Multilingual Dialects
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Deploy worldwide with native-level accent and cultural adaptation across Spanish, French, German, Hindi, Japanese, and regional variations. Auto-detects language switching mid-call.
                  </p>
                </div>
                <ul className="mt-6 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Real-time language auto-detection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Colloquial terminology fine-tuning</span>
                  </li>
                </ul>
              </div>

              {/* Feature 4 */}
              <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-12 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-6">
                    <PhoneForwarded className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Warm Human Escalation
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    When high-touch human expertise is required, the agent initiates an instantaneous warm transfer. The human representative receives a real-time summary so the caller never repeats themselves.
                  </p>
                </div>
                <ul className="mt-6 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Instant SIP transfer with metadata injection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Real-time pre-brief transcript for agent</span>
                  </li>
                </ul>
              </div>

              {/* Feature 5 */}
              <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-12 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-6">
                    <ShieldCheck className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Enterprise Privacy &amp; PII Redaction
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Credit card numbers, social security identifiers, and healthcare details are scrubbed in memory before call transcripts are committed to disk. Deployable in dedicated AWS/GCP VPCs.
                  </p>
                </div>
                <ul className="mt-6 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>SOC2 &amp; HIPAA-eligible deployments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Zero data retention options for audio</span>
                  </li>
                </ul>
              </div>

              {/* Feature 6 */}
              <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="size-12 rounded-xl bg-red-500/10 text-[#c30000] flex items-center justify-center mb-6">
                    <Layers className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Carrier-Grade Telephony &amp; SIP
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Integrate your existing business phone numbers or provision global DIDs instantly. Compatible with Twilio, Telnyx, Plivo, Vonage, FreeSWITCH, and Cisco CallManager.
                  </p>
                </div>
                <ul className="mt-6 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Elastic concurrency up to 10k+ simultaneous lines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Multi-region automated failover</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== INDUSTRY USE CASES ===================== */}
        <section
          id="use-cases"
          className="w-full py-16 sm:py-24 border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c30000]">
                Proven Impact
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                High-Volume Use Cases
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                How leading companies deploy Saras Voice Agents to drive operational efficiency and delight customers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900 flex flex-col">
                <span className="text-2xl mb-3">📞</span>
                <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                  Inbound Support &amp; Concierge
                </h3>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Resolve 75%+ of repetitive inquiries, password resets, ticket triaging, and order inquiries instantly without human wait queues.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900 flex flex-col">
                <span className="text-2xl mb-3">⚡</span>
                <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                  Instant Lead Qualification
                </h3>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Call back high-value website inquiries within 30 seconds. Qualify budget, timeline, and booking calendar demos directly on the call.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900 flex flex-col">
                <span className="text-2xl mb-3">🩺</span>
                <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                  Healthcare &amp; Clinic Intake
                </h3>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  HIPAA-compliant patient appointment scheduling, reminders, and prescription refill workflows with EHR calendar synchronization.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900 flex flex-col">
                <span className="text-2xl mb-3">🚚</span>
                <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                  Fleet &amp; Field Dispatch
                </h3>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Automate driver status check-ins, load reassignments, emergency roadside dispatching, and dynamic route adjustments 24/7.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== FAQ ACCORDION ===================== */}
        <section
          id="faq"
          className="w-full py-16 sm:py-24 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c30000]">
                Engineering FAQ
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                Technical details on implementing, fine-tuning, and maintaining Saras Voice Agents.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => {
                const isOpen = expandedFaq === i;
                return (
                  <div
                    key={i}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer"
                    >
                      <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white pr-4">
                        {faq.q}
                      </span>
                      <div className="size-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-700 dark:text-zinc-300">
                        {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================== CALL TO ACTION SECTION ===================== */}
        <section
          id="voice-cta"
          className="w-full py-16 sm:py-20 bg-zinc-950 text-white relative overflow-hidden"
        >
          {/* Subtle Ambient Red Glow */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-red-600/20 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c30000]">
                Ready to Automate Telephony?
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white uppercase leading-tight">
                Build Your Production Voice Agent with Saras Dynamics
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
                Schedule a technical discovery sprint. We will construct a prototype tailored to your API endpoints and telephony numbers within 5 business days.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <a
                href="#contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#c30000] hover:bg-[#a50000] text-white font-bold text-sm tracking-wide shadow-lg shadow-red-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Book Technical Discovery</span>
                <ArrowRight className="size-4" />
              </a>

              <a
                href="https://wa.me/919971999100"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800 font-semibold text-sm transition-colors"
              >
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Global Site Footer */}
      <SiteFooter />
    </div>
  );
}

export default VoiceAgentPage;

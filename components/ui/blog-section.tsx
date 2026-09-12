import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Clock, 
  Calendar, 
  User, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  Terminal, 
  Bookmark, 
  Share2, 
  Sparkles,
  Tag
} from 'lucide-react';
import { LazyImage } from './lazy-image';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  image: string;
  createdAt: string;
  author: string;
  authorRole: string;
  readTime: string;
  tags: string[];
  keyTakeaways: string[];
  contentBody: string[];
  codeSnippet?: {
    language: string;
    code: string;
  };
}

const BLOGS: BlogPost[] = [
  {
    id: "rag-hybrid-search",
    title: "Architecting Enterprise RAG: Hybrid Vector-Lexical Search with Cross-Encoder Reranking",
    slug: "#rag-hybrid-search",
    category: "AI & RAG",
    description: "How we slashed retrieval latency by 64% and eliminated hallucination cascades across high-concurrency production agentic pipelines.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    createdAt: "September 08, 2026",
    author: "Dr. Marcus Vance",
    authorRole: "Principal AI Architect",
    readTime: "8 min read",
    tags: ["RAG", "Vector Embeddings", "BM25", "Cross-Encoders", "Latency"],
    keyTakeaways: [
      "Pure vector similarity frequently misses exact SKU, serial number, and domain term matches; hybrid BM25 + dense vectors delivers 94.2% recall.",
      "Cross-encoder rerankers applied only to top-50 candidate documents reduce context window token waste by 60%.",
      "Streaming semantic cache hits drop average query latency from 820ms to 42ms for repetitive queries."
    ],
    contentBody: [
      "When deploying generative intelligence in regulated or high-throughput domains, hallucination is unacceptable. Traditional retrieval pipelines relying purely on cosine distance over dense vector embeddings struggle with out-of-vocabulary acronyms, part numbers, and precise Boolean constraints.",
      "At Saras Dynamics, our reference RAG architecture unifies Sparse BM25 lexical tokenization with dense multi-vector embeddings using Reciprocal Rank Fusion (RRF). Once candidate chunks are retrieved, a fast cross-encoder reranking model scores relevance before injecting the pruned context into the inference prompt.",
      "By decoupling embedding generation from synchronous request paths using asynchronous worker queues and Redis semantic caches, our clients maintain sub-100ms response windows even during traffic spikes."
    ],
    codeSnippet: {
      language: "typescript",
      code: `// Saras Dynamics Hybrid Retrieval Pipeline
async function retrieveContext(query: string, topK: number = 5): Promise<DocumentChunk[]> {
  const [denseResults, sparseResults] = await Promise.all([
    vectorIndex.query({ vector: await embed(query), topK: 50 }),
    bm25Index.search(query, { topK: 50 })
  ]);
  
  // Reciprocal Rank Fusion (RRF)
  const fusedScores = reciprocalRankFusion([denseResults, sparseResults], { k: 60 });
  const topCandidates = fusedScores.slice(0, 20);
  
  // Cross-Encoder Reranker Scoring
  return await crossEncoderRerank(query, topCandidates, topK);
}`
    }
  },
  {
    id: "monolith-migration",
    title: "Zero-Downtime Monolith Deconstruction: Migrating 10M Daily Transactions to Kubernetes",
    slug: "#monolith-migration",
    category: "Cloud & Systems",
    description: "De-risking a mission-critical financial backend using strangler fig routing, Kafka event bridges, and blue-green multi-region deployments.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    createdAt: "August 30, 2026",
    author: "Sarah Jenkins",
    authorRole: "Head of Infrastructure",
    readTime: "11 min read",
    tags: ["Kubernetes", "Microservices", "Kafka", "PostgreSQL", "DevOps"],
    keyTakeaways: [
      "The Strangler Fig pattern paired with edge Envoy proxies prevented all-at-once migration risk for payment flows.",
      "Dual-write shadow database replication verified data parity across 10,000,000 daily writes prior to cutover.",
      "Automated blue/green deployments with synthetic canary traffic ensured 99.999% transaction reliability."
    ],
    contentBody: [
      "Deconstructing a 9-year-old monolithic Rails/Postgres application handling live financial transactions is akin to replacing jet engines mid-flight. One bad schema lock or unindexed foreign key can cause cascade outages.",
      "We instituted an event-driven strangler fig strategy. Every write to the legacy system emitted a change-data-capture (CDC) event through Debezium into an Apache Kafka cluster. Independent Node.js microservices consumed these streams to hydrate dedicated PostgreSQL read models.",
      "Over an 8-week migration window, proxy traffic was incrementally shifted from 1% to 100%. The client experienced zero dropped transactions and reduced infrastructure spend by 58%."
    ],
    codeSnippet: {
      language: "yaml",
      code: `# Canary Deployment Traffic Shaping with Istio
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: payment-service-route
spec:
  hosts:
  - payment-api.internal
  http:
  - route:
    - destination:
        host: payment-service
        subset: v1-legacy
      weight: 10
    - destination:
        host: payment-service
        subset: v2-containerized
      weight: 90`
    }
  },
  {
    id: "react-native-120fps",
    title: "Rendering 120 FPS React Native on Mobile: Reanimated 3, Skia & C++ TurboModules",
    slug: "#react-native-120fps",
    category: "Mobile",
    description: "Eliminating UI thread hops and JavaScript bridge serialization bottlenecks to achieve butter-smooth ProMotion animations in fintech mobile apps.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    createdAt: "August 22, 2026",
    author: "Alex Rivera",
    authorRole: "Lead Mobile Engineer",
    readTime: "7 min read",
    tags: ["React Native", "Swift", "Kotlin", "Reanimated 3", "Skia"],
    keyTakeaways: [
      "JSI (JavaScript Interface) TurboModules allow C++ direct memory sharing without JSON bridge serialization.",
      "Offloading complex physics calculations entirely to the native UI thread prevents frame drops during background network requests.",
      "Hardware-accelerated Skia canvases render 60,000 live candlestick chart points smoothly at native 120Hz."
    ],
    contentBody: [
      "Mobile users detect even a single dropped frame during interactive gestures. In financial trading and health monitoring apps, tactile responsiveness directly drives user trust.",
      "With React Native's New Architecture (Fabric and TurboModules), JavaScript runs synchronously on top of Hermes with direct C++ pointer access to native platform views. By keeping gesture handlers strictly on the native UI thread via Reanimated worklets, touch response latency drops under 8 milliseconds.",
      "We walk through our battle-tested setup for implementing fluid sheet modals, real-time audio visualizers, and biometric security prompts that match 100% native Swift and Kotlin applications."
    ]
  },
  {
    id: "nextjs-edge-ttfb",
    title: "Optimizing Next.js Server Components for Sub-50ms Global Time-to-First-Byte (TTFB)",
    slug: "#nextjs-edge-ttfb",
    category: "Web & Performance",
    description: "Edge rendering, streaming SSR with Suspense, and multi-tier stale-while-revalidate caching strategies tested under 50,000 req/sec.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    createdAt: "August 14, 2026",
    author: "Elena Rostova",
    authorRole: "Staff Web Architect",
    readTime: "6 min read",
    tags: ["Next.js", "React 19", "Edge Compute", "SSR", "Web Vitals"],
    keyTakeaways: [
      "Decoupling non-critical personalized data into React Suspense boundaries lets edge nodes stream the critical shell in <25ms.",
      "Layered caching using stale-while-revalidate tags prevents cold-cache thundering herd problems during major traffic spikes.",
      "Total Blocking Time (TBT) dropped to 0ms across mobile devices through selective hydration."
    ],
    contentBody: [
      "Modern web platforms often suffer from monolithic server-side rendering where the slowest database query blocks the entire HTML stream from reaching the client's browser.",
      "By embracing React Server Components (RSC) and HTTP 103 Early Hints, we partition web applications into static edge-cacheable layouts and dynamically streamed micro-components. The critical above-the-fold canvas renders almost instantaneously.",
      "In this dispatch, we share our performance audit checklist that propelled an enterprise client from a 62 Lighthouse score to a flawless 100 across mobile and desktop."
    ]
  },
  {
    id: "resilient-microservices",
    title: "Self-Healing Microservices: Implementing Circuit Breakers, Bulkheads & Distributed Tracing",
    slug: "#resilient-microservices",
    category: "Cloud & Systems",
    description: "Building resilient microservice meshes with OpenTelemetry, Envoy sidecars, and automated chaos engineering fault-injection routines.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    createdAt: "July 28, 2026",
    author: "Devraj Patel",
    authorRole: "Principal Systems Engineer",
    readTime: "9 min read",
    tags: ["OpenTelemetry", "Microservices", "Chaos Engineering", "Resilience"],
    keyTakeaways: [
      "Circuit breakers isolate upstream service degradations before they exhaust downstream thread pools.",
      "OpenTelemetry context propagation links user actions to microservice spans with zero sampling blindspots.",
      "Automated chaos injection schedules in staging catch silent concurrency deadlocks before production launch."
    ],
    contentBody: [
      "Distributed systems fail in unpredictable ways: partial packet drops, DNS throttling, and degraded database replicas. Relying on simple retry policies often accelerates outages into complete cascading failures.",
      "We implement exponential backoff with jitter, bulkhead thread pool isolation, and dynamic circuit breakers configured through Envoy proxies. When a dependent service experiences latency spikes, synthetic fallback responses are returned immediately without exhausting system sockets."
    ]
  },
  {
    id: "biometric-token-security",
    title: "Securing Biometric Auth & Token Cryptography in Native iOS with Apple Secure Enclave",
    slug: "#biometric-token-security",
    category: "Security",
    description: "Hardening contactless digital wallet transactions using Apple's Secure Enclave, hardware-backed keys, and zero-knowledge cryptographic proofs.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    createdAt: "July 16, 2026",
    author: "Priya Sharma",
    authorRole: "Security & Mobile Architect",
    readTime: "8 min read",
    tags: ["Security", "iOS", "Cryptography", "Secure Enclave", "Biometrics"],
    keyTakeaways: [
      "Private keys generated inside the Secure Enclave processor can never be extracted by operating system memory.",
      "LocalAuthentication with biometric flags requires physical user presence before any cryptographic signature is computed.",
      "Zero-knowledge signature tokens eliminate the transmission of sensitive account numbers over public networks."
    ],
    contentBody: [
      "In high-value consumer applications, storing auth tokens or private credentials in basic keychain containers leaves users vulnerable to jailbreak exploits or memory injection attacks.",
      "Our security practice leverages Apple's dedicated Secure Enclave coprocessor. Hardware-backed ECC P-256 keypairs are initialized with strict biometric access control flags. The device signs authorization payloads within the isolated silicon without the private key ever leaving the enclave."
    ]
  },
  {
    id: "mathematical-design-tokens",
    title: "The Mathematical Foundations of UI Design Systems: Step Ratios and Fluid Tokens",
    slug: "#mathematical-design-tokens",
    category: "Web & Performance",
    description: "Moving beyond arbitrary pixel values to mathematically derived harmonic scales, typographic step ratios, and CSS variables.",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
    createdAt: "June 29, 2026",
    author: "Liam Zhao",
    authorRole: "Design Systems Lead",
    readTime: "6 min read",
    tags: ["Design Systems", "Typography", "CSS", "UI Engineering", "Tokens"],
    keyTakeaways: [
      "Harmonic scaling ratios (like the Major Second 1.125 for dense software and Perfect Fourth 1.333 for editorial) eliminate visual clutter.",
      "Nested border radius math (Outer Radius - Padding = Inner Radius) guarantees optical alignment.",
      "Fluid clamp() functions replace disjointed media query breakpoints with smooth responsive typography."
    ],
    contentBody: [
      "A software interface feels cohesive not by accident, but through optical rhythm. When designers or engineers choose arbitrary padding (17px here, 23px there), cognitive friction accumulates.",
      "By codifying modular scales into token pipelines shared between Figma and Tailwind CSS, we ensure typography, border radiuses, and container spacings maintain mathematical harmony across mobile, tablet, and desktop viewports."
    ]
  },
  {
    id: "slm-edge-quantization",
    title: "Fine-Tuning Small Language Models (SLMs) for Edge Execution in Offline Environments",
    slug: "#slm-edge-quantization",
    category: "AI & RAG",
    description: "Quantization strategies (GGUF, AWQ, 4-bit LoRA), memory profiling, and on-device inference benchmarks for edge hardware and mobile devices.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    createdAt: "June 12, 2026",
    author: "Dr. Marcus Vance",
    authorRole: "Principal AI Architect",
    readTime: "10 min read",
    tags: ["SLM", "Quantization", "LoRA", "Edge AI", "On-Device"],
    keyTakeaways: [
      "4-bit quantized 3B parameter models achieve 88% of cloud model task accuracy while consuming under 2.2GB of RAM.",
      "On-device inference guarantees zero private user data ever leaves the local device perimeter.",
      "Inference throughput reaches 42 tokens/sec on modern Apple Silicon and Snapdragon NPU chips."
    ],
    contentBody: [
      "While multi-hundred-billion parameter models dominate headlines, enterprise operations frequently require offline reliability, strict data isolation, and microsecond response times.",
      "We demonstrate how Saras Dynamics fine-tunes compact 1B to 3B models using LoRA adapters on proprietary operational manuals, quantizes the weights into 4-bit formats, and executes them directly on edge hardware with zero network dependencies."
    ]
  },
  {
    id: "realtime-crdt-websockets",
    title: "Building Real-Time Collaborative Whiteboards with CRDTs and WebSockets",
    slug: "#realtime-crdt-websockets",
    category: "Web & Performance",
    description: "Resolving state conflicts deterministically across thousands of simultaneous cursor interactions with zero centralized locking.",
    image: "https://images.unsplash.com/photo-1542744094-3a31727223ec?auto=format&fit=crop&w=1200&q=80",
    createdAt: "May 24, 2026",
    author: "Elena Rostova",
    authorRole: "Staff Web Architect",
    readTime: "8 min read",
    tags: ["CRDT", "WebSockets", "Real-Time", "Distributed State", "Canvas"],
    keyTakeaways: [
      "Conflict-free Replicated Data Types (CRDTs) guarantee convergence across offline peers without centralized server locks.",
      "Delta-state synchronization over lightweight binary WebSockets drops bandwidth consumption by 91%.",
      "Spatial indexing algorithms prune canvas redraw operations to only modified visual quadrants."
    ],
    contentBody: [
      "Real-time multiplayer applications present unique engineering hurdles when multiple remote users modify shared objects concurrently. Traditional locking strategies introduce unacceptable latency and sync deadlocks.",
      "We walk through our production architecture utilizing Yjs CRDTs over authenticated WebSockets, enabling thousands of distributed users to co-author canvases, annotate documents, and exchange high-frequency telemetry in real time."
    ]
  }
];

const CATEGORIES = [
  "All",
  "AI & RAG",
  "Cloud & Systems",
  "Mobile",
  "Web & Performance",
  "Security"
];

export function BlogSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);

  const filteredBlogs = useMemo(() => {
    return BLOGS.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        post.author.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="relative mx-auto w-full max-w-6xl grow flex flex-col gap-8">
      {/* Background Ambience */}
      <div
        aria-hidden
        className="absolute inset-0 isolate -z-10 opacity-60 overflow-hidden pointer-events-none"
      >
        <div className="-rotate-45 bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(0,0,0,0.04)_0,hsla(0,0%,55%,.01)_50%,rgba(0,0,0,0.005)_80%)] absolute top-0 left-0 h-320 w-140 -translate-y-87.5 rounded-full" />
        <div className="-rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0.03)_0,rgba(0,0,0,0.008)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
      </div>

      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700 tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
            <span>SARAS DYNAMICS &bull; ENGINEERING DISPATCHES</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 leading-[1.15]">
            Engineering &amp; Research Publications
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
            Deep technical articles, production case studies, and architectural patterns from Saras Dynamics engineering leads.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, keywords, tags..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all shadow-2xs placeholder:text-zinc-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "bg-zinc-100 hover:bg-zinc-200/80 text-zinc-600 hover:text-zinc-900 border border-transparent"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Articles Count / Active Filter Feedback */}
      <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-200 pb-3">
        <span>
          Showing <strong className="text-zinc-900">{filteredBlogs.length}</strong> technical publication{filteredBlogs.length === 1 ? "" : "s"}
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
        </span>
        {searchQuery && (
          <span>
            Filtering by: <strong className="text-zinc-900">"{searchQuery}"</strong>
          </span>
        )}
      </div>

      {/* Empty State */}
      {filteredBlogs.length === 0 && (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
          <Search className="size-8 text-zinc-400" />
          <h3 className="font-bold text-zinc-800 text-base">No articles found</h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            No technical dispatches matched your search criteria. Try adjusting keywords or switching categories.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="mt-2 text-xs font-semibold px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => (
          <article
            key={blog.id}
            onClick={() => setSelectedArticle(blog)}
            className="group flex flex-col justify-between bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-2xs hover:shadow-md hover:border-zinc-400/80 transition-all duration-300 cursor-pointer"
          >
            <div>
              {/* Cover Image */}
              <div className="relative overflow-hidden aspect-video bg-zinc-100">
                <LazyImage
                  src={blog.image}
                  fallback="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80"
                  alt={blog.title}
                  ratio={16 / 9}
                  className="transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-zinc-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide">
                  {blog.category}
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3 text-zinc-400" />
                    {blog.createdAt}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3 text-zinc-400" />
                    {blog.readTime}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-zinc-900 leading-snug group-hover:text-zinc-700 transition-colors line-clamp-2">
                  {blog.title}
                </h2>

                <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                  {blog.description}
                </p>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {blog.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-medium text-zinc-600"
                    >
                      #{tag}
                    </span>
                  ))}
                  {blog.tags.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-zinc-50 text-[10px] text-zinc-400">
                      +{blog.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Author Footer */}
            <div className="px-5 py-3.5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-700">
                  {blog.author.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-zinc-800">{blog.author}</span>
                  <span className="text-[10px] text-zinc-400">{blog.authorRole}</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 group-hover:translate-x-0.5 transition-transform">
                <span>Read</span>
                <ArrowRight className="size-3.5" />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Technical Deep Dive Article Reader Modal */}
      {selectedArticle && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-900/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col"
          >
            {/* Modal Header Bar */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-zinc-100">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600">
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-900 font-mono text-[11px]">
                  {selectedArticle.category}
                </span>
                <span>&bull;</span>
                <span>{selectedArticle.readTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                  title="Copy link"
                >
                  <Share2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                  title="Close reader"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Article Content */}
            <div className="p-6 sm:p-8 flex flex-col gap-6">
              {/* Header Details */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <User className="size-3.5 text-zinc-400" />
                    <strong className="text-zinc-800">{selectedArticle.author}</strong> ({selectedArticle.authorRole})
                  </span>
                  <span>&bull;</span>
                  <span>{selectedArticle.createdAt}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 leading-tight">
                  {selectedArticle.title}
                </h1>

                <p className="text-base text-zinc-600 font-medium leading-relaxed">
                  {selectedArticle.description}
                </p>
              </div>

              {/* Cover Image */}
              <div className="rounded-xl overflow-hidden aspect-video max-h-72 bg-zinc-100">
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Key Takeaways Box */}
              <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200/90 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Key Architectural Takeaways</span>
                </div>
                <div className="flex flex-col gap-2">
                  {selectedArticle.keyTakeaways.map((takeaway, tIdx) => (
                    <div key={tIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-2 shrink-0" />
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Article Paragraphs */}
              <div className="flex flex-col gap-4 text-sm sm:text-base text-zinc-700 leading-relaxed">
                {selectedArticle.contentBody.map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </div>

              {/* Optional Code Snippet */}
              {selectedArticle.codeSnippet && (
                <div className="rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono shadow-sm">
                  <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-2">
                      <Terminal className="size-3.5 text-emerald-400" />
                      <span>Reference Implementation ({selectedArticle.codeSnippet.language})</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Saras Architecture</span>
                  </div>
                  <pre className="p-4 overflow-x-auto leading-relaxed text-zinc-200">
                    <code>{selectedArticle.codeSnippet.code}</code>
                  </pre>
                </div>
              )}

              {/* Tags Section */}
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-zinc-100">
                <Tag className="size-3.5 text-zinc-400" />
                {selectedArticle.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-zinc-100 text-xs font-medium text-zinc-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Sticky Bottom Actions */}
            <div className="sticky bottom-0 px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Published by Saras Dynamics Engineering Team
              </span>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogSection;

import React, { useEffect, useState } from 'react';
import { LazyImage } from './lazy-image';
import { api, type BlogPost } from '../../src/services/api';

interface BlogSectionProps {
  onSelectPost?: (slug: string) => void;
}

const defaultBlogs = [
	{
		title: 'Architecting Zero-Downtime Migration to Kubernetes',
		slug: '#',
		description:
			'How we decomposed a legacy relational monolith into containerized services, automated canary deployments, and sustained 99.99% uptime.',
		image: 'https://cdn.21st.dev/assets/mirror/f2/f2b2a055966c6c1681569e43db628e02b5f32ce532c436bd05b2889a78914819.jpg',
		createdAt: '2026-08-25',
		author: 'Alex Rivera',
		readTime: '7 min read',
	},
	{
		title: 'Production RAG: Hybrid Vector Search & Reranking',
		slug: '#',
		description:
			'Why naive cosine embeddings fail at enterprise scale, and how cross-encoders, BM25 hybrid indexing, and chunk deduplication yield 94% retrieval accuracy.',
		image: 'https://cdn.21st.dev/assets/mirror/1c/1c9069d4c0e2ec6e906649d4872849733f11e1d5bc9acc77afa11d51300e042f.jpg',
		createdAt: '2026-07-14',
		author: 'Dr. Elena Rostova',
		readTime: '9 min read',
	},
	{
		title: 'Reaching 120 FPS in React Native & Reanimated 3',
		slug: '#',
		description:
			'Optimizing the shadow tree, offloading gesture math to the UI thread, and eliminating micro-janks across high-refresh iOS and Android displays.',
		image: 'https://cdn.21st.dev/assets/mirror/02/02f7ddc201e97fad2664c317fa4182a86cd41174d0618f09d41b712cafd243be.jpg',
		createdAt: '2026-06-30',
		author: 'Marcus Vance',
		readTime: '6 min read',
	},
	{
		title: 'Hardening Distributed Webhooks with Idempotency Keys',
		slug: '#',
		description:
			'Eliminating duplicate data processing and double billing in asynchronous distributed payment workflows with Redis-backed atomic lease locks.',
		image: 'https://cdn.21st.dev/assets/mirror/ba/ba0e6341e9bf5eefa9dd354dce1cdc4a0ca745a5b6f338b0271000f1b7fc3248.jpg',
		createdAt: '2026-06-18',
		author: 'Devlin Scott',
		readTime: '8 min read',
	},
	{
		title: 'Zero-Copy Data Pipelines with Arrow and Rust',
		slug: '#',
		description:
			'Processing gigabyte-scale telemetry batches without memory thrashing using Apache Arrow columnar memory layout and native Rust FFI bridges.',
		image: 'https://cdn.21st.dev/assets/mirror/c1/c12cf6dc6daca5173fd0bfc4b1562743c92e8f1fb17efa224098180d940ba880.jpg',
		createdAt: '2026-05-20',
		author: 'Priyantha Sen',
		readTime: '6 min read',
	},
	{
		title: 'Fine-Tuning Small Language Models for Edge Inference',
		slug: '#',
		description:
			'Deploying quantized 4-bit LoRA adapters on local mobile devices to deliver sub-100ms offline intent classification without cloud roundtrips.',
		image: 'https://cdn.21st.dev/assets/mirror/03/03e08e6b748cd888b6c4bb295b1348148830b5cfc87cce5ecb1ad62b4dd79fb3.jpg',
		createdAt: '2026-05-02',
		author: 'Sarah Lin',
		readTime: '10 min read',
	},
	{
		title: 'Event-Driven Telemetry at 10M Daily Transactions',
		slug: '#',
		description:
			'Architectural lessons from scaling Kafka partitions, dead-letter re-queuing, and ClickHouse analytical stores under heavy burst traffic.',
		image: 'https://cdn.21st.dev/assets/mirror/94/94f309ffe240e6252865b9a1fe6fc11c086414e7271e8565aae29d9e75dcfc44.jpg',
		createdAt: '2026-04-15',
		author: 'Julian Becker',
		readTime: '11 min read',
	},
	{
		title: 'Contract-First API Architecture: Protobuf to TypeScript',
		slug: '#',
		description:
			'Enforcing type-safe RPC boundaries, backward-compatible schemas, and automated client generation across polyglot microservice clusters.',
		image: 'https://cdn.21st.dev/assets/mirror/dd/dd7374e5608609dce96fedb6220383770fe180d2d2e9f41f9b3c22ccfa5b654e.jpg',
		createdAt: '2026-04-01',
		author: 'Tanya Morris',
		readTime: '7 min read',
	},
	{
		title: 'Native iOS Secure Enclave & Biometric Cryptography',
		slug: '#',
		description:
			'Generating non-exportable hardware-backed ECC keys on Apple Secure Enclave for zero-trust enterprise financial transactions.',
		image: 'https://cdn.21st.dev/assets/mirror/1e/1e4a4d1babea6eab29262d2283d9fb7a28b0301690e5f9c45612978ae2ff064f.jpg',
		createdAt: '2026-03-22',
		author: 'Rohit Sharma',
		readTime: '8 min read',
	},
	{
		title: 'Database Sharding vs Read-Replicas: When to Split',
		slug: '#',
		description:
			'Evaluating connection pooling, replication lag, cross-shard constraints, and operational overhead before partitioning production PostgreSQL.',
		image: 'https://cdn.21st.dev/assets/mirror/66/66c2376b01010086f676afcd56d9e3b0f0498b4d1c4e2c3e7e91eb3af2f179f2.jpg',
		createdAt: '2026-03-09',
		author: 'Carlos Mendes',
		readTime: '9 min read',
	},
	{
		title: 'Autonomous Multi-Agent Systems in Production',
		slug: '#',
		description:
			'Designing deterministic state machines for autonomous LLM agents to execute multi-step database mutations with human-in-the-loop approval.',
		image: 'https://cdn.21st.dev/assets/mirror/ee/ee1bd0742f0ae1ed3cc484df2b2a51495d35fd0e853eb14757b4f78df82f450c.jpg',
		createdAt: '2026-02-28',
		author: 'Amanda Wright',
		readTime: '8 min read',
	},
	{
		title: 'Optimizing Node.js Event Loop Latency under 50k RPS',
		slug: '#',
		description:
			'Profiling V8 heap allocations, eliminating synchronous cryptography blocks, and tuning libuv threadpools for high-concurrency microservices.',
		image: 'https://cdn.21st.dev/assets/mirror/f0/f05e33f6d849e65bc6507c82ed416805bba5d5dd4152fde67b1d833b5ff91b88.jpg',
		createdAt: '2026-02-14',
		author: 'Kevin O’Connor',
		readTime: '6 min read',
	},
];

export function BlogSection({ onSelectPost }: BlogSectionProps) {
	const [apiPosts, setApiPosts] = useState<any[]>([]);

	useEffect(() => {
		api.getPublicBlogPosts({ limit: 12 })
			.then((res) => {
				if (res.success && res.data && res.data.length > 0) {
					const mapped = res.data.map((p) => ({
						title: p.title,
						slug: p.slug,
						description: p.excerpt || p.content?.slice(0, 150) || "",
						image: p.featured_image_url || 'https://cdn.21st.dev/assets/mirror/f2/f2b2a055966c6c1681569e43db628e02b5f32ce532c436bd05b2889a78914819.jpg',
						createdAt: p.published_at ? new Date(p.published_at).toISOString().split('T')[0] : 'Recent',
						author: p.author?.full_name || 'Engineering Team',
						readTime: '5 min read',
						isDynamic: true,
					}));
					setApiPosts(mapped);
				}
			})
			.catch(() => {
				// Keep fallback list
			});
	}, []);

	const displayBlogs = apiPosts.length > 0 ? apiPosts : defaultBlogs;

	return (
		<div className="relative mx-auto w-full max-w-5xl grow">
			<div
				aria-hidden
				className="absolute inset-0 isolate contain-strict -z-10 opacity-60 overflow-hidden pointer-events-none"
			>
				<div className="-rotate-45 bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(0,0,0,0.06)_0,hsla(0,0%,55%,.02)_50%,rgba(0,0,0,0.01)_80%)] absolute top-0 left-0 h-320 w-140 -translate-y-87.5 rounded-full" />
				<div className="-rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0.04)_0,rgba(0,0,0,0.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
				<div className="-rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0.04)_0,rgba(0,0,0,0.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 -translate-y-87.5 rounded-full" />
			</div>
			<div className="space-y-1 px-4 py-8">
				<h1 className="font-mono text-4xl font-bold tracking-wide">
					Engineering & Systems Journal
				</h1>
				<p className="text-muted-foreground text-base">
					Deep dives into AI architectures, distributed systems, high-performance web, and mobile engineering by Saras Dynamics.
				</p>
			</div>
			<div className="relative inset-x-0 h-px w-full border-b border-dashed border-zinc-200" />
			<div className="grid p-4 md:grid-cols-2 lg:grid-cols-3 z-10 gap-4">
				{displayBlogs.map((blog) => (
					<div
						key={blog.title}
						onClick={(e) => {
							if (blog.slug && blog.slug !== '#') {
								e.preventDefault();
								if (onSelectPost) onSelectPost(blog.slug);
							}
						}}
						className="group hover:bg-zinc-100 active:bg-zinc-200 flex flex-col gap-2 rounded-lg p-2 duration-75 cursor-pointer"
					>
						<LazyImage
							src={blog.image}
							fallback="https://cdn.21st.dev/assets/mirror/cc/ccf6e78beb7f7cc5b720069cb4f86696912be109614973d49df165d1e51631c8.svg"
							inView={true}
							alt={blog.title}
							ratio={16 / 9}
							className="transition-all duration-500 group-hover:scale-105"
						/>
						<div className="space-y-2 px-2 pb-2">
							<div className="text-muted-foreground flex items-center gap-2 text-[11px] sm:text-xs">
								<p>by {blog.author}</p>
								<div className="bg-muted-foreground size-1 rounded-full" />
								<p>{blog.createdAt}</p>
								<div className="bg-muted-foreground size-1 rounded-full" />
								<p>{blog.readTime}</p>
							</div>
							<h2 className="line-clamp-2 text-lg leading-5 font-semibold tracking-tight text-zinc-900">
								{blog.title}
							</h2>
							<p className="text-muted-foreground line-clamp-3 text-sm">
								{blog.description}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default BlogSection;

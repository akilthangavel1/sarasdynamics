import React from "react";
import { BlogPostCard } from "@/components/ui/card-18";
import { motion } from "framer-motion";

// Data for web development engineering case studies
const posts = [
  {
    tag: "Performance & Vitals",
    date: "ENGINEERING PLAYBOOK",
    title: "Achieving 99+ Core Web Vitals on Heavy React Dashboards",
    description:
      "Proven tactics for route-based code-splitting, DOM virtualization, and CSS containment in data-dense financial applications.",
    href: "#",
    readMoreText: "Explore Architecture",
  },
  {
    tag: "Real-Time Systems",
    date: "DISTRIBUTED STATE",
    title: "Multiplayer WebSockets & Optimistic State Sync in TypeScript",
    description:
      "Architecting zero-latency conflict-free concurrent editing pipelines and heartbeat reconnection logic on Node.js.",
    href: "#",
    readMoreText: "Explore Architecture",
  },
  {
    tag: "Design Systems",
    date: "FRONTEND INFRA",
    title: "Production Design Systems: Tailwind CSS, Radix UI & Design Tokens",
    description:
      "Bridging the gap between design tokens and production React applications with WCAG AA compliance and zero visual regressions.",
    href: "#",
    readMoreText: "Explore Architecture",
  },
];

const featuredPost = {
  tag: "Cloud Architecture & Scale",
  date: "CASE STUDY • ENTERPRISE SAAS",
  title: "From Monolith to Cloud Run: Scaling to 10M+ Monthly API Requests with Zero Downtime",
  description:
    "How Saras Dynamics decoupled a legacy relational monolith into containerized Node.js microservices with sub-50ms response times, automated CI/CD pipelines, and 62% cloud infrastructure cost savings.",
  href: "#",
  readMoreText: "Read Architecture Case Study",
  imageUrl:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
};

// Animation variants for the container to stagger children
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

// Animation variants for child items
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function BlogPostCardDemo({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full max-w-6xl mx-auto p-4 md:p-8 ${className}`}>
      {/* Featured Post */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="mb-8 md:mb-12"
      >
        <BlogPostCard variant="featured" {...featuredPost} />
      </motion.div>

      {/* Grid of Default Posts */}
      <motion.div
        className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {posts.map((post, index) => (
          <motion.div key={index} variants={itemVariants}>
            <BlogPostCard {...post} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default BlogPostCardDemo;

import { NotchedProjectCard } from "@/components/ui/notched-project-card";

/* Three cards, one per device/project, showcasing engineering & craft */

export interface NotchedProjectCardsDemoProps {
  className?: string;
  surface?: string;
}

export function NotchedProjectCardsDemo({
  className = "",
  surface = "white",
}: NotchedProjectCardsDemoProps = {}) {
  return (
    <div className={`grid w-full max-w-7xl mx-auto gap-x-6 gap-y-12 px-4 sm:px-6 lg:px-8 min-[700px]:grid-cols-3 ${className}`}>
      {/* Card 1: Autonomous AI & Agent Orchestration */}
      <NotchedProjectCard
        href="#open-positions"
        title="Agentic Workflows & Tool Use"
        description="Autonomous AI infrastructure orchestrating multi-agent collaboration, memory pipelines, and real-time reasoning loops for mission-critical client operations."
        image="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"
        badge="2026"
        tags={["AI Agents", "Python", "LangChain"]}
        monochrome
        surface={surface}
        accent="#18181b"
        accentForeground="#ffffff"
      />
      {/* Card 2: Ultra High-Performance Interfaces */}
      <NotchedProjectCard
        href="#open-positions"
        title="Design Systems & Motion UI"
        description="Ultra-responsive frontend architectures blending WebGL shaders, Tailwind CSS, and resilient React state for enterprise-grade design clarity."
        image="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop"
        badge="2025"
        tags={["React", "TypeScript", "Tailwind"]}
        monochrome
        surface={surface}
        accent="#18181b"
        accentForeground="#ffffff"
      />
      {/* Card 3: Cloud & Distributed Backend Systems */}
      <NotchedProjectCard
        href="#open-positions"
        title="Distributed Data & Cloud Backends"
        description="Scalable cloud architectures with sub-millisecond query latencies, fault-tolerant replication, and event-driven microservices across global regions."
        image="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop"
        badge="2024"
        tags={["Node.js", "Docker", "AWS"]}
        monochrome
        surface={surface}
        accent="#18181b"
        accentForeground="#ffffff"
      />
    </div>
  );
}

export default NotchedProjectCardsDemo;

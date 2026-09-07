import HoverRevealCards, { type CardItem } from '@/components/ui/cards';

const demoItems: CardItem[] = [
  {
    id: 1,
    title: 'Echoes',
    subtitle: 'Grand Canyon',
    imageUrl:
      'https://images.unsplash.com/photo-1615551043360-33de8b5f4125?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'Highest Mountain',
    subtitle: 'Yosemite',
    imageUrl:
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Deep Desert',
    subtitle: 'Sahara',
    imageUrl:
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    title: 'Breath-taking',
    subtitle: 'Landscape',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
  },
];

export default function HoverRevealCardsDemo() {
  return (
    <section
      id="hover-reveal-section"
      className="flex w-full flex-col items-center justify-center bg-white py-16 md:py-24 px-4 border-t border-zinc-200/80 select-none"
    >
      <div className="w-full max-w-6xl mb-6 px-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span
            id="hover-reveal-tag"
            className="text-xs font-black tracking-[0.2em] uppercase text-zinc-500"
          >
            Curated Visuals
          </span>
          <h2
            id="hover-reveal-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mt-1"
          >
            Immersive Destinations
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md">
          Hover across cards to focus on individual destinations while softening adjacent views.
        </p>
      </div>
      <HoverRevealCards items={demoItems} />
    </section>
  );
}

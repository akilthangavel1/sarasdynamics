import { ImageExpansionSlider } from "@/components/ui/image-expansion";

export default function DemoOne() {
  return (
    <div className="w-full min-h-screen bg-[#050507] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl">
        <ImageExpansionSlider />
      </div>
    </div>
  );
}

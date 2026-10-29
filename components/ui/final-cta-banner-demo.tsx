import FinalCtaBanner from "@/components/ui/final-cta-banner";

/** Landscape frame so 21st covers capture the long card, not a square crop. */
export default function DefaultDemo() {
  return (
    <div
      style={{
        boxSizing: "border-box",
        width: "100%",
        aspectRatio: "16 / 9",
        minHeight: 420,
        background: "#f4f1ea",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4% 5%",
        overflow: "hidden",
      }}
    >
      <div style={{ width: "100%", maxWidth: "68rem" }}>
        <FinalCtaBanner />
      </div>
    </div>
  );
}

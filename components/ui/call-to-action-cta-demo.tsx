import { CtaCard } from "@/components/ui/call-to-action-cta";

interface CtaCardDemoProps {
  className?: string;
  cardClassName?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: (email: string) => void;
}

const CtaCardDemo = ({
  className,
  cardClassName,
  title = "Let's talk about your project.",
  description = "Tell us what you need, and we'll take it from there.",
  buttonText = "Contact Us",
  onButtonClick,
}: CtaCardDemoProps = {}) => {
  const handleAction = (email: string) => {
    if (onButtonClick) {
      onButtonClick(email);
    } else {
      window.location.hash = "#contact";
    }
  };

  return (
    <div className={className || "w-full"}>
      <CtaCard
        className={cardClassName || "w-full rounded-none border-x-0"}
        title={title}
        description={description}
        buttonText={buttonText}
        inputPlaceholder="Your email address"
        imageSrc="https://cdn.21st.dev/assets/mirror/d6/d6ebbba9f413343efbc0d13521dc6a9c607dbbd3e4795f2b756ca0467c03bf04.jpg"
        onButtonClick={handleAction}
      />
    </div>
  );
};


export default CtaCardDemo;
export { CtaCardDemo };

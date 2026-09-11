import { CtaCard } from "@/components/ui/call-to-action-cta";

const CtaCardDemo = () => {
  const handleSignUp = (email: string) => {
    alert(`Thank you for signing up with ${email}!`);
  };

  return (
    <div className="w-full p-4 md:p-8">
      <CtaCard
        theme="light"
        title="Let's build from here"
        description="Harnessed for productivity. Designed for collaboration. Celebrated for built-in security. Welcome to the platform developers love."
        buttonText="Sign up for GitHub"
        inputPlaceholder="Email address"
        imageSrc="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
        onButtonClick={handleSignUp}
      />
    </div>
  );
};

export default CtaCardDemo;

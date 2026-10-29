import { Error404 } from "@/components/ui/pixeleted-404-not-found";

export default function Error404Demo() {
  return (
    <Error404
      postcardImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
      postcardAlt="Modern Architectural Engineering"
      curvedTextTop="Saras Dynamics"
      curvedTextBottom="Web Engineering"
      heading="Have a web project? Let’s build it."
      subtext="Partner with Saras Dynamics to design, engineer, and deploy high-performance web applications and scalable digital platforms."
      backButtonLabel="Contact Us"
      backButtonHref="#contact"
    />
  );
}

export { Error404Demo };

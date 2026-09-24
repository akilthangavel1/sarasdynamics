import { Error404 } from "@/components/ui/pixeleted-404-not-found";

export default function Error404Demo() {
  return (
    <Error404
      postcardImage="https://cdn.21st.dev/assets/mirror/9e/9e64a2d8260f18efc82decc3e835f9ee656f14e736085507071a73f0841b38dd.jpg"
      postcardAlt="New York City Postcard with Statue of Liberty"
      curvedTextTop="The General Intelligence"
      curvedTextBottom="of New York"
      heading="Accelerate your digital transformation journey."
      subtext="Let your plans shape the future."
      backButtonLabel="Back to Home"
      backButtonHref="/"
    />
  );
}

export { Error404Demo };

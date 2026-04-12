import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import HowItWorks from "@/components/HowItWorks";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-5 sm:gap-8">
      <Hero />
      <TrustBar />
      <HowItWorks />
    </div>
  );
}

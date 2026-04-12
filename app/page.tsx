import { prisma } from "@/lib/prisma";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import HowItWorks from "@/components/HowItWorks";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const count = await prisma.task.count({
    where: { expiresAt: { gt: new Date() } },
  });

  return (
    <div className="flex flex-col gap-5 sm:gap-8">
      <Hero count={count} />
      <TrustBar />
      <HowItWorks />
    </div>
  );
}

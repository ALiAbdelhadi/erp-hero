import { Hero } from "@/components/hero/hero";
import { Smooth } from "@/components/smooth";
import { Problem } from "@/components/sections/problem";
import { Modules } from "@/components/sections/modules";
import { Close } from "@/components/sections/close";
import { Integrations } from "@/components/sections/integrations";
import { Rollout } from "@/components/sections/rollout";
import { Cta } from "@/components/sections/cta";

export default function Home() {
  return (
    <Smooth>
      <main>
        <Hero />
        <Problem />
        <Modules />
        <Close />
        <Integrations />
        <Rollout />
      </main>
      <Cta />
    </Smooth>
  );
}

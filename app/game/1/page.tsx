import type { Metadata } from "next";

import GameOneClient from "./GameOneClient";

export const metadata: Metadata = {
  title: "Hit 10k - We're Hiring",
  description:
    "A 2.5D browser runner created by Xiaotong Yu (肖彤宇), where a rocket chicken collects magnetic coins and unlocks a hiring message at 10,000 points.",
  alternates: {
    canonical: "/game/1",
  },
};

export default function GameOnePage() {
  return <GameOneClient />;
}

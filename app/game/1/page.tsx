import type { Metadata } from "next";

import GameOneClient from "./GameOneClient";

export const metadata: Metadata = {
  title: "Hit 10k - We're Hiring | XiaoTongYu",
  description:
    "A 2.5D browser runner where a rocket chicken collects magnetic coins, dodges obstacles, and unlocks a hiring message at 10,000 points.",
};

export default function GameOnePage() {
  return <GameOneClient />;
}

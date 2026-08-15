import Hero from "@/features/invitation/components/hero";
import { Events } from "@/features/events";
import { Location } from "@/features/location";
import { Wishes } from "@/features/wishes";
import { Gifts } from "@/features/gifts";

// Main Invitation Content
export default function MainContent() {
  return (
    <>
      <Hero />
      <Events />
      <Location />
      <Gifts />
      <Wishes />
    </>
  );
}

import { HoverEffect } from "./ui/card-hover-effect";

export default function CardHoverEffectDemo() {
  return (
    (<div className="max-w-8xl bg-black/[0.96] mx-auto md:px-32 ">
      <HoverEffect items={projects} />
    </div>)
  );
}
export const projects = [
  {
    title: "Personalized Learning",
    description:
      "AI-powered system adapts to each student's learning style and pace",
    link: "https://stripe.com",
  },
  {
    title: "Interactive Classes",
    description:
      "Live and recorded sessions with smart summaries and key checkpoints",
    link: "https://netflix.com",
  },
  {
    title: "AI Guidance",
    description:
      "Intelligent chatbot provides 24/7 support and personalized recommendations",
    link: "https://google.com",
  },
  {
    title: "Smart Analytics",
    description:
      "Detailed insights into student progress and performance",
    link: "https://meta.com",
  },
  {
    title: "AI-Generated Content",
    description:
      "Automated quiz generation and content summarization",
    link: "https://amazon.com",
  },
  {
    title: "Collaborative Learning",
    description:
      "Interactive classroom environment with real-time engagement",
    link: "https://microsoft.com",
  },
];
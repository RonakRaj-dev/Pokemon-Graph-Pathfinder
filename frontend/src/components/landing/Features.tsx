"use client"

import { Database, Globe, Zap } from "lucide-react";
import { FadeSlideIn, StaggerContainer, StaggerItem, BlurText } from "@/components/ui/animated-text";

const features = [
  {
    title: "Comprehensive Data",
    description:
      "Access detailed information on every Pokémon, from generation 1 to the latest discoveries.",
    icon: Database,
    color: "from-blue-500 to-cyan-400",
  },
  {
    title: "Global Regions",
    description:
      "Navigate through Kanto, Johto, Hoenn, and beyond with our interactive maps.",
    icon: Globe,
    color: "from-green-500 to-emerald-400",
  },
  {
    title: "Smart Routing",
    description:
      "Our advanced algorithm finds the safest or most adventurous paths for your journey.",
    icon: Zap,
    color: "from-yellow-500 to-orange-400",
  },
];

export const Features = () => {
  return (
    <section className="w-full py-20 bg-background">
      <div className="container px-4 md:px-6">
        <FadeSlideIn direction="up" className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Why Trainers Choose Us
          </h2>
        </FadeSlideIn>

        <StaggerContainer
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          staggerDelay={0.15}
        >
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="flex flex-col items-center text-center p-8 rounded-2xl border bg-card hover:border-pokemon-red/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group h-full">
                <div
                  className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-pokemon-red transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <BlurText
          className="mt-20 text-center max-w-3xl mx-auto"
          delay={0.3}
        >
          <h2 className="text-3xl font-bold mb-6">About the Project</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Pokémon Pro Pathfinder is designed for trainers who want to optimize
            their journey. Whether you&apos;re looking for the quickest route to
            the next Gym or want to catch &apos;em all on the scenic route, our
            tools help you plan your adventure. Built with the latest web
            technologies, we bring the world of Pokémon to life right in your
            browser.
          </p>
        </BlurText>
      </div>
    </section>
  );
};

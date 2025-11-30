"use client";
import Form from "@/components/form";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import React from "react";
import Image from "next/image";

export default function Home() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    if (!currentTarget) return;
    const { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const dotPattern = (color: string) => ({
    backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
    backgroundSize: '16px 16px',
  });

  return (
    <div
      className="relative bg-white dark:bg-black min-h-screen group"
      onMouseMove={handleMouseMove}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-70"
        style={dotPattern('rgb(212 212 212)')}
      />
      <div
        className="absolute inset-0 dark:opacity-70 opacity-0 pointer-events-none"
        style={dotPattern('rgb(38 38 38)')}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          ...dotPattern('rgb(99 102 241)'),
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
          maskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
        }}
      />

      <main className="relative z-10 min-h-screen flex flex-col items-center">
        <div className="text-center">
          <HeroHighlight containerClassName="bg-transparent">
            <motion.h1
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: [20, -5, 0],
              }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="text-2xl md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center"
            >
              Create and practice test papers for free at{" "}
              <Highlight className="text-black dark:text-white">
                TestiFy
              </Highlight>
            </motion.h1>
          </HeroHighlight>
        </div>
        <Image src="/favicon.ico" alt="TestiFy Mockup" width={100} height={100} className="mt- shadow-lg rounded-lg" />


        <div className="flex flex-col items-center justify-center mt-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm p-6 rounded-lg w-[400px]">
          <Form />
        </div>
      </main>
    </div>
  );
}
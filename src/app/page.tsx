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
    backgroundSize: '20px 20px',
  });

  return (
    <div className="relative bg-white dark:bg-black min-h-screen">
      <main className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-8 items-start px-8 py-0">

        <div
          className="relative flex flex-col items-center lg:items-start justify-start space-y-6 group min-h-screen pt-8"
          onMouseMove={handleMouseMove}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-70 -mx-8 lg:-ml-8 lg:mr-0"
            style={dotPattern('rgb(170 170 170)')}
          />
          <div
            className="absolute inset-0 dark:opacity-70 opacity-0 pointer-events-none -mx-8 lg:-ml-8 lg:mr-0"
            style={dotPattern('rgb(38 38 38)')}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 -mx-8 lg:-ml-8 lg:mr-0"
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

          <Image
            src="/favicon.ico"
            alt="TestiFy Logo"
            width={120}
            height={120}
            className="shadow-lg rounded-lg relative z-10"
          />
          <HeroHighlight containerClassName="bg-transparent relative z-10">
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
              className="text-2xl md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-2xl leading-relaxed lg:leading-snug text-center lg:text-left"
            >
              Create and practice test papers for free at{" "}
              <Highlight className="text-black dark:text-white">
                TestiFy
              </Highlight>
            </motion.h1>
          </HeroHighlight>
        </div>

        <div className="flex items-start justify-center pt-8">
          <div className="">
            <Form />
          </div>
        </div>
      </main>
    </div>
  );
}
"use client"

import { animate, motion, useMotionValue, useTransform } from "motion/react"
import { useEffect, useState } from "react"

export default function AnimatedCounter({ value, duration = 2 }) {
  const [isClient, setIsClient] = useState(false);
  const count = useMotionValue(0);
  const rounded = useTransform(() => Math.round(count.get()));

  useEffect(() => {
    setIsClient(true);
    // 從0開始計數到目標值
    const controls = animate(count, value, { duration });
    return () => controls.stop();
  }, [value, duration]);

  if (!isClient) {
    return <span>{value}</span>;
  }

  return <motion.span>{rounded}</motion.span>;
}
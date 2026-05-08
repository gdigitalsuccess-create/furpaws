'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PawPrint } from 'lucide-react';

interface Props {
  name: string | null;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

function useCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const steps = 40;
    const step = target / steps;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(current));
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function AdminHero({ name, totalOrders, totalRevenue, pendingOrders }: Props) {
  const firstName = name?.split(' ')[0] ?? 'Admin';
  const date = new Date().toLocaleDateString('en-AE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const orders  = useCounter(totalOrders);
  const revenue = useCounter(Math.round(totalRevenue));
  const pending = useCounter(pendingOrders);

  const stats = [
    { label: 'Total Orders',   value: orders,                suffix: '',    color: 'text-white' },
    { label: 'Revenue (AED)',  value: revenue,               suffix: ' AED', color: 'text-white' },
    { label: 'Pending',        value: pending,               suffix: '',    color: pending > 0 ? 'text-yellow-300' : 'text-white' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-600 via-pink-500 to-purple-600 p-8 mb-8 shadow-lg">

      {/* Background paw prints */}
      {[
        { size: 64, top: '-10%', right: '2%',  opacity: 0.08, rotate: 15,  delay: 0 },
        { size: 40, top: '10%',  right: '12%', opacity: 0.06, rotate: -20, delay: 0.2 },
        { size: 80, bottom: '-15%', left: '1%', opacity: 0.06, rotate: 30, delay: 0.1 },
        { size: 30, top: '50%',  left: '18%',  opacity: 0.05, rotate: -10, delay: 0.3 },
      ].map((p, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute text-white"
          style={{ top: p.top, bottom: p.bottom, left: p.left, right: p.right, opacity: p.opacity, rotate: p.rotate }}
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 5 + i, delay: p.delay, ease: 'easeInOut' }}
        >
          <PawPrint style={{ width: p.size, height: p.size }} />
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10">

        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-white/70 text-sm font-medium mb-1"
        >
          {greeting()} · {date}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-4xl font-extrabold text-white mb-1 tracking-tight"
        >
          Welcome back,{' '}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="relative inline-block"
          >
            {firstName}
            <motion.span
              className="absolute -bottom-1 left-0 h-0.5 bg-white/60 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5, delay: 0.7 }}
            />
          </motion.span>
          {' '}👋
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-white/60 text-sm mb-8"
        >
          Here's what's happening in your store today.
        </motion.p>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
              className="rounded-xl bg-white/15 backdrop-blur-sm px-4 py-3 border border-white/20"
            >
              <p className={`text-2xl font-extrabold ${s.color}`}>
                {s.value.toLocaleString()}{s.suffix}
              </p>
              <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Point { date: string; revenue: number; orders: number }

export default function RevenueChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0', fontSize: 12 }}
          formatter={(value, name) => [
            name === 'revenue' ? `${Number(value).toFixed(0)} AED` : value,
            name === 'revenue' ? 'Revenue' : 'Orders',
          ]}
        />
        <Line type="monotone" dataKey="revenue" stroke="#e91e8c" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

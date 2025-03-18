'use client';

interface StatProps {
  name: string;
  value: number;
}

interface StatsGroupProps {
  stats: StatProps[];
}

export default function StatsGroup({ stats }: StatsGroupProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8">
      {stats.map((stat) => (
        <StatCard key={stat.name} name={stat.name} value={stat.value} />
      ))}
    </div>
  );
}

function StatCard({ name, value }: StatProps) {
  return (
    <div className="px-4 md:px-8 py-5 shadow-xl border border-gray-200 rounded-lg bg-white">
      <div className="flex justify-between">
        <div className="pl-2 md:pl-4">
          <div className="text-sm font-medium text-gray-800 truncate">
            {name}
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
} 

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#FDF6EC]/10 backdrop-blur-xl border-2 border-[#C9A227]/40 rounded-xl p-4 shadow-2xl shadow-[#4E342E]/50 relative">
        <p className="font-heading text-sm font-semibold text-[#C9A227] mb-2">
          Session #{label}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <p key={index} className="text-xs text-[#FDF6EC] flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full border border-[#FDF6EC]/30"
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="font-medium">
                {entry.name === 'wpm' ? 'Speed' : 'Precision'}:
              </span>
              <span className="text-[#C9A227] font-bold">
                {entry.value}{entry.name === 'accuracy' ? '%' : ' WPM'}
              </span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex justify-center gap-6 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border-2 border-[#FDF6EC]/30"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-[#D7CCC8] text-sm font-medium">
            {entry.value === 'wpm' ? 'Typing Speed' : 'Accuracy Rate'}
          </span>
        </div>
      ))}
    </div>
  );
};

const StatsChart = ({ data }) => {
  //  Map all data first to keep correct "Session Numbers"
  const fullHistory = data.map((item, index) => ({
    game: index + 1, // This ensures Game #100 stays #100 even if we slice
    wpm: parseFloat(item.wpm),
    accuracy: parseFloat(item.accuracy),
    date: new Date(item.playedAt).toLocaleDateString()
  }));

  //  Only take the last 20 games. 
  const chartData = fullHistory.slice(-20);

  if (!chartData.length) {
    return <div className="text-[#D7CCC8] text-center p-8">No battles recorded yet.</div>;
  }

  return (
    <div className="w-full relative">
      {/* Floating Dust Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#D7CCC8]/20 rounded-full animate-float"
            style={{
              left: `${20 + i * 25}%`,
              top: `${15 + i * 20}%`,
              animationDelay: `${i * 3}s`,
              animationDuration: `${10 + i * 2}s`
            }}
          />
        ))}
      </div>

      {/* Chart Container */}
      <div className="bg-[#4E342E]/20 backdrop-blur-sm border border-[#6D4C41]/50 rounded-xl p-4 relative">
        
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="font-heading text-lg font-semibold text-[#C9A227] mb-1 inline-flex items-center gap-2 justify-center">
            Performance Mastery Timeline
          </h3>
          <p className="text-[#D7CCC8] text-sm">
            Showing last {chartData.length} sessions
          </p>
        </div>

        {/* Recharts Container */}
        <div className="h-64 sm:h-96 relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#6D4C41" 
                strokeOpacity={0.3} 
                vertical={false} 
              />

              <XAxis
                dataKey="game"
                stroke="#D7CCC8"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: "#C9A227", strokeWidth: 1 }}
                interval="preserveStartEnd" 
                minTickGap={15}
              />

              <YAxis
                stroke="#D7CCC8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 10', 'dataMax + 10']} 
              />

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#C9A227', strokeWidth: 1, strokeDasharray: '5 5' }} />
              <Legend content={<CustomLegend />} />

              {/* WPM Line */}
              <Line
                type="monotone"
                dataKey="wpm"
                stroke="#C9A227"
                strokeWidth={3}
                dot={{ fill: '#C9A227', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#FDF6EC', stroke: '#C9A227', strokeWidth: 2 }}
                animationDuration={1500}
              />

              {/* Accuracy Line */}
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#10B981"
                strokeWidth={2}
                dot={false} 
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          50% { transform: translateY(-15px) translateX(8px); opacity: 0.6; }
        }
        .animate-float { animation: float 12s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default StatsChart;
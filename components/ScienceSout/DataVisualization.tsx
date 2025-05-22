import React from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { EnvironmentalData } from '@/types/index';

interface DataVisualizationProps {
  data: EnvironmentalData[];
}

interface PieDataItem {
  name: string;
  value: number;
}

interface PollutionDataItem {
  date: string;
  level: number;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ data }) => {
  // Prepare data for visualization
  const countByType = data.reduce<Record<string, number>>((acc, item) => {
    acc[item.dataType] = (acc[item.dataType] || 0) + 1;
    return acc;
  }, {});

  const pieData: PieDataItem[] = Object.keys(countByType).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: countByType[key]
  }));

  // For pollution level chart (assuming pollution level is 1-10)
  const pollutionData: PollutionDataItem[] = data
    .filter(item => item.dataType === 'pollution')
    .map(item => ({
      date: new Date(item.created).toLocaleDateString(),
      level: parseFloat(item.value) || 0
    }))
    .slice(-10); // Last 10 entries

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-lg">
      <h2 className="mb-6 font-bold text-gray-900 dark:text-white text-2xl">Data Visualizations</h2>

      <div className="gap-8 grid grid-cols-1 md:grid-cols-2">
        <div>
          <h3 className="mb-4 font-semibold text-gray-800 dark:text-gray-200 text-lg">Data Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--foreground)'
                }}
              />
              <Legend
                wrapperStyle={{
                  color: 'var(--foreground)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {pollutionData.length > 0 && (
          <div>
            <h3 className="mb-4 font-semibold text-gray-800 dark:text-gray-200 text-lg">Recent Pollution Levels</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={pollutionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fill: 'var(--foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--foreground)'
                  }}
                />
                <Legend
                  wrapperStyle={{
                    color: 'var(--foreground)'
                  }}
                />
                <Bar dataKey="level" name="Pollution Level" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataVisualization;
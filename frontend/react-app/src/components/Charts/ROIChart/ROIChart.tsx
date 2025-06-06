import React, { PureComponent } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  {
    date: 'May 1',
    sales: 12500,
    revenue: 25000,
  },
  {
    date: 'May 5',
    sales: 15800,
    revenue: 31600,
  },
  {
    date: 'May 10',
    sales: 18200,
    revenue: 36400,
  },
  {
    date: 'May 15',
    sales: 22100,
    revenue: 44200,
  },
  {
    date: 'May 20',
    sales: 19800,
    revenue: 39600,
  },
  {
    date: 'May 25',
    sales: 26300,
    revenue: 52600,
  },
  {
    date: 'May 31',
    sales: 28900,
    revenue: 57800,
  },
];

export default class Example extends PureComponent {
  static demoUrl = 'https://codesandbox.io/p/sandbox/simple-area-chart-4y9cnl';

  render() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={500}
          height={400}
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
}
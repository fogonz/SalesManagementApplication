import React from "react";
import {
  Sankey,
  Tooltip,
  ResponsiveContainer,
  Text,
  Layer,
} from "recharts";

// Sample data: Store spending breakdown
const data = {
  nodes: [
    { name: "Total Spending" },
    { name: "Inventory" },
    { name: "Salaries" },
    { name: "Utilities" },
    { name: "Marketing" },
    { name: "Maintenance" },
    { name: "Suppliers" },
  ],
  links: [
    { source: 0, target: 1, value: 40000, name: "Buy Inventory" },
    { source: 0, target: 2, value: 25000, name: "Pay Salaries" },
    { source: 0, target: 3, value: 8000, name: "Utilities Bill" },
    { source: 0, target: 4, value: 5000, name: "Marketing Spend" },
    { source: 1, target: 6, value: 15000, name: "Pay Suppliers" },
  ],
};

const renderLink = ({ link, index }: any) => {
  const { sourceX, targetX, sourceY, targetY, value, name } = link;
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  return (
    <Layer key={`custom-link-${index}`}>
      <path
        d={`M${sourceX},${sourceY} C${midX},${sourceY} ${midX},${targetY} ${targetX},${targetY}`}
        fill="none"
        stroke="#d0e6f7"
        strokeWidth={Math.max(value / 10000, 1)}
        strokeOpacity={0.6}
      />
      <Text
        x={midX}
        y={midY - 5}
        textAnchor="middle"
        fontSize={12}
        fill="#333"
      >
        {name}
      </Text>
    </Layer>
  );
};

const SankeyChart: React.FC = () => {
  return (
    <div style={{ width: "100%", height: 400, }}>
      <h3 style={{ textAlign: "center", marginBottom: "0px", fontSize: "20px", color: "#333", }}>
        Distribucion del Gasto
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <Sankey
          data={data}
          nodePadding={20}
          margin={{ top: 10, bottom: 70 }}
          link={{ stroke: "#d0e6f7", strokeOpacity: 0.6, }}
          node={{ stroke: "#005ea2", fill: "#cce5ff" }}
        >
          <Tooltip />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
};

export default SankeyChart;

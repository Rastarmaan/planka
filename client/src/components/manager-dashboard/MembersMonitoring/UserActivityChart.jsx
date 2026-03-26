import React from 'react';
import PropTypes from 'prop-types';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

import styles from './MembersMonitoring.module.scss';

function CustomBadge(props) {
  const { x, y, value } = props;

  return (
    <g transform={`translate(${x},${y - 25})`}>
      <rect
        x={-18}
        y={-12}
        width={36}
        height={20}
        rx={10}
        fill="#fff"
        stroke="#e0e0e0"
        strokeWidth={1}
        filter="drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.1))"
      />
      <text
        x={0}
        y={0}
        dy={2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#398188"
        fontSize={10}
        fontWeight="bold"
        fontFamily="inherit"
      >
        {value}
      </text>
      <path
        d="M -4 8 L 0 12 L 4 8"
        fill="#fff"
        stroke="#e0e0e0"
        strokeWidth={1}
        transform="translate(0, 0)"
      />
      {/* Cover the stroke overlap */}
      <path d="M -3 8 L 3 8" stroke="#fff" strokeWidth={2} />
    </g>
  );
}

CustomBadge.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  value: PropTypes.string,
};

CustomBadge.defaultProps = {
  x: 0,
  y: 0,
  value: '',
};

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className={styles.chartTooltip}>
        <p className={styles.chartTooltipLabel}>{label}</p>
        {payload.map((entry) => (
          <p key={entry.dataKey} style={{ color: entry.color, margin: 0 }}>
            {`${entry.dataKey === 'bar' ? 'فعالیت' : 'روند'}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string,
      color: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  label: PropTypes.string,
};

CustomTooltip.defaultProps = {
  active: false,
  payload: [],
  label: '',
};

function UserActivityChart({ data }) {
  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 30,
            right: 20,
            left: 20,
            bottom: 20,
          }}
          barGap={0}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8898aa', fontSize: 11 }}
            dy={20}
            dx={-30}
            angle={-20}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            orientation="left"
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8898aa', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />

          <Bar
            dataKey="bar"
            barSize={45}
            fill="#398188"
            radius={[6, 6, 6, 6]}
            background={{ fill: '#f5f6f8', radius: [6, 6, 6, 6] }}
          />

          <Line
            type="monotone"
            dataKey="line"
            stroke="#398188"
            strokeWidth={3}
            dot={{ r: 4, fill: '#398188', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#398188' }}
          >
            <LabelList dataKey="badge" content={<CustomBadge />} />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

UserActivityChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      bar: PropTypes.number,
      line: PropTypes.number,
      badge: PropTypes.string,
    }),
  ).isRequired,
};

export default UserActivityChart;

import PropTypes from 'prop-types';
import React from 'react';
import { Card } from 'react-bootstrap';
import { Bar, BarChart, LabelList, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  {
    name: 'Marketing',
    value: 56,
  },
  {
    name: 'Support',
    value: 164,
  },
  {
    name: 'Sales',
    value: 36,
  },
  {
    name: 'Human Resource',
    value: 40,
  },
  {
    name: 'Developers',
    value: 144,
  },
];

const renderCustomizedLabel = (props) => {
  const { x, y, width, value } = props;
  const offset = 15;

  return (
    <g>
      <text
        dominantBaseline="middle"
        fill="#000"
        textAnchor="middle"
        x={x + width + offset}
        y={y + offset}>
        {value}
      </text>
    </g>
  );
};

const TierDataSet = ({ title }) => {
  return (
    <div>
      <Card style={{ height: '300px' }}>
        <Card.Body>
          <Card.Title className="graphs-title">{title}</Card.Title>
          <BarChart
            data={data}
            height={240}
            layout="vertical"
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            width={500}>
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Bar dataKey="value" fill="#3F699B">
              <LabelList content={renderCustomizedLabel} dataKey="value" />
            </Bar>
          </BarChart>
        </Card.Body>
      </Card>
    </div>
  );
};

TierDataSet.propTypes = {
  title: PropTypes.string,
};

renderCustomizedLabel.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  value: PropTypes.string,
};

export default TierDataSet;

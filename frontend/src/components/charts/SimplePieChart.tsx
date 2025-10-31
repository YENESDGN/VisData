export const SimplePieChart = () => {
  const data = [
    { label: 'Product A', value: 30, color: '#0d9488' },
    { label: 'Product B', value: 25, color: '#14b8a6' },
    { label: 'Product C', value: 20, color: '#2dd4bf' },
    { label: 'Product D', value: 15, color: '#5eead4' },
    { label: 'Product E', value: 10, color: '#99f6e4' },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativeValue = 0;

  const slices = data.map((item) => {
    const startAngle = (cumulativeValue / total) * 360;
    cumulativeValue += item.value;
    const endAngle = (cumulativeValue / total) * 360;
    const percentage = ((item.value / total) * 100).toFixed(1);

    return {
      ...item,
      startAngle,
      endAngle,
      percentage,
    };
  });

  const createSlicePath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(50, 50, 40, endAngle);
    const end = polarToCartesian(50, 50, 40, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', 50, 50,
      'L', start.x, start.y,
      'A', 40, 40, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');
  };

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex items-center space-x-8">
        <svg viewBox="0 0 100 100" className="w-64 h-64">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={createSlicePath(slice.startAngle, slice.endAngle)}
              fill={slice.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
        </svg>

        <div className="space-y-2">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: slice.color }}
              />
              <div className="text-sm">
                <span className="font-medium text-gray-800">{slice.label}</span>
                <span className="text-gray-600 ml-2">({slice.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SimpleBarChart = () => {
  const data = [
    { label: 'Jan', value: 65 },
    { label: 'Feb', value: 59 },
    { label: 'Mar', value: 80 },
    { label: 'Apr', value: 81 },
    { label: 'May', value: 56 },
    { label: 'Jun', value: 55 },
  ];

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="w-full h-full flex flex-col justify-end items-center">
      <div className="w-full flex items-end justify-around h-5/6 px-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 mx-2">
            <div className="text-xs font-medium text-gray-700 mb-1">{item.value}</div>
            <div
              className="w-full bg-gradient-to-t from-teal-600 to-cyan-500 rounded-t-lg transition-all hover:from-teal-700 hover:to-cyan-600"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: '20px',
              }}
            />
          </div>
        ))}
      </div>
      <div className="w-full flex justify-around mt-4 px-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center mx-2">
            <span className="text-sm font-medium text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

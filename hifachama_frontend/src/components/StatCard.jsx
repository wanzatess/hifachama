const StatCard = ({ title, value, icon, trend }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${
              trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              {trend.value} {trend.direction === 'up' ? '↑' : '↓'} from last month
            </p>
          )}
        </div>
        <span className="text-3xl" aria-hidden="true">
          {icon || '📊'}
        </span>
      </div>
    </div>
  );
};

export default StatCard;

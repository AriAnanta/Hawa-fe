/**
 * Loading Skeleton Components
 */
export function WeatherCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-8 w-24 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-300 rounded mb-1"></div>
            <div className="h-3 w-40 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-3 w-12 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 w-16 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ForecastCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-full flex flex-col animate-pulse">
      <div className="p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>
      <div className="p-4 flex-1">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-3 w-20 bg-gray-200 rounded mb-1"></div>
                  <div className="h-2 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MapCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="p-2 border-b border-gray-200 bg-gray-50">
        <div className="h-4 w-24 bg-gray-300 rounded"></div>
      </div>
      <div className="h-48 bg-gray-200"></div>
    </div>
  );
}








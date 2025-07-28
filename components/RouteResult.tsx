
import React from 'react';
import { OptimizedRoute } from '../types';
import { ClockIcon, RouteIcon, ExternalLinkIcon, ArrivalIcon, DepartureIcon } from './icons';

interface RouteResultProps {
  route: OptimizedRoute;
}

export const RouteResult: React.FC<RouteResultProps> = ({ route }) => {
  const googleMapsUrl = `https://www.google.com/maps/dir/${route.optimized_route.map(waypoint => encodeURIComponent(waypoint.address)).join('/')}`;

  return (
    <div className="w-full text-left animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700/50 p-4 rounded-lg flex items-center gap-3">
          <RouteIcon className="w-8 h-8 text-cyan-300 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-400">Total Distance</p>
            <p className="text-xl font-bold text-white">{route.total_distance}</p>
          </div>
        </div>
        <div className="bg-gray-700/50 p-4 rounded-lg flex items-center gap-3">
          <ClockIcon className="w-8 h-8 text-cyan-300 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-400">Total Trip Time</p>
            <p className="text-xl font-bold text-white">{route.total_time}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-purple-300">Optimized Itinerary</h3>
        <ol className="list-none space-y-4">
          {route.optimized_route.map((waypoint, index) => (
            <li key={index} className="flex items-start gap-4 p-3 bg-gray-800/40 rounded-lg">
              <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 text-base font-bold ${index === 0 ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-200'} rounded-full`}>
                {index + 1}
              </span>
              <div className="flex-grow">
                <p className="font-semibold text-gray-200">{waypoint.address}</p>
                <div className="flex flex-wrap items-center text-sm text-gray-400 mt-1.5 gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5 text-green-400">
                        <ArrivalIcon className="w-5 h-5" />
                        Arrival: <b>{waypoint.estimated_arrival_time}</b>
                    </span>
                    <span className="flex items-center gap-1.5 text-orange-400">
                        <DepartureIcon className="w-5 h-5" />
                        Departure: <b>{waypoint.estimated_departure_time}</b>
                    </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-purple-300">Trip Summary</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 py-2 bg-gray-900/50 rounded-r-lg">
            <p className="text-gray-300 italic">{route.summary}</p>
        </blockquote>
      </div>

      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open the optimized route in Google Maps"
        className="mt-6 w-full flex items-center justify-center gap-3 px-5 py-3 text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-all shadow-lg"
      >
        <ExternalLinkIcon className="w-6 h-6" />
        Open in Google Maps
      </a>
    </div>
  );
};
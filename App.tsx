
import React, { useState, useCallback } from 'react';
import { Address, OptimizedRoute } from './types';
import { optimizeRoute } from './services/geminiService';
import { PlusIcon, TrashIcon, MapPinIcon, ClockIcon, RouteIcon, SparklesIcon, ExclamationTriangleIcon, InfoIcon } from './components/icons';
import { RouteResult } from './components/RouteResult';
import { AddressInput } from './components/AddressInput';
import { LoadingSpinner } from './components/LoadingSpinner';

const MIN_STOPS = 2;
const MAX_STOPS = 10;

export default function App() {
  const [departureLocation, setDepartureLocation] = useState<string>('');
  const [departureTime, setDepartureTime] = useState<string>('09:00');
  const [addresses, setAddresses] = useState<Address[]>(() =>
    Array.from({ length: MIN_STOPS }, (_, i) => ({ id: Date.now() + i, value: '', time: '', duration: '30' }))
  );
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [timedStopId, setTimedStopId] = useState<number | null>(null);

  const handleAddressChange = useCallback((id: number, field: 'value' | 'time' | 'duration', value: string) => {
    setAddresses(prev => prev.map(addr => addr.id === id ? { ...addr, [field]: value } : addr));
  }, []);

  const handleSetTimedStop = useCallback((id: number) => {
    setTimedStopId(prevId => (prevId === id ? null : id));
  }, []);

  const handleAddStop = useCallback(() => {
    setAddresses(prev => {
      if (prev.length < MAX_STOPS) {
        return [...prev, { id: Date.now(), value: '', time: '', duration: '30' }];
      }
      return prev;
    });
  }, []);

  const handleRemoveStop = useCallback((id: number) => {
    setAddresses(prev => {
      if (prev.length > MIN_STOPS) {
        // If the removed stop was the timed stop, clear it
        if (id === timedStopId) {
            setTimedStopId(null);
        }
        return prev.filter(addr => addr.id !== id);
      }
      return prev;
    });
  }, [timedStopId]);

  const handleOptimize = async () => {
    if (!departureLocation.trim()) {
      setError('Please enter a departure location.');
      return;
    }

    const validAddresses = addresses.map(a => a.value.trim()).filter(Boolean);
    if (validAddresses.length < MIN_STOPS) {
      setError(`Please enter at least ${MIN_STOPS} destinations to optimize.`);
      return;
    }
    
    // Check if the timed stop has a time set
    if (timedStopId !== null) {
        const timedStop = addresses.find(a => a.id === timedStopId);
        if (!timedStop?.time) {
            setError('Please enter a time for the scheduled stop.');
            return;
        }
    }

    setIsLoading(true);
    setError(null);
    setOptimizedRoute(null);

    try {
      const result = await optimizeRoute(departureLocation, departureTime, addresses, timedStopId);
      setOptimizedRoute(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
            Codys AI Route Finagler
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Enter your departure details and destinations, and let AI find the most efficient round trip.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-cyan-300 flex items-center">
              <MapPinIcon className="w-6 h-6 mr-2" />
              Plan Your Route
            </h2>

            {/* Departure Section */}
            <div className="mb-6 p-4 bg-gray-700/40 rounded-lg border border-gray-600">
                <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
                    <div className="flex-grow min-w-[200px]">
                        <label htmlFor="departure-location" className="block text-sm font-medium text-gray-300 mb-1">
                            Where are you departing from?
                        </label>
                        <input
                            id="departure-location"
                            type="text"
                            value={departureLocation}
                            onChange={(e) => setDepartureLocation(e.target.value)}
                            placeholder="Enter starting address"
                            className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label htmlFor="departure-time" className="block text-sm font-medium text-gray-300 mb-1">
                            Hit the road at...
                        </label>
                        <input
                            id="departure-time"
                            type="time"
                            value={departureTime}
                            onChange={(e) => setDepartureTime(e.target.value)}
                            className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                        />
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold mb-3 text-cyan-300">
                Your Destinations
            </h3>
            <div className="space-y-3 mb-6">
              {addresses.map((address, index) => (
                <AddressInput
                  key={address.id}
                  index={index}
                  address={address}
                  onAddressChange={handleAddressChange}
                  onRemoveStop={handleRemoveStop}
                  canRemove={addresses.length > MIN_STOPS}
                  isTimedStop={timedStopId === address.id}
                  onSetTimedStop={handleSetTimedStop}
                />
              ))}
            </div>
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleAddStop}
                disabled={addresses.length >= MAX_STOPS}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Add Stop
              </button>
              <button
                onClick={handleOptimize}
                disabled={isLoading}
                className="flex-grow flex items-center justify-center gap-3 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 rounded-md hover:from-purple-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-wait transition-all shadow-lg"
              >
                {isLoading ? <LoadingSpinner /> : <RouteIcon className="w-6 h-6" />}
                {isLoading ? 'Optimizing...' : 'Optimize Route'}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 min-h-[400px] flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-purple-300 flex items-center">
              <SparklesIcon className="w-6 h-6 mr-2" />
              Your Optimized Trip
            </h2>
            <div className="flex-grow flex items-center justify-center">
              {isLoading && (
                 <div className="w-full space-y-4 animate-pulse">
                    <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-24 bg-gray-700 rounded w-full mt-4"></div>
                 </div>
              )}
              {error && (
                <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-lg">
                  <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2"/>
                  <p className="font-semibold">Oops! Something went wrong.</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {!isLoading && !error && optimizedRoute && <RouteResult route={optimizedRoute} />}
              {!isLoading && !error && !optimizedRoute && (
                <div className="text-center text-gray-500">
                  <InfoIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>Your optimized route and trip summary will appear here once calculated.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

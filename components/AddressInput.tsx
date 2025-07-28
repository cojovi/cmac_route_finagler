
import React from 'react';
import { Address } from '../types';
import { TrashIcon, ClockIcon } from './icons';

interface AddressInputProps {
  index: number;
  address: Address;
  onAddressChange: (id: number, field: 'value' | 'time' | 'duration', value: string) => void;
  onRemoveStop: (id: number) => void;
  canRemove: boolean;
  isTimedStop: boolean;
  onSetTimedStop: (id: number) => void;
}

export const AddressInput: React.FC<AddressInputProps> = ({ index, address, onAddressChange, onRemoveStop, canRemove, isTimedStop, onSetTimedStop }) => {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 text-sm font-bold text-cyan-200 bg-gray-700 rounded-full">
        {index + 1}
      </span>
      <input
        type="text"
        value={address.value}
        onChange={(e) => onAddressChange(address.id, 'value', e.target.value)}
        placeholder={`Enter Stop ${index + 1}`}
        className="flex-1 min-w-[200px] px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
      />
      
      <div className="flex items-center gap-1">
        <label htmlFor={`duration-${address.id}`} className="text-sm text-gray-400">Duration:</label>
        <input
          id={`duration-${address.id}`}
          type="number"
          min="0"
          step="5"
          value={address.duration}
          onChange={(e) => onAddressChange(address.id, 'duration', e.target.value)}
          aria-label="Duration at stop in minutes"
          className="w-[75px] px-2 py-1 text-white bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <span className="text-gray-400 text-sm">min</span>
      </div>

      {isTimedStop && (
        <input
          type="time"
          value={address.time}
          onChange={(e) => onAddressChange(address.id, 'time', e.target.value)}
          aria-label="Appointment time"
          className="px-2 py-2 text-white bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        />
      )}
      <button
        onClick={() => onSetTimedStop(address.id)}
        className={`p-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition-colors ${
          isTimedStop ? 'text-purple-400 bg-gray-600' : 'text-gray-400'
        }`}
        aria-label="Set timed appointment for this stop"
      >
        <ClockIcon className="w-5 h-5" />
      </button>
      <button
        onClick={() => onRemoveStop(address.id)}
        disabled={!canRemove}
        className="p-2 text-gray-400 rounded-md hover:bg-gray-600 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
        aria-label="Remove stop"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
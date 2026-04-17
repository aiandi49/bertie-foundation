/**
 * NetworkStatus.tsx
 * 
 * A component that displays the current network status
 */
import React, { useState, useEffect } from 'react';
import { isOfflineMode } from '../utils/offlineUtils';
import { useNetworkStatus } from './NetworkStatusProvider';

interface Props {
  className?: string;
  showLabel?: boolean;
}

/**
 * Displays the current network connection status
 */
export function NetworkStatus({ 
  className = '', 
  showLabel = true 
}: Props) {
  // Use the network status from context
  const { isOnline, connectionType, isServiceWorkerActive } = useNetworkStatus();
  
  // Offline status
  const isOffline = !isOnline;
  
  // Status indicator color
  const indicatorColor = isOffline ? 'bg-red-500' : 'bg-green-500';
  
  // Status label
  const getStatusLabel = () => {
    if (isOffline) return 'Offline';
    if (connectionType === 'wifi') return 'WiFi';
    if (connectionType === '4g') return '4G';
    if (connectionType === '3g') return '3G';
    if (connectionType === '2g') return '2G';
    return 'Online';
  };
  
  // Cache status
  const cacheStatus = isServiceWorkerActive ? 'Offline mode ready' : 'No offline mode';
  
  return (
    <div className={`flex items-center bg-gray-800 bg-opacity-70 px-2 py-1 rounded-full ${className}`}>
      <div className={`relative w-3 h-3 rounded-full ${indicatorColor} mr-2`}>
        {!isOffline && (
          <span className="absolute -inset-0.5 rounded-full animate-ping bg-green-400 opacity-75"></span>
        )}
      </div>
      {showLabel && (
        <div className="flex flex-col text-xs text-white">
          <span className="font-medium">{getStatusLabel()}</span>
          {isServiceWorkerActive && (
            <span className="text-green-300 text-[10px]">{cacheStatus}</span>
          )}
        </div>
      )}
    </div>
  );
}
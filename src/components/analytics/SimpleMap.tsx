'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { ConsumptionSession } from '@/types/consumption';
import SessionMap from './SessionMap';

interface SimpleMapProps {
  sessions: ConsumptionSession[];
  height?: string | number;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ 
  sessions, 
  height = 400 
}) => {
  // Check if Mapbox token is configured
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  
  // Filter sessions that have coordinates
  const sessionsWithCoordinates = sessions.filter(session => 
    session.latitude !== undefined && 
    session.longitude !== undefined &&
    !isNaN(session.latitude) &&
    !isNaN(session.longitude)
  );

  // Show message if no Mapbox token is configured
  if (!mapboxToken || mapboxToken === 'your_mapbox_public_token_here') {
    return (
      <div 
        className="flex items-center justify-center bg-yellow-50 border border-yellow-200 rounded-lg"
        style={{ height }}
      >
        <div className="text-center p-6">
          <MapPin className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Mapbox Token Required</h3>
          <p className="text-gray-600 max-w-sm">
            To display the interactive map, please add your Mapbox access token to the <code className="bg-gray-100 px-1 rounded">.env.local</code> file.
            See <code className="bg-gray-100 px-1 rounded">MAPBOX_SETUP.md</code> for instructions.
          </p>
        </div>
      </div>
    );
  }

  if (sessionsWithCoordinates.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Location Data</h3>
          <p className="text-gray-500 max-w-sm">
            Sessions need latitude and longitude coordinates to be displayed on the map. 
            Add location coordinates to your sessions to see them here.
          </p>
        </div>
      </div>
    );
  }

  // Use the full SessionMap component
  return (
    <SessionMap 
      sessions={sessions} 
      height={height}
    />
  );
};

export default SimpleMap;

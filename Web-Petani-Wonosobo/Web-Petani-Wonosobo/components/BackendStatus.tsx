import React from "react";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Server, Wifi, WifiOff } from "lucide-react";

interface BackendStatusProps {
  isConnected: boolean;
  className?: string;
  showDetails?: boolean;
}

export function BackendStatus({ isConnected, className = "", showDetails = false }: BackendStatusProps) {
  if (!showDetails) {
    return (
      <Badge 
        variant={isConnected ? "default" : "secondary"} 
        className={`${className} flex items-center space-x-1`}
      >
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>Live Data</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Demo Mode</span>
          </>
        )}
      </Badge>
    );
  }

  return (
    <Card className={`${className} ${isConnected ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {isConnected ? (
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                <Server className="h-4 w-4 text-green-600" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <Server className="h-4 w-4 text-blue-600" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-medium text-sm ${isConnected ? 'text-green-800' : 'text-blue-800'}`}>
                {isConnected ? 'Backend Terhubung' : 'Mode Demo Aktif'}
              </h3>
              <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                {isConnected ? 'LIVE' : 'DEMO'}
              </Badge>
            </div>
            
            <p className={`text-xs ${isConnected ? 'text-green-700' : 'text-blue-700'} mb-2`}>
              {isConnected ? 
                'Menggunakan data real-time dari API BMKG dan Bapanas' :
                'Menggunakan data simulasi untuk demonstrasi fitur'
              }
            </p>

            {/* Details with activation steps were removed to simplify the UI */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
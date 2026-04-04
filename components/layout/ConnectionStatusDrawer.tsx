'use client';

import { useConnectionStatuses } from '../../hooks/useConnectionStatus';
import { PROVIDER_CONFIGS, Provider } from '../../config/providers';
import { tokens } from '@/config/tokens';

interface ConnectionStatusDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectionStatusDrawer({ isOpen, onClose }: ConnectionStatusDrawerProps) {
  const statuses = useConnectionStatuses();

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500 animate-pulse';
      case 'reconnecting': return 'bg-orange-500 animate-pulse';
      case 'error': return 'bg-red-500';
      case 'degraded': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'reconnecting': return 'Reconnecting...';
      case 'error': return 'Error';
      case 'degraded': return 'Degraded';
      default: return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div
        className="bg-surface-primary rounded-lg shadow-xl max-w-md w-full mx-4"
        style={{ backgroundColor: tokens.colors.surface.bg }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-tertiary">
          <h2 className="text-lg font-semibold">Connection Status</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {Object.entries(PROVIDER_CONFIGS).map(([provider, config]) => {
            const status = statuses[provider as Provider];
            return (
              <div key={provider} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                  <div>
                    <div className="font-medium">{config.name}</div>
                    <div className="text-sm text-text-secondary">
                      {config.markets.join(', ')}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-text-secondary">
                  {getStatusText(status)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-tertiary">
          <p className="text-sm text-text-secondary">
            Real-time data feeds for live market information.
            Status updates automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
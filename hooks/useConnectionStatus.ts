/**
 * Hook for connection status
 */
import { useConnectionStatusStore } from '../store/connectionStatusStore';
import { Provider, ConnectionStatus } from '../config/providers';

export function useConnectionStatus(provider?: Provider): ConnectionStatus {
  const store = useConnectionStatusStore();

  if (provider) {
    return store.getStatus(provider);
  }

  return store.getOverallStatus();
}

export function useConnectionStatuses() {
  return useConnectionStatusStore((state: any) => state.statuses);
}
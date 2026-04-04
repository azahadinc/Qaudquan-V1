'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { PROVIDER_CONFIGS } from '../../config/providers';
import { tickPipeline } from '../../workers/tickPipeline';

export default function SettingsPage() {
  const { apiKeys, setApiKey, removeApiKey, getApiKey } = useSettingsStore();
  const [tempKeys, setTempKeys] = useState<Record<string, string>>({});

  const handleSave = async (provider: string) => {
    const key = tempKeys[provider];
    if (key?.trim()) {
      setApiKey(provider as keyof typeof apiKeys, key.trim());
      // Reconnect providers after key update
      await tickPipeline.reconnectProviders();
    }
  };

  const handleRemove = async (provider: string) => {
    removeApiKey(provider as keyof typeof apiKeys);
    setTempKeys(prev => ({ ...prev, [provider]: '' }));
    // Reconnect providers after key removal
    await tickPipeline.reconnectProviders();
  };

  const handleInputChange = (provider: string, value: string) => {
    setTempKeys(prev => ({ ...prev, [provider]: value }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
          ← Back to home
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">API Keys</h2>
          <p className="text-sm text-gray-600 mb-4">
            Configure API keys for data providers. Keys are stored locally in your browser.
          </p>

          <div className="space-y-4">
            {Object.entries(PROVIDER_CONFIGS).map(([provider, config]) => {
              if (!config.authRequired) return null;

              const currentKey = getApiKey(provider as keyof typeof apiKeys);
              const tempKey = tempKeys[provider] ?? currentKey ?? '';

              return (
                <div key={provider} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{config.name}</h3>
                    {currentKey && (
                      <span className="text-sm text-green-600">✓ Configured</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Markets: {config.markets.join(', ')}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder={`Enter ${config.name} API key`}
                      value={tempKey}
                      onChange={(e) => handleInputChange(provider, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleSave(provider)}
                      disabled={!tempKey?.trim() || tempKey === currentKey}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                    {currentKey && (
                      <button
                        onClick={() => handleRemove(provider)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
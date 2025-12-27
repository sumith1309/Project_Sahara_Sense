'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/dust/current',
    description: 'Get current dust levels for all UAE cities',
    response: '{ timestamp, cities: [...] }'
  },
  {
    method: 'GET',
    path: '/api/v1/dust/current/{city_id}',
    description: 'Get current dust level for a specific city',
    response: '{ city_id, dust, pm10, pm2_5, ... }'
  },
  {
    method: 'GET',
    path: '/api/v1/cities',
    description: 'Get all UAE cities configuration',
    response: '{ count, cities: [...] }'
  },
  {
    method: 'GET',
    path: '/api/v1/predictions/{city_id}',
    description: 'Get 72-hour dust predictions for a city',
    response: '{ predictions, risk_periods, ... }'
  },
  {
    method: 'GET',
    path: '/api/v1/alerts',
    description: 'Get all active alerts',
    response: '{ count, alerts: [...] }'
  },
  {
    method: 'WS',
    path: '/ws',
    description: 'WebSocket for real-time updates',
    response: 'Real-time dust data stream'
  },
];

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/icons/logo.png" alt="Sahara Sense" className="w-8 h-8 rounded-lg object-contain" />
            <span className="text-2xl font-black">
              <span className="text-amber-500">SAHARA</span>
              <span className="text-white"> SENSE</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2">📚 API Documentation</h1>
          <p className="text-gray-400 mb-8">
            RESTful API for sandstorm prediction data. Base URL: <code className="bg-white/10 px-2 py-1 rounded">http://localhost:8000</code>
          </p>
        </motion.div>

        {/* Interactive Docs Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 glass rounded-2xl"
        >
          <h2 className="text-xl font-bold mb-2">🎮 Interactive Documentation</h2>
          <p className="text-gray-400 mb-4">
            Try the API directly in your browser with Swagger UI
          </p>
          <a 
            href="http://localhost:8000/api/docs" 
            target="_blank"
            className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-full font-bold transition-colors"
          >
            Open Swagger UI →
          </a>
        </motion.div>

        {/* Endpoints */}
        <div className="space-y-4">
          {endpoints.map((endpoint, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  endpoint.method === 'GET' ? 'bg-green-500' :
                  endpoint.method === 'POST' ? 'bg-blue-500' :
                  endpoint.method === 'WS' ? 'bg-purple-500' :
                  'bg-gray-500'
                } text-white`}>
                  {endpoint.method}
                </span>
                <code className="text-orange-400">{endpoint.path}</code>
              </div>
              <p className="text-gray-400 mb-2">{endpoint.description}</p>
              <p className="text-sm text-gray-500">
                Response: <code className="bg-white/10 px-2 py-1 rounded">{endpoint.response}</code>
              </p>
            </motion.div>
          ))}
        </div>

        {/* Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 glass p-6 rounded-2xl"
        >
          <h2 className="text-xl font-bold mb-4">💻 Quick Example</h2>
          <pre className="bg-black/50 p-4 rounded-xl overflow-x-auto text-sm">
            <code className="text-green-400">{`# Get current dust levels
curl http://localhost:8000/api/v1/dust/current

# Get predictions for Dubai
curl http://localhost:8000/api/v1/predictions/dubai

# WebSocket connection
wscat -c ws://localhost:8000/ws`}</code>
          </pre>
        </motion.div>
      </main>
    </div>
  );
}

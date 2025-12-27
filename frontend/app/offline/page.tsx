'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="text-3xl font-bold text-white mb-4">You&apos;re Offline</h1>
        <p className="text-gray-400 mb-6 max-w-md">
          It looks like you&apos;ve lost your internet connection. Some features may not be available.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

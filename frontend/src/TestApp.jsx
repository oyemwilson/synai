import React from 'react';
import { useAuth } from './hooks/useAuth';
import { usePortfolio } from './hooks/usePortfolio';
import { useWebSocketContext } from './contexts/WebSocketContext';
import { LoadingSpinner } from './screens/common/LoadingSpinner';
import { WebSocketStatus } from './screens/common/WebSocketStatus';

const TestApp = () => {
  const { user, login, logout, isAuthenticated, loading: authLoading } = useAuth();
  const { portfolio, fetchPortfolio, loading: portfolioLoading } = usePortfolio();
  const { connectionState, subscribeToQuotes, realTimeQuotes } = useWebSocketContext();

// In frontend/src/TestApp.jsx - update the testLogin function:
const testLogin = async () => {
  try {
    console.log('🔄 Starting login test...');
    const result = await login("oyemwilson1@gmail.com", 'finalpass456');
    console.log('✅ Login successful:', result);
    alert('Login successful! User: ' + result.user?.email);
  } catch (error) {
    console.error('❌ Login failed:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    alert(`Login failed: ${error.response?.data?.message || error.message}`);
  }
};

  // Test portfolio fetch
  const testPortfolio = async () => {
    await fetchPortfolio();
  };

  // Test WebSocket subscription
  const testWebSocket = () => {
    if (isAuthenticated) {
      subscribeToQuotes(['AAPL', 'MSFT', 'TSLA']);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">SynAI Foundation Test</h1>
        
        {/* Connection Status */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
          <div className="flex items-center space-x-4">
            <WebSocketStatus />
            <span className="text-sm text-gray-600">
              Backend: {process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'Production'}
            </span>
          </div>
        </div>

        {/* Authentication Test */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Authentication Test</h2>
          {!isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-gray-600">Not authenticated</p>
              <button
                onClick={testLogin}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Test Login
              </button>
              <p className="text-sm text-gray-500">
                Note: This will try to login with test credentials. Make sure your backend is running.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-green-600">✅ Authenticated as: {user?.email}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>User ID:</strong> {user?._id}
                </div>
                <div>
                  <strong>Username:</strong> {user?.username}
                </div>
                <div>
                  <strong>Verified:</strong> {user?.isVerified ? 'Yes' : 'No'}
                </div>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Portfolio Test */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Portfolio Test</h2>
          {!isAuthenticated ? (
            <p className="text-gray-500">Please login first to test portfolio</p>
          ) : (
            <div className="space-y-4">
              <button
                onClick={testPortfolio}
                disabled={portfolioLoading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {portfolioLoading ? 'Loading...' : 'Fetch Portfolio'}
              </button>
              
              {portfolio && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Portfolio Data:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(portfolio, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* WebSocket Test */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">WebSocket Test</h2>
          {!isAuthenticated ? (
            <p className="text-gray-500">Please login first to test WebSocket</p>
          ) : (
            <div className="space-y-4">
              <button
                onClick={testWebSocket}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Subscribe to AAPL, MSFT, TSLA
              </button>
              
              {Object.keys(realTimeQuotes).length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Real-time Quotes:</h3>
                  <div className="space-y-2">
                    {Object.entries(realTimeQuotes).map(([symbol, quote]) => (
                      <div key={symbol} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{symbol}</span>
                        <span>${quote.price?.toFixed(2)}</span>
                        <span className={quote.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {quote.change >= 0 ? '+' : ''}{quote.change?.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* API Status */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">API Endpoints Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded">
              <strong>Auth Endpoints:</strong>
              <ul className="mt-1 space-y-1">
                <li>POST /api/auth/signup</li>
                <li>POST /api/auth/login</li>
                <li>POST /api/auth/verify-otp</li>
                <li>GET /api/auth/profile</li>
              </ul>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong>Portfolio Endpoints:</strong>
              <ul className="mt-1 space-y-1">
                <li>GET /api/portfolio/overview</li>
                <li>POST /api/portfolio/investments</li>
                <li>DELETE /api/portfolio/investments/:id</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestApp;
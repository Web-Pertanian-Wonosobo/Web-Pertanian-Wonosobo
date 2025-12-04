import { useState, useEffect } from 'react';

export function WeatherDebug() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    const testAPI = async () => {
      try {
        setStatus('Testing backend API...');
        
        // Test backend connection
        const response = await fetch('http://127.0.0.1:8080/weather/current');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
        setStatus(`✅ API Success! Found ${result.data?.length || 0} weather records`);
        
      } catch (error) {
        setStatus(`❌ API Error: ${error.message}`);
        console.error('Weather API Error:', error);
      }
    };
    
    testAPI();
  }, []);
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Weather API Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Status:</h2>
        <p className="text-sm font-mono">{status}</p>
      </div>
      
      {data && (
        <div className="bg-green-50 p-4 rounded">
          <h2 className="font-semibold mb-2">API Response:</h2>
          <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4">
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Reload Test
        </button>
        
        <button 
          onClick={() => window.location.href = '/?page=weather'} 
          className="ml-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Go to Weather Page
        </button>
      </div>
    </div>
  );
}
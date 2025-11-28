import React, { useState } from 'react';
import axios from 'axios';

const TestAPI = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/health');
      setResult('✅ SUCCESS: ' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult('❌ ERROR: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', {
        email: 'patronista@ejemplo.com',
        password: '123456'
      });
      setResult('✅ LOGIN SUCCESS: ' + JSON.stringify(response.data.user, null, 2));
    } catch (error) {
      setResult('❌ LOGIN ERROR: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔧 Test de API</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={testHealth} disabled={loading}>
          Test Health (/api/health)
        </button>
        <button onClick={testLogin} disabled={loading}>
          Test Login (/api/auth/login)
        </button>
      </div>
      {loading && <p>⏳ Cargando...</p>}
      {result && (
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '5px',
          overflow: 'auto'
        }}>
          {result}
        </pre>
      )}
    </div>
  );
};

export default TestAPI;

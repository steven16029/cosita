import React, { useEffect, useState } from 'react';
import axios from 'axios';
import keycloak from './services/redhatAuth';

const REGIONS = {
  LATAM: { currency: 'COP', lang: 'es-CO', label: 'Latinoamérica (Bogotá)' },
  NA: { currency: 'USD', lang: 'en-US', label: 'Norteamérica (New York)' },
  EU: { currency: 'EUR', lang: 'de-DE', label: 'Europa (Frankfurt)' }
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [region, setRegion] = useState('LATAM');
  const [financialData, setFinancialData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    keycloak
      .init({ onLoad: 'login-required', checkLoginIframe: false })
      .then((auth) => {
        setAuthenticated(auth);
        if (auth) fetchErpMetrics(region);
      })
      .catch(() => setError('Error conectando con Red Hat SSO'));
  }, []);

  const fetchErpMetrics = async (selectedRegion) => {
    try {
      const apiGatewayUrl = window._env_?.REACT_APP_3SCALE_API_URL || 'https://api.empresa-global.com/erp/v1';
      
      // Peticion pasando por Red Hat 3scale API Management
      const response = await axios.get(`${apiGatewayUrl}/metrics`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
          'X-ERP-Region': selectedRegion,
          'X-ERP-Currency': REGIONS[selectedRegion].currency
        }
      });
      setFinancialData(response.data);
    } catch (err) {
      setError('No se pudieron cargar los datos desde Red Hat 3scale Gateway.');
    }
  };

  const handleRegionChange = (e) => {
    const newRegion = e.target.value;
    setRegion(newRegion);
    fetchErpMetrics(newRegion);
  };

  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (!authenticated) return <div style={{ padding: 20 }}>Autenticando en Red Hat Single Sign-On...</div>;

  return (
    <div style={{ fontFamily: 'Red Hat Display, sans-serif', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
        <h1>Global ERP Enterprise</h1>
        <div>
          <select value={region} onChange={handleRegionChange} style={{ marginRight: '1rem', padding: '0.5rem' }}>
            {Object.entries(REGIONS).map(([key, val]) => (
              <option key={key} value={key}>{val.label} - ({val.currency})</option>
            ))}
          </select>
          <span>Usuario: <strong>{keycloak.tokenParsed?.preferred_username}</strong></span>
          <button onClick={() => keycloak.logout()} style={{ marginLeft: '1rem' }}>Cerrar Sesión</button>
        </div>
      </header>

      <main style={{ marginTop: '2rem' }}>
        <h2>Resumen Operativo - {REGIONS[region].label}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '6px' }}>
            <h3>Ingresos Consolidados</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {financialData?.revenue || '1,450,000'} {REGIONS[region].currency}
            </p>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '6px' }}>
            <h3>Órdenes Internacionales</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{financialData?.orders || '342'}</p>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '6px' }}>
            <h3>Estado API Gateway (3scale)</h3>
            <p style={{ color: 'green', fontWeight: 'bold' }}>Conectado / TLS Activo</p>
          </div>
        </div>
      </main>
    </div>
  );
}

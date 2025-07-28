// Minimal deployment test component
export default function DeploymentTest() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>✅ AI Copywriter - Deployment Test</h1>
      <p>If you can see this page, the deployment is working!</p>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Status: Ready for Production</h3>
        <p>Authentication barriers have been removed</p>
        <p>App is accessible without login requirements</p>
      </div>
      <button 
        onClick={() => alert('Deployment test successful!')}
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          backgroundColor: '#004182', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
    </div>
  );
}
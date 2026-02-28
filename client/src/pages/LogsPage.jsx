import React from 'react';
import UsageLogs from '../components/UsageLogs.jsx';

const LogsPage = () => {
  // since the navbar is fixed we allow the component to sit below it
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <UsageLogs />
    </div>
  );
};

export default LogsPage;

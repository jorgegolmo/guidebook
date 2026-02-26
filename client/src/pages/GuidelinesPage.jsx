// /client/src/pages/GuidelinesPage.jsx

import React from 'react';
import Guidelines from '../components/Guidelines.jsx';

const GuidelinesPage = () => {
  // since the navbar is fixed we allow the component to sit below it
  return (
    <div style={{ paddingTop: '70px', maxWidth: '1200px', margin: '0 auto' }}>
      <Guidelines />
    </div>
  );
};

export default GuidelinesPage;

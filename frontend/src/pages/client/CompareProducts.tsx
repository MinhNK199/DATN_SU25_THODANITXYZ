import React from 'react';
import SimpleProductComparison from '../../components/client/SimpleProductComparison';
import ErrorBoundary from '../../components/client/ErrorBoundary';

const CompareProducts: React.FC = () => {
  return (
    <ErrorBoundary>
      <SimpleProductComparison />
    </ErrorBoundary>
  );
};

export default CompareProducts;

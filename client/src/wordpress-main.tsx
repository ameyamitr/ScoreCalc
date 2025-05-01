import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import UcGpaCalculator from './pages/UcGpaCalculator';
import FinalGradeCalculator from './pages/FinalGradeCalculator';
import SatActConverter from './pages/SatActConverter';
import UcChancingCalculator from './pages/UcChancingCalculator';
import ServiceTracker from './pages/ServiceTracker';
import { Toaster } from './components/ui/toaster';

// WordPress integration
document.addEventListener('DOMContentLoaded', () => {
  // Main calculator container - renders specific calculator based on data attribute
  const mainContainer = document.getElementById('uc-calculator-root');
  if (mainContainer) {
    const calculator = mainContainer.getAttribute('data-calculator') || 'all';
    
    const root = ReactDOM.createRoot(mainContainer);
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          {calculator === 'all' ? (
            // Render a navigation/tabs UI for all calculators
            <AllCalculators />
          ) : calculator === 'uc-gpa' ? (
            <UcGpaCalculator />
          ) : calculator === 'final-grade' ? (
            <FinalGradeCalculator />
          ) : calculator === 'sat-act' ? (
            <SatActConverter />
          ) : calculator === 'uc-chance' ? (
            <UcChancingCalculator />
          ) : calculator === 'service' ? (
            <ServiceTracker />
          ) : null}
          <Toaster />
        </QueryClientProvider>
      </React.StrictMode>
    );
  }

  // Individual calculator containers
  const calculatorComponents = [
    { id: 'uc-gpa-calculator', Component: UcGpaCalculator },
    { id: 'final-grade-calculator', Component: FinalGradeCalculator },
    { id: 'sat-act-converter', Component: SatActConverter },
    { id: 'uc-chancing-calculator', Component: UcChancingCalculator },
    { id: 'service-tracker', Component: ServiceTracker }
  ];

  calculatorComponents.forEach(({ id, Component }) => {
    const container = document.getElementById(id);
    if (container) {
      const root = ReactDOM.createRoot(container);
      root.render(
        <React.StrictMode>
          <QueryClientProvider client={queryClient}>
            <Component />
            <Toaster />
          </QueryClientProvider>
        </React.StrictMode>
      );
    }
  });
});

// All calculators component with navigation
function AllCalculators() {
  const [activeTab, setActiveTab] = React.useState('uc-gpa');

  return (
    <div className="calculator-container">
      <div className="calculator-tabs">
        <button 
          className={`tab-button ${activeTab === 'uc-gpa' ? 'active' : ''}`}
          onClick={() => setActiveTab('uc-gpa')}
        >
          UC GPA Calculator
        </button>
        <button 
          className={`tab-button ${activeTab === 'final-grade' ? 'active' : ''}`}
          onClick={() => setActiveTab('final-grade')}
        >
          Final Grade Calculator
        </button>
        <button 
          className={`tab-button ${activeTab === 'sat-act' ? 'active' : ''}`}
          onClick={() => setActiveTab('sat-act')}
        >
          SAT/ACT Converter
        </button>
        <button 
          className={`tab-button ${activeTab === 'uc-chance' ? 'active' : ''}`}
          onClick={() => setActiveTab('uc-chance')}
        >
          UC Chances Calculator
        </button>
        <button 
          className={`tab-button ${activeTab === 'service' ? 'active' : ''}`}
          onClick={() => setActiveTab('service')}
        >
          Service Hours Tracker
        </button>
      </div>

      <div className="calculator-content">
        {activeTab === 'uc-gpa' && <UcGpaCalculator />}
        {activeTab === 'final-grade' && <FinalGradeCalculator />}
        {activeTab === 'sat-act' && <SatActConverter />}
        {activeTab === 'uc-chance' && <UcChancingCalculator />}
        {activeTab === 'service' && <ServiceTracker />}
      </div>
    </div>
  );
}
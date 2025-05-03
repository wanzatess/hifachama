import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import '../styles/Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ContributionDisplay = ({ contributions }) => {
  // Process chart data for the Pie chart
  const processChartData = () => {
    const rotational = contributions.filter(c => c.transaction_type === 'rotational');
    const investment = contributions.filter(c => c.transaction_type === 'investment');

    return {
      labels: ['Rotational', 'Investment'],
      datasets: [{
        label: 'Contributions (KES)',
        data: [
          rotational.reduce((sum, c) => sum + (c.amount || 0), 0),
          investment.reduce((sum, c) => sum + (c.amount || 0), 0)
        ],
        backgroundColor: [
          'rgba(156, 143, 95, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderWidth: 1,
      }]
    };
  };

  // Handle loading or empty states
  if (!contributions || contributions.length === 0) {
    return (
      <div className="contribution-display-card">
        <div className="card-header">
          <span className="card-icon">💰</span>
          <h3 className="card-title">Contribution Summary</h3>
        </div>
        <p>No contributions found.</p>
      </div>
    );
  }

  return (
    <div className="contribution-display-card">
      <div className="card-header">
        <span className="card-icon">💰</span>
        <h3 className="card-title">Contribution Summary</h3>
      </div>

      <div className="chart-container">
        <Pie data={processChartData()} />
      </div>

      <div className="recent-activity">
        <h4 className="activity-title">Recent Contributions</h4>
        <ul className="transaction-list">
          {contributions.slice(0, 5).map(c => (
            <li key={c.id}>
              <span>{c.member_name || 'Unknown Member'} - {c.transaction_type}</span>
              <span>KES {(c.amount || 0).toFixed(2)}</span>
              <small>{c.created_at || 'N/A'}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ContributionDisplay;
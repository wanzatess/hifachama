import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../styles/Dashboard.css';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const SavingsTracker = () => {
  const [savings, setSavings] = useState([]);
  const [amount, setAmount] = useState('');
  const [goal, setGoal] = useState('');

  const addSaving = () => {
    if (!amount || isNaN(amount)) return;
    setSavings([...savings, {
      id: Date.now(),
      amount: parseFloat(amount),
      goal,
      date: new Date().toLocaleDateString()
    }]);
    setAmount('');
    setGoal('');
  };

  // Process savings data for the chart
  const processChartData = () => {
    const amounts = savings.map(s => s.amount);
    const labels = savings.map((s, index) => s.goal || `Saving ${index + 1}`);

    return {
      labels,
      datasets: [
        {
          label: 'Savings Amount (KES)',
          data: amounts,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#4E4528',
          font: {
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'Savings Progress',
        color: '#4E4528',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `KES ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (KES)',
          color: '#4E4528',
          font: {
            weight: 'bold'
          }
        },
        ticks: {
          color: '#4E4528'
        },
        grid: {
          color: 'rgba(78, 69, 40, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#4E4528'
        },
        grid: {
          color: 'rgba(78, 69, 40, 0.1)'
        }
      }
    },
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">💰</span>
        <h3 className="card-title">Savings Tracker</h3>
      </div>

      <div className="form-group">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount Saved (KES)"
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Goal"
        />
      </div>
      <button className="action-btn" onClick={addSaving}>
        Add Saving
      </button>

      <div className="recent-activity">
        <h4 className="activity-title">Recent Savings</h4>
        <ul className="transaction-list">
          {savings.map(s => (
            <li key={s.id}>
              <span>KES {s.amount} - {s.goal}</span>
              <small>{s.date}</small>
            </li>
          ))}
        </ul>
      </div>

      <div className="chart-container">
        <Bar data={processChartData()} options={chartOptions} />
      </div>
    </div>
  );
};

export const InvestmentSummary = () => {
  // This could be a new component for investment-specific features
  return (
    <div>
      <div className="card-header">
        <span className="card-icon">📈</span>
        <h3 className="card-title">Investment Summary</h3>
      </div>
      <div className="recent-activity">
        <p>Investment-specific content would go here...</p>
      </div>
    </div>
  );
};

// Combined exports
export default {
  SavingsTracker,
  InvestmentSummary
};
import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../styles/Dashboard.css';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const BasicAccounting = ({ transactions, setTransactions }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const addTransaction = () => {
    if (!amount || isNaN(amount)) return;

    setTransactions([...transactions, {
      id: Date.now(),
      amount: parseFloat(amount),
      description,
      date: new Date().toLocaleDateString()
    }]);
    setAmount('');
    setDescription('');
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">📒</span>
        <h3 className="card-title">Basic Accounting</h3>
      </div>

      <div className="form-group">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (KES)"
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
      </div>
      <button className="action-btn" onClick={addTransaction}>
        Add Entry
      </button>

      <div className="recent-activity">
        <h4 className="activity-title">Recent Transactions</h4>
        <ul className="transaction-list">
          {transactions.map(t => (
            <li key={t.id}>
              <span>KES {t.amount} - {t.description}</span>
              <small>{t.date}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const BarChartComponent = ({ transactions }) => {
  // Process transactions data for the chart
  const processChartData = () => {
    const amounts = transactions.map(t => t.amount);
    const labels = transactions.map((t, index) => t.description || `Transaction ${index + 1}`);

    return {
      labels,
      datasets: [
        {
          label: 'Transaction Amount (KES)',
          data: amounts,
          backgroundColor: 'rgba(156, 143, 95, 0.6)',
          borderColor: 'rgba(156, 143, 95, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const options = {
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
        text: 'Transaction History',
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
        <span className="card-icon">📊</span>
        <h3 className="card-title">Transaction Analytics</h3>
      </div>
      <div className="chart-container">
        <Bar data={processChartData()} options={options} />
      </div>
    </div>
  );
};

// Combined exports
export default {
  BasicAccounting,
  BarChartComponent
};
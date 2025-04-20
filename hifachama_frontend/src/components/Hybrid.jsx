import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import '../styles/Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export const MemberList = ({ members }) => {
  return (
    <div>
      <div className="card-header">
        <span className="card-icon">👥</span>
        <h3 className="card-title">Member Directory</h3>
      </div>

      <div className="recent-activity">
        <h4 className="activity-title">Current Members</h4>
        <ul className="member-list">
          {members.map(m => (
            <li key={m.id} className="member-item">
              <span>{m.name} - {m.role}</span>
              <small>{m.phone} | Joined: {m.joinDate}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const ContributionDisplay = ({ contributions }) => {
  const processChartData = () => {
    const rotational = contributions.filter(c => c.type === 'rotational');
    const investment = contributions.filter(c => c.type === 'investment');
    
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

  return (
    <div>
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
              <span>{c.memberName} - {c.type}</span>
              <span>KES {c.amount.toFixed(2)}</span>
              <small>{c.date}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const RotationSchedule = ({ members, contributions }) => {
  const calculateRotationalTotal = () => {
    return contributions
      .filter(c => c.type === 'rotational')
      .reduce((sum, c) => sum + c.amount, 0);
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">🔄</span>
        <h3 className="card-title">Current Rotation</h3>
      </div>

      <div className="rotation-status">
        <h4>Current Pool:</h4>
        <p className="pool-amount">KES {calculateRotationalTotal().toFixed(2)}</p>
      </div>

      <div className="recent-activity">
        <h4 className="activity-title">Rotation Order</h4>
        <ol className="member-list">
          {members.map((member, index) => (
            <li key={member.id}>
              {index + 1}. {member.name}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export const ReportDisplay = ({ members = [], contributions = [], loans = [] }) => {
  const calculateStats = () => {
    const rotationalTotal = contributions
      .filter(c => c.type === 'rotational')
      .reduce((sum, c) => sum + (c.amount || 0), 0);
      
    const investmentTotal = contributions
      .filter(c => c.type === 'investment')
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    const totalLoans = loans
      .reduce((sum, l) => sum + (l.amount || 0), 0);

    return {
      rotationalTotal,
      investmentTotal,
      totalLoans,
      memberCount: members.length
    };
  };

  const stats = calculateStats();

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">📊</span>
        <h3 className="card-title">Financial Summary</h3>
      </div>

      <div className="report-summary">
        <div className="report-item">
          <h4>Rotational Pool</h4>
          <p>KES {stats.rotationalTotal.toFixed(2)}</p>
        </div>
        <div className="report-item">
          <h4>Investment Pool</h4>
          <p>KES {stats.investmentTotal.toFixed(2)}</p>
        </div>
        <div className="report-item">
          <h4>Active Loans</h4>
          <p>KES {stats.totalLoans.toFixed(2)}</p>
        </div>
        <div className="report-item">
          <h4>Total Members</h4>
          <p>{stats.memberCount}</p>
        </div>
      </div>
    </div>
  );
};

export default {
  MemberList,
  ContributionDisplay,
  RotationSchedule,
  ReportDisplay
};
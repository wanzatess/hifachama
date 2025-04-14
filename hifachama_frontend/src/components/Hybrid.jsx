import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import '../styles/Dashboard.css';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export const MemberManager = ({ members, setMembers }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Member');
  const [phone, setPhone] = useState('');

  const addMember = () => {
    if (!name) return;
    const newMember = {
      id: Date.now(),
      name,
      role,
      phone,
      joinDate: new Date().toLocaleDateString()
    };
    setMembers([...members, newMember]);
    setName('');
    setPhone('');
    setRole('Member');
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">👥</span>
        <h3 className="card-title">Member Management</h3>
      </div>

      <div className="form-group">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
        />
      </div>
      <div className="form-group">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
        />
      </div>
      <div className="form-group">
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Member">Member</option>
          <option value="Chairperson">Chairperson</option>
          <option value="Treasurer">Treasurer</option>
          <option value="Secretary">Secretary</option>
        </select>
      </div>
      <button className="action-btn" onClick={addMember}>
        Add Member
      </button>

      <div className="recent-activity">
        <h4 className="activity-title">Member List</h4>
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

export const ContributionTracker = ({ members, contributions, setContributions }) => {
  const [amount, setAmount] = useState('');
  const [memberId, setMemberId] = useState('');
  const [contributionType, setContributionType] = useState('rotational');

  const recordContribution = () => {
    if (!amount || !memberId || isNaN(amount)) return;
    
    const newContribution = {
      id: Date.now(),
      memberId: parseInt(memberId),
      amount: parseFloat(amount),
      type: contributionType,
      date: new Date().toLocaleDateString()
    };
    
    setContributions([...contributions, newContribution]);
    setAmount('');
    setMemberId('');
  };

  const processChartData = () => {
    const rotational = (contributions || []).filter(c => c.type === 'rotational');
    const investment = (contributions || []).filter(c => c.type === 'investment');
    
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
        <h3 className="card-title">Contribution Tracker</h3>
      </div>

      <div className="form-group">
        <select 
          value={memberId} 
          onChange={(e) => setMemberId(e.target.value)}
        >
          <option value="">Select Member</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <select 
          value={contributionType} 
          onChange={(e) => setContributionType(e.target.value)}
        >
          <option value="rotational">Rotational</option>
          <option value="investment">Investment</option>
        </select>
      </div>
      <div className="form-group">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (KES)"
        />
      </div>
      <button className="action-btn" onClick={recordContribution}>
        Record Contribution
      </button>

      <div className="chart-container">
        <Pie data={processChartData()} />
      </div>
    </div>
  );
};

export const MemberRotation = ({ members, contributions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rotationHistory, setRotationHistory] = useState([]);
  const [frequency, setFrequency] = useState('Monthly');

  useEffect(() => {
    // Auto-rotate based on frequency (simplified)
    const interval = setInterval(() => {
      if (members.length > 0) {
        setCurrentIndex(prev => (prev + 1) % members.length);
      }
    }, frequency === 'Monthly' ? 30000 : 15000); // Demo purposes - use actual dates in production
    
    return () => clearInterval(interval);
  }, [frequency, members.length]);

  const calculateRotationalTotal = () => {
    return contributions
      .filter(c => c.type === 'rotational')
      .reduce((sum, c) => sum + c.amount, 0);
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">🔄</span>
        <h3 className="card-title">Rotation Schedule</h3>
      </div>

      <div className="form-group">
        <label>Rotation Frequency</label>
        <select 
          value={frequency} 
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      {members.length > 0 && (
        <div className="rotation-status">
          <h4>Current Recipient:</h4>
          <div className="current-recipient">
            {members[currentIndex].name}
          </div>
          <p>Next rotation: {frequency === 'Monthly' ? 'Next month' : 'Next week'}</p>
          <p>Rotational pool: KES {calculateRotationalTotal().toFixed(2)}</p>
        </div>
      )}

      <div className="recent-activity">
        <h4 className="activity-title">Rotation Order</h4>
        <ol className="member-list">
          {members.map((member, index) => (
            <li key={member.id} className={index === currentIndex ? 'text-success' : ''}>
              {index + 1}. {member.name} {index === currentIndex && '(Current)'}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export const InvestmentTracker = ({ investments, setInvestments }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Real Estate');

  const addInvestment = () => {
    if (!name || !amount) return;
    setInvestments([...investments, {
      id: Date.now(),
      name,
      amount: parseFloat(amount),
      type,
      date: new Date().toLocaleDateString(),
      status: 'Active'
    }]);
    setName('');
    setAmount('');
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">🏠</span>
        <h3 className="card-title">Investment Tracker</h3>
      </div>

      <div className="form-group">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Investment Name"
        />
      </div>
      <div className="form-group">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount Invested (KES)"
        />
      </div>
      <div className="form-group">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Real Estate">Real Estate</option>
          <option value="Business">Business</option>
          <option value="Stocks">Stocks</option>
        </select>
      </div>
      <button className="action-btn" onClick={addInvestment}>
        Add Investment
      </button>

      <div className="recent-activity">
        <h4 className="activity-title">Active Investments</h4>
        <ul className="transaction-list">
          {investments.map(i => (
            <li key={i.id}>
              <span>{i.name} ({i.type})</span>
              <span>KES {i.amount.toFixed(2)}</span>
              <small>{i.date}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const HybridReports = ({ members = [], contributions = [], investments = [] }) => {
  const calculateStats = () => {
    const rotationalTotal = (contributions || [])
      .filter(c => c.type === 'rotational')
      .reduce((sum, c) => sum + (c.amount || 0), 0);
      
    const investmentTotal = (contributions || [])
      .filter(c => c.type === 'investment')
      .reduce((sum, c) => sum + (c.amount || 0), 0);
      
    const investmentValue = (investments || [])
      .reduce((sum, i) => sum + (i.amount || 0), 0);

    return {
      rotationalTotal,
      investmentTotal,
      investmentValue,
      memberCount: members.length
    };
  };


  const stats = calculateStats();

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">📊</span>
        <h3 className="card-title">Hybrid Reports</h3>
      </div>

      <div className="report-summary">
        <div className="report-item">
          <h4>Rotational Funds</h4>
          <p>KES {stats.rotationalTotal.toFixed(2)}</p>
        </div>
        <div className="report-item">
          <h4>Investment Funds</h4>
          <p>KES {stats.investmentTotal.toFixed(2)}</p>
        </div>
        <div className="report-item">
          <h4>Investment Value</h4>
          <p>KES {stats.investmentValue.toFixed(2)}</p>
        </div>
        <div className="report-item">
          <h4>Members</h4>
          <p>{stats.memberCount}</p>
        </div>
      </div>
    </div>
  );
};

export default {
  MemberManager,
  ContributionTracker,
  MemberRotation,
  InvestmentTracker,
  HybridReports
};
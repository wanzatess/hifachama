import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import '../styles/Dashboard.css';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// 1. Member Management Component
export const MemberManager = () => {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Member');
  const [phone, setPhone] = useState('');

  const addMember = () => {
    if (!name) return;
    setMembers([...members, {
      id: Date.now(),
      name,
      role,
      phone,
      joinDate: new Date().toLocaleDateString()
    }]);
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
        <ul className="transaction-list">
          {members.map(m => (
            <li key={m.id}>
              <span>{m.name} - {m.role}</span>
              <small>{m.phone} | Joined: {m.joinDate}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// 2. Contribution Tracker (Enhanced from SavingsTracker)
export const SavingsTracker = () => {
  const [savings, setSavings] = useState([]);
  const [amount, setAmount] = useState('');
  const [memberId, setMemberId] = useState('');
  const [members] = useState([
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" }
  ]);

  const addSaving = () => {
    if (!amount || isNaN(amount)) return;
    const member = members.find(m => m.id === parseInt(memberId));
    setSavings([...savings, {
      id: Date.now(),
      amount: parseFloat(amount),
      memberId,
      memberName: member?.name || 'Unknown',
      date: new Date().toLocaleDateString()
    }]);
    setAmount('');
    setMemberId('');
  };

  const processChartData = () => {
    const memberContributions = members.map(member => {
      const total = savings
        .filter(s => s.memberId === member.id)
        .reduce((sum, s) => sum + s.amount, 0);
      return total;
    });

    return {
      labels: members.map(m => m.name),
      datasets: [
        {
          label: 'Contributions (KES)',
          data: memberContributions,
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderWidth: 1,
        },
      ],
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
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (KES)"
        />
      </div>
      <button className="action-btn" onClick={addSaving}>
        Record Contribution
      </button>

      <div className="chart-container">
        <Pie data={processChartData()} />
      </div>

      <div className="recent-activity">
        <h4 className="activity-title">Recent Contributions</h4>
        <ul className="transaction-list">
          {savings.slice(0, 5).map(s => (
            <li key={s.id}>
              <span>{s.memberName}: KES {s.amount}</span>
              <small>{s.date}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// 3. Investment Tracker
export const InvestmentTracker = () => {
  const [investments, setInvestments] = useState([]);
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
          <option value="Other">Other</option>
        </select>
      </div>
      <button className="action-btn" onClick={addInvestment}>
        Add Investment
      </button>

      <div className="recent-activity">
        <h4 className="activity-title">Current Investments</h4>
        <ul className="transaction-list">
          {investments.map(i => (
            <li key={i.id}>
              <span>{i.name} ({i.type})</span>
              <span>KES {i.amount} - {i.status}</span>
              <small>{i.date}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// 4. Loan Manager
export const LoanManager = () => {
  const [loans, setLoans] = useState([]);
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [interest, setInterest] = useState(10);
  const [members] = useState([
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" }
  ]);

  const issueLoan = () => {
    if (!memberId || !amount) return;
    const member = members.find(m => m.id === parseInt(memberId));
    setLoans([...loans, {
      id: Date.now(),
      memberId,
      memberName: member?.name || 'Unknown',
      amount: parseFloat(amount),
      interestRate: interest,
      dateIssued: new Date().toLocaleDateString(),
      status: 'Active',
      amountPaid: 0
    }]);
    setMemberId('');
    setAmount('');
  };

  const repayLoan = (loanId, amount) => {
    setLoans(loans.map(loan => {
      if (loan.id === loanId) {
        const newPaid = loan.amountPaid + parseFloat(amount);
        return {
          ...loan,
          amountPaid: newPaid,
          status: newPaid >= (loan.amount * (1 + loan.interestRate/100)) ? 'Paid' : 'Active'
        };
      }
      return loan;
    }));
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">🏦</span>
        <h3 className="card-title">Loan Management</h3>
      </div>

      <div className="form-group">
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
          <option value="">Select Member</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Loan Amount (KES)"
        />
      </div>
      <div className="form-group">
        <input
          type="number"
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          placeholder="Interest Rate (%)"
        />
      </div>
      <button className="action-btn" onClick={issueLoan}>
        Issue Loan
      </button>

      <div className="recent-activity">
        <h4 className="activity-title">Active Loans</h4>
        <ul className="transaction-list">
          {loans.filter(l => l.status === 'Active').map(loan => (
            <li key={loan.id}>
              <span>{loan.memberName}: KES {loan.amount} ({loan.interestRate}%)</span>
              <span>Paid: KES {loan.amountPaid}</span>
              <small>Issued: {loan.dateIssued}</small>
              <button 
                className="small-btn"
                onClick={() => {
                  const amount = prompt('Enter repayment amount:');
                  if (amount) repayLoan(loan.id, amount);
                }}
              >
                Record Payment
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// 5. Meeting Manager
export const MeetingManager = () => {
  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [minutes, setMinutes] = useState('');

  const scheduleMeeting = () => {
    if (!title || !date) return;
    setMeetings([...meetings, {
      id: Date.now(),
      title,
      date,
      minutes,
      scheduledAt: new Date().toLocaleDateString()
    }]);
    setTitle('');
    setDate('');
    setMinutes('');
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">📅</span>
        <h3 className="card-title">Meeting Manager</h3>
      </div>

      <div className="form-group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Meeting Title"
        />
      </div>
      <div className="form-group">
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="form-group">
        <textarea
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="Meeting Minutes/Agenda"
        />
      </div>
      <button className="action-btn" onClick={scheduleMeeting}>
        Schedule Meeting
      </button>

      <div className="recent-activity">
        <h4 className="activity-title">Upcoming Meetings</h4>
        <ul className="transaction-list">
          {meetings.map(m => (
            <li key={m.id}>
              <span>{m.title}</span>
              <span>{new Date(m.date).toLocaleString()}</span>
              {m.minutes && <small>Agenda: {m.minutes}</small>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// 6. Expense Tracker
export const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Operation');

  const addExpense = () => {
    if (!description || !amount) return;
    setExpenses([...expenses, {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      category,
      date: new Date().toLocaleDateString()
    }]);
    setDescription('');
    setAmount('');
  };

  const processChartData = () => {
    const categories = [...new Set(expenses.map(e => e.category))];
    const amounts = categories.map(cat => 
      expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
    );

    return {
      labels: categories,
      datasets: [
        {
          label: 'Expenses by Category (KES)',
          data: amounts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">🧾</span>
        <h3 className="card-title">Expense Tracker</h3>
      </div>

      <div className="form-group">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
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
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Operation">Operation</option>
          <option value="Investment">Investment</option>
          <option value="Administration">Administration</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <button className="action-btn" onClick={addExpense}>
        Add Expense
      </button>

      <div className="chart-container">
        <Pie data={processChartData()} />
      </div>

      <div className="recent-activity">
        <h4 className="activity-title">Recent Expenses</h4>
        <ul className="transaction-list">
          {expenses.slice(0, 5).map(e => (
            <li key={e.id}>
              <span>{e.description} ({e.category})</span>
              <span>KES {e.amount}</span>
              <small>{e.date}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// 7. Financial Reports
export const FinancialReports = ({ contributions, expenses, investments, loans }) => {
  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
  const totalLoans = loans.reduce((sum, l) => sum + l.amount, 0);
  const totalLoanRepayments = loans.reduce((sum, l) => sum + l.amountPaid, 0);

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">📊</span>
        <h3 className="card-title">Financial Reports</h3>
      </div>

      <div className="report-summary">
        <div className="report-item">
          <h4>Total Contributions</h4>
          <p>KES {totalContributions.toLocaleString()}</p>
        </div>
        <div className="report-item">
          <h4>Total Expenses</h4>
          <p>KES {totalExpenses.toLocaleString()}</p>
        </div>
        <div className="report-item">
          <h4>Net Balance</h4>
          <p>KES {(totalContributions - totalExpenses).toLocaleString()}</p>
        </div>
        <div className="report-item">
          <h4>Total Investments</h4>
          <p>KES {totalInvested.toLocaleString()}</p>
        </div>
        <div className="report-item">
          <h4>Active Loans</h4>
          <p>KES {totalLoans.toLocaleString()}</p>
        </div>
        <div className="report-item">
          <h4>Loan Repayments</h4>
          <p>KES {totalLoanRepayments.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

// 8. Notification Center
export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Meeting scheduled for Friday", type: "meeting", read: false },
    { id: 2, message: "Contribution deadline approaching", type: "reminder", read: false },
    { id: 3, message: "New investment opportunity available", type: "update", read: true }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">🔔</span>
        <h3 className="card-title">Notifications</h3>
      </div>

      <div className="notification-list">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`notification-item ${n.read ? 'read' : 'unread'}`}
            onClick={() => markAsRead(n.id)}
          >
            <span className="notification-type">{n.type}</span>
            <p>{n.message}</p>
            {!n.read && <span className="unread-badge">New</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// 9. Asset Register
export const AssetRegister = () => {
  const [assets, setAssets] = useState([]);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [location, setLocation] = useState('');

  const addAsset = () => {
    if (!name || !value) return;
    setAssets([...assets, {
      id: Date.now(),
      name,
      value: parseFloat(value),
      location,
      dateAcquired: new Date().toLocaleDateString(),
      status: 'Active'
    }]);
    setName('');
    setValue('');
    setLocation('');
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">🏢</span>
        <h3 className="card-title">Asset Register</h3>
      </div>

      <div className="form-group">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Asset Name"
        />
      </div>
      <div className="form-group">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Value (KES)"
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
        />
      </div>
      <button className="action-btn" onClick={addAsset}>
        Register Asset
      </button>

      <div className="recent-activity">
        <h4 className="activity-title">Chama Assets</h4>
        <ul className="transaction-list">
          {assets.map(a => (
            <li key={a.id}>
              <span>{a.name} - KES {a.value.toLocaleString()}</span>
              <small>Location: {a.location} | Acquired: {a.dateAcquired}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Update InvestmentSummary to show actual data
export const InvestmentSummary = ({ investments, contributions, expenses }) => {
  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">📈</span>
        <h3 className="card-title">Investment Summary</h3>
      </div>
      <div className="summary-cards">
        <div className="summary-card">
          <h4>Total Portfolio Value</h4>
          <p>KES {totalInvested.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h4>Total Contributions</h4>
          <p>KES {totalContributions.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h4>Total Expenses</h4>
          <p>KES {totalExpenses.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

// Combined exports
export default {
  MemberManager,
  SavingsTracker,
  InvestmentTracker,
  LoanManager,
  MeetingManager,
  ExpenseTracker,
  FinancialReports,
  NotificationCenter,
  AssetRegister,
  InvestmentSummary
};
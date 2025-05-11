import React, { useState, useContext } from 'react';
import { ChamaContext } from '../../context/ChamaContext';
import MemberList from '../../components/Membership/MemberList';
import ContributionDisplay from '../../components/Contributions/ContributionDisplay';
import RotationSchedule from '../../components/Rotations/RotationSchedule';
import CreateRotationForm from '../../components/Rotations/CreateRotationForm';
import ContributionReports from '../../components/Reports/ContributionReports';
import LoanReports from '../../components/Reports/LoanReports';
import ContributionForm from '../../components/Contributions/ContributionForm';
import WithdrawalForm from '../../components/Withdrawals/WithdrawalForm';
import WithdrawalTable from '../../components/Withdrawals/WithdrawalTable';
import LoanRequestForm from '../../components/Loans/LoanRequestForm';
import LoanList from '../../components/Loans/LoanList';
import LoanApprovalForm from '../../components/Loans/LoanApprovalForm';
import AddPaymentDetailsForm from '../../components/Payment Details/AddPaymentDetailsForm';
import PaymentDetailsDisplay from '../../components/Payment Details/PaymentDetailsDisplay';
import Sidebar from '../../components/Sidebar/Sidebar';
import MeetingDisplay from '../../components/Meetings/MeetingDisplay';
import MeetingScheduleForm from '../../components/Meetings/MeetingScheduleForm';
import MeetingMinutesUpload from '../../components/Reports/MeetingMinutesUpload';
import Header from '../../components/Header/Header';
import OTPVerification from '../../components/OTP Verification/OTPVerification';
import './Dashboard.css';
import { useMembers } from '../../hooks/useMembers';
import { useContributions } from '../../hooks/useContributions';
import { useWithdrawals } from '../../hooks/useWithdrawals';
import { useLoans } from '../../hooks/useLoans';
import { useBalance } from '../../hooks/useBalance';
import { usePaymentDetails } from '../../hooks/usePaymentDetails';
import { useMeetings } from '../../hooks/useMeetings';
import { useRotations } from '../../hooks/useRotations';

const HybridDashboard = () => {
  const { userData, chamaData, isLoading, error, fetchUserAndChamaData } = useContext(ChamaContext);
  const [activeSection, setActiveSection] = useState('overview');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingSection, setPendingSection] = useState(null);

  const { members, memberId } = useMembers();
  const { contributions, refreshContributions } = useContributions();
  const { withdrawals, refreshWithdrawals, handleWithdrawalAction } = useWithdrawals();
  const { loans, refreshLoans } = useLoans();
  const { balance } = useBalance();
  const { paymentDetails, setPaymentDetails } = usePaymentDetails();
  const { meetings } = useMeetings();
  const { rotations } = useRotations();

  const sensitiveSections = {
    'payment-details': 'Chairperson',
    'approve-withdrawal': 'Treasurer',
    'schedule-meeting': 'Secretary',
    'approve-loan': 'Chairperson',
  };

  const handleSetActiveSection = (section) => {
    if (sensitiveSections[section]) {
      if (userData?.role !== sensitiveSections[section]) {
        setActiveSection('restricted');
        return;
      }
      setPendingSection(section);
      setShowOTPModal(true);
    } else {
      setActiveSection(section);
    }
  };

  const handleOTPVerification = () => {
    setShowOTPModal(false);
    setActiveSection(pendingSection);
    setPendingSection(null);
  };

  const handleOTPCancel = () => {
    setShowOTPModal(false);
    setPendingSection(null);
    setActiveSection('overview');
  };

  const renderContent = () => {
    if (isLoading) return <div className="dashboard-loading">Loading...</div>;
    if (error) {
      return (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => (window.location.href = '/join-chama')}>
            Join or Create a Chama
          </button>
          <button onClick={fetchUserAndChamaData} style={{ marginLeft: '10px' }}>
            Retry
          </button>
        </div>
      );
    }
    if (!chamaData) return <p>⏳ Loading chama data...</p>;

    if (showOTPModal) {
      return (
        <OTPVerification
          action={pendingSection}
          onVerify={handleOTPVerification}
          onCancel={handleOTPCancel}
        />
      );
    }

    return (
      <div className="dashboard-content">
        {(() => {
          switch (activeSection) {
            case 'overview':
              return (
                <div className="dashboard-card">
                  <MemberList chamaId={chamaData?.id} members={members} title="Member Directory" />
                  <div style={{ marginTop: '1.5rem' }}>
                    <PaymentDetailsDisplay details={paymentDetails} />
                  </div>
                </div>
              );
            case 'restricted':
              return (
                <div className="dashboard-card">
                  <p>Access restricted to authorized roles.</p>
                </div>
              );
            case 'payment-details':
              return (
                <div className="dashboard-card">
                  <h3>Manage Payment Details</h3>
                  <AddPaymentDetailsForm
                    chamaId={chamaData?.id}
                    initialData={paymentDetails}
                    onSuccess={setPaymentDetails}
                  />
                </div>
              );
            case 'contributions':
              return (
                <>
                  <div className="dashboard-card">
                    <ContributionDisplay contributions={contributions} />
                  </div>
                  <div className="dashboard-card">
                    <ContributionForm
                      chamaId={chamaData?.id}
                      userId={userData?.id}
                      onSuccess={refreshContributions}
                    />
                  </div>
                </>
              );
            case 'withdrawals':
              return (
                <>
                  <div className="dashboard-card">
                    <WithdrawalForm
                      chamaId={chamaData?.id}
                      userId={userData?.id}
                      balance={balance}
                      memberId={memberId}
                    />
                  </div>
                  <div className="dashboard-card">
                    <h3>Pending Withdrawals</h3>
                    <WithdrawalTable
                      withdrawals={withdrawals.filter((w) => w.member_id === userData?.id)}
                      balance={balance}
                      role={userData?.role}
                    />
                  </div>
                </>
              );
            case 'approve-withdrawal':
              return (
                <div className="dashboard-card">
                  <h3>Approve Withdrawals</h3>
                  <WithdrawalTable
                    withdrawals={withdrawals}
                    balance={balance}
                    role={userData?.role}
                    onAction={handleWithdrawalAction}
                  />
                </div>
              );
            case 'meetings':
              return (
                <div className="dashboard-card">
                  <h3>Upcoming Meetings</h3>
                  <MeetingDisplay meetings={meetings} />
                </div>
              );
            case 'schedule-meeting':
              return (
                <div className="dashboard-card">
                  <h3>Schedule a Meeting</h3>
                  <MeetingScheduleForm chamaId={chamaData?.id} />
                </div>
              );
            case 'loans':
              return (
                <>
                  <div className="dashboard-card">
                    <LoanRequestForm
                      chamaId={chamaData?.id}
                      userId={userData?.id}
                      onSuccess={refreshLoans}
                    />
                  </div>
                  <div className="dashboard-card">
                    <LoanList
                      loans={loans}
                      userData={userData}
                      chamaId={chamaData?.id}
                      refreshLoans={refreshLoans}
                    />
                  </div>
                </>
              );
            case 'approve-loan':
              const pendingLoan = loans?.find((loan) => loan.status.toLowerCase() === 'pending');
              return (
                <div className="dashboard-card">
                  <h3>Approve Loan</h3>
                  {pendingLoan ? (
                    <LoanApprovalForm
                      loan={pendingLoan}
                      userData={userData}
                      chamaId={chamaData?.id}
                      onSuccess={refreshLoans}
                    />
                  ) : (
                    <p>No pending loans available to approve BaseContext.jsx:96 
                    </p>
                  )}
                </div>
              );
            case 'meeting-minutes':
              return (
                <div className="dashboard-card">
                  <h3>Meeting Minutes</h3>
                  <MeetingMinutesUpload
                    chamaId={chamaData?.id}
                    canUpload={userData?.role === 'Secretary'}
                  />
                </div>
              );
            case 'contribution-reports':
              return (
                <div className="dashboard-card">
                  <h3>Contribution Reports</h3>
                  <ContributionReports contributions={contributions} chama={chamaData} balance={balance} />
                </div>
              );
            case 'loan-reports':
              return (
                <div className="dashboard-card">
                  <h3>Loan Reports</h3>
                  <LoanReports loans={loans} chama={chamaData} balance={balance} />
                </div>
              );
            case 'rotation':
              return (
                <div className="dashboard-card">
                  <RotationSchedule
                    members={members}
                    contributions={contributions}
                    chamaId={chamaData?.id}
                    rotations={rotations}
                    role={userData?.role}
                  />
                </div>
              );
            case 'rotation-details':
              return (
                <div className="dashboard-card">
                  <h3>Rotation Details</h3>
                  <CreateRotationForm chamaId={chamaData?.id} />
                </div>
              );
            default:
              return (
                <div className="dashboard-card">
                  <p>Invalid section selected.</p>
                </div>
              );
          }
        })()}
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <Header userName={userData?.username || userData?.email} chamaName={chamaData?.name} />
      <Sidebar
        setActiveSection={handleSetActiveSection}
        activeSection={activeSection}
        paymentDetails={paymentDetails}
        role={userData?.role}
        chamaType={chamaData?.type}
        chamaName={chamaData?.name}
      />
      <main className="dashboard-main-container">{renderContent()}</main>
    </div>
  );
};

export default HybridDashboard;
import React, { useState, useContext } from 'react';
import { ChamaContext } from '../../context/ChamaContext';
import { useMembers } from '../../hooks/useMembers';
import { useContributions } from '../../hooks/useContributions';
import { useBalance } from '../../hooks/useBalance';
import { usePaymentDetails } from '../../hooks/usePaymentDetails';
import { useMeetings } from '../../hooks/useMeetings';
import MemberList from '../../components/Membership/MemberList';
import ContributionDisplay from '../../components/Contributions/ContributionDisplay';
import ContributionReports from '../../components/Reports/ContributionReports';
import ContributionForm from '../../components/Contributions/ContributionForm';
import AddPaymentDetailsForm from '../../components/Payment Details/AddPaymentDetailsForm';
import PaymentDetailsDisplay from '../../components/Payment Details/PaymentDetailsDisplay';
import Sidebar from '../../components/Sidebar/Sidebar';
import MeetingDisplay from '../../components/Meetings/MeetingDisplay';
import MeetingScheduleForm from '../../components/Meetings/MeetingScheduleForm';
import MeetingMinutesUpload from '../../components/Reports/MeetingMinutesUpload';
import Header from '../../components/Header/Header';
import './Dashboard.css';

const InvestmentDashboard = () => {
  const { userData, chamaData, isLoading, error, fetchUserAndChamaData, handleSendOTP, handleVerifyOTP } = useContext(ChamaContext);
  const [activeSection, setActiveSection] = useState('overview');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingSection, setPendingSection] = useState(null);

  const { members } = useMembers();
  const { contributions, refreshContributions } = useContributions();
  const { balance } = useBalance();
  const { paymentDetails, setPaymentDetails } = usePaymentDetails();
  const { meetings } = useMeetings();

  // Filter contributions to exclude rotational contributions
  const investmentContributions = contributions.filter(c => c.transaction_type === 'investment');

  const sensitiveSections = {
    'payment-details': 'Chairperson',
    'schedule-meeting': 'Secretary',
  };

  const handleSetActiveSection = (section) => {
    if (sensitiveSections[section] && userData?.role !== sensitiveSections[section]) {
      handleSendOTP(() => {
        setPendingSection(section);
        setShowOTPModal(true);
      });
    } else {
      setActiveSection(section);
    }
  };

  const handleOTPVerification = () => {
    handleVerifyOTP(otp, () => {
      setShowOTPModal(false);
      setOtp('');
      setActiveSection(pendingSection);
      setPendingSection(null);
    });
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
            case 'payment-details':
              if (userData?.role !== 'Chairperson') return <p>Access restricted to Chairpersons.</p>;
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
                    <ContributionDisplay contributions={investmentContributions} />
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
            case 'meetings':
              return (
                <div className="dashboard-card">
                  <h3>Upcoming Meetings</h3>
                  <MeetingDisplay meetings={meetings} />
                </div>
              );
            case 'schedule-meeting':
              if (userData?.role !== 'Secretary') return <p>Access restricted to Secretaries.</p>;
              return (
                <div className="dashboard-card">
                  <h3>Schedule a Meeting</h3>
                  <MeetingScheduleForm chamaId={chamaData?.id} />
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
                  <ContributionReports
                    contributions={investmentContributions}
                    chama={chamaData}
                    balance={balance}
                  />
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
        {showOTPModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Enter OTP</h3>
              <p className="mb-6 text-gray-600">Please check your email for the 6-digit OTP.</p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="border border-gray-300 p-3 w-full mb-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-3">
                <button
                  className="bg-gray-300 text-gray-800 px-5 py-2 rounded hover:bg-gray-400 transition"
                  onClick={() => setShowOTPModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
                  onClick={handleOTPVerification}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <Header userName={userData?.username || userData?.email} chamaName={chamaData?.name} />
      <Sidebar
        setActiveSection={handleSetActiveSection}
        activeSection={activeSection}
        role={userData?.role}
        chamaType={chamaData?.type}
        chamaName={chamaData?.name}
      />
      <main className="dashboard-main-container">{renderContent()}</main>
    </div>
  );
};

export default InvestmentDashboard;
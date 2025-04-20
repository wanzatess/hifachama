import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '../../utils/auth';
import { supabase } from '../../utils/supabaseClient';
import {
  MemberList,          // Changed from MemberManager
  ContributionDisplay, // Changed from ContributionTracker
  RotationSchedule,    // Changed from MemberRotation
  ReportDisplay,       // Changed from HybridReports
} from '../../components/Hybrid';
import ContributionForm from '../../components/ContributionForm';
import WithdrawalForm from '../../components/WithdrawalForm';
import '../../styles/Dashboard.css';

const HybridDashboard = () => {
  // ... keep existing state and useEffect hooks ...

  return (
    <main className="dashboard-content">
      <div className="dashboard-header">
        <div>Welcome, {userData?.username || userData?.email}</div>
        <div>
          {chamaData?.name
            ? `${chamaData.name} (ID: ${chamaData.id})`
            : 'Loading Chama…'}
        </div>
      </div>

      <div className="dashboard-card">
        <MemberList 
          members={members} 
          title="Member Directory"
        />
      </div>

      <div className="dashboard-card">
        <ContributionDisplay
          members={members}
          contributions={contributions}
          title="Contribution History"
        />
      </div>

      {/* Transaction Forms */}
      <div className="dashboard-card">
        <ContributionForm />
      </div>

      <div className="dashboard-card">
        <WithdrawalForm />
      </div>

      <div className="dashboard-card">
        <RotationSchedule 
          members={members} 
          contributions={contributions}
          title="Current Rotation Schedule"
        />
      </div>

      <div className="dashboard-card">
        <ReportDisplay 
          members={members} 
          contributions={contributions} 
          loans={loans}
          title="Financial Reports"
        />
      </div>
    </main>
  );
};

export default HybridDashboard;
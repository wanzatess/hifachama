import React, { useContext } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { useContributions } from '../../hooks/useContributions'; 
import { useBalance } from '../../hooks/useBalance'; 
import { ChamaContext } from '../../context/ChamaContext'; 
import '../../pages/Dashboards/Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ContributionReports = () => {
  const { chamaData } = useContext(ChamaContext);
  const { contributions } = useContributions();
  const { balance } = useBalance();

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

  const downloadContributionExcel = () => {
    try {
      const template = {
        headers: ['Type', 'Username', 'Amount', 'Date'],
        data: contributions.map(t => ({
          Type: t.transaction_type || 'N/A',
          Username: t.username || 'Unknown',
          Amount: t.amount || 0,
          Date: t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A',
        })),
      };

      const worksheet = XLSX.utils.json_to_sheet(template.data, {
        header: template.headers,
      });

      const title = `${chamaData?.name || 'Chama'} Contribution Report`;
      XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: 'A1' });
      XLSX.utils.sheet_add_aoa(worksheet, [template.headers], { origin: 'A2' });

      worksheet['!cols'] = [
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contributions');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, `${chamaData?.name || 'Chama'}_Contributions_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Contribution report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download contribution report.');
    }
  };

  return (
    <div className="report-card">
      <h3 className="report-title">Contribution Reports</h3>

      <div className="report-section">
        <h4 className="report-section-title">Balance Summary</h4>
        <div className="balance-summary">
          {balance ? (
            <>
              <p>Rotational Balance: <span>Ksh {balance.rotational_balance || 0}</span></p>
              <p>Investment Balance: <span>Ksh {balance.investment_balance || 0}</span></p>
            </>
          ) : (
            <p>No balance data available.</p>
          )}
        </div>
      </div>

      <div className="report-section">
        <h4 className="report-section-title">Download Report</h4>
        <button
          onClick={downloadContributionExcel}
          className="download-button"
        >
          Download Contributions (Excel)
        </button>
      </div>

      <div className="report-section">
        <h4 className="report-section-title">Contributions by Transaction Type</h4>
        <div className="chart-container">
          {contributions.length > 0 ? (
            <Pie data={processChartData()} />
          ) : (
            <p>No contribution data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContributionReports;
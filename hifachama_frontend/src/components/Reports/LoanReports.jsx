import React, { useContext } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { useLoans } from '../../hooks/useLoans'; // Adjust path
import { useBalance } from '../../hooks/useBalance'; // Adjust path
import { ChamaContext } from '../../context/ChamaContext'; // Adjust path
import '../../pages/Dashboards/Dashboard.css';

const LoanReports = () => {
  const { chamaData } = useContext(ChamaContext);
  const { loans } = useLoans();
  const { balance } = useBalance();

  const totalOutstandingLoans = loans
    .filter(loan => loan.status.toLowerCase() === 'approved')
    .reduce((sum, loan) => sum + (loan.amount || 0), 0);

  const downloadLoanExcel = () => {
    try {
      const template = {
        headers: ['Member Name', 'Amount', 'Status', 'Request Date', 'Due Date'],
        data: loans.map(loan => ({
          'Member Name': loan.member_name || 'Unknown',
          Amount: loan.amount || 0,
          Status: loan.status || 'N/A',
          'Request Date': loan.created_at ? new Date(loan.created_at).toLocaleDateString() : 'N/A',
          'Due Date': loan.cycle_date ? new Date(loan.cycle_date).toLocaleDateString() : 'N/A',
        })),
      };

      const worksheet = XLSX.utils.json_to_sheet(template.data, {
        header: template.headers,
      });

      const title = `${chamaData?.name || 'Chama'} Loan Report`;
      XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: 'A1' });
      XLSX.utils.sheet_add_aoa(worksheet, [template.headers], { origin: 'A2' });

      worksheet['!cols'] = [
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Loans');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, `${chamaData?.name || 'Chama'}_Loans_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Loan report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download loan report.');
    }
  };

  return (
    <div className="report-card">
      <h3 className="report-title">Loan Reports</h3>

      <div className="report-section">
        <h4 className="report-section-title">Balance Summary</h4>
        <div className="balance-summary">
          <p>Total Outstanding Loans: <span>{totalOutstandingLoans || 0}</span></p>
          {balance && (
            <>
              <p>Rotational Balance: <span>{balance.rotational_balance || 0}</span></p>
              <p>Investment Balance: <span>{balance.investment_balance || 0}</span></p>
            </>
          )}
        </div>
      </div>

      <div className="report-section">
        <h4 className="report-section-title">Download Report</h4>
        <button
          onClick={downloadLoanExcel}
          className="download-button"
        >
          Download Loans (Excel)
        </button>
      </div>
    </div>
  );
};

export default LoanReports;
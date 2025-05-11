import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import '../../pages/Dashboards/Dashboard.css';

const LoanReports = ({ loans = [], chama, balance }) => {
  // Calculate total outstanding loans for balance display
  const totalOutstandingLoans = loans
    .filter(loan => loan.status.toLowerCase() === 'approved')
    .reduce((sum, loan) => sum + (loan.amount || 0), 0);

  // Generate Excel using predefined template
  const downloadLoanExcel = () => {
    try {
      // Define Excel template structure
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

      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(template.data, {
        header: template.headers,
      });

      // Add a title row above headers
      const title = `${chama?.name || 'Chama'} Loan Report`;
      XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: 'A1' });
      XLSX.utils.sheet_add_aoa(worksheet, [template.headers], { origin: 'A2' });

      // Set column widths
      worksheet['!cols'] = [
        { wch: 20 }, // Member Name
        { wch: 15 }, // Amount
        { wch: 15 }, // Status
        { wch: 15 }, // Request Date
        { wch: 15 }, // Due Date
      ];

      // Create workbook and append worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Loans');

      // Write and download Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, `${chama?.name || 'Chama'}_Loans_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Loan report downloaded successfully!');
    } catch (error) {
      console.error('Error generating loan Excel:', error);
      toast.error('Failed to download loan report.');
    }
  };

  return (
    <div className="report-card">
      <h3 className="report-title">Loan Reports</h3>

      {/* Balance Display */}
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

      {/* Download Button */}
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
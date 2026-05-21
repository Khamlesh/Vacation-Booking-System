import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const HostReports = () => {
  const { user } = useContext(AuthContext);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/reports/host?month=${month}&year=${year}`, config);
      setReport(data);
    } catch (err) {
      toast.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    
    // Add Brand Header
    doc.setFillColor(255, 56, 92); // Brand color (rose-500 equivalent)
    doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Vacation Rentals', 14, 20);

    // Title
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(16);
    doc.text(`Host Booking Report - ${month}/${year}`, 14, 45);
    
    // AutoTable
    autoTable(doc, {
      startY: 55,
      head: [['Metric', 'Value']],
      body: [
        ['Total Bookings', report.totalBookings],
        ['Payment Received', `INR ${report.totalPayment}`],
        ['Cancelled Bookings', report.cancelledBookings],
        ['Rescheduled Bookings', report.rescheduledBookings]
      ],
      theme: 'grid',
      headStyles: { fillColor: [255, 56, 92], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 12, cellPadding: 6 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
    });
    
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      doc.save(`Host_Report_${month}_${year}.pdf`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mt-8">
      <h2 className="text-2xl font-bold mb-6">Monthly Booking Report</h2>
      <div className="flex gap-4 items-end mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded-full px-4 py-2 bg-slate-50">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="border rounded-full px-4 py-2 bg-slate-50">
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button onClick={fetchReport} disabled={loading} className="bg-brand text-white px-6 py-2 rounded-full font-semibold hover:bg-rose-600 transition">
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {report && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-600 font-semibold mb-1">Total Bookings</p>
              <p className="text-2xl font-bold">{report.totalBookings}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-sm text-green-600 font-semibold mb-1">Payment Received</p>
              <p className="text-2xl font-bold">₹{report.totalPayment}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <p className="text-sm text-red-600 font-semibold mb-1">Cancelled</p>
              <p className="text-2xl font-bold">{report.cancelledBookings}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
              <p className="text-sm text-yellow-600 font-semibold mb-1">Rescheduled</p>
              <p className="text-2xl font-bold">{report.rescheduledBookings}</p>
            </div>
          </div>
          <button onClick={exportPDF} className="bg-slate-900 text-white px-6 py-2 rounded-full font-semibold hover:bg-slate-800 transition">
            Export to PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default HostReports;

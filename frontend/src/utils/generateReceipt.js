import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateReceipt = (booking, user) => {
  try {
    const doc = new jsPDF();
    const brandColor = [244, 63, 94]; // brand rose-500
    const darkText = [30, 41, 59];
    const mutedText = [100, 116, 139];

    // Safely extract data
    const bookingId = booking?._id?.substring(0, 8)?.toUpperCase() || 'N/A';
    const guestName = user?.name || booking?.guestName || 'Valued Guest';
    const guestEmail = user?.email || '';
    const propertyTitle = booking?.listing?.title || 'Property';
    const propertyLocation = booking?.listing?.location || '';
    const checkIn = booking?.checkIn ? new Date(booking.checkIn).toLocaleDateString('en-IN') : 'N/A';
    const checkOut = booking?.checkOut ? new Date(booking.checkOut).toLocaleDateString('en-IN') : 'N/A';
    const totalPrice = booking?.totalPrice || 0;
    const issueDate = new Date().toLocaleDateString('en-IN');

    // ── Header background ──────────────────────────────────────────────
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 55, 'F');

    // Brand
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('VACATION', 20, 28);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedText);
    doc.text('PREMIUM TRAVEL EXPERIENCE', 20, 36);

    // Receipt title (right side)
    doc.setTextColor(...darkText);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEIPT', 190, 22, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedText);
    doc.text(`Receipt #: ${bookingId}`, 190, 30, { align: 'right' });
    doc.text(`Date: ${issueDate}`, 190, 37, { align: 'right' });

    // ── Divider ────────────────────────────────────────────────────────
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(20, 62, 190, 62);

    // ── Billed To ──────────────────────────────────────────────────────
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...mutedText);
    doc.text('BILLED TO', 20, 74);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.text(guestName, 20, 82);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedText);
    if (guestEmail) doc.text(guestEmail, 20, 89);

    // ── Property ───────────────────────────────────────────────────────
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...mutedText);
    doc.text('PROPERTY', 120, 74);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    // Truncate long titles
    const maxTitleLen = 35;
    const titleText = propertyTitle.length > maxTitleLen ? propertyTitle.substring(0, maxTitleLen) + '...' : propertyTitle;
    doc.text(titleText, 120, 82);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedText);
    if (propertyLocation) doc.text(propertyLocation, 120, 89);

    // ── Line items table ───────────────────────────────────────────────
    autoTable(doc, {
      startY: 105,
      head: [['Description', 'Check-In', 'Check-Out', 'Amount']],
      body: [
        [
          `Stay at ${propertyTitle}`,
          checkIn,
          checkOut,
          `INR ${totalPrice.toLocaleString('en-IN')}`
        ]
      ],
      headStyles: {
        fillColor: brandColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 7,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: darkText,
        cellPadding: 8,
        lineColor: [241, 245, 249],
        lineWidth: 0.3,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        3: { halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: 20, right: 20 },
      theme: 'grid',
    });

    // ── Summary section ────────────────────────────────────────────────
    const tableBottom = doc.lastAutoTable?.finalY || 145;
    const summaryY = tableBottom + 15;

    // Summary box background
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(120, summaryY - 5, 70, 32, 3, 3, 'F');

    doc.setFontSize(9);
    doc.setTextColor(...mutedText);
    doc.text('Subtotal:', 128, summaryY + 5);
    doc.setTextColor(...darkText);
    doc.text(`INR ${totalPrice.toLocaleString('en-IN')}`, 188, summaryY + 5, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.line(128, summaryY + 10, 188, summaryY + 10);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.text('Total Paid:', 128, summaryY + 20);
    doc.text(`INR ${totalPrice.toLocaleString('en-IN')}`, 188, summaryY + 20, { align: 'right' });

    // ── Payment Status Badge ───────────────────────────────────────────
    doc.setFillColor(209, 250, 229); // green bg
    doc.roundedRect(20, summaryY, 50, 12, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 95, 70); // green text
    doc.text('✓  PAYMENT CONFIRMED', 45, summaryY + 8, { align: 'center' });

    // ── Footer ─────────────────────────────────────────────────────────
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 272, 210, 25, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Thank you for choosing VACATION. We wish you a pleasant stay!', 105, 282, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text('This is a computer-generated receipt and does not require a signature.  |  support@vacation.com  |  +91 98765 43210', 105, 290, { align: 'center' });

    // ── Save ───────────────────────────────────────────────────────────
    doc.save(`Vacation-Receipt-${bookingId}.pdf`);
  } catch (err) {
    console.error('Receipt generation failed:', err);
    alert('Could not generate receipt. Please try again.');
  }
};

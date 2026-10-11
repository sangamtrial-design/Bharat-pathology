import { BookingItem, LabSettings } from '../types/admin';

/**
 * Masks an Indian 10-digit phone number: XXXXXX1234
 */
export function maskPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length >= 10) {
    return 'XXXXXX' + clean.slice(-4);
  }
  return 'XXXX' + phone.slice(-4);
}

/**
 * Format Indian Currency
 */
export function formatCurrency(amount: number = 0): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format standard readable date
 */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Export array of bookings to CSV with optional phone masking
 */
export function exportBookingsToCSV(bookings: BookingItem[], shouldMaskPhone: boolean = false) {
  const headers = [
    'Booking ID',
    'Date Created',
    'Patient Name',
    'Phone',
    'Age',
    'Gender',
    'Test / Package',
    'Preferred Date',
    'Confirmed Date',
    'Time Slot',
    'Assigned Collector',
    'Priority',
    'Address',
    'Status',
    'Payment Status',
    'Payment Preference',
    'Quoted Amount (INR)',
    'Received Amount (INR)',
    'Collection Charge',
    'Discount',
    'Transaction Ref',
    'Report Status',
    'Report Delivery Mode',
    'Tags'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = bookings.map((b) => [
    escapeCSV(b.id),
    escapeCSV(formatDate(b.createdAt)),
    escapeCSV(b.name),
    escapeCSV(shouldMaskPhone ? maskPhone(b.phone) : b.phone),
    escapeCSV(b.age),
    escapeCSV(b.gender),
    escapeCSV(b.testOrPackage),
    escapeCSV(b.preferredDate),
    escapeCSV(b.confirmedDate || '—'),
    escapeCSV(b.confirmedTimeSlot || '—'),
    escapeCSV(b.assignedCollector || 'Unassigned'),
    escapeCSV(b.priority || 'Normal'),
    escapeCSV(b.address),
    escapeCSV(b.status),
    escapeCSV(b.paymentStatus),
    escapeCSV(b.paymentPreference),
    escapeCSV(b.amountQuoted || 0),
    escapeCSV(b.amountReceived || 0),
    escapeCSV(b.collectionCharge || 0),
    escapeCSV(b.discount || 0),
    escapeCSV(b.transactionRef || '—'),
    escapeCSV(b.reportStatus || 'Not Started'),
    escapeCSV(b.reportDeliveryMode || '—'),
    escapeCSV((b.tags || []).join('; '))
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bharat_Pathology_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export full JSON data backup download
 */
export function exportDataToJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print a professional laboratory booking receipt
 */
export function printBookingReceipt(booking: BookingItem, settings: LabSettings) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const totalPayable = (booking.amountQuoted || 0) + (booking.collectionCharge || 0) - (booking.discount || 0);
  const balanceDue = totalPayable - (booking.amountReceived || 0);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - ${booking.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; max-width: 720px; margin: 0 auto; }
          .header { border-bottom: 2px solid #0f766e; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
          .title { font-size: 22px; font-weight: bold; color: #0f766e; }
          .sub { font-size: 13px; color: #64748b; margin-top: 2px; }
          .meta { font-size: 12px; color: #475569; text-align: right; }
          .section { margin-bottom: 18px; }
          .sec-title { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #0f766e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 13px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .label { color: #64748b; font-weight: 500; }
          .val { font-weight: 600; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
          td { border: 1px solid #e2e8f0; padding: 8px; }
          .totals { margin-top: 12px; margin-left: auto; width: 280px; font-size: 13px; }
          .footer { margin-top: 36px; padding-top: 14px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; text-align: center; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
          .paid { background: #dcfce7; color: #15803d; }
          .unpaid { background: #fee2e2; color: #b91c1c; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${settings.labName || 'Bharat Pathology'}</div>
            <div class="sub">${settings.tagline || 'Local Pathology Laboratory'}</div>
            <div class="sub">${settings.address}</div>
            <div class="sub">Phone: ${settings.phone}</div>
          </div>
          <div class="meta">
            <div style="font-size: 16px; font-weight: bold; color: #0f172a;">BOOKING RECEIPT</div>
            <div>Ref: <strong>${booking.id}</strong></div>
            <div>Date: ${formatDate(booking.createdAt)}</div>
            <div style="margin-top: 6px;">
              <span class="badge ${booking.paymentStatus.includes('Paid') ? 'paid' : 'unpaid'}">
                ${booking.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="sec-title">Patient Details</div>
          <div class="grid">
            <div class="row"><span class="label">Patient Name:</span> <span class="val">${booking.name}</span></div>
            <div class="row"><span class="label">Phone:</span> <span class="val">${booking.phone}</span></div>
            <div class="row"><span class="label">Age / Gender:</span> <span class="val">${booking.age} yrs / ${booking.gender}</span></div>
            <div class="row"><span class="label">Preferred Date:</span> <span class="val">${booking.preferredDate}</span></div>
          </div>
          <div class="row" style="margin-top: 6px;">
            <span class="label">Collection Address:</span>
            <span class="val" style="text-align: right; max-width: 70%;">${booking.address}</span>
          </div>
        </div>

        <div class="section">
          <div class="sec-title">Investigation / Tests Ordered</div>
          <table>
            <thead>
              <tr>
                <th>Test / Package Description</th>
                <th style="text-align: right; width: 120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${booking.testOrPackage}</strong></td>
                <td style="text-align: right;">${formatCurrency(booking.amountQuoted)}</td>
              </tr>
              ${(booking.tests || [])
                .map(
                  (t) => `
                <tr>
                  <td>&nbsp;&nbsp;+ ${t.name}</td>
                  <td style="text-align: right;">${formatCurrency(t.price)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="row"><span class="label">Subtotal:</span> <span class="val">${formatCurrency(booking.amountQuoted)}</span></div>
            ${booking.collectionCharge ? `<div class="row"><span class="label">Collection Charge:</span> <span class="val">${formatCurrency(booking.collectionCharge)}</span></div>` : ''}
            ${booking.discount ? `<div class="row"><span class="label">Discount:</span> <span class="val">- ${formatCurrency(booking.discount)}</span></div>` : ''}
            <div class="row" style="border-top: 1px solid #e2e8f0; padding-top: 4px; font-size: 14px;">
              <span class="label" style="font-weight: bold; color: #0f172a;">Total Payable:</span>
              <span class="val" style="color: #0f766e;">${formatCurrency(totalPayable)}</span>
            </div>
            <div class="row"><span class="label">Amount Paid:</span> <span class="val" style="color: #16a34a;">${formatCurrency(booking.amountReceived)}</span></div>
            <div class="row"><span class="label">Balance Due:</span> <span class="val" style="color: ${balanceDue > 0 ? '#dc2626' : '#64748b'};">${formatCurrency(balanceDue)}</span></div>
            ${booking.transactionRef ? `<div class="row" style="margin-top: 4px; font-size: 11px;"><span class="label">UPI Ref / UTR:</span> <span class="val">${booking.transactionRef}</span></div>` : ''}
          </div>
        </div>

        <div class="section">
          <div class="sec-title">Collection & Report Instructions</div>
          <div class="grid">
            <div class="row"><span class="label">Status:</span> <span class="val">${booking.status}</span></div>
            <div class="row"><span class="label">Collector:</span> <span class="val">${booking.assignedCollector || 'Lab Direct'}</span></div>
            <div class="row"><span class="label">Time Slot:</span> <span class="val">${booking.confirmedTimeSlot || 'To be confirmed'}</span></div>
            <div class="row"><span class="label">Report Delivery:</span> <span class="val">${booking.reportDeliveryMode || 'WhatsApp'}</span></div>
          </div>
        </div>

        <div class="footer">
          <div>This is an official laboratory receipt from ${settings.labName}. All test reports will be verified prior to release.</div>
          <div>For enquiries regarding report readiness or sample collection, call ${settings.phone}.</div>
          ${settings.gstNumber ? `<div>GSTIN: ${settings.gstNumber}</div>` : ''}
          ${settings.regNumber ? `<div>Reg No: ${settings.regNumber}</div>` : ''}
        </div>

        <div class="no-print" style="margin-top: 24px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #0f766e; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            Print / Save as PDF
          </button>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Print daily route sheet grouped by collector and time slot
 */
export function printRouteSheet(dateStr: string, bookings: BookingItem[], settings: LabSettings) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Group by collector
  const grouped: Record<string, BookingItem[]> = {};
  bookings.forEach((b) => {
    const collector = b.assignedCollector || 'Unassigned Phlebotomists';
    if (!grouped[collector]) grouped[collector] = [];
    grouped[collector].push(b);
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Daily Route Sheet - ${dateStr}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #1e293b; }
          .header { border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; }
          h2 { margin: 0; color: #0f766e; font-size: 20px; }
          .collector-block { margin-bottom: 28px; page-break-inside: avoid; }
          .collector-title { background: #f1f5f9; padding: 8px 12px; font-weight: bold; font-size: 14px; border-left: 4px solid #0f766e; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #f8fafc; border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; }
          .urgent { background: #fef2f2; font-weight: bold; color: #b91c1c; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2>${settings.labName} — Daily Home Sample Collection Route Sheet</h2>
            <div style="font-size: 13px; color: #64748b;">Date: <strong>${formatDate(dateStr)}</strong></div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748b;">
            <div>Total Visits: ${bookings.length}</div>
            <div>Printed: ${new Date().toLocaleTimeString('en-IN')}</div>
          </div>
        </div>

        ${Object.keys(grouped)
          .map(
            (col) => `
          <div class="collector-block">
            <div class="collector-title">Phlebotomist / Collector: ${col} (${grouped[col].length} stops)</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">Time</th>
                  <th style="width: 140px;">Patient & Phone</th>
                  <th>Address & Landmark</th>
                  <th style="width: 160px;">Test Requested</th>
                  <th style="width: 80px;">Payment</th>
                  <th style="width: 100px;">Signature / Notes</th>
                </tr>
              </thead>
              <tbody>
                ${grouped[col]
                  .map(
                    (b, i) => `
                  <tr class="${b.priority === 'Urgent' ? 'urgent' : ''}">
                    <td><strong>${b.confirmedTimeSlot || 'Slot ' + (i + 1)}</strong></td>
                    <td>
                      <strong>${b.name}</strong><br/>
                      ${b.phone}<br/>
                      <small>${b.gender}, ${b.age}y</small>
                    </td>
                    <td>
                      ${b.address}
                      ${b.message ? `<div style="color: #64748b; font-size: 11px; margin-top: 2px;">Note: ${b.message}</div>` : ''}
                    </td>
                    <td>
                      <strong>${b.testOrPackage}</strong>
                      ${b.priority === 'Urgent' ? '<br/><span style="color: red; font-size: 10px;">[URGENT]</span>' : ''}
                    </td>
                    <td>
                      ${b.paymentStatus}<br/>
                      <small>Due: ${formatCurrency((b.amountQuoted || 0) + (b.collectionCharge || 0) - (b.amountReceived || 0))}</small>
                    </td>
                    <td></td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
          )
          .join('')}

        <div class="no-print" style="margin-top: 24px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #0f766e; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            Print Route Sheet
          </button>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

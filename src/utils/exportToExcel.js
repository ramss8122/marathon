import * as XLSX from 'xlsx';

/**
 * Formats a date string or Date object into YYYY-MM-DD or readable local date
 */
function formatDate(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  return d.toISOString().split('T')[0];
}

import { getCityDisplayName } from './cityHelper';

/**
 * Maps a registration object to a flattened row suitable for Excel export.
 * Follows the fields from Registration schema and Admin panel.
 */
function mapRegistrationToRow(r, index) {
  return {
    'S.No': index + 1,
    'Registration ID': r.registrationRef || '',
    'Participant Name': r.fullName || '',
    'Email Address': r.email || '',
    'Phone Number': r.mobileNumber || '',
    'WhatsApp Number': r.whatsappNumber || '',
    'Date of Birth': r.dob || '',
    'Gender': r.gender || '',
    'T-Shirt Size': r.tshirtSize || '',
    'Blood Group': r.bloodGroup || '',
    'Organisation': r.organisation || '',
    'Designation': r.designation || '',
    'Address': r.address || '',
    'City': r.city || '',
    'State': r.state || '',
    'Pincode': r.pincode || '',
    'Country': r.country || 'India',
    'Facebook Profile': r.facebookLink || '',
    'Event': getCityDisplayName(r),
    'Distance / Category': r.distance || r.raceCategory || '',
    'Amount (₹)': typeof r.amount === 'number' ? r.amount : (Number(r.amount) || 0),
    'Registration Status': r.registrationStatus || 'Confirmed',
    'Payment Status': r.paymentStatus || 'Pending',
    'Payment Method': r.paymentMethod || 'Online',
    'Payment Ref': r.paymentRef || '',
    'Emergency Contact': r.emergencyContact || '',
    'Emergency Phone': r.emergencyPhone || '',
    'Registration Date': formatDate(r.createdAt)
  };
}

/**
 * Calculates responsive column widths based on the data
 */
function calculateColumnWidths(dataRows, headers) {
  return headers.map(header => {
    let maxLength = header.length;
    for (const row of dataRows) {
      const val = row[header];
      if (val !== null && val !== undefined) {
        const strVal = String(val);
        if (strVal.length > maxLength) {
          maxLength = strVal.length;
        }
      }
    }
    return { wch: Math.min(Math.max(maxLength + 3, 10), 40) };
  });
}

/**
 * Exports an array of registrations to a genuine .xlsx file.
 * 
 * @param {Array} registrations - The array of registration objects (filtered or all)
 * @param {string} [customFileName] - Optional custom file name
 * @returns {boolean} - True if exported successfully, false otherwise
 */
export function exportRegistrationsToExcel(registrations = [], customFileName) {
  if (!registrations || registrations.length === 0) {
    alert('No registrations available to export.');
    return false;
  }

  try {
    const dataRows = registrations.map((r, i) => mapRegistrationToRow(r, i));
    const headers = Object.keys(dataRows[0] || {});

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataRows);

    // Apply column widths
    worksheet['!cols'] = calculateColumnWidths(dataRows, headers);

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    // Generate filename
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = customFileName || `RUNTRUST_Marathon_Registrations_${dateStr}.xlsx`;

    // Trigger download
    XLSX.writeFile(workbook, fileName);
    return true;
  } catch (error) {
    console.error('Error exporting registrations to Excel:', error);
    alert('Failed to export to Excel. Please check console for details.');
    return false;
  }
}

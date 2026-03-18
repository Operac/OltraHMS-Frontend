// Print Service for Thermal Printer Integration
// Supports ESC/POS compatible thermal printers

export interface TicketData {
  hospitalName: string;
  patientName: string;
  patientNumber: string;
  tokenNumber: number;
  department: string;
  doctorName: string;
  appointmentType: string;
  date: Date;
  estimatedWaitTime: number;
  insuranceProvider?: string;
  insuranceStatus?: string;
}

export interface ReceiptData {
  hospitalName: string;
  patientName: string;
  patientNumber: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
  total: number;
  paymentMethod: string;
  receiptNumber: string;
  date: Date;
}

// Generate ESC/POS commands for thermal printer
function generateHeader(hospitalName: string): number[] {
  const commands: number[] = [];
  
  // Initialize printer
  commands.push(0x1B, 0x40); // ESC @
  
  // Center align
  commands.push(0x1B, 0x61, 0x01); // ESC a 1
  
  // Bold on
  commands.push(0x1B, 0x45, 0x01); // ESC E 1
  
  // Double height/width
  commands.push(0x1D, 0x21, 0x11); // GS ! 11h
  
  // Add hospital name
  for (const char of hospitalName) {
    commands.push(char.charCodeAt(0));
  }
  commands.push(0x0A); // LF
  
  // Normal size
  commands.push(0x1D, 0x21, 0x00); // GS ! 0
  
  // Bold off
  commands.push(0x1B, 0x45, 0x00); // ESC E 0
  
  commands.push(0x0A); // LF
  
  return commands;
}

function generateTicketContent(data: TicketData): number[] {
  const commands: number[] = [];
  
  // Left align
  commands.push(0x1B, 0x61, 0x00); // ESC a 0
  
  // Patient Name
  const patientLabel = 'Patient:';
  for (const char of patientLabel) commands.push(char.charCodeAt(0));
  for (const char of data.patientName) commands.push(char.charCodeAt(0));
  commands.push(0x0A);
  
  // Patient Number
  const numberLabel = 'No:';
  for (const char of numberLabel) commands.push(char.charCodeAt(0));
  for (const char of data.patientNumber) commands.push(char.charCodeAt(0));
  commands.push(0x0A);
  
  // Token Number - large
  commands.push(0x1B, 0x45, 0x01); // Bold on
  const tokenLabel = 'TOKEN NO:';
  for (const char of tokenLabel) commands.push(char.charCodeAt(0));
  commands.push(0x1B, 0x45, 0x00); // Bold off
  commands.push(0x1D, 0x21, 0x01); // Double height
  
  // Convert token to string and add each character
  const tokenStr = data.tokenNumber.toString();
  for (const char of tokenStr) commands.push(char.charCodeAt(0));
  commands.push(0x0A);
  commands.push(0x1D, 0x21, 0x00); // Normal size
  
  // Department
  const deptLabel = 'Dept:';
  for (const char of deptLabel) commands.push(char.charCodeAt(0));
  for (const char of data.department) commands.push(char.charCodeAt(0));
  commands.push(0x0A);
  
  // Doctor
  const docLabel = 'Doctor:';
  for (const char of docLabel) commands.push(char.charCodeAt(0));
  for (const char of data.doctorName) commands.push(char.charCodeAt(0));
  commands.push(0x0A);
  
  // Appointment Type
  const typeLabel = 'Type:';
  for (const char of typeLabel) commands.push(char.charCodeAt(0));
  for (const char of data.appointmentType) commands.push(char.charCodeAt(0));
  commands.push(0x0A);
  
  // Estimated Wait
  const waitLabel = 'Est. Wait:';
  for (const char of waitLabel) commands.push(char.charCodeAt(0));
  const waitStr = `${data.estimatedWaitTime} mins`;
  for (const char of waitStr) commands.push(char.charCodeAt(0));
  commands.push(0x0A);
  
  // Insurance info if available
  if (data.insuranceProvider) {
    commands.push(0x0A);
    const insLabel = 'Insurance:';
    for (const char of insLabel) commands.push(char.charCodeAt(0));
    commands.push(0x0A);
    for (const char of data.insuranceProvider) commands.push(char.charCodeAt(0));
    if (data.insuranceStatus) {
      commands.push(0x20);
      commands.push(0x28);
      for (const char of `(${data.insuranceStatus})`) commands.push(char.charCodeAt(0));
    }
    commands.push(0x0A);
  }
  
  // Date
  const dateStr = data.date.toLocaleString();
  for (const char of dateStr) commands.push(char.charCodeAt(0));
  commands.push(0x0A);
  
  return commands;
}

function generateFooter(): number[] {
  const commands: number[] = [];
  
  // Center align
  commands.push(0x1B, 0x61, 0x01);
  
  commands.push(0x0A);
  const thankYou = 'Thank you for choosing us!';
  for (const char of thankYou) commands.push(char.charCodeAt(0));
  commands.push(0x0A);
  commands.push(0x0A);
  
  // Cut paper
  commands.push(0x1D, 0x56, 0x00); // GS V 0 (full cut)
  
  return commands;
}

// Print ticket to thermal printer
export async function printTicket(data: TicketData): Promise<boolean> {
  try {
    const commands: number[] = [
      ...generateHeader(data.hospitalName),
      ...generateTicketContent(data),
      ...generateFooter()
    ];
    
    // Try to use WebUSB to connect to thermal printer
    const usb = navigator as any;
    if (usb && usb.usb) {
      const devices = await usb.usb.getDevices();
      const printer = devices.find((d: any) => 
        d.productName?.toLowerCase().includes('printer') ||
        d.manufacturerName?.toLowerCase().includes('thermal')
      );
      
      if (printer) {
        await printer.open();
        await printer.claimInterface(0);
        await printer.transferOut(1, new Uint8Array(commands));
        await printer.releaseInterface(0);
        await printer.close();
        return true;
      }
    }
    
    // Fallback: Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const html = generatePrintHTML(data);
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Print error:', error);
    // Fallback to window.print()
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const html = generatePrintHTML(data);
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
    return false;
  }
}

// Generate HTML for fallback printing
function generatePrintHTML(data: TicketData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Queue Token</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Courier New', monospace; 
      width: 58mm; 
      padding: 5mm;
      font-size: 12px;
    }
    .header { text-align: center; margin-bottom: 10px; }
    .hospital-name { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
    .token { 
      text-align: center; 
      font-size: 32px; 
      font-weight: bold; 
      margin: 15px 0;
      border: 2px dashed #333;
      padding: 10px;
    }
    .field { margin: 5px 0; }
    .label { font-weight: bold; }
    .footer { 
      text-align: center; 
      margin-top: 15px;
      font-size: 10px;
      border-top: 1px dashed #333;
      padding-top: 10px;
    }
    @media print {
      body { width: 58mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="hospital-name">${data.hospitalName}</div>
  </div>
  
  <div class="token">#${data.tokenNumber}</div>
  
  <div class="field">
    <span class="label">Patient:</span> ${data.patientName}
  </div>
  <div class="field">
    <span class="label">No:</span> ${data.patientNumber}
  </div>
  <div class="field">
    <span class="label">Dept:</span> ${data.department}
  </div>
  <div class="field">
    <span class="label">Doctor:</span> ${data.doctorName}
  </div>
  <div class="field">
    <span class="label">Type:</span> ${data.appointmentType}
  </div>
  <div class="field">
    <span class="label">Est. Wait:</span> ${data.estimatedWaitTime} mins
  </div>
  ${data.insuranceProvider ? `
  <div class="field">
    <span class="label">Insurance:</span> ${data.insuranceProvider} (${data.insuranceStatus})
  </div>
  ` : ''}
  
  <div class="footer">
    <p>Thank you for choosing us!</p>
    <p>${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;
}

// Print receipt
export async function printReceipt(data: ReceiptData): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Receipt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Courier New', monospace; 
      width: 58mm; 
      padding: 5mm;
      font-size: 11px;
    }
    .header { text-align: center; margin-bottom: 10px; }
    .hospital-name { font-weight: bold; font-size: 14px; }
    .receipt-no { font-size: 10px; margin-top: 5px; }
    .items { margin: 10px 0; }
    .item { display: flex; justify-content: space-between; }
    .total { 
      font-weight: bold; 
      font-size: 14px; 
      border-top: 1px dashed #333;
      padding-top: 10px;
      margin-top: 10px;
    }
    .footer { 
      text-align: center; 
      margin-top: 15px;
      font-size: 10px;
    }
    @media print { body { width: 58mm; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="hospital-name">${data.hospitalName}</div>
    <div class="receipt-no">Receipt: ${data.receiptNumber}</div>
  </div>
  
  <div class="items">
    ${data.items.map(item => `
      <div class="item">
        <span>${item.description}</span>
        <span>₦${item.amount.toFixed(2)}</span>
      </div>
    `).join('')}
  </div>
  
  <div class="total">
    <div class="item">
      <span>TOTAL</span>
      <span>₦${data.total.toFixed(2)}</span>
    </div>
  </div>
  
  <div class="item" style="margin-top: 5px;">
    <span>Payment:</span>
    <span>${data.paymentMethod}</span>
  </div>
  
  <div class="footer">
    <p>${new Date().toLocaleString()}</p>
    <p>Thank you!</p>
  </div>
</body>
</html>
  `;

  try {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Print error:', error);
    return false;
  }
}

export default {
  printTicket,
  printReceipt
};

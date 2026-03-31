import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const exportToCSV = (data: any[], filename: string, columns: { header: string; dataKey: string | ((row: any) => any) }[]) => {
    // Group records by date if they have a createdAt/date field
    // But since the request says "grouped by date", let's sort them by date before export
    const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date).getTime();
        const dateB = new Date(b.createdAt || b.date).getTime();
        return dateB - dateA;
    });

    const headers = columns.map((col) => col.header).join(',');
    const rows = sortedData.map((row) =>
        columns.map((col) => {
            const value = typeof col.dataKey === 'function' ? col.dataKey(row) : row[col.dataKey as string];
            const escapedValue = (value?.toString() || '').replace(/"/g, '""');
            return `"${escapedValue}"`;
        }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const exportToPDF = (data: any[], filename: string, title: string, columns: { header: string; dataKey: string | ((row: any) => any) }[]) => {
    const doc = new jsPDF();
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date).getTime();
        const dateB = new Date(b.createdAt || b.date).getTime();
        return dateB - dateA;
    });

    const tableColumn = columns.map((col) => col.header);
    const tableRows = sortedData.map((row) => 
        columns.map((col) => {
            return typeof col.dataKey === 'function' ? col.dataKey(row) : row[col.dataKey as string];
        })
    );

    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(11);
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 14, 22);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [14, 165, 233] }, // Tailwind sky-500
    });

    doc.save(`${filename}.pdf`);
};

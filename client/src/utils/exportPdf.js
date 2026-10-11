import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const FOREST = [10, 46, 36];
const GOLD = [245, 184, 61];
const MINT = [240, 246, 243];
const INK = [11, 26, 21];
const GREY = [110, 120, 115];
const RED = [185, 28, 28];

function prettyHeader(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

function formatCell(key, value) {
  if (value === null || value === undefined || value === "") return "-";
  if (key === "date" || key === "createdAt")
    return new Date(value).toLocaleDateString();
  if (typeof value === "number") return value.toLocaleString();
  const text = String(value).replace(/_/g, " ");
  return key === "paymentMethod"
    ? text.replace(/^./, (c) => c.toUpperCase())
    : text;
}

// Turns an array of report objects into { head, body, numericCols } for the table
export function rowsToTable(rows, hiddenKeys = []) {
  const first = rows[0] || {};
  const keys = Object.keys(first).filter((k) => !hiddenKeys.includes(k));
  return {
    head: keys.map(prettyHeader),
    body: rows.map((row) => keys.map((k) => formatCell(k, row[k]))),
    numericCols: keys
      .map((k, i) => (typeof first[k] === "number" ? i : -1))
      .filter((i) => i >= 0),
  };
}

export function exportPdf({
  title,
  subtitle,
  summary = [],
  head,
  body,
  numericCols = [],
  boldRows = [],
  preparedBy,
  filename,
}) {
  const doc = new jsPDF({
    orientation: head.length > 6 ? "landscape" : "portrait",
    unit: "pt",
    format: "a4",
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // --- Brand header ---
  doc.setFillColor(...FOREST);
  doc.rect(0, 0, pageWidth, 64, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 64, pageWidth, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("EthioFlow", margin, 40);
  const brandWidth = doc.getTextWidth("EthioFlow");
  doc.setTextColor(...GOLD);
  doc.text(" AI", margin + brandWidth, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 215, 208);
  doc.text("Business Report", pageWidth - margin, 38, { align: "right" });

  // --- Title block ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...INK);
  doc.text(title, margin, 102);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...GREY);
  doc.text(subtitle, margin, 119);
  doc.text(
    `Generated ${new Date().toLocaleString()}${preparedBy ? ` by ${preparedBy}` : ""}`,
    margin,
    133,
  );

  let y = 150;

  // --- Summary cards ---
  if (summary.length > 0) {
    const gap = 12;
    const cardWidth =
      (pageWidth - margin * 2 - gap * (summary.length - 1)) / summary.length;
    summary.forEach(([label, value], i) => {
      const x = margin + i * (cardWidth + gap);
      doc.setFillColor(...MINT);
      doc.roundedRect(x, y, cardWidth, 48, 6, 6, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GREY);
      doc.text(String(label).toUpperCase(), x + 12, y + 18);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...FOREST);
      doc.text(String(value), x + 12, y + 37);
    });
    y += 48 + 18;
  }

  // --- Table ---
  const columnStyles = {};
  numericCols.forEach((i) => {
    columnStyles[i] = { halign: "right" };
  });

  autoTable(doc, {
    startY: y,
    head: [head],
    body,
    margin: { left: margin, right: margin, bottom: 40 },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 6,
      textColor: INK,
      lineColor: [226, 237, 232],
      lineWidth: 0.4,
    },
    headStyles: { fillColor: FOREST, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: MINT },
    columnStyles,
    didParseCell: (data) => {
      if (data.section === "head" && numericCols.includes(data.column.index)) {
        data.cell.styles.halign = "right";
      }
      if (data.section === "body") {
        if (boldRows.includes(data.row.index))
          data.cell.styles.fontStyle = "bold";
        if (
          numericCols.includes(data.column.index) &&
          String(data.cell.raw).startsWith("-")
        ) {
          data.cell.styles.textColor = RED;
        }
      }
    },
  });

  // --- Footer on every page ---
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GREY);
    doc.text(
      `EthioFlow AI  |  Page ${i} of ${pages}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" },
    );
  }

  doc.save(filename);
}

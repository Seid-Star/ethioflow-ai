// Turns an array of flat objects into a downloadable CSV file, no library needed
export function exportCsv(filename, rows) {
  if (!rows || rows.length === 0) {
    alert("Nothing to export");
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const value = row[h] ?? "";
          const cell = String(value).replace(/"/g, '""');
          return cell.includes(",") ? `"${cell}"` : cell;
        })
        .join(","),
    ),
  ];

  const blob = new Blob([csvLines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

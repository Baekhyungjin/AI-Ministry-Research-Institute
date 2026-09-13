export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number | boolean | undefined>>) {
  const escape = (value: string | number | boolean | undefined) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = `\uFEFF${[headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

// views/reporting.js
document.addEventListener('DOMContentLoaded', () => {
  fetch('navbar.html')
    .then(res => res.text())
    .then(html => { document.getElementById('navbar').innerHTML = html; });
});

function generateReport(type, format) {
  const msgDiv = document.getElementById('report-message');
  msgDiv.textContent = 'Generating report...';
  fetch(`/api/reports/${type}?format=${format}`, {
    method: 'GET',
    headers: { 'Authorization': sessionStorage.getItem('user') }
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to generate report');
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      msgDiv.textContent = 'Report downloaded.';
    })
    .catch(err => {
      msgDiv.textContent = err.message;
    });
}

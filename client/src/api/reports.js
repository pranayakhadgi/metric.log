const BASE_URL = '/api';

export async function fetchReports() {
  const res = await fetch(`${BASE_URL}/reports`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error ${res.status}: Failed to fetch reports`);
  }
  const body = await res.json();
  return body.data;
}

export async function fetchSummary() {
  const res = await fetch(`${BASE_URL}/reports/summary`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error ${res.status}: Failed to fetch summary`);
  }
  return await res.json(); // returns { success, overall, by_site }
}

export async function fetchReportsByWeek(week) {
  const res = await fetch(`${BASE_URL}/reports/week/${week}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error ${res.status}: Failed to fetch reports for week ${week}`);
  }
  const body = await res.json();
  return body.data;
}

export async function submitReport(reportData) {
  const res = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      site_id: Number(reportData.site_id),
      week_number: Number(reportData.week_number),
      // David changes (start)
      team: reportData.team || null,
      // David changes (end)
      items_collected: reportData.items_collected === '' ? 0 : Number(reportData.items_collected),
      kits_assembled: reportData.kits_assembled === '' ? 0 : Number(reportData.kits_assembled),
      funds_raised: reportData.funds_raised === '' ? 0 : Number(reportData.funds_raised),
      volunteer_hours: reportData.volunteer_hours === '' ? 0 : Number(reportData.volunteer_hours),
      notes: reportData.notes || null,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error ${res.status}: Failed to submit report`);
  }
  return await res.json(); // returns { success, action, data }
}

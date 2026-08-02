/**
 * Utilities for AttendWise: Calculations and Export/Backup Services.
 */

// --- Mathematics & Calculation Engine ---

export function calculatePercent(present, total) {
  if (total <= 0) return 100;
  return Math.round((present / total) * 1000) / 10;
}

export function calculateSafeBunks(present, total, mandatory = 75) {
  if (total <= 0) return 0;
  const currentPercent = calculatePercent(present, total);
  if (currentPercent < mandatory) return 0;

  const limit = Math.floor((present * 100) / mandatory) - total;
  return Math.max(0, limit);
}

export function calculateRequiredClasses(present, total, mandatory = 75) {
  if (mandatory >= 100) return 0;
  const currentPercent = calculatePercent(present, total);
  if (currentPercent >= mandatory) return 0;

  const numerator = mandatory * total - 100 * present;
  const denominator = 100 - mandatory;
  const limit = Math.ceil(numerator / denominator);
  return Math.max(0, limit);
}

export function predictSemesterAttendance(present, total, expectedTotalClasses = 45) {
  if (total <= 0) return 100;
  if (total >= expectedTotalClasses) return calculatePercent(present, total);

  const rate = present / total;
  const remaining = expectedTotalClasses - total;
  const predictedPresent = present + rate * remaining;
  
  return calculatePercent(Math.round(predictedPresent), expectedTotalClasses);
}

export function calculateStreaks(attendanceLogs) {
  if (!attendanceLogs || attendanceLogs.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const sortedLogs = [...attendanceLogs]
    .filter(log => log.status === 'Present' || log.status === 'Absent')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentStreak = 0;
  let bestStreak = 0;
  let runningStreak = 0;

  for (let i = 0; i < sortedLogs.length; i++) {
    const log = sortedLogs[i];
    if (log.status === 'Present') {
      runningStreak++;
      if (runningStreak > bestStreak) {
        bestStreak = runningStreak;
      }
    } else if (log.status === 'Absent') {
      runningStreak = 0;
    }
  }

  let activeStreak = 0;
  for (let i = sortedLogs.length - 1; i >= 0; i--) {
    const log = sortedLogs[i];
    if (log.status === 'Present') {
      activeStreak++;
    } else if (log.status === 'Absent') {
      break;
    }
  }
  currentStreak = activeStreak;

  return { currentStreak, bestStreak };
}

// --- Data Export & Import Systems ---

export function exportToCSV(headers, rows, filename) {
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportBackup(state) {
  const backupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: state
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  
  link.setAttribute('href', url);
  link.setAttribute('download', `attendwise_backup_${dateStr}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed || parsed.version !== '1.0' || !parsed.data) {
          reject(new Error('Invalid backup file format.'));
          return;
        }
        resolve(parsed.data);
      } catch (err) {
        reject(new Error('Failed to parse JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error.'));
    reader.readAsText(file);
  });
}

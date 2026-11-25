import { SemesterType } from '@/types/Semester';

export interface GpaBackupV1 {
  version: '1.0';
  exportedAt: string;
  degree: string | null;
  semesters: SemesterType[];
}

export function downloadJsonBackup(semesters: SemesterType[]) {
  const backup: GpaBackupV1 = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    degree: localStorage.getItem('degree'),
    semesters,
  };

  const dateStr = new Date().toISOString().split('T')[0]; // e.g., 2026-11-25
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `fit-gpa-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function validateJsonBackup(rawText: string): GpaBackupV1 {
  const data = JSON.parse(rawText);

  if (!data || typeof data !== 'object' || data.version !== '1.0') {
    throw new Error('Unsupported or missing backup version.');
  }

  if (!Array.isArray(data.semesters)) {
    throw new Error('Invalid backup format: semesters must be a list.');
  }

  // Validate each semester and its modules
  for (const sem of data.semesters) {
    if (
      typeof sem.id !== 'number' ||
      typeof sem.level !== 'number' ||
      typeof sem.semester !== 'number' ||
      !Array.isArray(sem.modules)
    ) {
      throw new Error('Invalid semester structure found in backup file.');
    }
  }

  return data as GpaBackupV1;
}
import { SemesterType } from '@/types/Semester';
import { gradeToPoint } from '@/constants/grades';

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
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error('File is not valid JSON.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid backup format.');
  }

  const data = parsed as Record<string, unknown>;

  if (data.version !== '1.0') {
    throw new Error('Unsupported backup version.');
  }

  if (
    data.degree !== null &&
    data.degree !== undefined &&
    typeof data.degree !== 'string'
  ) {
    throw new Error('Invalid degree metadata in backup.');
  }

  if (!Array.isArray(data.semesters)) {
    throw new Error('Backup is missing a valid semesters list.');
  }

  for (const sem of data.semesters) {
    if (!sem || typeof sem !== 'object') {
      throw new Error('Backup contains an invalid semester entry.');
    }

    const s = sem as Record<string, unknown>;
    if (
      typeof s.id !== 'number' ||
      typeof s.level !== 'number' ||
      typeof s.semester !== 'number' ||
      !Array.isArray(s.modules)
    ) {
      throw new Error('Backup semester fields are corrupted.');
    }

    for (const mod of s.modules) {
      if (!mod || typeof mod !== 'object') {
        throw new Error('Backup contains an invalid module entry.');
      }

      const m = mod as Record<string, unknown>;

      if (typeof m.name !== 'string') {
        throw new Error('Every module must have a valid name.');
      }

      if (typeof m.credits !== 'string' && typeof m.credits !== 'number') {
        throw new Error(`Invalid credits value for module "${m.name}".`);
      }

      const creditsStr = String(m.credits).trim();
      const creditsNum = Number(creditsStr);

      if (
        creditsStr !== '' &&
        (!Number.isFinite(creditsNum) || creditsNum < 0)
      ) {
        throw new Error(`Invalid credits value for module "${m.name}".`);
      }

      // Normalize numeric credits (e.g. 3 -> "3") to match ModuleType
      m.credits = creditsStr;

      if (
        typeof m.grade !== 'string' ||
        (m.grade !== '' &&
          !Object.prototype.hasOwnProperty.call(gradeToPoint, m.grade))
      ) {
        throw new Error(
          `Invalid grade "${String(m.grade)}" for module "${m.name}".`
        );
      }

      if (m.gpa !== 'GPA' && m.gpa !== 'NGPA') {
        throw new Error(`Invalid GPA category for module "${m.name}".`);
      }
    }
  }

  return parsed as GpaBackupV1;
}
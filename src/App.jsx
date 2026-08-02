import React, { useState, useEffect } from 'react';
import { useAttendance, AttendanceProvider } from './AttendanceContext';
import {
  calculatePercent,
  calculateSafeBunks,
  calculateRequiredClasses,
  predictSemesterAttendance,
  calculateStreaks,
  exportToCSV,
  exportBackup,
  importBackup
} from './utils';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Calendar as CalendarIcon,
  History as HistoryIcon,
  BarChart3,
  Settings as SettingsIcon,
  Sparkles,
  Sun,
  Moon,
  X,
  Plus,
  Edit2,
  Trash2,
  User,
  MapPin,
  Award,
  Percent,
  Clock,
  AlertCircle,
  Flame,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  Download,
  Database,
  FileText,
  Printer,
  Upload,
  RefreshCcw,
  BarChart
} from 'lucide-react';

// ============================================================================
// CORE UI COMPONENTS (CircularProgress, ThemeToggle, Modal, Navigation)
// ============================================================================

function CircularProgress({ percentage, size = 180, strokeWidth = 14, targetPercentage = 75, showLabel = true }) {
  const [offset, setOffset] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    const clamped = Math.min(Math.max(percentage, 0), 100);
    const progressOffset = circumference - (clamped / 100) * circumference;
    const timer = setTimeout(() => setOffset(progressOffset), 100);
    return () => clearTimeout(timer);
  }, [percentage, circumference]);

  let color = 'var(--danger)';
  if (percentage >= 85) color = 'var(--success)';
  else if (percentage >= targetPercentage) color = 'var(--warning)';

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border) / 0.6)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <span style={{ fontSize: `${size * 0.16}px`, fontWeight: 800, color: 'hsl(var(--text))', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {percentage.toFixed(1)}%
        </span>
        {showLabel && (
          <span style={{ fontSize: `${size * 0.065}px`, fontWeight: 600, color: 'hsl(var(--text-muted))', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Overall
          </span>
        )}
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { settings, updateSettings } = useAttendance();
  const isDark = settings.theme === 'dark';
  const toggleTheme = () => updateSettings({ theme: isDark ? 'light' : 'dark' });

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-secondary"
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      <div style={{ transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)', opacity: isDark ? 1 : 0, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'absolute', display: 'flex' }}>
        <Sun size={20} color="#f59e0b" style={{ fill: '#f59e0b' }} />
      </div>
      <div style={{ transform: isDark ? 'rotate(-90deg) scale(0)' : 'rotate(0deg) scale(1)', opacity: isDark ? 0 : 1, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'absolute', display: 'flex' }}>
        <Moon size={20} color="#6366f1" style={{ fill: '#6366f1' }} />
      </div>
    </button>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))', display: 'flex', padding: '4px', borderRadius: '50%', backgroundColor: 'hsl(var(--border) / 0.3)', transition: 'background-color 0.2s' }}>
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'history', label: 'History Logs', icon: HistoryIcon },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

function Navigation({ activeTab, setActiveTab }) {
  const { profile } = useAttendance();

  return (
    <>
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
          <div className="grad-primary" style={{ padding: '0.5rem', borderRadius: '12px', display: 'flex', color: 'white' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(var(--bg-deg), hsl(var(--text)), hsl(var(--text-muted)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AttendWise
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>v1.0 (PWA)</span>
          </div>
        </div>

        {profile.name && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '2rem', padding: '0.75rem 1rem', background: 'hsl(var(--border) / 0.3)', borderRadius: '12px', border: '1px solid hsl(var(--border) / 0.5)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.name}</span>
            <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.branch || 'Student'}</span>
          </div>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? 'hsl(var(--primary) / 0.12)' : 'transparent',
                  color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  width: '100%'
                }}
                className={isActive ? '' : 'nav-hover-effect'}
              >
                <Icon size={18} style={{ strokeWidth: isActive ? 2.5 : 2 }} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.2rem',
                background: 'none',
                border: 'none',
                color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                fontSize: '0.65rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                flex: 1,
                height: '100%'
              }}
            >
              <Icon size={18} style={{ strokeWidth: isActive ? 2.5 : 2 }} />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .nav-hover-effect:hover {
          background-color: hsl(var(--border) / 0.2);
          color: hsl(var(--text)) !important;
        }
      `}} />
    </>
  );
}

// ============================================================================
// INDIVIDUAL PAGES (Dashboard, Subjects, Timetable, Calendar, History, Analytics, Settings)
// ============================================================================

function Dashboard() {
  const { profile, settings, subjects, timetable, attendance, markAttendance } = useAttendance();
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = days[today.getDay()];

  const subjectStats = subjects.map(sub => {
    const logs = attendance.filter(a => a.subjectId === sub.id);
    const present = logs.filter(a => a.status === 'Present').length;
    const absent = logs.filter(a => a.status === 'Absent').length;
    const total = present + absent;
    const percent = calculatePercent(present, total);
    return {
      ...sub, present, absent, total, percent,
      safeBunks: calculateSafeBunks(present, total, sub.mandatoryPercentage),
      requiredClasses: calculateRequiredClasses(present, total, sub.mandatoryPercentage)
    };
  });

  const overallPresent = subjectStats.reduce((acc, curr) => acc + curr.present, 0);
  const overallAbsent = subjectStats.reduce((acc, curr) => acc + curr.absent, 0);
  const overallTotal = overallPresent + overallAbsent;
  const overallPercent = calculatePercent(overallPresent, overallTotal);
  const { currentStreak, bestStreak } = calculateStreaks(attendance);

  const todaysSchedule = timetable.filter(t => t.day === currentDayName).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const criticalSubjects = subjectStats.filter(s => s.total > 0 && s.percent < s.mandatoryPercentage);
  const warningSubjects = subjectStats.filter(s => s.total > 0 && s.percent >= s.mandatoryPercentage && s.percent < s.mandatoryPercentage + 5);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Hello, {profile.name || 'Student'} <Sparkles size={24} color="hsl(var(--primary))" />
          </h1>
          <p>{profile.college || 'Smart Attendance Dashboard'} • {profile.semester || 'Academic Term'}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.25rem', borderRadius: '15px' }}>
            <Flame size={20} color="#f97316" style={{ fill: '#f97316' }} />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', fontWeight: 600, textTransform: 'uppercase' }}>Streak</div>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>{currentStreak} Classes</div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.25rem', borderRadius: '15px' }}>
            <TrendingUp size={20} color="hsl(var(--primary))" />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', fontWeight: 600, textTransform: 'uppercase' }}>Best</div>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>{bestStreak} Classes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="grad-primary" style={{ width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Total Lectures</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{overallTotal}</div>
            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{overallPresent} Present • {overallAbsent} Absent</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="grad-success" style={{ width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Total Missed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: overallAbsent > 5 ? 'hsl(var(--danger))' : 'inherit' }}>{overallAbsent}</div>
            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Avoid bunking if critical</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="grad-warning" style={{ width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Projected Term %</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {overallTotal > 0 ? calculatePercent(overallPresent + (subjects.length * 5), overallTotal + (subjects.length * 6)).toFixed(1) : '100'}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Based on active trends</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Today's Classes</h3>
                <p style={{ fontSize: '0.85rem' }}>{currentDayName}, {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
              </div>
              <span className="grad-primary" style={{ color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                {todaysSchedule.length} Classes
              </span>
            </div>
            {todaysSchedule.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                <CheckCircle2 size={40} style={{ margin: '0 auto 1rem auto', display: 'block', color: 'hsl(var(--success))' }} />
                <p style={{ fontWeight: 600 }}>No classes scheduled for today!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {todaysSchedule.map((slot) => {
                  const sub = subjects.find(s => s.id === slot.subjectId);
                  if (!sub) return null;
                  const log = attendance.find(a => a.subjectId === sub.id && a.date === dateStr);
                  const isPresent = log?.status === 'Present';
                  const isAbsent = log?.status === 'Absent';
                  return (
                    <div key={slot.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '16px', background: 'hsl(var(--surface))', borderLeft: `5px solid ${sub.color || 'hsl(var(--primary))'}`, border: '1px solid hsl(var(--border) / 0.5)', borderLeftWidth: '5px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} /> {slot.startTime} - {slot.endTime}
                          </span>
                          {slot.room && <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', background: 'hsl(var(--border) / 0.4)', padding: '2px 8px', borderRadius: '4px' }}>Room {slot.room}</span>}
                        </div>
                        <h4 style={{ fontWeight: 700, fontSize: '1.05rem', margin: '4px 0 2px 0' }}>{sub.name}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>{sub.faculty}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                        <button onClick={() => markAttendance(sub.id, dateStr, 'Present')} style={{ width: '40px', height: '40px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isPresent ? 'hsl(var(--success))' : 'hsl(var(--border) / 0.4)', color: isPresent ? 'white' : 'hsl(var(--text))', transition: 'all 0.2s' }}><Check size={18} /></button>
                        <button onClick={() => markAttendance(sub.id, dateStr, 'Absent')} style={{ width: '40px', height: '40px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isAbsent ? 'hsl(var(--danger))' : 'hsl(var(--border) / 0.4)', color: isAbsent ? 'white' : 'hsl(var(--text))', transition: 'all 0.2s' }}><X size={18} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} color="hsl(var(--warning))" /> Attendance Warnings & Analysis
            </h3>
            {criticalSubjects.length === 0 && warningSubjects.length === 0 ? (
              <div style={{ color: 'hsl(var(--success))', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                <CheckCircle2 size={18} />
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Excellent! All active subjects are above the mandatory percentage thresholds.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {criticalSubjects.map(sub => (
                  <div key={sub.id} style={{ background: 'hsl(var(--danger-glow))', border: '1px solid hsl(var(--danger) / 0.3)', padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'hsl(var(--danger))', fontSize: '1rem' }}>⚠ CRITICAL: {sub.name}</span>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'hsl(var(--danger))' }}>{sub.percent.toFixed(1)}%</span>
                    </div>
                    <p style={{ fontSize: '0.85rem' }}>Your attendance has fallen below <strong>{sub.mandatoryPercentage}%</strong>.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '6px 12px', background: 'hsl(var(--surface-card))', borderRadius: '8px', border: '1px solid hsl(var(--danger) / 0.15)', fontSize: '0.85rem' }}>
                      <AlertTriangle size={14} color="hsl(var(--danger))" />
                      <span>Action: Attend next <strong>{sub.requiredClasses}</strong> classes continuously to recover.</span>
                    </div>
                  </div>
                ))}
                {warningSubjects.map(sub => (
                  <div key={sub.id} style={{ background: 'hsl(var(--warning-glow))', border: '1px solid hsl(var(--warning) / 0.3)', padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'hsl(var(--warning))', fontSize: '1rem' }}>⚠ WARNING: {sub.name}</span>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'hsl(var(--warning))' }}>{sub.percent.toFixed(1)}%</span>
                    </div>
                    <p style={{ fontSize: '0.85rem' }}>You are close to the limit of <strong>{sub.mandatoryPercentage}%</strong>.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '6px 12px', background: 'hsl(var(--surface-card))', borderRadius: '8px', border: '1px solid hsl(var(--warning) / 0.15)', fontSize: '0.85rem' }}>
                      <CheckCircle2 size={14} color="hsl(var(--warning))" />
                      <span>Bunk limit: You can bunk only <strong>{sub.safeBunks}</strong> classes safely.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Overall Attendance</h3>
            <CircularProgress percentage={overallTotal > 0 ? overallPercent : 100} size={190} strokeWidth={14} targetPercentage={settings.defaultMandatory} />
            <p style={{ fontSize: '0.85rem', marginTop: '1.5rem', maxWidth: '280px' }}>
              {overallTotal > 0 ? `You have attended ${overallPresent} out of ${overallTotal} classes. Keep it up!` : 'No logs yet.'}
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Courses Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {subjectStats.map(sub => (
                <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '12px', background: 'hsl(var(--surface))', fontSize: '0.9rem', border: '1px solid hsl(var(--border) / 0.5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden', marginRight: '0.5rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: sub.color || 'white', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{sub.present}/{sub.total}</span>
                    <span style={{ fontWeight: 800, color: sub.total === 0 ? 'hsl(var(--text-muted))' : sub.percent < sub.mandatoryPercentage ? 'hsl(var(--danger))' : 'hsl(var(--success))' }}>
                      {sub.total === 0 ? '—' : `${sub.percent.toFixed(0)}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Subjects() {
  const { subjects, attendance, addSubject, updateSubject, deleteSubject } = useAttendance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const [name, setName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [room, setRoom] = useState('');
  const [credits, setCredits] = useState(3);
  const [mandatory, setMandatory] = useState(75);
  const [color, setColor] = useState('#6366f1');

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];

  const openAddModal = () => {
    setEditingSub(null); setName(''); setFaculty(''); setRoom(''); setCredits(3); setMandatory(75); setColor(COLORS[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (sub) => {
    setEditingSub(sub); setName(sub.name); setFaculty(sub.faculty || ''); setRoom(sub.room || ''); setCredits(sub.credits || 3); setMandatory(sub.mandatoryPercentage || 75); setColor(sub.color || COLORS[0]);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const data = { name, faculty, room, credits: Number(credits), mandatoryPercentage: Number(mandatory), color };
    if (editingSub) updateSubject(editingSub.id, data);
    else addSubject(data);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Subject Management</h1>
          <p>Add and configure your academic courses and targets</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={18} /> Add Subject
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {subjects.map((sub) => {
          const logs = attendance.filter(a => a.subjectId === sub.id);
          const present = logs.filter(a => a.status === 'Present').length;
          const absent = logs.filter(a => a.status === 'Absent').length;
          const total = present + absent;
          const percent = calculatePercent(present, total);
          const mandatoryTarget = sub.mandatoryPercentage || 75;
          const isBelow = total > 0 && percent < mandatoryTarget;
          const safeBunks = calculateSafeBunks(present, total, mandatoryTarget);
          const required = calculateRequiredClasses(present, total, mandatoryTarget);

          return (
            <div key={sub.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem', borderLeft: `6px solid ${sub.color || 'hsl(var(--primary))'}`, borderLeftWidth: '6px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.2rem', lineHeight: 1.3 }}>{sub.name}</h3>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', backgroundColor: total === 0 ? 'hsl(var(--border) / 0.5)' : isBelow ? 'hsl(var(--danger) / 0.15)' : 'hsl(var(--success) / 0.15)', color: total === 0 ? 'hsl(var(--text-muted))' : isBelow ? 'hsl(var(--danger))' : 'hsl(var(--success))', flexShrink: 0 }}>
                    {total === 0 ? 'No Data' : `${percent.toFixed(1)}%`}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem' }}>
                  {sub.faculty && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}><User size={14} /> <span>{sub.faculty}</span></div>}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {sub.room && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}><MapPin size={14} /> <span>Room {sub.room}</span></div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}><Award size={14} /> <span>{sub.credits} Credits</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}><Percent size={14} /> <span>Goal {mandatoryTarget}%</span></div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '4px' }}>
                  <span>Progress Ratio</span>
                  <span>{present} Present / {total} Total</span>
                </div>
                <div style={{ height: '8px', background: 'hsl(var(--border) / 0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${total > 0 ? Math.min(percent, 100) : 0}%`, backgroundColor: sub.color || 'hsl(var(--primary))', borderRadius: '4px', transition: 'width 0.5s ease-out' }} />
                </div>
              </div>

              <div style={{ background: 'hsl(var(--surface) / 0.5)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.85rem', border: '1px solid hsl(var(--border) / 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {total === 0 ? <span style={{ color: 'hsl(var(--text-muted))' }}>No attendance logs yet.</span> : isBelow ? <span style={{ color: 'hsl(var(--danger))' }}>Need <strong>{required}</strong> classes continuously to recover.</span> : <span style={{ color: 'hsl(var(--success))' }}>You can bunk <strong>{safeBunks}</strong> classes safely.</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid hsl(var(--border) / 0.3)', paddingTop: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => openEditModal(sub)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}><Edit2 size={14} /> Edit</button>
                <button className="btn btn-danger" onClick={() => { if(window.confirm(`Delete ${sub.name}?`)) deleteSubject(sub.id); }} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSub ? 'Edit Subject' : 'Add Subject'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group"><label className="form-label">Subject Name *</label><input type="text" className="form-input" placeholder="e.g. Operating Systems" required value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Faculty</label><input type="text" className="form-input" placeholder="Faculty Name" value={faculty} onChange={e => setFaculty(e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Room</label><input type="text" className="form-input" placeholder="Room Number" value={room} onChange={e => setRoom(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Credits</label><input type="number" className="form-input" value={credits} onChange={e => setCredits(e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Mandatory Attendance (%)</label><input type="number" className="form-input" value={mandatory} onChange={e => setMandatory(e.target.value)} /></div>
          <div className="form-group">
            <label className="form-label">Color tag</label>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: c, border: color === c ? '3px solid hsl(var(--text))' : '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Timetable() {
  const { subjects, timetable, addTimetableSlot, updateTimetableSlot, deleteTimetableSlot, resetToDefault } = useAttendance();
  const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[today.getDay()];
  const defaultDay = WEEKDAYS.includes(todayName) ? todayName : 'Monday';

  const [activeDay, setActiveDay] = useState(defaultDay);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  const [day, setDay] = useState('Monday');
  const [subjectId, setSubjectId] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('');

  const openAddModal = () => {
    setEditingSlot(null); setDay(activeDay); setSubjectId(subjects[0]?.id || ''); setStartTime('09:00'); setEndTime('10:00'); setRoom('');
    setIsModalOpen(true);
  };

  const openEditModal = (slot) => {
    setEditingSlot(slot); setDay(slot.day); setSubjectId(slot.subjectId); setStartTime(slot.startTime); setEndTime(slot.endTime); setRoom(slot.room || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subjectId) return;
    if (startTime >= endTime) { alert("Invalid Time range!"); return; }
    const data = { day, subjectId, startTime, endTime, room };
    if (editingSlot) updateTimetableSlot(editingSlot.id, data);
    else addTimetableSlot(data);
    setIsModalOpen(false);
  };

  const activeSlots = timetable.filter(t => t.day === activeDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Weekly Timetable</h1>
          <p>Organize your weekly course schedule</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} disabled={subjects.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={18} /> Add Class Slot
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid hsl(var(--border))' }}>
        {WEEKDAYS.map(w => (
          <button key={w} onClick={() => setActiveDay(w)} style={{ padding: '0.6rem 1.25rem', borderRadius: '25px', cursor: 'pointer', fontWeight: w === activeDay ? 700 : 500, backgroundColor: w === activeDay ? 'hsl(var(--primary))' : 'hsl(var(--surface))', color: w === activeDay ? 'white' : 'hsl(var(--text-muted))', border: w === todayName && w !== activeDay ? '1px dashed hsl(var(--primary))' : '1px solid transparent' }}>
            {w}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {activeSlots.map((slot) => {
          const sub = subjects.find(s => s.id === slot.subjectId);
          if (!sub) return null;
          return (
            <div key={slot.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderLeft: `6px solid ${sub.color || 'hsl(var(--primary))'}`, borderLeftWidth: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '130px' }}><Clock size={16} color="hsl(var(--primary))" /> <span style={{ fontWeight: 700 }}>{slot.startTime} - {slot.endTime}</span></div>
                <div><h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{sub.name}</h3><span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>{sub.faculty}</span></div>
                {slot.room && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'hsl(var(--text-muted))', backgroundColor: 'hsl(var(--border) / 0.4)', padding: '4px 10px', borderRadius: '8px' }}><MapPin size={14} /> <span>Room {slot.room}</span></div>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={() => openEditModal(slot)} style={{ padding: '0.4rem 0.6rem', borderRadius: '8px' }}><Edit2 size={14} /></button>
                <button className="btn btn-danger" onClick={() => { if(window.confirm('Delete slot?')) deleteTimetableSlot(slot.id); }} style={{ padding: '0.4rem 0.6rem', borderRadius: '8px' }}><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
        {activeSlots.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'hsl(var(--text-muted))' }}>
            <CalendarDays size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            <h3>No Scheduled Classes</h3>
            {timetable.length === 0 && <button className="btn btn-secondary" onClick={resetToDefault} style={{ marginTop: '1rem' }}>Load Demo Data</button>}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSlot ? 'Edit Class Slot' : 'Add Class Slot'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group"><label className="form-label">Day</label><select className="form-input" value={day} onChange={e => setDay(e.target.value)}>{WEEKDAYS.map(w => <option key={w} value={w}>{w}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Subject *</label><select className="form-input" value={subjectId} onChange={e => setSubjectId(e.target.value)} required><option value="" disabled>Select Subject</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Start Time</label><input type="time" className="form-input" value={startTime} onChange={e => setStartTime(e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">End Time</label><input type="time" className="form-input" value={endTime} onChange={e => setEndTime(e.target.value)} required /></div>
          </div>
          <div className="form-group"><label className="form-label">Room</label><input type="text" className="form-input" placeholder="LH-201" value={room} onChange={e => setRoom(e.target.value)} /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}><button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
        </form>
      </Modal>
    </div>
  );
}

function Calendar() {
  const { subjects, timetable, attendance, markAttendance } = useAttendance();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remarksState, setRemarksState] = useState({});

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const getDateStatus = (dateStr, dayOfWeekName) => {
    const dailySlots = timetable.filter(t => t.day === dayOfWeekName);
    if (dailySlots.length === 0) return 'none';
    const logs = attendance.filter(a => a.date === dateStr);
    if (logs.length === 0) return 'unmarked';
    if (logs.some(a => a.status === 'Absent')) return 'absent';
    if (logs.some(a => a.status === 'Present')) return 'present';
    return 'cancelled';
  };

  const handleDayClick = (dayNum) => {
    const dateObj = new Date(year, month, dayNum);
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    const dailyRemarks = {};
    attendance.filter(a => a.date === dateStr).forEach(l => { dailyRemarks[l.subjectId] = l.remarks || ''; });
    setRemarksState(dailyRemarks);
    setIsModalOpen(true);
  };

  const calendarCells = Array(firstDayIndex).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  
  const getSelectedDetails = () => {
    if (!selectedDate) return { formatted: '', dayName: '', classes: [] };
    const dateObj = new Date(selectedDate);
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];
    return {
      formatted: dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }),
      dayName,
      classes: timetable.filter(t => t.day === dayName).sort((a,b) => a.startTime.localeCompare(b.startTime))
    };
  };

  const { formatted: selFormatted, dayName: selDayName, classes: selClasses } = getSelectedDetails();

  return (
    <div>
      <h1>Attendance Calendar</h1>
      <p>Log past attendance logs dynamically on the grid</p>
      
      <div className="card" style={{ padding: '1.5rem', maxWidth: '640px', margin: '1.5rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>{['January','February','March','April','May','June','July','August','September','October','November','December'][month]} {year}</h3>
          <div>
            <button className="btn btn-secondary" onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{ padding: '0.4rem', borderRadius: '50%' }}><ChevronLeft size={16} /></button>
            <button className="btn btn-secondary" onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{ padding: '0.4rem', borderRadius: '50%' }}><ChevronRight size={16} /></button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w => <div key={w}>{w}</div>)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {calendarCells.map((dayNum, idx) => {
            if (dayNum === null) return <div key={`empty-${idx}`} />;
            const cellDateObj = new Date(year, month, dayNum);
            const cellDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][cellDateObj.getDay()];
            const cellDateStr = `${cellDateObj.getFullYear()}-${String(cellDateObj.getMonth()+1).padStart(2,'0')}-${String(cellDateObj.getDate()).padStart(2,'0')}`;
            const isToday = new Date().toISOString().split('T')[0] === cellDateStr;
            const status = getDateStatus(cellDateStr, cellDayName);

            let color = 'transparent';
            if (status === 'present') color = 'hsl(var(--success))';
            else if (status === 'absent') color = 'hsl(var(--danger))';
            else if (status === 'cancelled') color = 'hsl(var(--text-muted))';
            else if (status === 'unmarked') color = 'hsl(var(--warning) / 0.5)';

            return (
              <button key={idx} onClick={() => handleDayClick(dayNum)} style={{ aspectRatio: '1.1', background: isToday ? 'hsl(var(--primary) / 0.15)' : 'hsl(var(--surface))', border: isToday ? '2px solid hsl(var(--primary))' : '1px solid hsl(var(--border) / 0.4)', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '6px' }}>
                <span style={{ fontWeight: isToday ? 800 : 500 }}>{dayNum}</span>
                {status !== 'none' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }} />}
              </button>
            );
          })}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Log: ${selFormatted}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {selClasses.length === 0 ? <p>No classes scheduled for {selDayName}</p> : (
            selClasses.map(slot => {
              const sub = subjects.find(s => s.id === slot.subjectId);
              if (!sub) return null;
              const log = attendance.find(a => a.subjectId === sub.id && a.date === selectedDate);
              const currentStatus = log?.status || 'Unmarked';

              return (
                <div key={slot.id} style={{ border: '1px solid hsl(var(--border))', borderRadius: '12px', padding: '1rem', background: 'hsl(var(--surface))', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h4>{sub.name}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                    {['Present', 'Absent', 'Cancelled'].map(st => (
                      <button key={st} onClick={() => markAttendance(sub.id, selectedDate, st, remarksState[sub.id] || '')} style={{ padding: '6px 0', borderRadius: '8px', cursor: 'pointer', backgroundColor: currentStatus === st ? st === 'Present' ? 'hsl(var(--success))' : st === 'Absent' ? 'hsl(var(--danger))' : 'hsl(var(--text-muted))' : 'hsl(var(--border) / 0.4)', color: currentStatus === st ? 'white' : 'inherit', border: 'none', fontWeight: 600 }}>{st}</button>
                    ))}
                  </div>
                  <input type="text" placeholder="Remarks" className="form-input" value={remarksState[sub.id] || ''} onChange={e => { setRemarksState({...remarksState, [sub.id]: e.target.value}); if(log) markAttendance(sub.id, selectedDate, log.status, e.target.value); }} />
                </div>
              );
            })
          )}
          <button className="btn btn-primary" onClick={() => setIsModalOpen(false)}>Done</button>
        </div>
      </Modal>
    </div>
  );
}

function History() {
  const { subjects, attendance, markAttendance, deleteAttendanceLog, updateAttendanceLog } = useAttendance();
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [subId, setSubId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Present');
  const [remarks, setRemarks] = useState('');

  const openAddModal = () => {
    setEditingLog(null); setSubId(subjects[0]?.id || ''); setDate(new Date().toISOString().split('T')[0]); setStatus('Present'); setRemarks('');
    setIsModalOpen(true);
  };

  const openEditModal = (log) => {
    setEditingLog(log); setSubId(log.subjectId); setDate(log.date); setStatus(log.status); setRemarks(log.remarks || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subId || !date) return;
    if (editingLog) updateAttendanceLog(editingLog.id, { subjectId: subId, date, status, remarks });
    else markAttendance(subId, date, status, remarks);
    setIsModalOpen(false);
  };

  const filteredLogs = attendance.filter(log => {
    const sub = subjects.find(s => s.id === log.subjectId);
    const subName = sub ? sub.name.toLowerCase() : '';
    const matchesQuery = log.date.includes(search) || log.remarks?.toLowerCase().includes(search.toLowerCase()) || subName.includes(search.toLowerCase());
    return matchesQuery && (subjectFilter === 'all' || log.subjectId === subjectFilter) && (statusFilter === 'all' || log.status === statusFilter);
  }).sort((a,b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Attendance History</h1>
          <p>Search and audit your daily logs</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => exportToCSV(['Date', 'Subject', 'Status', 'Remarks'], filteredLogs.map(l => [l.date, subjects.find(s => s.id === l.subjectId)?.name || '', l.status, l.remarks || '']), 'history.csv')}><Download size={16} /> Export CSV</button>
          <button className="btn btn-primary" onClick={openAddModal} disabled={subjects.length === 0}><Plus size={16} /> Add Log</button>
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <input type="text" placeholder="Search..." className="form-input" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-input" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}><option value="all">All Subjects</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All Statuses</option><option value="Present">Present</option><option value="Absent">Absent</option><option value="Cancelled">Cancelled</option></select>
      </div>

      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr><th>Date</th><th>Subject</th><th>Status</th><th>Remarks</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => {
              const sub = subjects.find(s => s.id === log.subjectId);
              return (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600 }}>{log.date}</td>
                  <td>{sub ? sub.name : 'Unknown'}</td>
                  <td style={{ fontWeight: 700, color: log.status === 'Present' ? 'var(--success)' : log.status === 'Absent' ? 'var(--danger)' : 'inherit' }}>{log.status}</td>
                  <td>{log.remarks}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => openEditModal(log)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', marginRight: '0.5rem' }}><Edit size={14} /></button>
                    <button onClick={() => { if(window.confirm('Delete log?')) deleteAttendanceLog(log.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--danger))' }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLog ? 'Edit Log' : 'Create Log'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group"><label className="form-label">Subject</label><select className="form-input" value={subId} onChange={e => setSubId(e.target.value)} required>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} required /></div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {['Present', 'Absent', 'Cancelled'].map(st => (
                <button key={st} type="button" onClick={() => setStatus(st)} style={{ padding: '8px 0', borderRadius: '8px', cursor: 'pointer', backgroundColor: status === st ? 'hsl(var(--primary))' : 'hsl(var(--border) / 0.4)', color: status === st ? 'white' : 'inherit', border: 'none', fontWeight: 600 }}>{st}</button>
              ))}
            </div>
          </div>
          <div className="form-group"><label className="form-label">Remarks</label><input type="text" className="form-input" value={remarks} onChange={e => setRemarks(e.target.value)} /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}><button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
        </form>
      </Modal>
    </div>
  );
}

function Analytics() {
  const { subjects, attendance, settings } = useAttendance();

  const subjectStats = subjects.map(sub => {
    const logs = attendance.filter(a => a.subjectId === sub.id);
    const present = logs.filter(a => a.status === 'Present').length;
    const absent = logs.filter(a => a.status === 'Absent').length;
    const total = present + absent;
    return {
      name: sub.name,
      shortName: sub.name.split(' ').map(w => w[0]).join(''),
      percent: calculatePercent(present, total),
      color: sub.color
    };
  });

  const getWeeklyTrend = () => {
    const trend = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const start = new Date(today); start.setDate(today.getDate() - (i * 7 + 6)); start.setHours(0,0,0,0);
      const end = new Date(today); end.setDate(today.getDate() - (i * 7)); end.setHours(23,59,59,999);
      const weeklyLogs = attendance.filter(a => { const d = new Date(a.date); return d >= start && d <= end; });
      const present = weeklyLogs.filter(a => a.status === 'Present').length;
      const absent = weeklyLogs.filter(a => a.status === 'Absent').length;
      const total = present + absent;
      trend.push({ label: i === 0 ? 'This Week' : `${i}w ago`, percent: total > 0 ? calculatePercent(present, total) : 100 });
    }
    return trend;
  };

  const weeklyTrendData = getWeeklyTrend();

  const getHeatmapGrid = () => {
    const grid = [];
    const today = new Date();
    const currentDayIdx = today.getDay();
    const startDate = new Date(today); startDate.setDate(today.getDate() - (13 * 7 + currentDayIdx)); startDate.setHours(0,0,0,0);

    for (let col = 0; col < 14; col++) {
      const week = [];
      for (let row = 0; row < 7; row++) {
        const cellDate = new Date(startDate); cellDate.setDate(startDate.getDate() + (col * 7 + row));
        const dateStr = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
        const dayLogs = attendance.filter(a => a.date === dateStr);
        const present = dayLogs.filter(a => a.status === 'Present').length;
        const absent = dayLogs.filter(a => a.status === 'Absent').length;
        
        let level = 'empty';
        if (present + absent > 0) {
          if (absent > 0) level = 'absent';
          else if (present === 1) level = 'low';
          else if (present >= 2) level = 'high';
        }
        week.push({ level, tooltip: `${cellDate.toLocaleDateString(undefined, {month:'short', day:'numeric'})}: ${present} Pres, ${absent} Abs` });
      }
      grid.push(week);
    }
    return grid;
  };

  const heatmapGrid = getHeatmapGrid();

  return (
    <div>
      <h1>Analytics & Charts</h1>
      <p>Visual performance metrics and schedules</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3>Subject Comparison</h3>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '2.5rem', paddingLeft: '1.5rem', borderLeft: '1px solid hsl(var(--border))', borderBottom: '1px solid hsl(var(--border))', marginTop: '1.5rem' }}>
            <div style={{ position: 'absolute', left: '-25px', top: '0', bottom: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textAlign: 'right' }}>
              <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: `calc(2.5rem + ${(settings.defaultMandatory / 100) * 100}%)`, borderBottom: '2px dashed hsl(var(--danger))', pointerEvents: 'none' }}>
              <span style={{ fontSize: '0.65rem', color: 'hsl(var(--danger))', background: 'hsl(var(--surface-card))', padding: '0 4px', fontWeight: 700 }}>Target ({settings.defaultMandatory}%)</span>
            </div>
            {subjectStats.map((sub, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                <div style={{ height: `${sub.percent}%`, backgroundColor: sub.color || 'hsl(var(--primary))', width: '32px', borderRadius: '8px 8px 0 0' }} title={`${sub.name}: ${sub.percent}%`} />
                <span style={{ position: 'absolute', bottom: '-2.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}>{sub.shortName}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3>Weekly Trend</h3>
          <div style={{ flex: 1, position: 'relative', paddingLeft: '1.5rem', borderLeft: '1px solid hsl(var(--border))', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '1.5rem', marginTop: '1.5rem' }}>
            <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              {(() => {
                const points = weeklyTrendData.map((d, idx) => ({ x: (idx / 5) * 300, y: 150 - (d.percent / 100) * 150 }));
                const pathD = points.reduce((acc, curr, idx) => idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`, '');
                return (
                  <>
                    <path d={`${pathD} L 300 150 L 0 150 Z`} fill="url(#t-gradient)" opacity="0.15" />
                    <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth="3" />
                    {points.map((p, idx) => <circle key={idx} cx={p.x} cy={p.y} r="4" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="2" />)}
                  </>
                );
              })()}
              <defs>
                <linearGradient id="t-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 600, marginTop: '4px' }}>
              {weeklyTrendData.map((d, idx) => <span key={idx}>{d.label}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.75rem', marginTop: '1.5rem' }}>
        <h3>Consistency Grid</h3>
        <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', minWidth: '450px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', fontSize: '0.65rem', color: 'hsl(var(--text-muted))', fontWeight: 700, width: '25px' }}>
              <span>Sun</span><span>Tue</span><span>Thu</span><span>Sat</span>
            </div>
            <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
              {heatmapGrid.map((week, wIdx) => (
                <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                  {week.map((day, dIdx) => {
                    let bgColor = 'hsl(var(--border) / 0.3)';
                    if (day.level === 'low') bgColor = '#86efac';
                    else if (day.level === 'high') bgColor = '#16a34a';
                    else if (day.level === 'absent') bgColor = '#f87171';
                    return <div key={dIdx} style={{ aspectRatio: '1', width: '100%', backgroundColor: bgColor, borderRadius: '3px', cursor: 'pointer' }} title={day.tooltip} className="heatmap-cell" />;
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Settings() {
  const { profile, settings, subjects, attendance, timetable, updateProfile, updateSettings, importData, clearData, resetToDefault } = useAttendance();

  const [name, setName] = useState(profile.name || '');
  const [college, setCollege] = useState(profile.college || '');
  const [semester, setSemester] = useState(profile.semester || '');
  const [branch, setBranch] = useState(profile.branch || '');
  const [rollNumber, setRollNumber] = useState(profile.rollNumber || '');
  const [mandatory, setMandatory] = useState(settings.defaultMandatory || 75);
  const [reminders, setReminders] = useState(settings.reminderEnabled !== false);
  const [toast, setToast] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name, college, semester, branch, rollNumber });
    showToast('Profile updated!');
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings({ defaultMandatory: Number(mandatory), reminderEnabled: reminders });
    showToast('Settings saved!');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importBackup(file);
      importData(data);
      showToast('Backup restored!');
    } catch(err) { alert(err.message); }
  };

  return (
    <div>
      <h1>App Settings</h1>
      <p>Configure student profiles, targets, and data options</p>
      
      {toast && <div style={{ position: 'fixed', top: '20px', right: '20px', background: 'hsl(var(--success))', color: 'white', padding: '12px 24px', borderRadius: '12px', zIndex: 9999 }}>{toast}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3>Student Profile</h3>
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
            <div className="form-group"><label className="form-label">Name</label><input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">College</label><input type="text" className="form-input" value={college} onChange={e => setCollege(e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Sem</label><input type="text" className="form-input" value={semester} onChange={e => setSemester(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Roll No</label><input type="text" className="form-input" value={rollNumber} onChange={e => setRollNumber(e.target.value)} /></div>
            </div>
            <button type="submit" className="btn btn-primary">Save Profile</button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3>Settings</h3>
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
              <div className="form-group"><label className="form-label">Attendance Target (%)</label><input type="number" className="form-input" value={mandatory} onChange={e => setMandatory(e.target.value)} /></div>
              <button type="submit" className="btn btn-primary">Save Targets</button>
            </form>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <h3>Data Management</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button className="btn btn-secondary" onClick={() => exportBackup({ profile, settings, subjects, attendance, timetable })}><Download size={16} /> Export Backup (JSON)</button>
              <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}><Upload size={16} /> Import Backup (JSON)<input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} /></label>
              <button className="btn btn-secondary" onClick={() => { if(window.confirm('Restore Demo Data?')) { resetToDefault(); showToast('Demo data loaded!'); } }}><RefreshCcw size={16} /> Restore Demo Data</button>
              <button className="btn btn-danger" onClick={() => { if(window.confirm('Wipe all data?')) { clearData(); showToast('Wiped.'); } }}><Trash2 size={16} /> Wipe Local DB</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APPLICATION LAYOUT & ROUTING shell
// ============================================================================

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'subjects': return <Subjects />;
      case 'timetable': return <Timetable />;
      case 'calendar': return <Calendar />;
      case 'history': return <History />;
      case 'analytics': return <Analytics />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <header className="mobile-header" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid hsl(var(--border) / 0.5)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="grad-primary" style={{ padding: '0.4rem', borderRadius: '8px', display: 'flex', color: 'white' }}><Sparkles size={16} /></div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>AttendWise</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><ThemeToggle /></div>
        </header>
        <div key={activeTab} style={{ animation: 'fadeIn 0.3s ease-out', minHeight: '80vh' }}>
          {renderActiveTab()}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media (max-width: 768px) {
            .mobile-header { display: flex !important; }
            .main-content { padding-top: 1rem !important; }
          }
        `}} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
}

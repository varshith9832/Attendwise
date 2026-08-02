import React, { createContext, useState, useEffect, useContext } from 'react';

const AttendanceContext = createContext();

// Sample initial data to show rich aesthetics out-of-the-box
const initialSampleData = {
  profile: {
    name: "Varun Sharma",
    college: "State Tech University",
    semester: "Semester 5",
    branch: "Computer Science & Engineering",
    rollNumber: "CS2026042"
  },
  settings: {
    defaultMandatory: 75,
    targetGoal: 85,
    theme: 'dark',
    reminderEnabled: true
  },
  subjects: [
    { id: 'sub-daa', name: 'Design & Analysis of Algorithms', faculty: 'Dr. A. B. Chaudhari', mandatoryPercentage: 75, room: 'LH-201', credits: 4, color: '#6366f1' }, // Indigo
    { id: 'sub-os', name: 'Operating Systems', faculty: 'Prof. X. Y. Zala', mandatoryPercentage: 75, room: 'LH-202', credits: 4, color: '#06b6d4' }, // Cyan
    { id: 'sub-cn', name: 'Computer Networks', faculty: 'Dr. P. Q. Roy', mandatoryPercentage: 80, room: 'LH-305', credits: 3, color: '#f59e0b' }, // Amber
    { id: 'sub-ai', name: 'Artificial Intelligence', faculty: 'Prof. S. K. Sen', room: 'Lab-4', credits: 3, mandatoryPercentage: 75, color: '#ef4444' } // Red
  ],
  timetable: [
    // Monday
    { id: 't-mon-1', day: 'Monday', subjectId: 'sub-os', startTime: '09:00', endTime: '10:00', room: 'LH-202' },
    { id: 't-mon-2', day: 'Monday', subjectId: 'sub-daa', startTime: '10:00', endTime: '11:00', room: 'LH-201' },
    { id: 't-mon-3', day: 'Monday', subjectId: 'sub-cn', startTime: '11:15', endTime: '12:15', room: 'LH-305' },
    // Tuesday
    { id: 't-tue-1', day: 'Tuesday', subjectId: 'sub-ai', startTime: '09:00', endTime: '10:00', room: 'Lab-4' },
    { id: 't-tue-2', day: 'Tuesday', subjectId: 'sub-os', startTime: '10:00', endTime: '11:00', room: 'LH-202' },
    { id: 't-tue-3', day: 'Tuesday', subjectId: 'sub-daa', startTime: '11:15', endTime: '12:15', room: 'LH-201' },
    // Wednesday
    { id: 't-wed-1', day: 'Wednesday', subjectId: 'sub-cn', startTime: '09:00', endTime: '10:00', room: 'LH-305' },
    { id: 't-wed-2', day: 'Wednesday', subjectId: 'sub-daa', startTime: '10:00', endTime: '11:00', room: 'LH-201' },
    { id: 't-wed-3', day: 'Wednesday', subjectId: 'sub-ai', startTime: '14:00', endTime: '16:00', room: 'Lab-4' }, // Lab
    // Thursday
    { id: 't-thu-1', day: 'Thursday', subjectId: 'sub-os', startTime: '09:00', endTime: '10:00', room: 'LH-202' },
    { id: 't-thu-2', day: 'Thursday', subjectId: 'sub-cn', startTime: '10:00', endTime: '11:00', room: 'LH-305' },
    { id: 't-thu-3', day: 'Thursday', subjectId: 'sub-daa', startTime: '11:15', endTime: '12:15', room: 'LH-201' },
    // Friday
    { id: 't-fri-1', day: 'Friday', subjectId: 'sub-ai', startTime: '09:00', endTime: '10:00', room: 'Lab-4' },
    { id: 't-fri-2', day: 'Friday', subjectId: 'sub-os', startTime: '10:00', endTime: '11:00', room: 'LH-202' },
    { id: 't-fri-3', day: 'Friday', subjectId: 'sub-cn', startTime: '11:15', endTime: '12:15', room: 'LH-305' }
  ],
  // Simulate 3 weeks of classes (July 13 to August 2)
  attendance: [
    // Week 1 (July 13 - July 17)
    { id: 'att-1', subjectId: 'sub-os', date: '2026-07-13', status: 'Present', remarks: 'First day' },
    { id: 'att-2', subjectId: 'sub-daa', date: '2026-07-13', status: 'Present', remarks: '' },
    { id: 'att-3', subjectId: 'sub-cn', date: '2026-07-13', status: 'Present', remarks: '' },
    { id: 'att-4', subjectId: 'sub-ai', date: '2026-07-14', status: 'Present', remarks: '' },
    { id: 'att-5', subjectId: 'sub-os', date: '2026-07-14', status: 'Absent', remarks: 'Sick leave' },
    { id: 'att-6', subjectId: 'sub-daa', date: '2026-07-14', status: 'Present', remarks: '' },
    { id: 'att-7', subjectId: 'sub-cn', date: '2026-07-15', status: 'Present', remarks: '' },
    { id: 'att-8', subjectId: 'sub-daa', date: '2026-07-15', status: 'Present', remarks: '' },
    { id: 'att-9', subjectId: 'sub-ai', date: '2026-07-15', status: 'Present', remarks: '' },
    { id: 'att-10', subjectId: 'sub-os', date: '2026-07-16', status: 'Present', remarks: '' },
    { id: 'att-11', subjectId: 'sub-cn', date: '2026-07-16', status: 'Present', remarks: '' },
    { id: 'att-12', subjectId: 'sub-daa', date: '2026-07-16', status: 'Present', remarks: '' },
    { id: 'att-13', subjectId: 'sub-ai', date: '2026-07-17', status: 'Present', remarks: '' },
    { id: 'att-14', subjectId: 'sub-os', date: '2026-07-17', status: 'Present', remarks: '' },
    { id: 'att-15', subjectId: 'sub-cn', date: '2026-07-17', status: 'Present', remarks: '' },

    // Week 2 (July 20 - July 24)
    { id: 'att-16', subjectId: 'sub-os', date: '2026-07-20', status: 'Absent', remarks: 'Woke up late' },
    { id: 'att-17', subjectId: 'sub-daa', date: '2026-07-20', status: 'Present', remarks: '' },
    { id: 'att-18', subjectId: 'sub-cn', date: '2026-07-20', status: 'Present', remarks: '' },
    { id: 'att-19', subjectId: 'sub-ai', date: '2026-07-21', status: 'Present', remarks: '' },
    { id: 'att-20', subjectId: 'sub-os', date: '2026-07-21', status: 'Present', remarks: '' },
    { id: 'att-21', subjectId: 'sub-daa', date: '2026-07-21', status: 'Absent', remarks: 'Went for coffee' },
    { id: 'att-22', subjectId: 'sub-cn', date: '2026-07-22', status: 'Present', remarks: '' },
    { id: 'att-23', subjectId: 'sub-daa', date: '2026-07-22', status: 'Present', remarks: '' },
    { id: 'att-24', subjectId: 'sub-ai', date: '2026-07-22', status: 'Absent', remarks: 'Mass bunk' },
    { id: 'att-25', subjectId: 'sub-os', date: '2026-07-23', status: 'Absent', remarks: 'Stormy weather' },
    { id: 'att-26', subjectId: 'sub-cn', date: '2026-07-23', status: 'Absent', remarks: 'Missed bus' },
    { id: 'att-27', subjectId: 'sub-daa', date: '2026-07-23', status: 'Present', remarks: '' },
    { id: 'att-28', subjectId: 'sub-ai', date: '2026-07-24', status: 'Present', remarks: '' },
    { id: 'att-29', subjectId: 'sub-os', date: '2026-07-24', status: 'Present', remarks: '' },
    { id: 'att-30', subjectId: 'sub-cn', date: '2026-07-24', status: 'Present', remarks: '' },

    // Week 3 (July 27 - July 31)
    { id: 'att-31', subjectId: 'sub-os', date: '2026-07-27', status: 'Present', remarks: '' },
    { id: 'att-32', subjectId: 'sub-daa', date: '2026-07-27', status: 'Present', remarks: '' },
    { id: 'att-33', subjectId: 'sub-cn', date: '2026-07-27', status: 'Present', remarks: '' },
    { id: 'att-34', subjectId: 'sub-ai', date: '2026-07-28', status: 'Present', remarks: '' },
    { id: 'att-35', subjectId: 'sub-os', date: '2026-07-28', status: 'Absent', remarks: 'Heavy rain' },
    { id: 'att-36', subjectId: 'sub-daa', date: '2026-07-28', status: 'Present', remarks: '' },
    { id: 'att-37', subjectId: 'sub-cn', date: '2026-07-29', status: 'Present', remarks: '' },
    { id: 'att-38', subjectId: 'sub-daa', date: '2026-07-29', status: 'Present', remarks: '' },
    { id: 'att-39', subjectId: 'sub-ai', date: '2026-07-29', status: 'Absent', remarks: 'Lab exam study' },
    { id: 'att-40', subjectId: 'sub-os', date: '2026-07-30', status: 'Present', remarks: '' },
    { id: 'att-41', subjectId: 'sub-cn', date: '2026-07-30', status: 'Present', remarks: '' },
    { id: 'att-42', subjectId: 'sub-daa', date: '2026-07-30', status: 'Absent', remarks: 'Late arrival' },
    { id: 'att-43', subjectId: 'sub-ai', date: '2026-07-31', status: 'Present', remarks: '' },
    { id: 'att-44', subjectId: 'sub-os', date: '2026-07-31', status: 'Present', remarks: '' },
    { id: 'att-45', subjectId: 'sub-cn', date: '2026-07-31', status: 'Present', remarks: '' }
  ]
};

export function AttendanceProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('aw_profile');
    return saved ? JSON.parse(saved) : initialSampleData.profile;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('aw_settings');
    return saved ? JSON.parse(saved) : initialSampleData.settings;
  });

  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('aw_subjects');
    return saved ? JSON.parse(saved) : initialSampleData.subjects;
  });

  const [timetable, setTimetable] = useState(() => {
    const saved = localStorage.getItem('aw_timetable');
    return saved ? JSON.parse(saved) : initialSampleData.timetable;
  });

  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('aw_attendance');
    return saved ? JSON.parse(saved) : initialSampleData.attendance;
  });

  // Persist all states to localstorage on change
  useEffect(() => {
    localStorage.setItem('aw_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('aw_settings', JSON.stringify(settings));
    // Set theme class on body
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(settings.theme);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('aw_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('aw_timetable', JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem('aw_attendance', JSON.stringify(attendance));
  }, [attendance]);

  // --- Subject Actions ---
  const addSubject = (sub) => {
    const newSub = { ...sub, id: `sub-${Date.now()}` };
    setSubjects(prev => [...prev, newSub]);
  };

  const updateSubject = (id, updated) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
  };

  const deleteSubject = (id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    // Cascade delete timetable and attendance for this subject
    setTimetable(prev => prev.filter(t => t.subjectId !== id));
    setAttendance(prev => prev.filter(a => a.subjectId !== id));
  };

  // --- Timetable Actions ---
  const addTimetableSlot = (slot) => {
    const newSlot = { ...slot, id: `t-${Date.now()}` };
    setTimetable(prev => [...prev, newSlot]);
  };

  const updateTimetableSlot = (id, updated) => {
    setTimetable(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
  };

  const deleteTimetableSlot = (id) => {
    setTimetable(prev => prev.filter(t => t.id !== id));
  };

  // --- Attendance Log Actions ---
  const markAttendance = (subjectId, date, status, remarks = '') => {
    // Check if entry already exists for this subject on this exact date
    const existingIndex = attendance.findIndex(a => a.subjectId === subjectId && a.date === date);
    
    if (existingIndex > -1) {
      setAttendance(prev => {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], status, remarks };
        return copy;
      });
    } else {
      const newLog = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        subjectId,
        date,
        status,
        remarks
      };
      setAttendance(prev => [...prev, newLog]);
    }
  };

  const updateAttendanceLog = (id, updated) => {
    setAttendance(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  };

  const deleteAttendanceLog = (id) => {
    setAttendance(prev => prev.filter(a => a.id !== id));
  };

  // --- Profile / Settings Actions ---
  const updateProfile = (newProfile) => {
    setProfile(newProfile);
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // --- Global Actions ---
  const importData = (data) => {
    if (data.profile) setProfile(data.profile);
    if (data.settings) setSettings(data.settings);
    if (data.subjects) setSubjects(data.subjects);
    if (data.timetable) setTimetable(data.timetable);
    if (data.attendance) setAttendance(data.attendance);
  };

  const clearData = () => {
    setProfile({ name: '', college: '', semester: '', branch: '', rollNumber: '' });
    setSubjects([]);
    setTimetable([]);
    setAttendance([]);
  };

  const resetToDefault = () => {
    setProfile(initialSampleData.profile);
    setSettings(initialSampleData.settings);
    setSubjects(initialSampleData.subjects);
    setTimetable(initialSampleData.timetable);
    setAttendance(initialSampleData.attendance);
  };

  return (
    <AttendanceContext.Provider value={{
      profile,
      settings,
      subjects,
      timetable,
      attendance,
      addSubject,
      updateSubject,
      deleteSubject,
      addTimetableSlot,
      updateTimetableSlot,
      deleteTimetableSlot,
      markAttendance,
      updateAttendanceLog,
      deleteAttendanceLog,
      updateProfile,
      updateSettings,
      importData,
      clearData,
      resetToDefault
    }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  return useContext(AttendanceContext);
}

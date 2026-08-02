# AttendWise – Smart Attendance Tracker PWA

**AttendWise** is an offline-first, mobile-responsive Progressive Web App (PWA) built to help college students track their attendance, manage their weekly schedules, predict semester trends, and make smart bunk decisions. 

It runs on both Desktop and Mobile devices, functioning like a native application with local offline storage capability.

---

## 🚀 Key Features

1. **Vibrant Dashboard**: Overview of overall attendance, present streaks, expected semester projections, and risk analysis.
2. **Subject Management**: Add subjects with custom color tags, credit weights, and distinct attendance requirements (e.g. 75% or 80%).
3. **Weekly Timetable**: View classes scheduled for each weekday. Features *one-tap daily attendance logging* from the dashboard.
4. **Color-Coded Calendar**: Visual monthly grid showing present/absent summaries. Clicking any date lets you log or edit attendance retroactively.
5. **Interactive Analytics**: Custom, lightweight SVG charts including:
   - Subject-wise performance bar charts against target threshold lines.
   - Weekly attendance percentage trends.
   - A GitHub-style daily consistency heatmap grid.
6. **Detailed Log History**: Searchable and filterable history logs of all sessions with custom notes/remarks, exportable to CSV.
7. **PWA Standalone Setup**: Installs directly onto iOS and Android home screens as an app.
8. **Backup & Restore**: Export full database state to a JSON file or restore from it. Includes a "Restore Demo Data" utility.
9. **Printable Semester PDF**: Features clean CSS styling optimized for printing, allowing saving subject reports directly to PDF.

---

## 🛠️ Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed.

1. **Install Dependencies**:
   Navigate to the project root directory and run:
   ```bash
   npm install
   ```

2. **Run Local Server**:
   Launch the Vite development server:
   ```bash
   npm run dev
   ```

3. **Access the App**:
   - **On Desktop**: Open the local URL printed in the terminal (typically `http://localhost:5173`).
   - **On Mobile**: 
     1. Make sure your computer and mobile phone are connected to the **same Wi-Fi network**.
     2. Run `npm run dev -- --host` (this exposes Vite to your local network).
     3. Look for the **Network IP Address** printed in your terminal (e.g., `http://192.168.1.15:5173`).
     4. Open this URL in Chrome (Android) or Safari (iOS) on your phone.

---

## 📱 Installing as a Native PWA

Once you open the website on your mobile browser over your local network:
- **Android (Chrome)**: Tap the menu dots (⋮) and select **"Add to Home screen"** or **"Install App"**.
- **iOS (Safari)**: Tap the share button (📤) and select **"Add to Home Screen"**.

This installs the AttendWise shortcut icon on your phone's home screen. Launching from this icon opens the app in immersive fullscreen standalone mode (no browser top bar) and works entirely offline!

---

## 📝 Demo Mode / Initial Testing
If the database is empty or you want to see the charts and dashboards immediately:
1. Go to **Settings** (gear icon in sidebar).
2. Click **Restore Demo Data**.
3. This pre-seeds the app with 3 weeks of mock subject, schedule, and attendance log data, illustrating warnings, bunk limits, and analytics instantly.

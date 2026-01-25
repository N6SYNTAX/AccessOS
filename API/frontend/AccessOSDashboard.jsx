/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                     AccessOS Dashboard Template                            ║
 * ║                                                                            ║
 * ║  A React dashboard for Inner Range Inception security controllers          ║
 * ║  Built for Insight Security Group                                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * ============================================================================
 * TABLE OF CONTENTS
 * ============================================================================
 * 
 * 1. STYLES (CSS Variables)                    - Line ~60
 * 2. MOCK DATA (Replace with API)              - Line ~380
 * 3. REUSABLE COMPONENTS                       - Line ~450
 *    - StatusBadge, StatCard, EntityCard, EventItem
 * 4. PAGE COMPONENTS                           - Line ~550
 *    - Dashboard, Areas, Doors, Inputs, Outputs, Users, Events, Settings
 * 5. LAYOUT (Sidebar + Header)                 - Line ~900
 * 6. MAIN APP                                  - Line ~1000
 * 
 * ============================================================================
 * HOW THIS CODE IS ORGANIZED
 * ============================================================================
 * 
 * COMPONENTS = Reusable UI pieces (cards, badges, buttons)
 * PAGES      = Full screens (one per nav item)
 * LAYOUT     = The shell (sidebar + header + content area)
 * 
 * ============================================================================
 * KEY REACT CONCEPTS
 * ============================================================================
 * 
 * useState(initialValue)
 *   - Creates state that can change
 *   - Returns [currentValue, setterFunction]
 *   - When setter called, React re-renders
 *   - Example: const [doors, setDoors] = useState([]);
 * 
 * useEffect(callback, dependencies)
 *   - Runs code at specific times
 *   - [] = run once on mount
 *   - [doors] = run when 'doors' changes
 *   - Example: useEffect(() => fetchData(), []);
 * 
 * props
 *   - Data passed from parent to child
 *   - Example: <Card title="Hello" /> → function Card({ title })
 * 
 * map()
 *   - Loop through arrays to render lists
 *   - Example: doors.map(door => <DoorCard key={door.id} door={door} />)
 * 
 */

import React, { useState, useEffect } from 'react';
import {
  Shield, DoorOpen, Radio, Zap, Users, Clock, Settings,
  Bell, Lock, Unlock, AlertTriangle, Activity, Home,
  RefreshCw, Search, Filter, Eye, Edit, Trash2, Plus
} from 'lucide-react';


// ════════════════════════════════════════════════════════════════════════════
// SECTION 1: STYLES
// ════════════════════════════════════════════════════════════════════════════
/**
 * CSS VARIABLES allow you to define colors once and use everywhere.
 * To change the theme, just modify the values in :root { }
 */

const styles = `
  /* ═══════════════════════════════════════════════════════════════════════
     CSS VARIABLES (Your Theme Lives Here)
     
     To customize colors:
     1. Change values here
     2. Everything updates automatically!
     ═══════════════════════════════════════════════════════════════════════ */
  
  :root {
    /* ─── BACKGROUNDS ─── */
    --bg-primary: #0c0d12;       /* Darkest - main background */
    --bg-secondary: #13151c;     /* Cards and panels */
    --bg-tertiary: #1a1d28;      /* Hover states */
    --bg-elevated: #21242f;      /* Elevated elements */
    
    /* ─── TEXT ─── */
    --text-primary: #f8fafc;     /* Main text */
    --text-secondary: #94a3b8;   /* Muted text */
    --text-muted: #64748b;       /* Very muted */
    
    /* ─── BORDERS ─── */
    --border-default: #1e2330;
    --border-light: #2d3548;
    
    /* ─── STATUS COLORS (Critical for security!) ─── */
    --status-success: #22c55e;   /* Green - Armed/Locked/Sealed */
    --status-success-bg: rgba(34, 197, 94, 0.12);
    
    --status-warning: #eab308;   /* Yellow - Warning */
    --status-warning-bg: rgba(234, 179, 8, 0.12);
    
    --status-danger: #ef4444;    /* Red - Alarm/Error */
    --status-danger-bg: rgba(239, 68, 68, 0.12);
    
    --status-info: #3b82f6;      /* Blue - Info */
    --status-info-bg: rgba(59, 130, 246, 0.12);
    
    /* ─── ACCENT ─── */
    --accent: #f65c5cff;           /* Purple - Primary actions */
    --accent-hover: #ed3a3aff;
    --accent-bg: rgba(246, 92, 92, 0.12);
    
    /* ─── LAYOUT ─── */
    --sidebar-width: 260px;
    --header-height: 64px;
    --radius: 10px;
    --radius-sm: 6px;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  /* ═══════════════════════════════════════════════════════════════════════
     MAIN LAYOUT
     
     ┌────────────────────────────────────────────────────┐
     │  ┌──────────┬───────────────────────────────────┐  │
     │  │          │  HEADER                           │  │
     │  │ SIDEBAR  ├───────────────────────────────────┤  │
     │  │          │                                   │  │
     │  │          │  PAGE CONTENT                     │  │
     │  │          │  (changes per navigation)         │  │
     │  └──────────┴───────────────────────────────────┘  │
     └────────────────────────────────────────────────────┘
     ═══════════════════════════════════════════════════════════════════════ */
  
  .dashboard {
    display: flex;
    min-height: 100vh;
    background: var(--bg-primary);
    font-family: 'Outfit', -apple-system, sans-serif;
    color: var(--text-primary);
    line-height: 1.5;
  }

  /* ─── SIDEBAR ─── */
  .sidebar {
    width: var(--sidebar-width);
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-default);
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    z-index: 100;
  }

  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-default);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sidebar-logo {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--accent) 0%, #6366f1 100%);
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }

  .sidebar-brand {
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .sidebar-brand span { color: var(--accent); }

  .sidebar-nav {
    flex: 1;
    padding: 16px 12px;
    overflow-y: auto;
  }

  .nav-group { margin-bottom: 28px; }

  .nav-group-title {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    padding: 0 12px;
    margin-bottom: 10px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 12px;
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
    margin-bottom: 2px;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .nav-item:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .nav-item.active {
    background: var(--accent-bg);
    color: var(--accent);
  }

  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--border-default);
  }

  .connection-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--status-success-bg);
    border-radius: var(--radius);
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--status-success);
  }

  .connection-dot {
    width: 8px;
    height: 8px;
    background: var(--status-success);
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* ─── MAIN CONTENT ─── */
  .main-content {
    flex: 1;
    margin-left: var(--sidebar-width);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* ─── HEADER ─── */
  .header {
    height: var(--header-height);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-default);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .header-title {
    font-size: 1.15rem;
    font-weight: 600;
  }

  .header-search {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius);
    width: 280px;
  }

  .header-search input {
    flex: 1;
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: 0.9rem;
    outline: none;
  }

  .header-search input::placeholder { color: var(--text-muted); }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-btn {
    width: 40px;
    height: 40px;
    border-radius: var(--radius);
    border: 1px solid var(--border-default);
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    position: relative;
  }

  .header-btn:hover {
    background: var(--bg-elevated);
    color: var(--text-primary);
  }

  .notification-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: var(--status-danger);
    border-radius: 50%;
  }

  .user-dropdown {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 14px 6px 6px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-default);
    border-radius: 50px;
    cursor: pointer;
    margin-left: 8px;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent) 0%, #6366f1 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.85rem;
    color: white;
  }

  .user-name { font-size: 0.85rem; font-weight: 600; }
  .user-role { font-size: 0.75rem; color: var(--text-muted); }

  /* ─── PAGE CONTENT ─── */
  .page-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 1.6rem;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .page-subtitle {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .page-actions { display: flex; gap: 10px; }

  /* ─── STAT CARDS ─── */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  @media (max-width: 1200px) {
    .stats-row { grid-template-columns: repeat(2, 1fr); }
  }

  .stat-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius);
    padding: 20px;
    display: flex;
    gap: 16px;
    transition: all 0.2s ease;
  }

  .stat-card:hover {
    border-color: var(--border-light);
    transform: translateY(-2px);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-icon.success { background: var(--status-success-bg); color: var(--status-success); }
  .stat-icon.warning { background: var(--status-warning-bg); color: var(--status-warning); }
  .stat-icon.danger { background: var(--status-danger-bg); color: var(--status-danger); }
  .stat-icon.info { background: var(--status-info-bg); color: var(--status-info); }
  .stat-icon.accent { background: var(--accent-bg); color: var(--accent); }

  .stat-label { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px; }
  .stat-value { font-size: 1.75rem; font-weight: 700; }

  /* ─── ENTITY CARDS ─── */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  .entity-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius);
    padding: 20px;
    transition: all 0.2s ease;
  }

  .entity-card:hover { border-color: var(--border-light); }

  .entity-card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .entity-card-title { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
  .entity-card-subtitle { font-size: 0.85rem; color: var(--text-secondary); }
  .entity-card-footer { display: flex; gap: 8px; }

  /* ─── STATUS BADGE ─── */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 50px;
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .status-badge.armed, .status-badge.locked, .status-badge.sealed, .status-badge.on, .status-badge.online {
    background: var(--status-success-bg);
    color: var(--status-success);
  }

  .status-badge.disarmed, .status-badge.unlocked, .status-badge.unsealed, .status-badge.off {
    background: var(--status-warning-bg);
    color: var(--status-warning);
  }

  .status-badge.alarm, .status-badge.error {
    background: var(--status-danger-bg);
    color: var(--status-danger);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  /* ─── BUTTONS ─── */
  .btn {
    padding: 9px 16px;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.15s ease;
  }

  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { background: var(--accent-hover); }

  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-default);
  }
  .btn-secondary:hover { background: var(--bg-elevated); }

  .btn-success { background: var(--status-success-bg); color: var(--status-success); }
  .btn-success:hover { background: var(--status-success); color: white; }

  .btn-danger { background: var(--status-danger-bg); color: var(--status-danger); }
  .btn-danger:hover { background: var(--status-danger); color: white; }

  .btn-icon { width: 36px; height: 36px; padding: 0; }

  /* ─── TABLE ─── */
  .table-container {
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .table { width: 100%; border-collapse: collapse; }

  .table th {
    text-align: left;
    padding: 14px 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-muted);
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-default);
  }

  .table td {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border-default);
    font-size: 0.9rem;
  }

  .table tr:last-child td { border-bottom: none; }
  .table tbody tr:hover { background: var(--bg-tertiary); }
  .table-actions { display: flex; gap: 6px; }

  /* ─── EVENTS ─── */
  .events-panel {
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .events-header {
    display: flex;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-default);
  }

  .events-title { font-size: 1rem; font-weight: 600; }

  .event-item {
    display: flex;
    gap: 14px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border-default);
  }

  .event-item:hover { background: var(--bg-tertiary); }
  .event-item:last-child { border-bottom: none; }

  .event-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .event-icon.info { background: var(--status-info-bg); color: var(--status-info); }
  .event-icon.success { background: var(--status-success-bg); color: var(--status-success); }
  .event-icon.warning { background: var(--status-warning-bg); color: var(--status-warning); }
  .event-icon.danger { background: var(--status-danger-bg); color: var(--status-danger); }

  .event-message { font-size: 0.9rem; margin-bottom: 4px; }
  .event-meta { font-size: 0.8rem; color: var(--text-muted); }

  /* ─── LAYOUT HELPERS ─── */
  .two-columns {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 24px;
  }

  @media (max-width: 1100px) {
    .two-columns { grid-template-columns: 1fr; }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .section-title { font-size: 1.1rem; font-weight: 600; }

  /* ─── FORMS ─── */
  .form-group { margin-bottom: 20px; }
  .form-label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px; }

  .form-input {
    width: 100%;
    padding: 11px 14px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--accent);
  }
`;


// ════════════════════════════════════════════════════════════════════════════
// SECTION 2: MOCK DATA
// ════════════════════════════════════════════════════════════════════════════
/**
 * MOCK DATA - Replace with real API calls!
 * 
 * TO CONNECT TO YOUR FLASK API:
 * 
 * 1. Replace useState(MOCK_DATA.doors) with useState([])
 * 
 * 2. Add useEffect to fetch on page load:
 *    useEffect(() => {
 *      fetch('/api/doors')
 *        .then(res => res.json())
 *        .then(data => setDoors(data));
 *    }, []);
 * 
 * 3. Call API for actions:
 *    async function handleUnlock(doorId) {
 *      await fetch(`/api/doors/${doorId}/unlock`, { method: 'POST' });
 *      loadDoors(); // Refresh
 *    }
 */

const MOCK_DATA = {
  areas: [
    { id: 'area-1', name: 'Main Building', status: 'armed', zones: 12, alarms: 0 },
    { id: 'area-2', name: 'Warehouse A', status: 'disarmed', zones: 8, alarms: 0 },
    { id: 'area-3', name: 'Office Wing', status: 'armed', zones: 6, alarms: 0 },
    { id: 'area-4', name: 'Server Room', status: 'armed', zones: 4, alarms: 1 },
  ],

  doors: [
    { id: 'door-1', name: 'Main Entrance', status: 'locked', lastAccess: '2 mins ago', location: 'Building A' },
    { id: 'door-2', name: 'Side Door', status: 'unlocked', lastAccess: '15 mins ago', location: 'Building A' },
    { id: 'door-3', name: 'Loading Bay', status: 'locked', lastAccess: '1 hour ago', location: 'Warehouse' },
    { id: 'door-4', name: 'Server Room', status: 'locked', lastAccess: '3 hours ago', location: 'IT Block' },
    { id: 'door-5', name: 'Emergency Exit', status: 'locked', lastAccess: 'Never', location: 'Building A' },
    { id: 'door-6', name: 'Parking Gate', status: 'unlocked', lastAccess: '5 mins ago', location: 'External' },
  ],

  inputs: [
    { id: 'inp-1', name: 'PIR Sensor - Lobby', status: 'sealed', type: 'Motion', area: 'Main Building' },
    { id: 'inp-2', name: 'Door Contact - Main', status: 'sealed', type: 'Contact', area: 'Main Building' },
    { id: 'inp-3', name: 'Glass Break - Office', status: 'sealed', type: 'Glass Break', area: 'Office Wing' },
    { id: 'inp-4', name: 'PIR Sensor - Warehouse', status: 'unsealed', type: 'Motion', area: 'Warehouse A' },
  ],

  outputs: [
    { id: 'out-1', name: 'Lobby Lights', status: 'on', type: 'Lighting' },
    { id: 'out-2', name: 'Alarm Siren', status: 'off', type: 'Alarm' },
    { id: 'out-3', name: 'HVAC System', status: 'on', type: 'Climate' },
    { id: 'out-4', name: 'Gate Motor', status: 'off', type: 'Access' },
  ],

  events: [
    { id: 'evt-1', time: '09:45:22', type: 'access', message: 'John Smith accessed Main Entrance', severity: 'info' },
    { id: 'evt-2', time: '09:42:15', type: 'alarm', message: 'Motion detected in Server Room', severity: 'warning' },
    { id: 'evt-3', time: '09:38:00', type: 'system', message: 'Area "Office Wing" armed by Admin', severity: 'success' },
    { id: 'evt-4', time: '09:30:11', type: 'access', message: 'Access denied - Invalid card', severity: 'danger' },
    { id: 'evt-5', time: '09:25:00', type: 'system', message: 'System health check completed', severity: 'info' },
  ],

  users: [
    { id: 'usr-1', name: 'John Smith', role: 'Administrator', status: 'online', areas: 5 },
    { id: 'usr-2', name: 'Sarah Connor', role: 'Supervisor', status: 'online', areas: 3 },
    { id: 'usr-3', name: 'Mike Johnson', role: 'Operator', status: 'off', areas: 2 },
  ]
};


// ════════════════════════════════════════════════════════════════════════════
// SECTION 3: REUSABLE COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

/** StatusBadge - Colored status indicator */
function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

/** StatCard - Dashboard stat with icon */
function StatCard({ icon: Icon, label, value, color = 'info' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

/** EntityCard - Card for doors, areas, inputs, outputs */
function EntityCard({ title, subtitle, status, actions = [] }) {
  return (
    <div className="entity-card">
      <div className="entity-card-header">
        <div>
          <div className="entity-card-title">{title}</div>
          <div className="entity-card-subtitle">{subtitle}</div>
        </div>
        <StatusBadge status={status} />
      </div>
      {actions.length > 0 && (
        <div className="entity-card-footer">
          {actions.map((action, i) => (
            <button
              key={i}
              className={`btn btn-${action.variant || 'secondary'}`}
              onClick={action.onClick}
            >
              {action.icon && <action.icon size={16} />}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** EventItem - Single event row */
function EventItem({ event }) {
  const icons = { access: DoorOpen, alarm: AlertTriangle, system: Activity };
  const Icon = icons[event.type] || Activity;

  return (
    <div className="event-item">
      <div className={`event-icon ${event.severity}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="event-message">{event.message}</div>
        <div className="event-meta">{event.time} • {event.type}</div>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// SECTION 4: PAGE COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

/** Dashboard - Overview page */
function DashboardPage() {
  const data = MOCK_DATA;
  const armedAreas = data.areas.filter(a => a.status === 'armed').length;
  const lockedDoors = data.doors.filter(d => d.status === 'locked').length;
  const totalAlarms = data.areas.reduce((sum, a) => sum + a.alarms, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">System overview and recent activity</p>
        </div>
        <button className="btn btn-secondary"><RefreshCw size={16} /> Refresh</button>
      </div>

      <div className="stats-row">
        <StatCard icon={Shield} label="Areas Armed" value={`${armedAreas}/${data.areas.length}`} color="success" />
        <StatCard icon={Lock} label="Doors Locked" value={`${lockedDoors}/${data.doors.length}`} color="info" />
        <StatCard icon={AlertTriangle} label="Active Alarms" value={totalAlarms} color={totalAlarms > 0 ? 'danger' : 'success'} />
        <StatCard icon={Users} label="Users Online" value={data.users.filter(u => u.status === 'online').length} color="accent" />
      </div>

      <div className="two-columns">
        <div>
          <div className="section-header">
            <h2 className="section-title">Quick Actions - Doors</h2>
            <button className="btn btn-secondary">View All</button>
          </div>
          <div className="cards-grid">
            {data.doors.slice(0, 4).map(door => (
              <EntityCard
                key={door.id}
                title={door.name}
                subtitle={`${door.location} • Last: ${door.lastAccess}`}
                status={door.status}
                actions={[{ label: door.status === 'locked' ? 'Unlock' : 'Lock', icon: door.status === 'locked' ? Unlock : Lock, variant: door.status === 'locked' ? 'success' : 'danger' }]}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="events-panel">
            <div className="events-header">
              <h2 className="events-title">Recent Activity</h2>
              <button className="btn btn-secondary">View All</button>
            </div>
            {data.events.map(event => <EventItem key={event.id} event={event} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Areas - Area management */
function AreasPage() {
  const [areas] = useState(MOCK_DATA.areas);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Areas</h1>
          <p className="page-subtitle">Manage alarm areas and zones</p>
        </div>
        <button className="btn btn-primary"><Shield size={16} /> Arm All</button>
      </div>

      <div className="cards-grid">
        {areas.map(area => (
          <EntityCard
            key={area.id}
            title={area.name}
            subtitle={`${area.zones} zones • ${area.alarms} alarms`}
            status={area.alarms > 0 ? 'alarm' : area.status}
            actions={[
              { label: area.status === 'armed' ? 'Disarm' : 'Arm', variant: area.status === 'armed' ? 'danger' : 'success', icon: area.status === 'armed' ? Unlock : Lock },
              { label: 'Details', variant: 'secondary', icon: Eye }
            ]}
          />
        ))}
      </div>
    </div>
  );
}

/** Doors - Door control */
function DoorsPage() {
  const [doors, setDoors] = useState(MOCK_DATA.doors);

  // Toggle door lock status (demonstrates state updates)
  function handleToggle(doorId) {
    setDoors(current =>
      current.map(door =>
        door.id === doorId
          ? { ...door, status: door.status === 'locked' ? 'unlocked' : 'locked' }
          : door
      )
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Doors</h1>
          <p className="page-subtitle">Access control management</p>
        </div>
        <button className="btn btn-success"><Lock size={16} /> Lock All</button>
      </div>

      <div className="cards-grid">
        {doors.map(door => (
          <EntityCard
            key={door.id}
            title={door.name}
            subtitle={`${door.location} • Last: ${door.lastAccess}`}
            status={door.status}
            actions={[
              { label: door.status === 'locked' ? 'Unlock' : 'Lock', icon: door.status === 'locked' ? Unlock : Lock, variant: door.status === 'locked' ? 'success' : 'danger', onClick: () => handleToggle(door.id) },
              { label: 'Open', variant: 'secondary', icon: DoorOpen }
            ]}
          />
        ))}
      </div>
    </div>
  );
}

/** Inputs - Input monitoring */
function InputsPage() {
  const [inputs] = useState(MOCK_DATA.inputs);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inputs</h1>
          <p className="page-subtitle">Sensor and detector status</p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Type</th><th>Area</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {inputs.map(input => (
              <tr key={input.id}>
                <td><strong>{input.name}</strong></td>
                <td>{input.type}</td>
                <td>{input.area}</td>
                <td><StatusBadge status={input.status} /></td>
                <td><button className="btn btn-secondary">Isolate</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Outputs - Output control */
function OutputsPage() {
  const [outputs, setOutputs] = useState(MOCK_DATA.outputs);

  function handleToggle(id) {
    setOutputs(current =>
      current.map(o => o.id === id ? { ...o, status: o.status === 'on' ? 'off' : 'on' } : o)
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Outputs</h1>
          <p className="page-subtitle">Control lights, sirens, and devices</p>
        </div>
      </div>

      <div className="cards-grid">
        {outputs.map(output => (
          <EntityCard
            key={output.id}
            title={output.name}
            subtitle={output.type}
            status={output.status}
            actions={[{ label: output.status === 'on' ? 'Turn Off' : 'Turn On', icon: Zap, variant: output.status === 'on' ? 'danger' : 'success', onClick: () => handleToggle(output.id) }]}
          />
        ))}
      </div>
    </div>
  );
}

/** Users - User management */
function UsersPage() {
  const [users] = useState(MOCK_DATA.users);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage system users</p>
        </div>
        <button className="btn btn-primary"><Plus size={16} /> Add User</button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>User</th><th>Role</th><th>Areas</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td><strong>{user.name}</strong></td>
                <td>{user.role}</td>
                <td>{user.areas} areas</td>
                <td><StatusBadge status={user.status} /></td>
                <td className="table-actions">
                  <button className="btn btn-secondary btn-icon"><Edit size={16} /></button>
                  <button className="btn btn-danger btn-icon"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Events - Event log */
function EventsPage() {
  const [events] = useState(MOCK_DATA.events);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">System activity log</p>
        </div>
        <button className="btn btn-secondary"><Filter size={16} /> Filter</button>
      </div>

      <div className="events-panel">
        {events.map(event => <EventItem key={event.id} event={event} />)}
      </div>
    </div>
  );
}

/** Settings - Configuration */
function SettingsPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">System configuration</p>
        </div>
      </div>

      <div className="entity-card" style={{ maxWidth: 500 }}>
        <div className="entity-card-header">
          <div>
            <div className="entity-card-title">Controller Connection</div>
            <div className="entity-card-subtitle">Inception controller settings</div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">IP Address</label>
          <input type="text" className="form-input" defaultValue="192.168.0.115" />
        </div>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input type="text" className="form-input" defaultValue="AccessOS" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-input" placeholder="••••••••" />
        </div>

        <div className="entity-card-footer">
          <button className="btn btn-primary">Save Changes</button>
          <button className="btn btn-secondary">Test Connection</button>
        </div>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// SECTION 5: LAYOUT COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

/** Sidebar - Navigation menu */
function Sidebar({ currentPage, onNavigate }) {
  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'areas', label: 'Areas', icon: Shield },
    { id: 'doors', label: 'Doors', icon: DoorOpen },
    { id: 'inputs', label: 'Inputs', icon: Radio },
    { id: 'outputs', label: 'Outputs', icon: Zap },
  ];

  const systemNav = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'events', label: 'Events', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo"><Shield size={22} color="white" /></div>
        <div className="sidebar-brand">Access<span>OS</span></div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group">
          <div className="nav-group-title">Main</div>
          {mainNav.map(item => (
            <div key={item.id} className={`nav-item ${currentPage === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="nav-group">
          <div className="nav-group-title">System</div>
          {systemNav.map(item => (
            <div key={item.id} className={`nav-item ${currentPage === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="connection-badge">
          <span className="connection-dot" />
          Connected
        </div>
      </div>
    </aside>
  );
}

/** Header - Top bar */
function Header({ pageTitle }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{pageTitle}</h1>
        <div className="header-search">
          <Search size={18} color="var(--text-muted)" />
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="header-right">
        <button className="header-btn"><RefreshCw size={18} /></button>
        <button className="header-btn">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>
        <div className="user-dropdown">
          <div className="user-avatar">A</div>
          <div>
            <div className="user-name">Admin</div>
            <div className="user-role">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// SECTION 6: MAIN APP
// ════════════════════════════════════════════════════════════════════════════

export default function AccessOSDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const pages = {
    dashboard: { component: DashboardPage, title: 'Dashboard' },
    areas: { component: AreasPage, title: 'Areas' },
    doors: { component: DoorsPage, title: 'Doors' },
    inputs: { component: InputsPage, title: 'Inputs' },
    outputs: { component: OutputsPage, title: 'Outputs' },
    users: { component: UsersPage, title: 'Users' },
    events: { component: EventsPage, title: 'Events' },
    settings: { component: SettingsPage, title: 'Settings' },
  };

  const { component: PageComponent, title } = pages[currentPage];

  return (
    <>
      <style>{styles}</style>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="dashboard">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="main-content">
          <Header pageTitle={title} />
          <div className="page-content">
            <PageComponent />
          </div>
        </main>
      </div>
    </>
  );
}

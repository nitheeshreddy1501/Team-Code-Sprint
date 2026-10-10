// ShiftWise - Business-Based Shift Management & Workforce Intelligence Platform
// Built for Problem Statement 36 | Team CODESPRINT CBC052
// Modern Commercial Official Corporate Interface & Operations Console

const { useState, useEffect, useMemo, useCallback } = React;

// ---------------- Reusable Commercial CSV Export Helpers ----------------
function downloadCSV(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportShiftsToCSV(shifts) {
  const headers = ['Shift ID', 'Title', 'Department', 'Role Required', 'Start Time', 'End Time', 'Duration (Hours)', 'Demand Level', 'Required Headcount', 'Assigned Count', 'Status'];
  const rows = shifts.map(s => [
    s.id,
    `"${(s.title || '').replace(/"/g, '""')}"`,
    `"${s.department}"`,
    `"${s.role_required}"`,
    s.start_time,
    s.end_time,
    s.duration_hours,
    s.demand_level,
    s.required_headcount,
    s.assigned_count,
    s.is_short ? 'Shortage' : 'Filled'
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(`ShiftWise_Roster_Export_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}

function exportEmployeesToCSV(employees) {
  const headers = ['Employee ID', 'Name', 'Email', 'Role', 'Department', 'Status', 'Current Hours', 'Max Hours', 'Fatigue Score', 'Skills', 'Certifications'];
  const rows = employees.map(e => [
    e.id,
    `"${(e.name || '').replace(/"/g, '""')}"`,
    `"${e.email || ''}"`,
    `"${e.role}"`,
    `"${e.department}"`,
    e.status,
    e.current_weekly_hours,
    e.max_weekly_hours,
    `${e.fatigue_score || 0}%`,
    `"${(e.skills || []).join('; ')}"`,
    `"${(e.certifications || []).map(c => typeof c === 'string' ? c : c.name).join('; ')}"`
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(`ShiftWise_Staff_Directory_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}

function exportHeatmapToCSV(heatmap) {
  if (!heatmap) return;
  const skills = heatmap.tracked_skills || [];
  const headers = ['Shift Title', 'Department', 'Time Window', ...skills];
  const rows = (heatmap.matrix || []).map(r => {
    const skillCounts = skills.map(sk => r.coverage[sk]?.count || 0);
    return [
      `"${(r.shift_title || '').replace(/"/g, '""')}"`,
      `"${r.department}"`,
      `"${r.time_window}"`,
      ...skillCounts
    ];
  });
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(`ShiftWise_Competency_Matrix_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}


// ---------------- Multi-Language (i18n) Dictionary ----------------
const TRANSLATIONS = {
  en: {
    title: "ShiftWise",
    subtitle: "Business-Based Workforce Scheduling & Resilience Platform",
    liveDashboard: "Live Dashboard",
    rosterSchedule: "Schedule & Shifts",
    staffDirectory: "Staff Directory",
    skillHeatmap: "Skill Matrix",
    whatIfSimulator: "Disaster Simulator",
    shiftSwaps: "Shift Swaps",
    skillAcademy: "Training Academy",
    resilienceScore: "Resilience Index",
    coverageRate: "Coverage Rate",
    staffShortages: "Staffing Shortages",
    activeConflicts: "Active Conflicts",
    fatigueRisk: "Burnout Risk",
    autoAssignAll: "Auto-Assign All",
    oneClickRepair: "One-Click Schedule Repair",
    emergencyMode: "Emergency Mode",
    activeEmergency: "EMERGENCY PROTOCOL ACTIVE: Overtime caps relaxed to 56h & rest rules adjusted",
    normalProtocol: "Standard Compliance Active (11h min rest & 40h cap)",
    shortageAlert: "Real-Time Staffing Shortage Alerts",
    unfilledWarning: "shifts are critically understaffed",
    conflictsAlert: "Active Conflict & Compliance Violations",
    findReplacement: "Find Replacement",
    addShift: "Create Shift",
    addEmployee: "Add Personnel",
    resetDemo: "Reset Demo Data",
    filterDepartment: "Department",
    allDepartments: "All Departments",
    hoursPerWeek: "hrs / wk",
    fatigueIndex: "Fatigue Index",
    compatible: "Compatible",
    incompatible: "Conflict Risk",
    simulateScenario: "Run Stress Simulation",
    testRecovery: "Test Auto-Recovery",
    completeCourse: "Complete & Accredit Skill",
    certified: "Certified",
    requiredSkills: "Required Skills",
    requiredCerts: "Required Certifications",
    teamCodesprint: "ShiftWise Business-Based Shift Management • Team CODESPRINT • Problem Statement 36"
  },
  es: {
    title: "ShiftWise",
    subtitle: "Plataforma Empresarial de Turnos y Resiliencia Hospitalaria",
    liveDashboard: "Panel en Vivo",
    rosterSchedule: "Turnos y Horarios",
    staffDirectory: "Directorio de Personal",
    skillHeatmap: "Matriz de Habilidades",
    whatIfSimulator: "Simulador de Desastres",
    shiftSwaps: "Intercambio de Turnos",
    skillAcademy: "Academia de Formación",
    resilienceScore: "Índice de Resiliencia",
    coverageRate: "Tasa de Cobertura",
    staffShortages: "Faltante de Personal",
    activeConflicts: "Conflictos Activos",
    fatigueRisk: "Riesgo de Fatiga",
    autoAssignAll: "Asignación Automática",
    oneClickRepair: "Reparación en 1 Clic",
    emergencyMode: "Modo Emergencia",
    activeEmergency: "PROTOCOLO DE EMERGENCIA ACTIVO: Límite ampliado a 56h",
    normalProtocol: "Cumplimiento Estándar Activo (11h descanso y 40h máx)",
    shortageAlert: "Alertas de Escasez en Tiempo Real",
    unfilledWarning: "turnos necesitan personal urgente",
    conflictsAlert: "Violaciones de Cumplimiento",
    findReplacement: "Buscar Reemplazo",
    addShift: "Crear Turno",
    addEmployee: "Agregar Personal",
    resetDemo: "Restablecer Datos",
    filterDepartment: "Departamento",
    allDepartments: "Todos los Departamentos",
    hoursPerWeek: "hrs / sem",
    fatigueIndex: "Índice de Fatiga",
    compatible: "Compatible",
    incompatible: "Riesgo de Conflicto",
    simulateScenario: "Ejecutar Simulación",
    testRecovery: "Probar Auto-Recuperación",
    completeCourse: "Completar y Certificar",
    certified: "Certificado",
    requiredSkills: "Habilidades Requeridas",
    requiredCerts: "Certificaciones",
    teamCodesprint: "ShiftWise Enterprise • Equipo CODESPRINT • Planteamiento 36"
  },
  fr: {
    title: "ShiftWise",
    subtitle: "Planification Hospitalière et Résilience Opérationnelle",
    liveDashboard: "Tableau de Bord",
    rosterSchedule: "Planning & Postes",
    staffDirectory: "Annuaire du Personnel",
    skillHeatmap: "Matrice de Compétences",
    whatIfSimulator: "Simulateur d'Urgence",
    shiftSwaps: "Échange de Gardes",
    skillAcademy: "Académie de Formation",
    resilienceScore: "Indice de Résilience",
    coverageRate: "Taux de Couverture",
    staffShortages: "Manque d'Effectif",
    activeConflicts: "Conflits Détectés",
    fatigueRisk: "Risque de Fatigue",
    autoAssignAll: "Attribution Auto",
    oneClickRepair: "Réparation en 1 Clic",
    emergencyMode: "Mode Urgence",
    activeEmergency: "PROTOCOLE D'URGENCE ACTIF : Plafond 56h",
    normalProtocol: "Conformité Normale Active (11h repos & 40h max)",
    shortageAlert: "Alertes d'Effectif en Direct",
    unfilledWarning: "gardes sous-effectuées",
    conflictsAlert: "Infractions Détectées",
    findReplacement: "Trouver Remplaçant",
    addShift: "Créer un Poste",
    addEmployee: "Ajouter Personnel",
    resetDemo: "Réinitialiser Données",
    filterDepartment: "Service",
    allDepartments: "Tous les Services",
    hoursPerWeek: "h / sem",
    fatigueIndex: "Indice de Fatigue",
    compatible: "Compatible",
    incompatible: "Risque de Conflit",
    simulateScenario: "Lancer Simulation",
    testRecovery: "Tester Récupération",
    completeCourse: "Valider Formation",
    certified: "Certifié",
    requiredSkills: "Compétences",
    requiredCerts: "Certifications",
    teamCodesprint: "ShiftWise Enterprise • Équipe CODESPRINT • Défi 36"
  },
  de: {
    title: "ShiftWise",
    subtitle: "Betriebliche Dienstplanung & Resilienz-Management",
    liveDashboard: "Live Dashboard",
    rosterSchedule: "Dienstplan & Schichten",
    staffDirectory: "Mitarbeiterverzeichnis",
    skillHeatmap: "Skill-Matrix",
    whatIfSimulator: "Notfall-Simulator",
    shiftSwaps: "Schichttausch",
    skillAcademy: "Schulungsakademie",
    resilienceScore: "Resilienz-Index",
    coverageRate: "Abdeckungsrate",
    staffShortages: "Personalengpässe",
    activeConflicts: "Aktive Konflikte",
    fatigueRisk: "Überlastungsrisiko",
    autoAssignAll: "Auto-Zuweisung",
    oneClickRepair: "1-Klick Reparatur",
    emergencyMode: "Notfallmodus",
    activeEmergency: "NOTFALLMODUS AKTIV: Arbeitszeitlimit 56h",
    normalProtocol: "Standardkonformität (11h Ruhe & 40h Limit)",
    shortageAlert: "Echtzeit-Engpassmeldungen",
    unfilledWarning: "Schichten unterbesetzt",
    conflictsAlert: "Regelverstöße",
    findReplacement: "Ersatz Finden",
    addShift: "Schicht Erstellen",
    addEmployee: "Mitarbeiter Hinzufügen",
    resetDemo: "Daten Zurücksetzen",
    filterDepartment: "Abteilung",
    allDepartments: "Alle Abteilungen",
    hoursPerWeek: "Std / Wo",
    fatigueIndex: "Erschöpfungsindex",
    compatible: "Kompatibel",
    incompatible: "Konfliktrisiko",
    simulateScenario: "Simulation Starten",
    testRecovery: "Auto-Reparatur Testen",
    completeCourse: "Kurs Abschließen",
    certified: "Zertifiziert",
    requiredSkills: "Erforderliche Skills",
    requiredCerts: "Zertifizierungen",
    teamCodesprint: "ShiftWise Enterprise • Team CODESPRINT • Problem 36"
  },
  hi: {
    title: "ShiftWise",
    subtitle: "स्मार्ट शिफ्ट शेड्यूलिंग और वर्कफ़ोर्स रेजिलिएंस प्लेटफ़ॉर्म",
    liveDashboard: "लाइव डैशबोर्ड",
    rosterSchedule: "शेड्यूल और शिफ्ट्स",
    staffDirectory: "स्टाफ डायरेक्टरी",
    skillHeatmap: "स्किल हीटमैप",
    whatIfSimulator: "आपातकालीन सिम्युलेटर",
    shiftSwaps: "शिफ्ट स्वैप",
    skillAcademy: "ट्रेनिंग अकादमी",
    resilienceScore: "रेजिलिएंस स्कोर",
    coverageRate: "कवरेज दर",
    staffShortages: "स्टाफ की कमी",
    activeConflicts: "सक्रिय टकराव",
    fatigueRisk: "थकान जोखिम",
    autoAssignAll: "ऑटो-असाइन ऑल",
    oneClickRepair: "1-क्लिक शेड्यूल रिपेयर",
    emergencyMode: "आपातकालीन मोड",
    activeEmergency: "आपातकालीन प्रोटोकॉल सक्रिय: 56 घंटे तक सीमा शिथिल",
    normalProtocol: "मानक अनुपालन सक्रिय (11 घंटे विश्राम)",
    shortageAlert: "स्टाफिंग कमी अलर्ट",
    unfilledWarning: "शिफ्ट्स में स्टाफ की तत्काल आवश्यकता है",
    conflictsAlert: "नियम उल्लंघन व टकराव",
    findReplacement: "प्रतिस्थापन खोजें",
    addShift: "शिफ्ट बनाएं",
    addEmployee: "कर्मचारी जोड़ें",
    resetDemo: "डेमो डेटा रीसेट",
    filterDepartment: "विभाग",
    allDepartments: "सभी विभाग",
    hoursPerWeek: "घंटे / सप्ताह",
    fatigueIndex: "थकान सूचकांक",
    compatible: "अनुकूल",
    incompatible: "टकराव जोखिम",
    simulateScenario: "सिमुलेशन चलाएं",
    testRecovery: "रिकवरी टेस्ट करें",
    completeCourse: "कोर्स पूरा करें",
    certified: "प्रमाणित",
    requiredSkills: "आवश्यक कौशल",
    requiredCerts: "प्रमाणपत्र",
    teamCodesprint: "ShiftWise Enterprise • टीम CODESPRINT • प्रॉब्लम 36"
  },
  ja: {
    title: "ShiftWise",
    subtitle: "医療・企業向けAIシフト管理＆レジリエンスプラットフォーム",
    liveDashboard: "ライブダッシュボード",
    rosterSchedule: "シフト＆スケジュール",
    staffDirectory: "スタッフ名簿",
    skillHeatmap: "スキルマトリクス",
    whatIfSimulator: "災害シミュレーター",
    shiftSwaps: "シフト交換",
    skillAcademy: "研修アカデミー",
    resilienceScore: "レジリエンス指数",
    coverageRate: "充足率",
    staffShortages: "人員不足",
    activeConflicts: "アクティブな競合",
    fatigueRisk: "過労リスク",
    autoAssignAll: "自動一括割当",
    oneClickRepair: "ワンクリック自動修復",
    emergencyMode: "緊急モード",
    activeEmergency: "緊急プロトコル作動中：上限56時間に緩和",
    normalProtocol: "標準コンプライアンス（11時間休息・40時間上限）",
    shortageAlert: "リアルタイム人員不足アラート",
    unfilledWarning: "シフトが人員不足です",
    conflictsAlert: "コンプライアンス違反",
    findReplacement: "代替者を検索",
    addShift: "シフト作成",
    addEmployee: "スタッフ追加",
    resetDemo: "デモデータ初期化",
    filterDepartment: "診療科・部門",
    allDepartments: "全診療科",
    hoursPerWeek: "時間 / 週",
    fatigueIndex: "疲労指数",
    compatible: "適合",
    incompatible: "競合リスク",
    simulateScenario: "シミュレーション実行",
    testRecovery: "自動回復テスト",
    completeCourse: "コース修了・認定",
    certified: "認定済",
    requiredSkills: "必要スキル",
    requiredCerts: "必要認定",
    teamCodesprint: "ShiftWise Enterprise • Team CODESPRINT • 課題 36"
  }
};


// ---------------- STARTING LOGIN DASHBOARD (PORTAL) ----------------
function LoginDashboard({ t, stats, employees, onLogin, showToast }) {
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [email, setEmail] = useState('druvith.raj@metrohealth.org');
  const [password, setPassword] = useState('hospital2026!');
  const [department, setDepartment] = useState('All Business Units');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString());
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [highlightInputs, setHighlightInputs] = useState(false);

  // Keep Lucide icons active
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  // Live seconds ticker on Login Dashboard
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Quick Verified Demo Clinical Personas with Real Passwords
  const demoPersonas = [
    {
      id: 1,
      name: "Dr. Druvith Raj",
      email: "druvith.raj@metrohealth.org",
      password: "hospital2026!",
      role: "Business Operations Director",
      department: "All Business Units",
      badgeId: "MH-DIR-01",
      avatar: "/static/assets/druvith_raj.jpg",
      description: "Full Administrative Authority • Schedule Optimization • Surge Protocol",
      accessLevel: "Executive Authority",
      tag: "Operations VP"
    },
    {
      id: 2,
      name: "Elena Rostova",
      email: "elena.rostova@metrohealth.org",
      password: "supervisor2026!",
      role: "Operations Shift Supervisor",
      department: "Operations & Logistics",
      badgeId: "BIZ-OPS-44",
      avatar: "https://images.unsplash.com/photo-1594824813571-638f0263613a?w=150",
      description: "Logistics Roster Command • Shift Dispatch • Overtime Authorization",
      accessLevel: "Operations Supervisor",
      tag: "Shift Supervisor"
    },
    {
      id: 3,
      name: "Emily Thorne",
      email: "emily.thorne@metrohealth.org",
      password: "cloudops2026!",
      role: "Lead Cloud Infrastructure Engineer",
      department: "IT & Cloud Infrastructure",
      badgeId: "BIZ-ENG-18",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150",
      description: "24/7 SRE Telemetry • Mutual Swaps • Technical Skill Academy",
      accessLevel: "Lead Engineer",
      tag: "Lead SRE"
    },
    {
      id: 4,
      name: "Administrator Console",
      email: "admin.console@metrohealth.org",
      password: "adminsecure2026!",
      role: "Enterprise Systems Auditor",
      department: "Corporate Administration",
      badgeId: "BIZ-SEC-99",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      description: "Audit Logs • Resilience Analytics • Database Seeding",
      accessLevel: "System Administrator",
      tag: "Compliance Lead"
    }
  ];

  const handleSelectPersona = (index) => {
    setSelectedRoleIndex(index);
    const persona = demoPersonas[index];
    setEmail(persona.email);
    setPassword(persona.password);
    setDepartment(persona.department);
    setErrorMessage('');
    setHighlightInputs(true);
    setTimeout(() => setHighlightInputs(false), 1200);
    showToast(`Loaded verified credentials for ${persona.name}`, 'info');
  };

  const handleFillCredentials = (persona, e) => {
    if (e) e.stopPropagation();
    const idx = demoPersonas.findIndex(p => p.id === persona.id);
    if (idx !== -1) setSelectedRoleIndex(idx);
    setEmail(persona.email);
    setPassword(persona.password);
    setDepartment(persona.department);
    setErrorMessage('');
    setHighlightInputs(true);
    setTimeout(() => setHighlightInputs(false), 1200);
    showToast(`Auto-filled credentials for ${persona.name}`, 'success');
  };

  const handleCopy = (text, key, e) => {
    if (e) e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    showToast(`Copied to clipboard: ${text}`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setShakeError(false);

    if (!email.trim()) {
      setErrorMessage('Please enter your corporate work email.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
      return;
    }
    if (!password) {
      setErrorMessage('Invalid password. Please enter a password or use the verified demo credentials below.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          department: department
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setErrorMessage('');
        onLogin(data.user);
      } else {
        const detailMsg = data.detail || 'Invalid password. Please check your credentials or use the demo credentials below.';
        setErrorMessage(detailMsg);
        setShakeError(true);
        showToast(detailMsg, 'error');
        setTimeout(() => setShakeError(false), 600);
      }
    } catch (err) {
      const errorMsg = 'Connection error. Please check your server or use a verified demo account.';
      setErrorMessage(errorMsg);
      setShakeError(true);
      showToast(errorMsg, 'error');
      setTimeout(() => setShakeError(false), 600);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstantDemoLogin = async () => {
    const activePersona = demoPersonas[selectedRoleIndex];
    setEmail(activePersona.email);
    setPassword(activePersona.password);
    setDepartment(activePersona.department);
    setErrorMessage('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: activePersona.email,
          password: activePersona.password,
          department: activePersona.department
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        onLogin(data.user);
      } else {
        const errorDetail = data.detail || 'Authentication failed';
        setErrorMessage(errorDetail);
        setShakeError(true);
        setTimeout(() => setShakeError(false), 600);
      }
    } catch (err) {
      setErrorMessage('Network error during authentication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmergencySurgeLogin = async () => {
    const activePersona = demoPersonas[0];
    setEmail(activePersona.email);
    setPassword(activePersona.password);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: activePersona.email,
          password: activePersona.password,
          department: "Operations & Logistics"
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        onLogin({ ...data.user, emergency_surge_active: true });
      } else {
        setErrorMessage(data.detail || 'Surge mode authentication failed');
      }
    } catch (err) {
      setErrorMessage('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const activePersona = demoPersonas[selectedRoleIndex];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-brand-600 selection:text-white">
      
      {/* ---------------- Top Business Operations Ticker ---------------- */}
      <div className="w-full max-w-6xl mx-auto mb-4 bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-white tracking-wide uppercase font-mono text-[11px]">System Status: Normal Level 1</span>
          </div>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden sm:inline">Enterprise Business Network (Operations Hub: BIZ-MAIN-01)</span>
        </div>

        <div className="flex items-center space-x-4 text-slate-400 text-[11px] font-mono">
          <span className="flex items-center space-x-1">
            <i data-lucide="clock" className="w-3.5 h-3.5 text-cyan-400"></i>
            <span className="text-slate-200">{currentTime}</span>
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:flex items-center space-x-1 text-slate-300">
            <i data-lucide="shield-check" className="w-3.5 h-3.5 text-emerald-400"></i>
            <span>Real Auth Validated</span>
          </span>
          <span className="hidden lg:inline text-slate-500">•</span>
          <span className="hidden lg:inline text-brand-400 font-semibold">Operations Command: ext. 4400</span>
        </div>
      </div>

      {/* ---------------- Main Dual-Panel Dashboard Card ---------------- */}
      <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-700/60 overflow-hidden flex flex-col lg:flex-row my-auto">
        
        {/* Left Side: Operations Command Hero Graphic & Metrics */}
        <div className="lg:w-5/12 bg-slate-950 text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            
            {/* Brand Logo & System Category */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 via-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <i data-lucide="calendar-check-2" className="w-6 h-6"></i>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-black text-white tracking-tight font-display">ShiftWise</span>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/40">
                    Business
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Business Operations Command</p>
              </div>
            </div>

            {/* Headline & Overview */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display leading-tight">
                Business-Based Shift Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Autonomous schedule conflict resolution, live business shift shortage telemetry, rest compliance enforcement, and enterprise resilience management.
              </p>
            </div>

            {/* Graphic Illustration Card */}
            <div className="rounded-xl overflow-hidden border border-slate-800 shadow-xl relative group">
              <img
                src="/static/assets/command_banner.jpg"
                alt="Operations Command Center"
                className="w-full h-40 object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end p-3.5">
                <div className="flex items-center justify-between w-full text-xs">
                  <span className="font-semibold text-white flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-mono text-[11px]">Active Clinical Command Feed • Week 41</span>
                  </span>
                  <span className="text-[11px] font-mono text-cyan-300 font-bold bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-500/30">
                    24/7 Redundant
                  </span>
                </div>
              </div>
            </div>

            {/* Live Telemetry KPI Cards */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <div className="text-lg sm:text-xl font-black text-white font-mono">99.98%</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Engine SLA</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">1,240+</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Shifts Managed</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <div className="text-lg sm:text-xl font-black text-cyan-300 font-mono">11h Rest</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Law Enforced</div>
              </div>
            </div>

          </div>

          {/* Security & Regulatory Compliance Footer */}
          <div className="relative z-10 pt-6 mt-6 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
              <i data-lucide="shield-check" className="w-4 h-4"></i>
              <span>HIPAA & HITECH Compliant</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-400">
              <i data-lucide="lock" className="w-3.5 h-3.5 text-cyan-400"></i>
              <span>256-Bit TLS End-to-End</span>
            </span>
          </div>
        </div>

        {/* Right Side: Sign-In Console & Real Credential Verification */}
        <div className="lg:w-7/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white space-y-5 overflow-y-auto max-h-[92vh]">
          <div>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                  Business Operations Sign-In
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Authenticate with verified credentials or select any pre-configured demo account below.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-mono font-bold border border-emerald-200 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Auth</span>
              </span>
            </div>

            {/* ERROR BANNER: Shown when password or credentials fail */}
            {errorMessage && (
              <div className="mt-4 bg-rose-50 border-2 border-rose-500/80 rounded-xl p-3.5 shadow-md flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-9 h-9 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center flex-shrink-0 text-rose-600 mt-0.5">
                  <i data-lucide="shield-alert" className="w-5 h-5"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-900 font-mono flex items-center space-x-1.5">
                      <span>Authentication Rejected</span>
                    </h4>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-800">
                      HTTP 401
                    </span>
                  </div>
                  <p className="text-xs text-rose-800 font-bold mt-1 leading-snug">
                    {errorMessage}
                  </p>
                  
                  {/* Quick Fix Button */}
                  <div className="mt-2.5 pt-2 border-t border-rose-200/80 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPassword(activePersona.password);
                        setErrorMessage('');
                        showToast(`Restored valid password for ${activePersona.name}!`, 'success');
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[11px] font-bold shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      <i data-lucide="key" className="w-3.5 h-3.5"></i>
                      <span>Auto-Fix Password: "{activePersona.password}"</span>
                    </button>
                    <span className="text-[11px] text-rose-600 font-medium">
                      or choose an account below
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick 1-Click Persona Selector */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-500">
                  Select Business Persona (Click to Switch):
                </span>
                <span className="text-[10px] text-brand-600 font-semibold">1-Click Auto-Fill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoPersonas.map((persona, pIdx) => {
                  const isSelected = selectedRoleIndex === pIdx;
                  return (
                    <div
                      key={persona.id}
                      onClick={() => handleSelectPersona(pIdx)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                        isSelected
                          ? 'bg-blue-50/90 border-brand-500 shadow-sm ring-1 ring-brand-500'
                          : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                      }`}
                    >
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className={`w-9 h-9 rounded-full object-cover border flex-shrink-0 mt-0.5 ${
                          isSelected ? 'border-brand-500 ring-2 ring-brand-200' : 'border-slate-300'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">{persona.name}</span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 ml-1 flex-shrink-0">
                            {persona.tag}
                          </span>
                        </div>
                        <div className="text-[10px] text-brand-700 font-semibold truncate mt-0.5">{persona.role}</div>
                        <div className="text-[9px] text-slate-400 font-mono truncate">{persona.badgeId} • {persona.accessLevel}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Credentials Form with Validation & Shake */}
            <form onSubmit={handleFormSubmit} className={`mt-4 space-y-3 text-xs ${shakeError ? 'shake-animation' : ''}`}>
              <div>
                <label className="text-slate-700 font-semibold flex items-center justify-between mb-1">
                  <span>Corporate Work Email</span>
                  <span className="text-[10px] font-mono text-slate-400">Checked against directory</span>
                </label>
                <div className="relative">
                  <i data-lucide="mail" className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className={`w-full bg-slate-50 border text-slate-900 pl-9 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none text-xs font-medium transition ${
                      highlightInputs ? 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-50/20' : 'border-slate-300'
                    }`}
                    placeholder="name@metrohealth.org"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">Security Key / Password</label>
                  <span className="text-[10px] font-mono text-slate-400">Real validation active</span>
                </div>
                <div className="relative">
                  <i data-lucide="lock" className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className={`w-full bg-slate-50 border text-slate-900 pl-9 pr-10 py-2 rounded-lg focus:ring-2 focus:outline-none font-mono text-xs transition ${
                      errorMessage
                        ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/30 text-rose-900'
                        : highlightInputs
                        ? 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-50/20'
                        : 'border-slate-300 focus:ring-brand-500'
                    }`}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <i data-lucide={showPassword ? 'eye-off' : 'eye'} className="w-4 h-4"></i>
                  </button>
                </div>

                {/* Helpful Hint & Test Wrong Password shortcut */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-0.5">
                  <div className="flex items-center space-x-1">
                    <span>Valid key for {activePersona.name.split(' ')[0]}:</span>
                    <span className="font-mono font-bold text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded border border-brand-200">
                      {activePersona.password}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPassword('wrong_password_999!');
                      showToast('Entered incorrect password. Click "Sign In" to see error validation!', 'warning');
                    }}
                    className="text-rose-600 hover:text-rose-800 font-mono text-[10px] font-semibold underline cursor-pointer"
                    title="Simulate entering a wrong password"
                  >
                    Test Wrong Password
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Department / Business Unit Access</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer text-xs font-medium"
                >
                  <option value="All Business Units">All Business Units (Enterprise Company-Wide)</option>
                  <option value="Operations & Logistics">Operations & Logistics</option>
                  <option value="IT & Cloud Infrastructure">IT & Cloud Infrastructure</option>
                  <option value="Customer Operations">Customer Operations</option>
                  <option value="Finance & Risk Management">Finance & Risk Management</option>
                  <option value="Quality & Compliance">Quality & Compliance</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-[11px]">Remember this business workstation</span>
                </label>
                <span className="text-[11px] text-brand-600 hover:text-brand-800 cursor-pointer font-semibold">
                  IT Support Helpdesk
                </span>
              </div>

              {/* Action Buttons: Sign-In & Instant Demo */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
                >
                  <i data-lucide="log-in" className="w-4 h-4"></i>
                  <span>{submitting ? 'Verifying Credentials...' : `Sign In as ${activePersona.name}`}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleInstantDemoLogin}
                    disabled={submitting}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                    title="Authenticate automatically with active persona credentials"
                  >
                    <i data-lucide="zap" className="w-3.5 h-3.5 text-amber-500"></i>
                    <span>Instant 1-Click Access</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEmergencySurgeLogin}
                    disabled={submitting}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                    title="Enter directly in Emergency Surge Protocol Mode"
                  >
                    <i data-lucide="alert-triangle" className="w-3.5 h-3.5 text-rose-600"></i>
                    <span>Surge Mode Bypass</span>
                  </button>
                </div>
              </div>
            </form>

            {/* ---------------- DEDICATED DEMO CREDENTIALS DIRECTORY ---------------- */}
            <div className="mt-5 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center space-x-1.5">
                  <i data-lucide="key-round" className="w-4 h-4 text-brand-600"></i>
                  <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                    Verified Demo Credentials
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Click Auto-Fill to populate</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoPersonas.map((persona) => {
                  const isCurrent = email === persona.email;
                  return (
                    <div
                      key={`cred-${persona.id}`}
                      className={`p-2.5 rounded-xl border text-xs transition-all ${
                        isCurrent
                          ? 'bg-blue-50/70 border-brand-400 shadow-sm ring-1 ring-brand-300'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-900 truncate text-[11px]">{persona.name}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                          {persona.tag}
                        </span>
                      </div>
                      
                      {/* Email row */}
                      <div className="flex items-center justify-between text-[10px] text-slate-600 mb-1">
                        <span className="font-semibold text-slate-500">Email:</span>
                        <div className="flex items-center space-x-1">
                          <code className="font-mono text-[10px] text-slate-800 bg-white px-1 py-0.5 rounded border border-slate-200">
                            {persona.email}
                          </code>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(persona.email, `email-${persona.id}`, e)}
                            className="text-slate-400 hover:text-brand-600 p-0.5"
                            title="Copy email"
                          >
                            <i data-lucide={copiedKey === `email-${persona.id}` ? "check" : "copy"} className="w-3 h-3"></i>
                          </button>
                        </div>
                      </div>

                      {/* Password row */}
                      <div className="flex items-center justify-between text-[10px] text-slate-600 mb-2">
                        <span className="font-semibold text-slate-500">Password:</span>
                        <div className="flex items-center space-x-1">
                          <code className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                            {persona.password}
                          </code>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(persona.password, `pwd-${persona.id}`, e)}
                            className="text-slate-400 hover:text-brand-600 p-0.5"
                            title="Copy password"
                          >
                            <i data-lucide={copiedKey === `pwd-${persona.id}` ? "check" : "copy"} className="w-3 h-3"></i>
                          </button>
                        </div>
                      </div>

                      {/* Auto-Fill Button */}
                      <button
                        type="button"
                        onClick={(e) => handleFillCredentials(persona, e)}
                        className={`w-full py-1 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 transition cursor-pointer ${
                          isCurrent
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-white hover:bg-brand-50 text-brand-700 border border-brand-200'
                        }`}
                      >
                        <i data-lucide="sparkles" className="w-3 h-3"></i>
                        <span>{isCurrent ? 'Credentials Active' : '⚡ Auto-Fill Credentials'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer Notice */}
          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center leading-relaxed">
            Enterprise Operations Center • Confidential Business Systems • Authorized Personnel Only • Corporate Security Protected
          </div>
        </div>

      </div>

      {/* ---------------- Bottom Platform Attribution ---------------- */}
      <div className="w-full max-w-6xl mx-auto mt-4 text-center text-slate-400 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2">
        <span>ShiftWise Business-Based Shift Management Platform</span>
        <span className="text-slate-300">Team CODESPRINT CBC052 • Problem Statement 36</span>
        <span>FastAPI v0.104.1 • React 18 Console</span>
      </div>

    </div>
  );
}


// ---------------- Main ShiftWise Application Component ----------------
function ShiftWiseApp() {
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // User friendly authentication: defaults to operational session with easy logout & switcher
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shiftwise_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          if (parsed.name === "Dr. Marcus Vance, MD" || parsed.name === "Dr. Marcus Vance") {
            parsed.name = "Dr. Druvith Raj";
            parsed.avatar_url = "/static/assets/druvith_raj.jpg";
            parsed.email = "druvith.raj@metrohealth.org";
          }
          return parsed;
        }
      }
    } catch (e) {}
    return {
      id: 1,
      name: "Dr. Druvith Raj",
      email: "druvith.raj@metrohealth.org",
      role: "Business Operations Director",
      department: "All Business Units",
      badge_id: "MH-DIR-01",
      avatar_url: "/static/assets/druvith_raj.jpg"
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('shiftwise_auth') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [courses, setCourses] = useState([]);
  const [heatmap, setHeatmap] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mobile sidebar drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter States
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Drawers
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [selectedShiftForReplacement, setSelectedShiftForReplacement] = useState(null);
  const [replacementCandidates, setReplacementCandidates] = useState([]);
  const [repairModalData, setRepairModalData] = useState(null);
  const [activeCertificateCourse, setActiveCertificateCourse] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Simulator State
  const [simScenario, setSimScenario] = useState('flu_wave');
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  // Swap Tool State
  const [swapRequesterId, setSwapRequesterId] = useState('');
  const [swapShiftId, setSwapShiftId] = useState('');
  const [swapTargetEmpId, setSwapTargetEmpId] = useState('');
  const [swapTargetShiftId, setSwapTargetShiftId] = useState('');
  const [swapCheckResult, setSwapCheckResult] = useState(null);

  // Skill Academy Active Employee
  const [academyEmpId, setAcademyEmpId] = useState('');

  // Toast Helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Login handler
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('shiftwise_auth', 'true');
      localStorage.setItem('shiftwise_user', JSON.stringify(user));
    } catch (e) {}
    showToast(`Welcome back, ${user.name}! Connected to ShiftWise Business Operations Console.`, 'success');
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem('shiftwise_auth', 'false');
    } catch (e) {}
    showToast('Signed out. You can switch personas or sign back in anytime!', 'info');
  };

  // Fetch all initial data
  const fetchData = async () => {
    try {
      const [
        statsRes,
        shiftsRes,
        employeesRes,
        conflictsRes,
        swapsRes,
        coursesRes,
        heatmapRes,
        logsRes,
        notifsRes
      ] = await Promise.all([
        fetch('/api/dashboard/stats').then(r => r.json()),
        fetch('/api/shifts').then(r => r.json()),
        fetch('/api/employees').then(r => r.json()),
        fetch('/api/conflicts').then(r => r.json()),
        fetch('/api/swaps').then(r => r.json()),
        fetch('/api/courses').then(r => r.json()),
        fetch('/api/dashboard/heatmap').then(r => r.json()),
        fetch('/api/activity').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json()),
      ]);

      setStats(statsRes);
      setShifts(shiftsRes);
      setEmployees(employeesRes);
      setConflicts(conflictsRes);
      setSwaps(swapsRes);
      setCourses(coursesRes);
      setHeatmap(heatmapRes);
      setActivityLogs(logsRes);
      setNotifications(notifsRes);

      if (employeesRes.length > 0 && !academyEmpId) {
        setAcademyEmpId(employeesRes[0].id);
      }
      if (employeesRes.length > 1 && !swapRequesterId) {
        setSwapRequesterId(employeesRes[0].id);
        setSwapTargetEmpId(employeesRes[1].id);
      }
      if (shiftsRes.length > 0 && !swapShiftId) {
        setSwapShiftId(shiftsRes[0].id);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('Error syncing with backend server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update icons when Lucide is available
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  // Notification & Shift Headcount Handlers
  const handleMarkNotificationRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      showToast('All notifications marked as read', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickSetHeadcount = async (shiftId, newHeadcount = 5) => {
    try {
      const res = await fetch(`/api/shifts/${shiftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ required_headcount: parseInt(newHeadcount) })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Shift headcount updated to ${newHeadcount}! Dispatched skill upgrade notifications to ${data.notified_count || 5} staff members.`, 'success');
        await fetchData();
      } else {
        showToast(data.detail || 'Failed to update shift headcount', 'error');
      }
    } catch (err) {
      showToast('Error updating shift headcount', 'error');
    }
  };

  const handleNotifySkillUpgrade = async (shiftId, targetSkills = null) => {
    try {
      const res = await fetch(`/api/shifts/${shiftId}/notify-upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shift_id: shiftId,
          target_headcount: 5,
          target_skills: targetSkills
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`📢 Skill upgrade notifications dispatched to ${data.notified_count} staff members for Shift #${shiftId}!`, 'success');
        await fetchData();
        setShowNotificationDrawer(true);
      } else {
        showToast(data.detail || 'Failed to send notifications', 'error');
      }
    } catch (err) {
      showToast('Error sending notifications', 'error');
    }
  };

  const handleSaveEditShift = async (shiftId, updateData) => {
    try {
      const res = await fetch(`/api/shifts/${shiftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Shift updated! Headcount is now ${data.required_headcount}. Notifications dispatched: ${data.notified_count}.`, 'success');
        setEditingShift(null);
        await fetchData();
      } else {
        showToast(data.detail || 'Failed to update shift', 'error');
      }
    } catch (err) {
      showToast('Error updating shift', 'error');
    }
  };

  const handleOpenAcademyForUpgrade = (empId, courseId = null) => {
    if (empId) {
      setAcademyEmpId(empId);
    }
    setActiveTab('academy');
    setShowNotificationDrawer(false);
    showToast('Navigated to Skill Academy to complete required training!', 'info');
  };

  // 1. One-Click Schedule Repair Action
  const handleOneClickRepair = async () => {
    try {
      showToast('Initiating AI-Powered Schedule Optimizer & Conflict Repair...', 'info');
      const res = await fetch('/api/shifts/repair', { method: 'POST' });
      const data = await res.json();
      setRepairModalData(data);
      showToast(`Schedule Repaired! ${data.conflicts_resolved} conflicts resolved, ${data.newly_assigned} slots filled.`, 'success');
      await fetchData();
    } catch (err) {
      showToast('Schedule repair failed', 'error');
    }
  };

  // 2. Auto-Assign All Action
  const handleAutoAssign = async () => {
    try {
      showToast('Executing Heuristic Auto-Assignment Engine...', 'info');
      const res = await fetch('/api/shifts/auto-assign', { method: 'POST' });
      const data = await res.json();
      showToast(`Auto-Assignment complete! Filled ${data.assigned_count} shifts.`, 'success');
      await fetchData();
    } catch (err) {
      showToast('Auto-Assignment failed', 'error');
    }
  };

  // 3. Toggle Emergency Mode Action
  const handleToggleEmergency = async () => {
    try {
      const res = await fetch('/api/settings/emergency', { method: 'POST' });
      const data = await res.json();
      showToast(data.message, data.emergency_mode ? 'error' : 'info');
      await fetchData();
    } catch (err) {
      showToast('Failed to toggle emergency mode', 'error');
    }
  };

  // 4. Reset Demo System
  const handleResetDemo = async () => {
    if (!confirm('Reset entire roster and database to fresh demo dataset?')) return;
    try {
      await fetch('/api/system/reset', { method: 'POST' });
      showToast('System reset to default demo scenario!', 'success');
      await fetchData();
    } catch (err) {
      showToast('Reset failed', 'error');
    }
  };

  // 5. Open Replacement Candidates Drawer
  const openReplacementDrawer = async (shift) => {
    setSelectedShiftForReplacement(shift);
    try {
      const res = await fetch(`/api/shifts/${shift.id}/replacements`);
      const data = await res.json();
      setReplacementCandidates(data);
    } catch (err) {
      setReplacementCandidates([]);
    }
  };

  // 6. Assign Candidate to Shift
  const handleAssignCandidate = async (employeeId) => {
    if (!selectedShiftForReplacement) return;
    try {
      const res = await fetch('/api/shifts/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shift_id: selectedShiftForReplacement.id,
          employee_id: employeeId
        })
      });
      const data = await res.json();
      showToast(data.message, 'success');
      setSelectedShiftForReplacement(null);
      await fetchData();
    } catch (err) {
      showToast('Assignment error', 'error');
    }
  };

  // 7. Unassign Candidate from Shift
  const handleUnassign = async (assignmentId) => {
    try {
      await fetch(`/api/shifts/unassign/${assignmentId}`, { method: 'DELETE' });
      showToast('Assignment removed', 'info');
      await fetchData();
    } catch (err) {
      showToast('Failed to remove assignment', 'error');
    }
  };

  // 8. Run What-If Simulator
  const handleRunSimulator = async () => {
    setSimLoading(true);
    try {
      const res = await fetch('/api/simulator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: simScenario })
      });
      const data = await res.json();
      setSimResult(data);
      showToast(`Simulation completed: ${data.title}`, 'info');
    } catch (err) {
      showToast('Simulation failed', 'error');
    } finally {
      setSimLoading(false);
    }
  };

  // 9. Check Swap Compatibility
  const handleCheckSwap = async () => {
    if (!swapRequesterId || !swapTargetEmpId || !swapShiftId) {
      showToast('Select employees and shift to test swap', 'warning');
      return;
    }
    try {
      const res = await fetch('/api/swaps/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester_id: parseInt(swapRequesterId),
          target_employee_id: parseInt(swapTargetEmpId),
          shift_id: parseInt(swapShiftId),
          target_shift_id: swapTargetShiftId ? parseInt(swapTargetShiftId) : null
        })
      });
      const data = await res.json();
      setSwapCheckResult(data);
    } catch (err) {
      showToast('Failed to evaluate swap', 'error');
    }
  };

  // 10. Submit Swap Request
  const handleSubmitSwap = async () => {
    try {
      const res = await fetch('/api/swaps/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester_id: parseInt(swapRequesterId),
          target_employee_id: parseInt(swapTargetEmpId),
          shift_id: parseInt(swapShiftId),
          target_shift_id: swapTargetShiftId ? parseInt(swapTargetShiftId) : null
        })
      });
      const data = await res.json();
      showToast('Swap request submitted successfully!', 'success');
      setSwapCheckResult(null);
      await fetchData();
    } catch (err) {
      showToast('Swap submission failed', 'error');
    }
  };

  // 11. Approve Swap
  const handleApproveSwap = async (swapId) => {
    try {
      await fetch(`/api/swaps/${swapId}/approve`, { method: 'POST' });
      showToast('Swap approved and roster updated!', 'success');
      await fetchData();
    } catch (err) {
      showToast('Approval error', 'error');
    }
  };

  // 12. Complete Skill Academy Course
  const handleCompleteCourse = async (courseId, targetEmpId = null) => {
    const empIdToUse = targetEmpId || academyEmpId;
    if (!empIdToUse) {
      showToast('Select an employee to award course completion', 'warning');
      return;
    }
    try {
      const res = await fetch('/api/courses/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: parseInt(empIdToUse),
          course_id: courseId
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        await fetchData();
        const courseObj = courses.find(c => c.id === courseId);
        if (courseObj) {
          setActiveCertificateCourse(courseObj);
        }
      } else {
        showToast(data.detail || 'Course completion failed', 'error');
      }
    } catch (err) {
      showToast('Course completion error', 'error');
    }
  };

  // Filtered shifts calculation
  const filteredShifts = useMemo(() => {
    return shifts.filter(s => {
      const matchDept = deptFilter === 'All' || s.department === deptFilter;
      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Shortage' && s.is_short) ||
        (statusFilter === 'Filled' && !s.is_short);
      return matchDept && matchStatus;
    });
  }, [shifts, deptFilter, statusFilter]);

  // Unique departments
  const departments = useMemo(() => {
    const list = Array.from(new Set(shifts.map(s => s.department)));
    return ['All', ...list];
  }, [shifts]);

  // ---------------- DISPLAY LOGIN DASHBOARD AT STARTING ----------------
  if (!isAuthenticated) {
    return (
      <LoginDashboard
        t={t}
        stats={stats}
        employees={employees}
        onLogin={handleLogin}
        showToast={showToast}
      />
    );
  }

  // If loading initial state inside operations console
  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-700">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight font-display">Connecting to ShiftWise Operations Console...</h2>
        <p className="text-xs text-slate-500 mt-1">Authenticating session and loading live clinical telemetry</p>
      </div>
    );
  }

  const resilience = stats?.resilience || { score: 78, tier: "Moderate Risk", vulnerabilities: [] };
  const resilienceScore = resilience.score || 75;
  const isEmergency = stats?.emergency_mode || false;
  const pendingSwapsCount = swaps.filter(s => s.status === 'pending').length;

  const navItems = [
    {
      category: "OPERATIONS",
      items: [
        { id: 'dashboard', label: t.liveDashboard, icon: 'layout-dashboard' },
        { id: 'schedule', label: t.rosterSchedule, icon: 'calendar', badge: stats?.total_gaps, badgeColor: 'bg-rose-100 text-rose-700' },
        { id: 'employees', label: t.staffDirectory, icon: 'users' },
      ]
    },
    {
      category: "INTELLIGENCE & RESILIENCE",
      items: [
        { id: 'heatmap', label: t.skillHeatmap, icon: 'grid' },
        { id: 'simulator', label: t.whatIfSimulator, icon: 'play-circle' },
        { id: 'swaps', label: t.shiftSwaps, icon: 'repeat', badge: pendingSwapsCount, badgeColor: 'bg-amber-100 text-amber-800' },
      ]
    },
    {
      category: "WORKFORCE DEVELOPMENT",
      items: [
        { id: 'academy', label: t.skillAcademy, icon: 'graduation-cap' },
      ]
    }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* ---------------- Top Emergency Protocol Alert Ribbon ---------------- */}
      {isEmergency && (
        <div className="emergency-active text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm z-50">
          <div className="flex items-center space-x-2.5 max-w-7xl mx-auto w-full">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span className="font-bold tracking-wider uppercase">🚨 {t.emergencyMode}</span>
            <span className="opacity-95 hidden sm:inline">— {t.activeEmergency}</span>
            <button
              onClick={handleToggleEmergency}
              className="ml-auto px-2.5 py-0.5 bg-white/20 hover:bg-white/30 text-white rounded text-xs font-bold transition"
            >
              Deactivate
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex w-full">
        
        {/* ---------------- Desktop Left Sidebar Navigation ---------------- */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen overflow-y-auto z-40 select-none">
          {/* Organization / App Logo Header */}
          <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-blue-500 flex items-center justify-center text-white shadow-xs flex-shrink-0">
              <i data-lucide="calendar-check-2" className="w-5 h-5 text-white"></i>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-extrabold text-slate-900 tracking-tight font-display">ShiftWise</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 text-brand-700 rounded border border-blue-200 font-mono">
                  Business
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Business Shift Management</p>
            </div>
          </div>

          {/* Active Logged-In User Profile Card */}
          <div className="p-3 mx-3 my-2 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center space-x-2.5">
              <img
                src={currentUser?.avatar_url || "/static/assets/druvith_raj.jpg"}
                className="w-8 h-8 rounded-full object-cover border border-slate-300"
                alt={currentUser?.name}
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 truncate">{currentUser?.name || "Dr. Druvith Raj"}</div>
                <div className="text-[10px] text-brand-700 font-semibold truncate">{currentUser?.role || "Clinical Director"}</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[10px] text-slate-500">
              <span className="font-mono">{currentUser?.badge_id || "MH-DIR-01"}</span>
              <button
                onClick={handleLogout}
                className="text-rose-600 hover:text-rose-800 font-bold flex items-center space-x-1"
                title="Sign out of console"
              >
                <i data-lucide="log-out" className="w-3 h-3"></i>
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Navigation Items Grouped */}
          <div className="flex-1 px-3 py-2 space-y-5">
            {navItems.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <span className="px-3 text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
                  {group.category}
                </span>
                <div className="pt-1 space-y-0.5">
                  {group.items.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 transform ${
                          isActive
                            ? 'bg-blue-50/90 text-brand-700 font-bold shadow-xs translate-x-1'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 hover:translate-x-0.5'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <i
                            data-lucide={item.icon}
                            className={`w-4 h-4 transition-colors ${isActive ? 'text-brand-600' : 'text-slate-400'}`}
                          ></i>
                          <span>{item.label}</span>
                        </div>
                        {item.badge > 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono badge-pop ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Buttons in Sidebar */}
          <div className="px-3 pb-3 space-y-1.5">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="w-full py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <i data-lucide="radio" className="w-3.5 h-3.5 text-rose-600"></i>
              <span>Broadcast Staff Alert</span>
            </button>

            <button
              onClick={() => exportShiftsToCSV(shifts)}
              className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <i data-lucide="download" className="w-3.5 h-3.5 text-slate-500"></i>
              <span>Download Schedule CSV</span>
            </button>
          </div>

          {/* Sidebar Footer: System Status */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/60">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase">Engine Status</span>
                <span className="flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-600">
                  <span className="beacon-dot"></span>
                  <span>99.98% SLA</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center justify-between">
                <span>Facility:</span>
                <strong className="text-slate-800 font-medium">Corporate HQ</strong>
              </div>
            </div>
          </div>
        </aside>

        {/* ---------------- Mobile Sidebar Drawer (Overlay) ---------------- */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden modal-overlay">
            <div className="w-72 bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-left p-4">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                      <i data-lucide="calendar-check-2" className="w-4 h-4"></i>
                    </div>
                    <span className="font-bold text-slate-900 text-base font-display">ShiftWise</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                    <i data-lucide="x" className="w-5 h-5"></i>
                  </button>
                </div>

                {/* Mobile User Profile */}
                <div className="p-3 my-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={currentUser?.avatar_url || "/static/assets/druvith_raj.jpg"}
                      className="w-7 h-7 rounded-full object-cover"
                      alt={currentUser?.name}
                    />
                    <div>
                      <div className="font-bold text-slate-900">{currentUser?.name || "Dr. Druvith Raj"}</div>
                      <div className="text-[10px] text-brand-700">{currentUser?.role}</div>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="text-rose-600 font-bold text-xs">
                    Sign Out
                  </button>
                </div>

                <div className="py-2 space-y-4">
                  {navItems.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-1">
                      <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
                        {group.category}
                      </span>
                      <div className="pt-1 space-y-0.5">
                        {group.items.map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                              activeTab === item.id
                                ? 'bg-blue-50 text-brand-700 font-bold'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <i data-lucide={item.icon} className="w-4 h-4"></i>
                              <span>{item.label}</span>
                            </div>
                            {item.badge > 0 && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono ${item.badgeColor}`}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 text-center">
                Enterprise Business Operations
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
          </div>
        )}

        {/* ---------------- Main Content Workspace (Right of Sidebar) ---------------- */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* Top Executive Header Bar */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
            <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
              
              {/* Left: Mobile Toggle & Facility Context */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg bg-slate-100"
                >
                  <i data-lucide="menu" className="w-5 h-5"></i>
                </button>

                <div>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                    <span>Enterprise Business Operations</span>
                    <span>/</span>
                    <span className="text-slate-800 font-semibold">{currentUser?.department || "Acute Care & Surgery"}</span>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight hidden sm:block font-display">
                    {t[activeTab === 'dashboard' ? 'liveDashboard' :
                        activeTab === 'schedule' ? 'rosterSchedule' :
                        activeTab === 'employees' ? 'staffDirectory' :
                        activeTab === 'heatmap' ? 'skillHeatmap' :
                        activeTab === 'simulator' ? 'whatIfSimulator' :
                        activeTab === 'swaps' ? 'shiftSwaps' : 'skillAcademy']}
                  </h2>
                </div>
              </div>

              {/* Right: Actions, Logged-in User, Language, Emergency Toggle */}
              <div className="flex items-center flex-wrap gap-2">
                
                {/* User Status Profile Capsule */}
                <div className="hidden sm:flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                  <img
                    src={currentUser?.avatar_url || "/static/assets/druvith_raj.jpg"}
                    className="w-5 h-5 rounded-full object-cover border border-slate-300"
                    alt={currentUser?.name}
                  />
                  <div className="text-left">
                    <span className="font-bold text-slate-900 block leading-tight">{currentUser?.name || "Dr. Druvith Raj"}</span>
                    <span className="text-[10px] text-brand-700 leading-tight block">{currentUser?.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-2 text-slate-400 hover:text-rose-600 transition"
                    title="Sign Out to Login Portal"
                  >
                    <i data-lucide="log-out" className="w-3.5 h-3.5"></i>
                  </button>
                </div>

                {/* Return to Login Dashboard / Clinician Switcher */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition shadow-xs cursor-pointer"
                  title="Return to Clinical Login Portal & Switch Role"
                >
                  <i data-lucide="log-out" className="w-3.5 h-3.5 text-brand-600"></i>
                  <span className="hidden md:inline">Login Portal</span>
                </button>

                {/* Workforce Notification Center Bell */}
                <button
                  onClick={() => setShowNotificationDrawer(true)}
                  className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-xs cursor-pointer hover:border-slate-300"
                  title="View Workforce Skill Upgrade Notifications"
                >
                  <i data-lucide="bell" className={`w-4 h-4 text-brand-600 ${notifications.filter(n => !n.is_read).length > 0 ? 'notification-bell-pulse' : ''}`}></i>
                  <span className="hidden sm:inline">Alerts</span>
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs badge-pop">
                      {notifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                </button>

                {/* Commercial Broadcast Alert Button */}
                <button
                  onClick={() => setShowBroadcastModal(true)}
                  className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition shadow-xs"
                  title="Broadcast instant staff callout"
                >
                  <i data-lucide="radio" className="w-3.5 h-3.5 text-rose-600"></i>
                  <span>Broadcast</span>
                </button>

                {/* Print Roster Button */}
                <button
                  onClick={() => window.print()}
                  className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-xs"
                  title="Print official clinical roster"
                >
                  <i data-lucide="printer" className="w-3.5 h-3.5 text-slate-500"></i>
                  <span className="hidden md:inline">Print</span>
                </button>

                {/* Language Selector */}
                <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
                  <i data-lucide="globe" className="w-3.5 h-3.5 text-slate-500"></i>
                  <select
                    value={lang}
                    onChange={e => setLang(e.target.value)}
                    className="bg-transparent text-slate-800 text-xs font-medium focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="en">EN</option>
                    <option value="es">ES</option>
                    <option value="fr">FR</option>
                    <option value="de">DE</option>
                    <option value="hi">HI</option>
                    <option value="ja">JA</option>
                  </select>
                </div>

                {/* Emergency Mode Toggle Button */}
                <button
                  onClick={handleToggleEmergency}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    isEmergency
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                  title="Toggle emergency protocol"
                >
                  <i data-lucide="alert-triangle" className={`w-3.5 h-3.5 ${isEmergency ? 'text-rose-600' : 'text-slate-500'}`}></i>
                  <span className="hidden sm:inline">{t.emergencyMode}</span>
                  <span className={`w-2 h-2 rounded-full ${isEmergency ? 'bg-rose-600 animate-ping' : 'bg-slate-400'}`}></span>
                </button>

                {/* Primary Action Button: One-Click Schedule Repair */}
                <button
                  onClick={handleOneClickRepair}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white btn-glow-primary border border-brand-700 shadow-sm"
                  title="Optimize schedule & repair all conflicts"
                >
                  <i data-lucide="sparkles" className="w-3.5 h-3.5 text-blue-200"></i>
                  <span>{t.oneClickRepair}</span>
                </button>

                {/* Reset Demo Button */}
                <button
                  onClick={handleResetDemo}
                  className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition shadow-xs"
                  title="Reset Demo Dataset"
                >
                  <i data-lucide="rotate-ccw" className="w-4 h-4"></i>
                </button>
              </div>

            </div>
          </header>

          {/* ---------------- Main View Container ---------------- */}
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
            <div key={activeTab} className="animate-view-fade-in">
              {activeTab === 'dashboard' && (
                <DashboardView
                  t={t}
                  stats={stats}
                  conflicts={conflicts}
                  shifts={shifts}
                  employees={employees}
                  activityLogs={activityLogs}
                  onAutoAssign={handleAutoAssign}
                  onOneClickRepair={handleOneClickRepair}
                  onOpenReplacement={openReplacementDrawer}
                  onOpenBroadcast={() => setShowBroadcastModal(true)}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'schedule' && (
                <ScheduleView
                  t={t}
                  shifts={filteredShifts}
                  allShiftsCount={shifts.length}
                  deptFilter={deptFilter}
                  setDeptFilter={setDeptFilter}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  departments={departments}
                  conflicts={conflicts}
                  onAutoAssign={handleAutoAssign}
                  onOpenReplacement={openReplacementDrawer}
                  onOpenBroadcast={() => setShowBroadcastModal(true)}
                  onUnassign={handleUnassign}
                  onAddShift={() => setShowAddShiftModal(true)}
                  onQuickSetHeadcount={handleQuickSetHeadcount}
                  onNotifySkillUpgrade={handleNotifySkillUpgrade}
                  onEditShift={(shift) => setEditingShift(shift)}
                />
              )}

              {activeTab === 'employees' && (
                <EmployeesView
                  t={t}
                  employees={employees}
                  departments={departments}
                  onAddEmployee={() => setShowAddEmployeeModal(true)}
                  onOpenBroadcast={() => setShowBroadcastModal(true)}
                  showToast={showToast}
                  onEnrollCourse={(empId) => {
                    setAcademyEmpId(empId);
                    setActiveTab('academy');
                  }}
                />
              )}

              {activeTab === 'heatmap' && (
                <HeatmapView
                  t={t}
                  heatmap={heatmap}
                />
              )}

              {activeTab === 'simulator' && (
                <SimulatorView
                  t={t}
                  resilience={resilience}
                  scenario={simScenario}
                  setScenario={setSimScenario}
                  result={simResult}
                  loading={simLoading}
                  onRun={handleRunSimulator}
                  onOneClickRepair={handleOneClickRepair}
                />
              )}

              {activeTab === 'swaps' && (
                <SwapsView
                  t={t}
                  swaps={swaps}
                  employees={employees}
                  shifts={shifts}
                  requesterId={swapRequesterId}
                  setRequesterId={setSwapRequesterId}
                  targetEmpId={swapTargetEmpId}
                  setTargetEmpId={setSwapTargetEmpId}
                  shiftId={swapShiftId}
                  setShiftId={setSwapShiftId}
                  targetShiftId={swapTargetShiftId}
                  setTargetShiftId={setSwapTargetShiftId}
                  checkResult={swapCheckResult}
                  onCheck={handleCheckSwap}
                  onSubmit={handleSubmitSwap}
                  onApprove={handleApproveSwap}
                />
              )}

              {activeTab === 'academy' && (
                <AcademyView
                  t={t}
                  courses={courses}
                  employees={employees}
                  selectedEmpId={academyEmpId}
                  setSelectedEmpId={setAcademyEmpId}
                  onComplete={handleCompleteCourse}
                  onViewCertificate={(course) => {
                    const emp = employees.find(e => e.id === parseInt(academyEmpId));
                    setActiveCertificateCourse({ course, employee: emp });
                  }}
                />
              )}
            </div>
          </main>

          {/* ---------------- Footer ---------------- */}
          <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>{t.teamCodesprint}</div>
              <div className="flex items-center space-x-3 text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600 font-medium">FastAPI Engine Online</span>
                </span>
                <span>•</span>
                <span>CBC052</span>
              </div>
            </div>
          </footer>

        </div>
      </div>

      {/* ---------------- Modals & Drawers ---------------- */}

      {/* Workforce Notification Center Drawer */}
      {showNotificationDrawer && (
        <NotificationDrawer
          notifications={notifications}
          onClose={() => setShowNotificationDrawer(false)}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onOpenAcademy={handleOpenAcademyForUpgrade}
          onDispatchShiftNotification={handleNotifySkillUpgrade}
          shifts={shifts}
        />
      )}

      {/* Edit Shift Modal */}
      {editingShift && (
        <EditShiftModal
          shift={editingShift}
          onClose={() => setEditingShift(null)}
          onSave={handleSaveEditShift}
          showToast={showToast}
        />
      )}

      {/* Broadcast Alert Modal */}
      {showBroadcastModal && (
        <BroadcastModal
          onClose={() => setShowBroadcastModal(false)}
          showToast={showToast}
        />
      )}

      {/* Official Certificate Modal */}
      {activeCertificateCourse && (
        <CertificateModal
          course={activeCertificateCourse.course || activeCertificateCourse}
          employee={activeCertificateCourse.employee}
          onClose={() => setActiveCertificateCourse(null)}
        />
      )}

      {/* Replacement Recommendation Drawer */}
      {selectedShiftForReplacement && (
        <ReplacementDrawer
          t={t}
          shift={selectedShiftForReplacement}
          candidates={replacementCandidates}
          onClose={() => setSelectedShiftForReplacement(null)}
          onAssign={handleAssignCandidate}
        />
      )}

      {/* One-Click Repair Result Modal */}
      {repairModalData && (
        <RepairResultModal
          t={t}
          data={repairModalData}
          onClose={() => setRepairModalData(null)}
        />
      )}

      {/* Add Shift Modal */}
      {showAddShiftModal && (
        <AddShiftModal
          t={t}
          onClose={() => setShowAddShiftModal(false)}
          onSuccess={() => {
            setShowAddShiftModal(false);
            fetchData();
          }}
          showToast={showToast}
        />
      )}

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <AddEmployeeModal
          t={t}
          onClose={() => setShowAddEmployeeModal(false)}
          onSuccess={() => {
            setShowAddEmployeeModal(false);
            fetchData();
          }}
          showToast={showToast}
        />
      )}

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-xl border text-sm max-w-md animate-fade-in ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            <i
              data-lucide={
                toast.type === 'success' ? 'check-circle' :
                toast.type === 'error' ? 'alert-octagon' :
                toast.type === 'warning' ? 'alert-triangle' : 'info'
              }
              className={`w-5 h-5 flex-shrink-0 ${
                toast.type === 'success' ? 'text-emerald-600' :
                toast.type === 'error' ? 'text-rose-600' :
                toast.type === 'warning' ? 'text-amber-600' : 'text-brand-600'
              }`}
            ></i>
            <span className="font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}


// ---------------- BROADCAST ALERT MODAL ----------------
function BroadcastModal({ onClose, showToast }) {
  const [targetGroup, setTargetGroup] = useState('All Off-Duty Staff');
  const [priority, setPriority] = useState('Urgent Staffing Shortage');
  const [message, setMessage] = useState('Business Operations Notice: Additional shift slots open for Operations & Logistics with premium overtime rate eligibility.');

  const handleSend = (e) => {
    e.preventDefault();
    showToast(`Broadcast dispatch initiated to 18 off-duty clinicians in '${targetGroup}'!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up">
        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
            <i data-lucide="radio" className="w-5 h-5"></i>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">Broadcast Urgent Shift Alert</h3>
            <p className="text-xs text-slate-500">Dispatch instant SMS & push notifications to reserve & off-duty clinicians</p>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-700">
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-3.5 text-xs">
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Target Personnel Pool</label>
            <select
              value={targetGroup}
              onChange={e => setTargetGroup(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All Off-Duty Staff">All Available Off-Duty Personnel (18 Clinicians)</option>
              <option value="Emergency Unit Reserves">Emergency Department Reserve Pool Only (6 Clinicians)</option>
              <option value="ICU Certified Nurses">ICU Certified Critical Care Nurses (5 Clinicians)</option>
              <option value="On-Call Physicians">On-Call Attending Physicians (3 Clinicians)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Notification Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {['Standard Coverage', 'Urgent Staffing Shortage', 'Code Red Surge'].map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`p-2 rounded-lg border text-center font-semibold transition ${
                    priority === p
                      ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Broadcast Notification Message</label>
            <textarea
              rows="3"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-slate-700 flex items-center space-x-2">
            <i data-lucide="check-circle-2" className="w-4 h-4 text-brand-600 flex-shrink-0"></i>
            <span>Automated SMS + Push Notification delivery with 1-tap accept/decline buttons</span>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs flex items-center space-x-1.5">
              <i data-lucide="send" className="w-3.5 h-3.5"></i>
              <span>Dispatch Broadcast</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ---------------- OFFICIAL CERTIFICATE MODAL ----------------
function CertificateModal({ course, employee, onClose }) {
  const certCode = `MH-CLIN-${(course?.id || 1) * 100 + (employee ? employee.id : 12)}-${new Date().getFullYear()}`;
  const issueDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 space-y-6 animate-scale-up text-center relative overflow-hidden">
        {/* Certificate Decorative Border */}
        <div className="absolute inset-2 border-2 border-double border-blue-200 pointer-events-none rounded-xl"></div>
        <div className="absolute top-4 right-4 no-print">
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg bg-slate-100">
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </div>

        {/* Certificate Content */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-center space-x-2 text-brand-700">
            <i data-lucide="award" className="w-9 h-9 text-brand-600"></i>
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
            Enterprise Business Center • Professional Development Board
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Certificate of Clinical Accreditation
          </h2>
          <p className="text-xs text-slate-500">
            This officially certifies that the clinician named below has demonstrated qualified competence
          </p>
        </div>

        <div className="py-4 border-y border-slate-100 space-y-1">
          <span className="text-xs text-slate-400 uppercase font-mono font-semibold">Awarded To</span>
          <h3 className="text-2xl font-bold text-slate-900 font-display">
            {employee ? employee.name : "Dr. Emily Thorne, RN"}
          </h3>
          <p className="text-xs text-brand-700 font-semibold">
            {employee ? `${employee.role} • ${employee.department} Division` : "Emergency Care Specialist"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-slate-600">For successful completion and mastery of the accredited clinical module:</p>
          <h4 className="text-base font-bold text-slate-900">
            {course?.title || "Clinical Skill Course"}
          </h4>
          <div className="flex items-center justify-center space-x-2 pt-1">
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
              Verified Competency: {course?.target_skill}
            </span>
            {course?.target_cert && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-brand-800 rounded-md border border-blue-200">
                Official Credential: {course?.target_cert}
              </span>
            )}
          </div>
        </div>

        {/* Official Signatures & Seal */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 items-end text-xs">
          <div>
            <div className="font-mono text-slate-800 font-bold text-sm">Dr. Druvith Raj</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Chief Operations Officer</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-brand-500 flex items-center justify-center shadow-xs">
              <i data-lucide="shield-check" className="w-7 h-7 text-brand-600"></i>
            </div>
            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold mt-1">Official Clinical Seal</span>
          </div>

          <div>
            <div className="font-mono text-slate-800 font-bold">{issueDate}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Accreditation Date</div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 pt-1">
          Credential Verification License: <strong>{certCode}</strong>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-center space-x-3 pt-2 no-print">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5"
          >
            <i data-lucide="printer" className="w-4 h-4"></i>
            <span>Print Official Certificate</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


// ---------------- VIEW 1: Live Scheduling Dashboard ----------------
function DashboardView({
  t,
  stats,
  conflicts,
  shifts,
  employees,
  activityLogs,
  onAutoAssign,
  onOneClickRepair,
  onOpenReplacement,
  onOpenBroadcast,
  onNavigate
}) {
  const resilience = stats?.resilience || { score: 75, tier: "Moderate Risk", vulnerabilities: [] };
  const resilienceScore = Math.round(resilience.score || 75);
  
  const resilienceColor =
    resilienceScore >= 80 ? '#059669' :
    resilienceScore >= 60 ? '#d97706' : '#dc2626';

  const strokeDash = `${resilienceScore}, 100`;

  return (
    <div className="space-y-6">

      {/* 1. Hero Commercial Operations Graphic Banner */}
      <div className="card-corporate card-shine aurora-gradient-bg rounded-2xl overflow-hidden shadow-xs border border-slate-200 flex flex-col md:flex-row">
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase text-brand-700">
              <span className="beacon-dot mr-1"></span>
              <span>Command Center Telemetry • Live Schedule Feed</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1 font-display">
              Business-Based Shift Management Command
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Real-time multi-department workforce shift scheduling, automated rest compliance enforcement, and AI resilience stress modeling.
            </p>
          </div>

          {/* Quick Status Badges */}
          <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50/90 rounded-lg border border-slate-200 text-slate-700 backdrop-blur-xs">
              <i data-lucide="building-2" className="w-4 h-4 text-brand-600"></i>
              <span>5 Active Business Units</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50/90 rounded-lg border border-emerald-200 text-emerald-800 backdrop-blur-xs">
              <i data-lucide="check-circle-2" className="w-4 h-4 text-emerald-600"></i>
              <span>{stats?.coverage_percentage}% Shift Coverage</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50/90 rounded-lg border border-blue-200 text-brand-800 backdrop-blur-xs">
              <i data-lucide="shield" className="w-4 h-4 text-brand-600"></i>
              <span>11h Rest Law Enforced</span>
            </div>
          </div>

          {/* Quick Action Button Toolbar on Banner */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              onClick={onOneClickRepair}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition btn-ai-sparkle cursor-pointer"
            >
              <i data-lucide="sparkles" className="w-4 h-4"></i>
              <span>Run AI Schedule Optimizer</span>
            </button>

            <button
              onClick={() => exportShiftsToCSV(shifts)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
            >
              <i data-lucide="download" className="w-4 h-4 text-slate-500"></i>
              <span>Export Roster (CSV)</span>
            </button>

            <button
              onClick={onOpenBroadcast}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
            >
              <i data-lucide="radio" className="w-4 h-4 text-rose-600"></i>
              <span>Broadcast Shift Alert</span>
            </button>
          </div>
        </div>

        {/* Right Graphic Banner Image */}
        <div className="md:w-80 lg:w-96 relative bg-slate-100 min-h-[180px] md:min-h-0 border-t md:border-t-0 md:border-l border-slate-200 overflow-hidden">
          <img
            src="/static/assets/command_banner.jpg"
            alt="Operations Command Center"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-4">
            <span className="text-[11px] font-medium text-white/90 bg-slate-900/60 backdrop-blur-xs px-2.5 py-1 rounded-md">
              🏢 Enterprise Business Live Telemetry
            </span>
          </div>
        </div>
      </div>
      
      {/* 2. Executive Metric KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger-cascade">
        
        {/* KPI 1: Resilience Score Gauge */}
        <div className="card-corporate p-4 rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.resilienceScore}</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              resilienceScore >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              resilienceScore >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {resilience.tier}
            </span>
          </div>
          
          <div className="flex items-center justify-between my-2">
            <div className="w-16 h-16 relative flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="circle"
                  stroke={resilienceColor}
                  strokeDasharray={strokeDash}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-extrabold text-slate-900">{resilienceScore}%</span>
              </div>
            </div>
            
            <div className="text-right space-y-1 text-xs">
              <div className="text-slate-500">Buffer: <span className="text-slate-800 font-semibold font-mono">{resilience.buffer_capacity || 64}%</span></div>
              <div className="text-slate-500">Skills: <span className="text-slate-800 font-semibold font-mono">{resilience.skill_redundancy || 75}%</span></div>
              <div className="text-slate-500">Rules: <span className="text-slate-800 font-semibold font-mono">{resilience.compliance_health || 85}%</span></div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('simulator')}
            className="text-[11px] text-brand-600 hover:text-brand-800 font-semibold flex items-center justify-end space-x-1 pt-1"
          >
            <span>Stress Simulator</span>
            <i data-lucide="arrow-right" className="w-3 h-3"></i>
          </button>
        </div>

        {/* KPI 2: Staffing Shortages & Unfilled Slots */}
        <div className="card-corporate p-4 rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.staffShortages}</span>
            <div className={`p-1.5 rounded-lg ${stats?.total_gaps > 0 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
              <i data-lucide="user-minus" className="w-4 h-4"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
              {stats?.total_gaps} <span className="text-xs text-slate-500 font-sans font-normal">unfilled slots</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.total_assigned_slots} / {stats?.total_required_slots} slots covered ({stats?.coverage_percentage}%)
            </p>
          </div>
          <button
            onClick={onAutoAssign}
            className="w-full mt-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-brand-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition"
          >
            <i data-lucide="sparkles" className="w-3.5 h-3.5"></i>
            <span>{t.autoAssignAll}</span>
          </button>
        </div>

        {/* KPI 3: Active Conflicts & Violations */}
        <div className="card-corporate p-4 rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.activeConflicts}</span>
            <div className={`p-1.5 rounded-lg ${conflicts.length > 0 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
              <i data-lucide="alert-octagon" className="w-4 h-4"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
              {conflicts.length} <span className="text-xs text-slate-500 font-sans font-normal">detected</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.critical_conflicts_count || 0} critical (overlaps & rest breaches)
            </p>
          </div>
          <button
            onClick={onOneClickRepair}
            className="w-full mt-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition"
          >
            <i data-lucide="wand-2" className="w-3.5 h-3.5"></i>
            <span>Auto-Repair Schedule</span>
          </button>
        </div>

        {/* KPI 4: Active Roster & Staff Capacity */}
        <div className="card-corporate p-4 rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Staff Pool</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <i data-lucide="users" className="w-4 h-4"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
              {stats?.active_employees} <span className="text-xs text-slate-500 font-sans font-normal">active / {stats?.total_employees}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.reserve_employees || 1} on-call reserves available
            </p>
          </div>
          <button
            onClick={() => onNavigate('employees')}
            className="w-full mt-2 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition"
          >
            <i data-lucide="external-link" className="w-3.5 h-3.5"></i>
            <span>View Staff Directory</span>
          </button>
        </div>

        {/* KPI 5: Fatigue & Burnout Risk Monitor */}
        <div className="card-corporate p-4 rounded-xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.fatigueRisk}</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <i data-lucide="heart-pulse" className="w-4 h-4"></i>
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
              {stats?.burnout_risk_count || 0} <span className="text-xs text-slate-500 font-sans font-normal">at fatigue risk</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rule: 11h mandatory rest enforced
            </p>
          </div>
          <button
            onClick={() => onNavigate('heatmap')}
            className="w-full mt-2 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition"
          >
            <i data-lucide="activity" className="w-3.5 h-3.5"></i>
            <span>Inspect Skill Matrix</span>
          </button>
        </div>

      </div>

      {/* 3. Middle Row: Real-time Shortage Alerts & Conflict Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Card A: Real-Time Staffing Shortage Alerts */}
        <div className="card-corporate p-5 rounded-xl flex flex-col shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <span className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                <i data-lucide="bell-ring" className="w-4 h-4"></i>
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">{t.shortageAlert}</h3>
                <p className="text-xs text-slate-500">
                  {stats?.total_gaps > 0 ? `${stats.total_gaps} ${t.unfilledWarning}` : 'All shifts fully covered!'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenBroadcast}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                title="Send broadcast alert"
              >
                <i data-lucide="radio" className="w-3.5 h-3.5"></i>
                <span className="hidden sm:inline">Broadcast</span>
              </button>
              {stats?.total_gaps > 0 && (
                <button
                  onClick={onAutoAssign}
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                >
                  Auto-Fill Gaps
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-80 pr-1">
            {stats?.short_shifts?.length > 0 ? (
              stats.short_shifts.map(shift => (
                <div
                  key={shift.id}
                  className="p-3 rounded-lg bg-slate-50 border border-rose-200 hover:border-rose-300 transition flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-slate-900">{shift.title}</span>
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                        Missing {shift.missing}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center space-x-3">
                      <span><i data-lucide="building-2" className="w-3 h-3 inline mr-1 text-slate-400"></i>{shift.department}</span>
                      <span><i data-lucide="user-check" className="w-3 h-3 inline mr-1 text-slate-400"></i>Needs {shift.role_required}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        const fullShift = shifts.find(s => s.id === shift.id) || shift;
                        onOpenReplacement(fullShift);
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-blue-50 text-brand-700 border border-blue-300 rounded-lg text-xs font-semibold flex items-center space-x-1 whitespace-nowrap shadow-xs transition"
                    >
                      <i data-lucide="user-plus" className="w-3.5 h-3.5"></i>
                      <span>{t.findReplacement}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center">
                <i data-lucide="check-circle-2" className="w-10 h-10 text-emerald-500 mb-2"></i>
                <p className="text-sm font-semibold text-slate-800">Zero Staffing Shortages!</p>
                <p className="text-xs text-slate-500 mt-1">All shifts meet or exceed required headcounts.</p>
              </div>
            )}
          </div>
        </div>

        {/* Card B: Live Conflict & Compliance Watchlist */}
        <div className="card-corporate p-5 rounded-xl flex flex-col shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <span className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                <i data-lucide="shield-alert" className="w-4 h-4"></i>
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">{t.conflictsAlert}</h3>
                <p className="text-xs text-slate-500">
                  {conflicts.length} rule infractions detected (rest, overlaps, certs)
                </p>
              </div>
            </div>
            {conflicts.length > 0 && (
              <button
                onClick={onOneClickRepair}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-xs"
              >
                <i data-lucide="sparkles" className="w-3 h-3"></i>
                <span>Auto-Repair</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-80 pr-1">
            {conflicts.length > 0 ? (
              conflicts.map((c, idx) => (
                <div
                  key={c.id || idx}
                  className={`p-3 rounded-lg border transition space-y-1.5 bg-white ${
                    c.severity === 'critical'
                      ? 'border-rose-200 hover:border-rose-300'
                      : 'border-amber-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-full ${c.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                      <span>{c.employee_name}</span>
                    </span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.2 rounded font-bold ${
                      c.severity === 'critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {c.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{c.description}</p>
                  <div className="text-[11px] text-brand-700 font-medium flex items-center space-x-1 bg-blue-50/70 p-1 rounded border border-blue-100">
                    <i data-lucide="lightbulb" className="w-3 h-3 text-brand-600"></i>
                    <span>Fix: {c.mitigation_hint}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center">
                <i data-lucide="shield-check" className="w-10 h-10 text-emerald-500 mb-2"></i>
                <p className="text-sm font-semibold text-slate-800">100% Conflict-Free Schedule!</p>
                <p className="text-xs text-slate-500 mt-1">Zero overlaps, rest breaches, or uncertified assignments.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Bottom Row: Demand vs Staffing Curve & Real-Time Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Demand-Based Staffing Distribution Visualizer */}
        <div className="card-corporate p-5 rounded-xl lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Demand-Based Staffing vs Headcount Allocation</h3>
              <p className="text-xs text-slate-500">Comparing required patient volume demand against assigned roster capacity</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportShiftsToCSV(shifts)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-semibold flex items-center space-x-1"
              >
                <i data-lucide="download" className="w-3 h-3 text-slate-400"></i>
                <span>Export</span>
              </button>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                7-Day Projection
              </span>
            </div>
          </div>

          {/* Comparative Bar Chart Visualization */}
          <div className="space-y-3 pt-1">
            {shifts.slice(0, 6).map(s => {
              const assigned = s.assigned_count;
              const required = s.required_headcount;
              const pct = Math.min(100, Math.round((assigned / required) * 100));
              const isSurge = s.demand_level === 'surge';
              const isHigh = s.demand_level === 'high';

              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center space-x-2">
                      <span>{s.title}</span>
                      <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                        isSurge ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        isHigh ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {s.demand_level}
                      </span>
                    </span>
                    <span className="text-slate-500 font-mono text-xs">
                      {assigned} / {required} staff ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                    <div
                      className={`h-full transition-all duration-500 ${
                        pct === 100 ? 'bg-emerald-500' :
                        pct >= 50 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Operational Activity Stream */}
        <div className="card-corporate p-5 rounded-xl flex flex-col shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 font-display">
              <i data-lucide="radio" className="w-4 h-4 text-brand-600 animate-pulse"></i>
              <span>Live Activity Audit Feed</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold">Real-Time</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-72 pr-1 text-xs">
            {activityLogs.map((log, idx) => (
              <div key={log.id || idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start space-x-2.5">
                <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                  log.severity === 'critical' ? 'bg-rose-500' :
                  log.severity === 'warning' ? 'bg-amber-500' :
                  log.severity === 'success' ? 'bg-emerald-500' : 'bg-brand-500'
                }`}></span>
                <div className="flex-1 space-y-0.5">
                  <p className="text-slate-800">{log.description}</p>
                  <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}


// ---------------- VIEW 2: Schedule & Shifts (Roster Management) ----------------
function ScheduleView({
  t,
  shifts,
  allShiftsCount,
  deptFilter,
  setDeptFilter,
  statusFilter,
  setStatusFilter,
  departments,
  conflicts,
  onAutoAssign,
  onOpenReplacement,
  onOpenBroadcast,
  onUnassign,
  onAddShift,
  onQuickSetHeadcount,
  onNotifySkillUpgrade,
  onEditShift
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPill, setFilterPill] = useState('all'); // 'all', '5person', 'shortage', 'surge'

  // Filtered shifts combining department, status, search query, and filter pill
  const displayedShifts = useMemo(() => {
    return shifts.filter(s => {
      // 1. Filter Pill logic
      if (filterPill === '5person') {
        if (s.required_headcount !== 5 && !s.title?.toLowerCase().includes('global logistics')) {
          return false;
        }
      } else if (filterPill === 'shortage') {
        if (!s.is_short) return false;
      } else if (filterPill === 'surge') {
        if (s.demand_level !== 'surge' && s.demand_level !== 'high') return false;
      }

      // 2. Search Query logic across Title, Role, Department, and Skills
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = s.title?.toLowerCase().includes(q);
        const inRole = s.role_required?.toLowerCase().includes(q);
        const inDept = s.department?.toLowerCase().includes(q);
        const inSkills = s.required_skills?.some(sk => sk.toLowerCase().includes(q));
        if (!inTitle && !inRole && !inDept && !inSkills) {
          return false;
        }
      }

      return true;
    });
  }, [shifts, filterPill, searchQuery]);

  return (
    <div className="space-y-4">
      {/* 1. Search & Quick Filter Pills Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
        {/* Search Input Box */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 flex-1 min-w-[260px] max-w-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
          <i data-lucide="search" className="w-4 h-4 text-slate-400"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search shift title, role, skill (e.g. Six Sigma), department..."
            className="bg-transparent w-full focus:outline-none text-xs text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-700 p-0.5"
              title="Clear search"
            >
              <i data-lucide="x" className="w-3.5 h-3.5"></i>
            </button>
          )}
        </div>

        {/* Quick Filter Pill Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterPill('all')}
            className={`filter-pill ${filterPill === 'all' ? 'filter-pill-active' : ''}`}
          >
            <span>All Shifts</span>
            <span className="text-[10px] font-mono opacity-80">({shifts.length})</span>
          </button>

          <button
            onClick={() => setFilterPill('5person')}
            className={`filter-pill ${filterPill === '5person' ? 'filter-pill-active' : ''}`}
            title="Isolate 5-person shifts requiring skill upgrades"
          >
            <span>👥 5-Person Shifts</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono bg-purple-100 text-purple-800">
              {shifts.filter(s => s.required_headcount === 5).length}
            </span>
          </button>

          <button
            onClick={() => setFilterPill('shortage')}
            className={`filter-pill ${filterPill === 'shortage' ? 'filter-pill-active' : ''}`}
          >
            <span>⚠️ Shortages</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono bg-rose-100 text-rose-800">
              {shifts.filter(s => s.is_short).length}
            </span>
          </button>

          <button
            onClick={() => setFilterPill('surge')}
            className={`filter-pill ${filterPill === 'surge' ? 'filter-pill-active' : ''}`}
          >
            <span>⚡ Surge Demand</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono bg-amber-100 text-amber-800">
              {shifts.filter(s => s.demand_level === 'surge' || s.demand_level === 'high').length}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Department & Status Dropdown Filters & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl card-corporate shadow-xs">
        
        {/* Left: Department & Status Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <i data-lucide="filter" className="w-3.5 h-3.5 text-slate-500"></i>
            <span className="text-slate-500">{t.filterDepartment}:</span>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              {departments.map(d => (
                <option key={d} value={d} className="bg-white">{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-white">All Coverage Statuses</option>
              <option value="Shortage" className="bg-white">Staffing Shortages Only</option>
              <option value="Filled" className="bg-white">Fully Covered Only</option>
            </select>
          </div>

          {/* View Switcher Toggle Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1 transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <i data-lucide="layout-grid" className="w-3.5 h-3.5"></i>
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1 transition ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <i data-lucide="table" className="w-3.5 h-3.5"></i>
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportShiftsToCSV(displayedShifts)}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
            title="Download CSV file of currently filtered shifts"
          >
            <i data-lucide="download" className="w-4 h-4 text-slate-500"></i>
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onAutoAssign}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-brand-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs btn-ai-sparkle cursor-pointer"
          >
            <i data-lucide="sparkles" className="w-4 h-4 text-brand-600"></i>
            <span>{t.autoAssignAll}</span>
          </button>
          
          <button
            onClick={onAddShift}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
          >
            <i data-lucide="plus" className="w-4 h-4"></i>
            <span>{t.addShift}</span>
          </button>
        </div>
      </div>

      {/* Render Mode A: Table View */}
      {viewMode === 'table' ? (
        <div className="card-corporate rounded-xl overflow-hidden border border-slate-200 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-mono text-slate-600">
                <tr>
                  <th className="p-3.5 font-bold">Shift Title & Role</th>
                  <th className="p-3.5 font-bold">Department</th>
                  <th className="p-3.5 font-bold">Date & Hours</th>
                  <th className="p-3.5 font-bold text-center">Headcount & Stepper</th>
                  <th className="p-3.5 font-bold">Assigned Clinicians</th>
                  <th className="p-3.5 font-bold text-center">Status</th>
                  <th className="p-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {displayedShifts.map(shift => {
                  const shiftConflicts = conflicts.filter(c => c.shift_id === shift.id);
                  const isShort = shift.is_short;

                  return (
                    <tr key={shift.id} className="table-row-hover transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{shift.title}</div>
                        <div className="text-[11px] text-slate-500">{shift.role_required}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-brand-800 border border-blue-200 text-[11px] font-semibold">
                          {shift.department}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <div>{new Date(shift.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({shift.duration_hours}h)
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold">
                        <div className="flex flex-col items-center space-y-1">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => onQuickSetHeadcount && onQuickSetHeadcount(shift.id, Math.max(1, shift.required_headcount - 1))}
                              className="stepper-btn"
                              title="Decrease required headcount"
                            >-</button>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold ${
                              shift.required_headcount === 5
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : isShort ? 'text-rose-600 font-extrabold' : 'text-emerald-700'
                            }`}>
                              {shift.assigned_count} / {shift.required_headcount}
                            </span>
                            <button
                              onClick={() => onQuickSetHeadcount && onQuickSetHeadcount(shift.id, shift.required_headcount + 1)}
                              className="stepper-btn"
                              title="Increase required headcount"
                            >+</button>
                          </div>
                          {shift.required_headcount !== 5 ? (
                            <button
                              onClick={() => onQuickSetHeadcount && onQuickSetHeadcount(shift.id, 5)}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-brand-700 border border-blue-200 font-bold transition cursor-pointer"
                              title="Set shift headcount directly to 5 and dispatch notifications"
                            >
                              Set 5 ⭐
                            </button>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold uppercase tracking-wider">
                              5 People ⭐
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {shift.assignments?.map(a => (
                            <span key={a.id} className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-800">
                              <span className="font-medium">{a.employee_name}</span>
                              <button onClick={() => onUnassign(a.id)} className="text-slate-400 hover:text-rose-600 ml-1">
                                <i data-lucide="x" className="w-3 h-3"></i>
                              </button>
                            </span>
                          ))}
                          {(!shift.assignments || shift.assignments.length === 0) && (
                            <span className="text-rose-600 text-xs font-semibold">Unfilled Vacancy</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          shiftConflicts.length > 0 ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          isShort ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {shiftConflicts.length > 0 ? 'Conflict' : isShort ? 'Shortage' : 'Filled'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => onNotifySkillUpgrade && onNotifySkillUpgrade(shift.id)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md font-semibold text-xs inline-flex items-center space-x-1 transition cursor-pointer"
                          title="Send skill upgrade notifications to staff"
                        >
                          <i data-lucide="bell" className="w-3 h-3 text-amber-600"></i>
                          <span>Notify Skills</span>
                        </button>
                        <button
                          onClick={() => onEditShift && onEditShift(shift)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md font-semibold text-xs inline-flex items-center space-x-1 transition cursor-pointer"
                          title="Edit Shift Details & Headcount"
                        >
                          <i data-lucide="edit-3" className="w-3 h-3 text-slate-500"></i>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => onOpenReplacement(shift)}
                          className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-md font-semibold text-xs transition cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Render Mode B: Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-cascade">
          {displayedShifts.map(shift => {
            const isShort = shift.is_short;
            const assignedCount = shift.assigned_count;
            const required = shift.required_headcount;
            
            const shiftConflicts = conflicts.filter(c => c.shift_id === shift.id);

            return (
              <div
                key={shift.id}
                className={`card-corporate card-shine p-5 rounded-xl flex flex-col justify-between transition border ${
                  required === 5
                    ? 'shift-card-5person'
                    : shift.demand_level === 'surge'
                    ? 'shift-card-surge'
                    : shiftConflicts.length > 0
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isShort
                    ? 'border-amber-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header: Dept & Demand Badge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-brand-700 font-bold flex items-center space-x-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      <i data-lucide="building" className="w-3.5 h-3.5"></i>
                      <span>{shift.department}</span>
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                        shift.demand_level === 'surge' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        shift.demand_level === 'high' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {shift.demand_level}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        required === 5
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : isShort ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {assignedCount}/{required} Filled {required === 5 ? '⭐' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-base font-bold text-slate-900 font-display">{shift.title}</h4>
                  
                  {/* Time & Role */}
                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <i data-lucide="clock" className="w-3.5 h-3.5 text-slate-400"></i>
                      <span>
                        {new Date(shift.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}, {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({shift.duration_hours}h)
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <i data-lucide="shield-check" className="w-3.5 h-3.5 text-slate-400"></i>
                      <span>Requires: <strong className="text-slate-800">{shift.role_required}</strong></span>
                    </div>
                  </div>

                  {/* Required Skills & Certs Chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {shift.required_skills?.map((sk, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {sk}
                      </span>
                    ))}
                    {shift.required_certifications?.map((cr, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-semibold">
                        📜 {cr}
                      </span>
                    ))}
                  </div>

                  {/* Conflict Alert Banner on Card */}
                  {shiftConflicts.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                      <div className="font-bold flex items-center space-x-1">
                        <i data-lucide="alert-triangle" className="w-3.5 h-3.5 text-rose-600"></i>
                        <span>Conflict Detected!</span>
                      </div>
                      <p className="text-[11px] text-rose-700">{shiftConflicts[0].description}</p>
                    </div>
                  )}
                </div>

                {/* Assigned Staff & Stepper Controls Row */}
                <div className="pt-3 border-t border-slate-100 mt-3 space-y-2.5">
                  {/* Coverage Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500">Staffing Capacity:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {assignedCount} / {required} ({Math.min(100, Math.round((assignedCount / (required || 1)) * 100))}%)
                      </span>
                    </div>
                    <div className="headcount-progress-track">
                      <div
                        className={`headcount-progress-fill ${
                          isShort ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.round((assignedCount / (required || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Interactive Headcount Stepper Toolbar on Card */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700 flex items-center space-x-1">
                      <i data-lucide="users" className="w-3.5 h-3.5 text-slate-500"></i>
                      <span>Required Headcount:</span>
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onQuickSetHeadcount && onQuickSetHeadcount(shift.id, Math.max(1, required - 1))}
                        className="stepper-btn"
                        title="Decrease headcount by 1"
                      >-</button>
                      <span className={`px-2 py-0.5 font-mono font-bold rounded text-xs ${
                        required === 5 ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'text-slate-800'
                      }`}>
                        {required} {required === 5 ? '⭐' : ''}
                      </span>
                      <button
                        onClick={() => onQuickSetHeadcount && onQuickSetHeadcount(shift.id, required + 1)}
                        className="stepper-btn"
                        title="Increase headcount by 1"
                      >+</button>
                      {required !== 5 && (
                        <button
                          onClick={() => onQuickSetHeadcount && onQuickSetHeadcount(shift.id, 5)}
                          className="text-[10px] px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs cursor-pointer ml-1"
                          title="Set headcount directly to 5 and notify staff"
                        >Set 5 ⭐</button>
                      )}
                    </div>
                  </div>

                  {/* Assigned Personnel Chips */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Assigned Personnel ({shift.assignments?.length || 0})
                    </span>
                    
                    {shift.assignments && shift.assignments.length > 0 ? (
                      <div className="space-y-1.5">
                        {shift.assignments.map(a => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
                          >
                            <div className="flex items-center space-x-2">
                              <img
                                src={a.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                                className="w-6 h-6 rounded-full object-cover border border-slate-200"
                                alt={a.employee_name}
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block">{a.employee_name}</span>
                                <span className="text-[10px] text-slate-500">{a.employee_role}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => onUnassign(a.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Remove assignment"
                            >
                              <i data-lucide="x" className="w-3.5 h-3.5"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
                        Vacant Shift Slot
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      onClick={() => onNotifySkillUpgrade && onNotifySkillUpgrade(shift.id)}
                      className="py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer"
                      title="Dispatch skill upgrade notifications"
                    >
                      <i data-lucide="bell" className="w-3.5 h-3.5 text-amber-600"></i>
                      <span>Notify</span>
                    </button>

                    <button
                      onClick={() => onEditShift && onEditShift(shift)}
                      className="py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs transition cursor-pointer"
                      title="Edit Shift Headcount & Skills"
                    >
                      <i data-lucide="edit-3" className="w-3.5 h-3.5 text-slate-500"></i>
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => onOpenReplacement(shift)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition cursor-pointer ${
                        isShort
                          ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                          : 'bg-blue-50 hover:bg-blue-100 text-brand-700 border border-blue-200'
                      }`}
                    >
                      <i data-lucide="user-plus" className="w-3.5 h-3.5"></i>
                      <span>{isShort ? t.findReplacement : 'Manage'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {displayedShifts.length === 0 && (
        <div className="card-corporate p-8 rounded-xl text-center text-slate-500 space-y-2">
          <i data-lucide="search-x" className="w-10 h-10 mx-auto text-slate-400"></i>
          <h4 className="font-bold text-slate-800 text-sm font-display">No shifts match active filters</h4>
          <p className="text-xs text-slate-500">Try clearing your search query or switching the quick filter pills above.</p>
          <button
            onClick={() => { setSearchQuery(''); setFilterPill('all'); setDeptFilter('All'); setStatusFilter('All'); }}
            className="mt-2 px-3 py-1.5 bg-blue-50 text-brand-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}


// ---------------- VIEW 3: Employees (Staff Directory & Compliance) ----------------
function EmployeesView({
  t,
  employees,
  departments,
  onAddEmployee,
  onOpenBroadcast,
  onEnrollCourse,
  showToast
}) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [statusTab, setStatusTab] = useState('all'); // 'all', 'active', 'reserve', 'fatigue'

  const filteredEmployees = employees.filter(e => {
    const matchName = e.name.toLowerCase().includes(search.toLowerCase()) ||
                      e.role.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept === 'All' || e.department === selectedDept;
    const matchStatus =
      statusTab === 'all' ? true :
      statusTab === 'active' ? e.status === 'Active' :
      statusTab === 'reserve' ? e.status === 'Reserve' :
      statusTab === 'fatigue' ? (e.fatigue_score || 0) > 30 : true;

    return matchName && matchDept && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Search, Filter Tabs and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl card-corporate shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs w-60">
            <i data-lucide="search" className="w-3.5 h-3.5 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search staff by name or role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <span className="text-slate-500">Dept:</span>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              {departments.map(d => (
                <option key={d} value={d} className="bg-white">{d}</option>
              ))}
            </select>
          </div>

          {/* Quick Status Filter Pills */}
          <div className="flex items-center space-x-1 text-xs">
            {[
              { id: 'all', label: 'All Staff' },
              { id: 'active', label: 'Active Roster' },
              { id: 'reserve', label: 'Reserve Pool' },
              { id: 'fatigue', label: 'Fatigue Watch' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                  statusTab === tab.id
                    ? 'bg-brand-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportEmployeesToCSV(employees)}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
          >
            <i data-lucide="download" className="w-4 h-4 text-slate-500"></i>
            <span>Export CSV</span>
          </button>

          <button
            onClick={onAddEmployee}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition"
          >
            <i data-lucide="user-plus" className="w-4 h-4"></i>
            <span>{t.addEmployee}</span>
          </button>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-cascade">
        {filteredEmployees.map(emp => {
          const hoursPct = Math.min(100, (emp.current_weekly_hours / emp.max_weekly_hours) * 100);
          const isOvertime = emp.current_weekly_hours > emp.max_weekly_hours;
          const fatigue = emp.fatigue_score || 15;

          return (
            <div key={emp.id} className="card-corporate card-shine p-5 rounded-xl flex flex-col justify-between space-y-4 shadow-xs">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={emp.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      alt={emp.name}
                    />
                    <div>
                      <h4 className="text-base font-bold text-slate-900 font-display">{emp.name}</h4>
                      <p className="text-xs text-brand-700 font-semibold">{emp.role}</p>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">{emp.department}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                    emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    emp.status === 'Reserve' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {emp.status}
                  </span>
                </div>

                {/* Workload & Fatigue Metrics */}
                <div className="mt-4 space-y-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {/* Hours Cap */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Weekly Workload</span>
                      <span className={`font-mono font-semibold ${isOvertime ? 'text-rose-600' : 'text-slate-800'}`}>
                        {emp.current_weekly_hours} / {emp.max_weekly_hours} {t.hoursPerWeek}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isOvertime ? 'bg-rose-500' : hoursPct > 80 ? 'bg-amber-500' : 'bg-brand-600'}`}
                        style={{ width: `${Math.min(100, hoursPct)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Fatigue Meter */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">{t.fatigueIndex}</span>
                      <span className={`font-mono text-xs font-semibold ${
                        fatigue > 50 ? 'text-rose-600' : fatigue > 30 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {fatigue}% ({fatigue > 50 ? 'High Burnout' : fatigue > 30 ? 'Moderate' : 'Optimal'})
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          fatigue > 50 ? 'bg-rose-500' : fatigue > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${fatigue}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Skills Badges */}
                <div className="mt-3">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider block mb-1">
                    Verified Competencies
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {emp.skills?.map((sk, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications with Expiry */}
                <div className="mt-2.5">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider block mb-1">
                    Active Certifications
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {emp.certifications?.map((c, idx) => (
                      <span key={idx} className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                        c.status === 'Expiring'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                      }`}>
                        📜 {c.name} ({c.expiry})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    showToast(`Direct alert notification sent to ${emp.name}!`, 'info');
                  }}
                  className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition"
                  title="Send direct shift inquiry or notification"
                >
                  <i data-lucide="message-square" className="w-3.5 h-3.5 text-slate-500"></i>
                  <span>Send Alert</span>
                </button>

                <button
                  onClick={() => onEnrollCourse(emp.id)}
                  className="py-2 bg-blue-50 hover:bg-blue-100 text-brand-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition"
                >
                  <i data-lucide="graduation-cap" className="w-3.5 h-3.5"></i>
                  <span>Train</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ---------------- VIEW 4: Skill Coverage Heatmap ----------------
function HeatmapView({ t, heatmap }) {
  const [highlightGaps, setHighlightGaps] = useState(false);

  if (!heatmap) {
    return <div className="p-8 text-center text-slate-500">Loading skill coverage matrix...</div>;
  }

  const { tracked_skills, matrix } = heatmap;

  return (
    <div className="space-y-6">
      {/* Header & Legend */}
      <div className="card-corporate p-5 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 font-display">
            <i data-lucide="grid" className="w-5 h-5 text-brand-600"></i>
            <span>Skill Coverage Matrix (Clinical Competency Heatmap)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing skill availability across active shifts to identify single points of failure and staffing vulnerabilities
          </p>
        </div>

        {/* Action Buttons & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-300"></span>
              <span className="text-rose-800">0 Staff (Critical Gap)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300"></span>
              <span className="text-amber-800">1 Staff (Single Point)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300"></span>
              <span className="text-emerald-800">2+ Staff (Resilient)</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setHighlightGaps(!highlightGaps)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                highlightGaps
                  ? 'bg-rose-100 border-rose-300 text-rose-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <i data-lucide="eye" className="w-3.5 h-3.5 inline mr-1"></i>
              {highlightGaps ? 'Showing Gaps Only' : 'Highlight Gaps'}
            </button>

            <button
              onClick={() => exportHeatmapToCSV(heatmap)}
              className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-xs"
            >
              <i data-lucide="download" className="w-3.5 h-3.5"></i>
              <span>Export Matrix CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Table */}
      <div className="card-corporate rounded-xl overflow-hidden border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-mono text-slate-600">
              <tr>
                <th className="p-3.5 font-bold">Shift & Department</th>
                <th className="p-3.5 font-bold">Time Window</th>
                {tracked_skills.map(sk => (
                  <th key={sk} className="p-3.5 font-bold text-center">{sk}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {matrix.map(row => (
                <tr key={row.shift_id} className="table-row-hover transition">
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 block">{row.shift_title}</span>
                    <span className="text-[11px] text-brand-700 font-mono">{row.department}</span>
                  </td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                    {row.time_window}
                  </td>
                  {tracked_skills.map(sk => {
                    const cell = row.coverage[sk] || { count: 0, status: 'critical_gap' };
                    const isZero = cell.count === 0;
                    const isOne = cell.count === 1;

                    if (highlightGaps && !isZero && !isOne) {
                      return (
                        <td key={sk} className="p-2 text-center opacity-30">
                          <span className="inline-block px-3 py-1 rounded-md font-mono text-xs text-slate-400">
                            {cell.count}
                          </span>
                        </td>
                      );
                    }

                    return (
                      <td key={sk} className="p-2 text-center">
                        <span className={`inline-block px-3 py-1 rounded-md font-mono font-bold text-xs heat-cell-zoom cursor-default ${
                          isZero ? 'heat-cell-gap animate-pulse' :
                          isOne ? 'heat-cell-single' :
                          'heat-cell-healthy'
                        }`}
                        title={`${sk}: ${cell.count} certified on duty`}
                        >
                          {cell.count}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ---------------- VIEW 5: What-If Scheduling Simulator ----------------
function SimulatorView({
  t,
  resilience,
  scenario,
  setScenario,
  result,
  loading,
  onRun,
  onOneClickRepair
}) {
  const currentScore = Math.round(resilience?.score || 78);

  return (
    <div className="space-y-6">

      {/* Simulator Visual Graphic Hero Card */}
      <div className="card-corporate rounded-2xl overflow-hidden shadow-xs border border-slate-200 flex flex-col md:flex-row">
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-brand-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Disaster Preparedness Sandbox
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-2 font-display">
              Business Surge & Incident Simulator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Stress-test the business shift roster against sudden seasonal demand spikes, supply chain disruptions, or critical staff absenteeism.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
              Current Baseline: <strong className="text-slate-900 font-mono">{currentScore}%</strong>
            </div>
            <div className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800">
              Disaster Reserve Pool: <strong>1 Active Clinician</strong>
            </div>
          </div>
        </div>

        {/* Right Graphic Illustration */}
        <div className="md:w-80 lg:w-96 relative bg-slate-100 min-h-[160px] md:min-h-0 border-t md:border-t-0 md:border-l border-slate-200 overflow-hidden">
          <img
            src="/static/assets/surge_simulation.jpg"
            alt="Disaster Simulation Sandbox"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-4">
            <span className="text-[11px] font-medium text-white/90 bg-slate-900/60 backdrop-blur-xs px-2.5 py-1 rounded-md">
              ⚡ Business Surge Simulation Active
            </span>
          </div>
        </div>
      </div>

      {/* Scenario Selector & Run Button */}
      <div className="card-corporate p-5 rounded-xl shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 font-display">Select Stress Scenario to Execute:</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: 'flu_wave',
              title: 'Unexpected Team Outage',
              desc: '4 key staff members call out simultaneously across Operations & Cloud Infrastructure',
              icon: 'users'
            },
            {
              id: 'surge_demand',
              title: 'Q4 Peak Business Surge (+50%)',
              desc: 'Sudden spike in enterprise volume requires 5 additional operational shifts',
              icon: 'trending-up'
            },
            {
              id: 'lead_absence',
              title: 'Operations Lead Absence',
              desc: 'Senior Operations Dispatch Lead is unexpectedly unavailable for 48 hours',
              icon: 'user-x'
            }
          ].map(sc => (
            <div
              key={sc.id}
              onClick={() => setScenario(sc.id)}
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between card-shine ${
                scenario === sc.id
                  ? 'bg-blue-50/80 border-brand-500 shadow-sm ring-1 ring-blue-300'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">{sc.title}</span>
                  <i data-lucide={sc.icon} className={`w-4 h-4 ${scenario === sc.id ? 'text-brand-600' : 'text-slate-400'}`}></i>
                </div>
                <p className="text-xs text-slate-500">{sc.desc}</p>
              </div>
              <div className="mt-3 flex items-center text-xs font-semibold text-brand-700">
                <span className={`w-2 h-2 rounded-full mr-1.5 ${scenario === sc.id ? 'bg-brand-600' : 'bg-slate-300'}`}></span>
                <span>{scenario === sc.id ? 'Selected' : 'Click to Select'}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={onRun}
            disabled={loading}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs flex items-center space-x-2 transition disabled:opacity-50 btn-ai-sparkle cursor-pointer"
          >
            <i data-lucide="play" className="w-4 h-4"></i>
            <span>{loading ? 'Running Stress Simulation...' : t.simulateScenario}</span>
          </button>
        </div>
      </div>

      {/* Simulation Results Comparison Display */}
      {result && (
        <div className="card-corporate card-shine p-6 rounded-xl border-blue-200 shadow-sm space-y-6 animate-scale-up">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono uppercase text-brand-700 font-bold">Simulation Outcome</span>
              <h4 className="text-lg font-bold text-slate-900 mt-0.5 font-display">{result.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{result.impact_summary}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold">
              +{result.new_shortages_created} Staff Shortages Created
            </span>
          </div>

          {/* 3-Way Metrics Comparison: Baseline -> Stress Drop -> Projected Auto-Recovery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Step 1: Baseline */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs text-slate-500 uppercase font-mono font-bold">Current Baseline</span>
              <div className="text-3xl font-extrabold text-slate-900 font-mono my-2">{currentScore}%</div>
              <span className="text-xs text-emerald-700 font-semibold">Healthy Schedule</span>
            </div>

            {/* Step 2: Under Stress */}
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-center">
              <span className="text-xs text-rose-700 uppercase font-mono font-bold">Simulated Impact</span>
              <div className="text-3xl font-extrabold text-rose-700 font-mono my-2">{result.simulated_resilience}%</div>
              <span className="text-xs text-rose-700 font-semibold">Drop of -{result.resilience_drop}%</span>
            </div>

            {/* Step 3: Auto-Recovery Projected */}
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-xs text-emerald-700 uppercase font-mono font-bold">After One-Click Repair</span>
              <div className="text-3xl font-extrabold text-emerald-700 font-mono my-2">{result.recovery_resilience_projected}%</div>
              <span className="text-xs text-emerald-700 font-semibold">Full Recovery Achieved</span>
            </div>

          </div>

          {/* Mitigation Strategy Checklist */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center space-x-1.5">
              <i data-lucide="check-square" className="w-4 h-4 text-emerald-600"></i>
              <span>Auto-Generated Heuristic Recovery Protocol</span>
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
              {result.mitigation_plan?.map((step, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA: Execute One Click Repair Now */}
          <div className="flex justify-end">
            <button
              onClick={onOneClickRepair}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 transition"
            >
              <i data-lucide="wand-2" className="w-4 h-4"></i>
              <span>Apply Schedule Repair Protocol</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// ---------------- VIEW 6: Shift Swaps & Self-Service ----------------
function SwapsView({
  t,
  swaps,
  employees,
  shifts,
  requesterId,
  setRequesterId,
  targetEmpId,
  setTargetEmpId,
  shiftId,
  setShiftId,
  targetShiftId,
  setTargetShiftId,
  checkResult,
  onCheck,
  onSubmit,
  onApprove
}) {
  return (
    <div className="space-y-6">
      
      {/* Interactive Swap Compatibility Evaluator */}
      <div className="card-corporate p-5 rounded-xl space-y-4 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 font-display">
            <i data-lucide="repeat" className="w-5 h-5 text-brand-600"></i>
            <span>Shift Swap Compliance & Compatibility Engine</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Validates rest rules (11h gap), skill requirements, overtime caps, and schedule overlaps before approving swaps.
          </p>
        </div>

        {/* Swap Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          
          {/* Requester Employee */}
          <div className="space-y-1">
            <label className="text-xs text-slate-600 font-semibold">Requester Personnel</label>
            <select
              value={requesterId}
              onChange={e => setRequesterId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
              ))}
            </select>
          </div>

          {/* Shift to Swap Out */}
          <div className="space-y-1">
            <label className="text-xs text-slate-600 font-semibold">Shift to Hand Over</label>
            <select
              value={shiftId}
              onChange={e => setShiftId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {shifts.map(s => (
                <option key={s.id} value={s.id}>{s.title} ({s.department})</option>
              ))}
            </select>
          </div>

          {/* Target Colleague */}
          <div className="space-y-1">
            <label className="text-xs text-slate-600 font-semibold">Target Colleague</label>
            <select
              value={targetEmpId}
              onChange={e => setTargetEmpId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
              ))}
            </select>
          </div>

          {/* Target Shift (Optional) */}
          <div className="space-y-1">
            <label className="text-xs text-slate-600 font-semibold">Target Shift (Optional)</label>
            <select
              value={targetShiftId}
              onChange={e => setTargetShiftId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">None (Direct One-Way Cover)</option>
              {shifts.map(s => (
                <option key={s.id} value={s.id}>{s.title} ({s.department})</option>
              ))}
            </select>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onCheck}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-brand-700 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
          >
            <i data-lucide="check-circle" className="w-4 h-4 text-brand-600"></i>
            <span>Evaluate Swap Compliance</span>
          </button>
        </div>

        {/* Compatibility Report Box */}
        {checkResult && (
          <div className={`p-4 rounded-lg border mt-3 space-y-2 animate-fade-in ${
            checkResult.compatible
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center space-x-2">
                <i data-lucide={checkResult.compatible ? 'check-circle-2' : 'alert-circle'} className={`w-5 h-5 ${checkResult.compatible ? 'text-emerald-600' : 'text-rose-600'}`}></i>
                <span>Compliance Score: {checkResult.score}% ({checkResult.recommendation})</span>
              </span>
              {checkResult.compatible && (
                <button
                  onClick={onSubmit}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                >
                  Submit Swap Request
                </button>
              )}
            </div>

            <div className="text-xs space-y-1 pt-1">
              {checkResult.strengths?.map((s, idx) => (
                <div key={idx} className="flex items-center space-x-1.5 text-emerald-800">
                  <i data-lucide="check" className="w-3.5 h-3.5 text-emerald-600"></i>
                  <span>{s}</span>
                </div>
              ))}
              {checkResult.issues?.map((iss, idx) => (
                <div key={idx} className="flex items-center space-x-1.5 text-rose-800">
                  <i data-lucide="x" className="w-3.5 h-3.5 text-rose-600"></i>
                  <span>{iss}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Existing Swap Requests Queue */}
      <div className="card-corporate p-5 rounded-xl space-y-3 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 font-display">Shift Swap Review Queue</h4>
        
        {swaps.length > 0 ? (
          <div className="space-y-2.5">
            {swaps.map(sw => (
              <div
                key={sw.id}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900 text-sm">{sw.requester_name}</span>
                    <i data-lucide="arrow-right" className="w-3.5 h-3.5 text-slate-400"></i>
                    <span className="font-semibold text-slate-900 text-sm">{sw.target_employee_name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      sw.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      sw.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {sw.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Shift: <strong className="text-slate-800">{sw.shift_title}</strong> ({sw.shift_time})
                    {sw.target_shift_title ? ` ⇄ ${sw.target_shift_title}` : ' (Direct Cover)'}
                  </div>
                </div>

                {sw.status === 'pending' && (
                  <button
                    onClick={() => onApprove(sw.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-xs"
                  >
                    <i data-lucide="check" className="w-3.5 h-3.5"></i>
                    <span>Approve Swap</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">No active shift swap requests recorded.</p>
        )}
      </div>

    </div>
  );
}


// ---------------- VIEW 7: Skill Academy & Course Upgrading ----------------
function AcademyView({
  t,
  courses,
  employees,
  selectedEmpId,
  setSelectedEmpId,
  onComplete,
  onViewCertificate
}) {
  const currentEmp = employees.find(e => e.id === parseInt(selectedEmpId));
  const sixSigmaCourse = courses.find(c => c.target_skill === 'Six Sigma') || courses[0];

  return (
    <div className="space-y-6">

      {/* Academy Visual Graphic Hero Banner */}
      <div className="card-corporate card-shine aurora-gradient-bg rounded-2xl overflow-hidden shadow-xs border border-slate-200 flex flex-col md:flex-row">
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Professional Workforce Development
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-2 font-display">
              Skill Academy & Enterprise Credentialing
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Enable staff to complete certified training courses in Cloud SRE Operations, Six Sigma Lean Process, ITIL Service Delivery, and Incident Command.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 max-w-sm">
            <span className="text-slate-500 font-semibold">Trainee Professional:</span>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer flex-1"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id} className="bg-white">
                  {e.name} ({e.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Graphic Banner Image */}
        <div className="md:w-80 lg:w-96 relative bg-slate-100 min-h-[160px] md:min-h-0 border-t md:border-t-0 md:border-l border-slate-200 overflow-hidden">
          <img
            src="/static/assets/academy_badge.jpg"
            alt="Medical Education Academy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-4">
            <span className="text-[11px] font-medium text-white/90 bg-slate-900/60 backdrop-blur-xs px-2.5 py-1 rounded-md">
              🎓 Corporate Professional Development Faculty
            </span>
          </div>
        </div>
      </div>

      {/* 5-Person Shift Active Upgrade Prompt Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-blue-50 border border-amber-300 text-xs space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-200 text-amber-900 font-bold">
              <i data-lucide="bell" className="w-4 h-4"></i>
            </span>
            <div>
              <span className="font-extrabold text-slate-900 text-sm font-display block">
                Skill Upgrade Notifications Dispatched: 5-Person Shift Requirement
              </span>
              <span className="text-[11px] text-slate-600">
                Shift #1 "Global Logistics Morning Dispatch" requires 5 certified staff with <strong>Six Sigma</strong> & <strong>ERP Systems</strong>.
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full uppercase">
              Headcount: 5 Staff Needed
            </span>
            {sixSigmaCourse && employees.filter(e => e.department === 'Operations & Logistics' && !e.skills?.includes('Six Sigma')).length > 0 && (
              <button
                onClick={async () => {
                  const pendingStaff = employees.filter(e => e.department === 'Operations & Logistics' && !e.skills?.includes('Six Sigma')).slice(0, 5);
                  for (const s of pendingStaff) {
                    await onComplete(sixSigmaCourse.id, s.id);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1 shadow-xs transition cursor-pointer"
                title="Certify all pending operations personnel in Six Sigma with 1 click"
              >
                <i data-lucide="sparkles" className="w-3.5 h-3.5"></i>
                <span>⚡ Certify All Pending</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {employees
            .filter(e => e.department === 'Operations & Logistics')
            .slice(0, 5)
            .map(emp => {
              const hasSixSigma = emp.skills?.includes('Six Sigma');
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmpId(emp.id)}
                  className={`cursor-pointer p-2.5 rounded-xl border flex flex-col justify-between space-y-2 transition ${
                    parseInt(selectedEmpId) === emp.id
                      ? 'bg-white border-brand-500 ring-2 ring-blue-200 shadow-xs'
                      : 'bg-white/90 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                  title="Click to select this trainee"
                >
                  <div className="flex items-center space-x-2">
                    <img src={emp.avatar_url} className="w-6 h-6 rounded-full object-cover border border-slate-200" alt={emp.name} />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-800 truncate block text-[11px]">{emp.name}</span>
                      <span className="text-[10px] text-slate-500 truncate block">{emp.role}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      hasSixSigma ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {hasSixSigma ? '✓ Certified' : '⚡ Upgrade Pending'}
                    </span>

                    {!hasSixSigma && sixSigmaCourse && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onComplete(sixSigmaCourse.id, emp.id);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-brand-600 hover:bg-brand-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center space-x-0.5"
                        title={`Award Six Sigma competency to ${emp.name}`}
                      >
                        <span>Certify</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Selected Employee's Current Skills Preview */}
      {currentEmp && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <img
              src={currentEmp.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              alt={currentEmp.name}
            />
            <div>
              <span className="font-bold text-slate-900 text-sm font-display">{currentEmp.name}</span>
              <span className="text-brand-700 font-semibold block">{currentEmp.role}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="text-slate-500 mr-1 font-medium">Verified Skills:</span>
            {currentEmp.skills?.map((sk, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 font-medium">
                {sk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Course Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-cascade">
        {courses.map(course => {
          const hasSkill = currentEmp?.skills?.includes(course.target_skill);

          return (
            <div key={course.id} className="card-corporate card-shine p-5 rounded-xl flex flex-col justify-between space-y-4 shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-brand-700 border border-blue-200">
                    {course.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {course.duration_hours}h • {course.level}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 font-display">{course.title}</h4>
                <p className="text-xs text-slate-600">{course.description}</p>

                {/* Unlocks Reward Pill */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="text-slate-500 font-medium">Awarded Competency:</div>
                  <div className="font-bold text-brand-700 flex items-center space-x-1">
                    <i data-lucide="award" className="w-3.5 h-3.5 text-brand-600"></i>
                    <span>{course.target_skill}</span>
                    {course.target_cert && <span className="text-[10px] text-cyan-800 ml-1">({course.target_cert})</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => onComplete(course.id)}
                  disabled={hasSkill}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                    hasSkill
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                  }`}
                >
                  <i data-lucide={hasSkill ? 'check-check' : 'graduation-cap'} className="w-4 h-4"></i>
                  <span>{hasSkill ? 'Competency Acquired' : t.completeCourse}</span>
                </button>

                {hasSkill && (
                  <button
                    onClick={() => onViewCertificate(course)}
                    className="w-full py-1.5 bg-white hover:bg-slate-50 text-brand-700 border border-brand-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 shadow-xs transition"
                  >
                    <i data-lucide="file-badge" className="w-3.5 h-3.5 text-brand-600"></i>
                    <span>View & Print Official Certificate</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ---------------- DRAWER: Replacement Candidates Recommendation ----------------
function ReplacementDrawer({ t, shift, candidates, onClose, onAssign }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end modal-overlay">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-slate-200 animate-slide-left">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs uppercase font-mono text-brand-700 font-bold">Auto-Replacement Engine</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5 font-display">{shift.title}</h3>
              <p className="text-xs text-slate-500">
                Department: {shift.department} • Requires {shift.role_required}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg bg-slate-100">
              <i data-lucide="x" className="w-5 h-5"></i>
            </button>
          </div>

          {/* Shift Details Summary */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 my-4 text-xs space-y-1">
            <div className="text-slate-700 font-medium">
              Time: {new Date(shift.start_time).toLocaleDateString()}, {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({shift.duration_hours}h)
            </div>
            <div className="text-slate-500 flex flex-wrap gap-1 pt-1">
              <span>Required:</span>
              {shift.required_skills?.map((sk, idx) => (
                <span key={idx} className="px-1.5 py-0.2 rounded bg-white text-slate-800 border border-slate-200">{sk}</span>
              ))}
            </div>
          </div>

          {/* Top Ranked Candidates List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Top Ranked Available Replacements ({candidates.length})
            </h4>

            {candidates.map((cand, idx) => (
              <div
                key={cand.employee_id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-400 transition flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <img
                      src={cand.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      alt={cand.name}
                    />
                    <div>
                      <span className="font-bold text-sm text-slate-900 font-display">{cand.name}</span>
                      <span className="text-[10px] text-slate-500 block">{cand.role}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center space-x-3 pt-1">
                    <span>Fit: <strong className="text-emerald-700 font-mono font-bold">{cand.fit_score}%</strong></span>
                    <span>Hours: <span className="font-mono">{cand.current_hours}/{cand.max_hours}h</span></span>
                    <span>Fatigue: <span className="font-mono">{cand.fatigue_score}%</span></span>
                  </div>

                  <div className="text-[10px] text-brand-700 font-medium italic">
                    {cand.reasons?.[0] || 'Eligible and available'}
                  </div>
                </div>

                <button
                  onClick={() => onAssign(cand.employee_id)}
                  className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-xs transition whitespace-nowrap"
                >
                  Assign Staff
                </button>
              </div>
            ))}

            {candidates.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">
                No eligible employees meet minimum qualification thresholds.
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold mt-4 hover:bg-slate-200"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
}


// ---------------- MODAL: One-Click Repair Result ----------------
function RepairResultModal({ t, data, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <i data-lucide="sparkles" className="w-5 h-5"></i>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">One-Click Schedule Repair Complete</h3>
            <p className="text-xs text-slate-500">All detected conflicts and gaps were automatically processed</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-mono font-bold">Conflicts Resolved</span>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
              {data.conflicts_resolved}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-mono font-bold">New Slots Auto-Filled</span>
            <div className="text-2xl font-extrabold text-brand-700 font-mono mt-1">
              {data.newly_assigned}
            </div>
          </div>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Actions Executed</span>
          {data.actions_taken?.map((act, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-slate-50 text-xs text-slate-800 border border-slate-200 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{act}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
        >
          Done & Review Schedule
        </button>
      </div>
    </div>
  );
}


// ---------------- DRAWER: Notification Center ----------------
function NotificationDrawer({ notifications, onClose, onMarkRead, onMarkAllRead, onOpenAcademy, onDispatchShiftNotification, shifts }) {
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'unread', 'skill_upgrade'
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const displayedNotifs = useMemo(() => {
    return notifications.filter(n => {
      if (filterTab === 'unread') return !n.is_read;
      if (filterTab === 'skill_upgrade') return n.category === 'skill_upgrade';
      return true;
    });
  }, [notifications, filterTab]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end modal-overlay">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-slate-200 animate-slide-left">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <i data-lucide="bell" className="w-5 h-5"></i>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Workforce Notifications</h3>
                <p className="text-xs text-slate-500">
                  {unreadCount > 0 ? `${unreadCount} unread skill upgrade alerts` : 'All alerts caught up'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-brand-600 hover:text-brand-800 font-semibold px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 cursor-pointer"
                >
                  Mark All Read
                </button>
              )}
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg bg-slate-100 cursor-pointer">
                <i data-lucide="x" className="w-4 h-4"></i>
              </button>
            </div>
          </div>

          {/* Quick Action: Trigger 5-Person Shift Notification */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span className="flex items-center space-x-1.5 text-brand-700">
                <i data-lucide="sparkles" className="w-4 h-4"></i>
                <span>5-Person Shift Skill Dispatch</span>
              </span>
              <span className="text-[10px] bg-brand-600 text-white px-2 py-0.5 rounded-full font-mono">Headcount = 5</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Dispatch instant notifications to 5 team members to upgrade required skills (Six Sigma & ERP Systems) for Shift #1 (Global Logistics Morning Dispatch).
            </p>
            <button
              onClick={() => onDispatchShiftNotification(1)}
              className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold flex items-center justify-center space-x-1.5 shadow-xs transition cursor-pointer"
            >
              <i data-lucide="send" className="w-3.5 h-3.5"></i>
              <span>Dispatch 5-Person Shift Notifications</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-1 rounded-md font-semibold text-center transition ${
                filterTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilterTab('unread')}
              className={`flex-1 py-1 rounded-md font-semibold text-center transition ${
                filterTab === 'unread' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilterTab('skill_upgrade')}
              className={`flex-1 py-1 rounded-md font-semibold text-center transition ${
                filterTab === 'skill_upgrade' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Skills ({notifications.filter(n => n.category === 'skill_upgrade').length})
            </button>
          </div>

          {/* Notification List */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
              <span>Alerts ({displayedNotifs.length})</span>
            </h4>

            {displayedNotifs.map(notif => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-xl border text-xs transition space-y-2 shadow-xs ${
                  notif.is_read
                    ? 'bg-slate-50/70 border-slate-200 text-slate-600'
                    : 'bg-white border-amber-300 ring-1 ring-amber-100 text-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <img
                      src={notif.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      alt={notif.employee_name}
                    />
                    <div>
                      <span className="font-bold text-slate-900 block font-display">{notif.employee_name}</span>
                      <span className="text-[10px] text-slate-500">{notif.employee_role}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    notif.category === 'skill_upgrade' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {notif.category === 'skill_upgrade' ? 'Skill Upgrade' : notif.category}
                  </span>
                </div>

                <div className="font-semibold text-slate-800 text-[11.5px] leading-snug">
                  {notif.title}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {notif.message}
                </p>

                {notif.target_skill && (
                  <div className="flex items-center space-x-1.5 text-[11px] text-brand-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
                    <i data-lucide="award" className="w-3.5 h-3.5 text-brand-600"></i>
                    <span>Target Competency: <strong>{notif.target_skill}</strong></span>
                    {notif.target_cert && <span className="text-[10px] text-slate-500">({notif.target_cert})</span>}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    {!notif.is_read && (
                      <button
                        onClick={() => onMarkRead(notif.id)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition cursor-pointer"
                        title="Mark as read"
                      >
                        Dismiss
                      </button>
                    )}
                    <button
                      onClick={() => onOpenAcademy(notif.employee_id, notif.course_id)}
                      className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold flex items-center space-x-1 shadow-xs transition cursor-pointer"
                    >
                      <i data-lucide="graduation-cap" className="w-3 h-3"></i>
                      <span>Upgrade in Academy</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <i data-lucide="check-circle-2" className="w-8 h-8 mx-auto text-emerald-500"></i>
                <p className="text-xs">No pending notifications. All shifts and skills are in compliance.</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold mt-4 cursor-pointer"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
}


// ---------------- MODAL: Edit Shift ----------------
function EditShiftModal({ shift, onClose, onSave, showToast }) {
  const [title, setTitle] = useState(shift.title || '');
  const [department, setDepartment] = useState(shift.department || 'Operations & Logistics');
  const [role, setRole] = useState(shift.role_required || '');
  const [headcount, setHeadcount] = useState(shift.required_headcount || 5);
  const [demand, setDemand] = useState(shift.demand_level || 'surge');
  const [skills, setSkills] = useState((shift.required_skills || []).join(', '));
  const [certs, setCerts] = useState((shift.required_certifications || []).join(', '));
  const [notifyStaff, setNotifyStaff] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(shift.id, {
      title,
      department,
      role_required: role,
      required_headcount: parseInt(headcount),
      demand_level: demand,
      required_skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      required_certifications: certs.split(',').map(s => s.trim()).filter(Boolean)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-brand-700 font-bold">Shift #{shift.id}</span>
            <h3 className="text-base font-bold text-slate-900 font-display">Edit Shift & Headcount</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer"><i data-lucide="x" className="w-5 h-5"></i></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Shift Title</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Department</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Operations & Logistics">Operations & Logistics</option>
                <option value="IT & Cloud Infrastructure">IT & Cloud Infrastructure</option>
                <option value="Customer Operations">Customer Operations</option>
                <option value="Finance & Risk Management">Finance & Risk Management</option>
                <option value="Quality & Compliance">Quality & Compliance</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Role Required</label>
              <input
                required
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Headcount Input with 1-click Preset to 5 */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-800 font-bold block">Required Headcount (People)</label>
              <div className="flex items-center space-x-1">
                {[2, 3, 5, 8].map(num => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setHeadcount(num)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition cursor-pointer ${
                      parseInt(headcount) === num
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {num === 5 ? '5 ⭐' : num}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="20"
                value={headcount}
                onChange={e => setHeadcount(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 font-bold p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setHeadcount(5)}
                className="px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-xs whitespace-nowrap cursor-pointer"
              >
                Set to 5
              </button>
            </div>
            <p className="text-[11px] text-brand-800 font-medium">
              Setting headcount to 5 expands shift capacity to 5 people and alerts team members to upgrade new skills.
            </p>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Required Skills (comma separated)</label>
            <input
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="Logistics, ERP Systems, Six Sigma"
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Required Certifications</label>
            <input
              value={certs}
              onChange={e => setCerts(e.target.value)}
              placeholder="CSCP, Six Sigma Black Belt"
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyStaff}
              onChange={e => setNotifyStaff(e.target.checked)}
              className="rounded text-brand-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-slate-700 font-medium text-[11px]">
              📢 Automatically notify 5 staff members to upgrade to new skills upon save
            </span>
          </label>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg cursor-pointer">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-xs cursor-pointer">
              Save & Dispatch Notifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ---------------- MODAL: Add Shift ----------------
function AddShiftModal({ t, onClose, onSuccess, showToast }) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Emergency');
  const [role, setRole] = useState('Triage Specialist');
  const [headcount, setHeadcount] = useState(2);
  const [demand, setDemand] = useState('normal');
  const [skills, setSkills] = useState('Triage, BLS');
  const [certs, setCerts] = useState('BLS');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const now = new Date();
      now.setDate(now.getDate() + 1);
      const start = new Date(now);
      start.setHours(8, 0, 0);
      const end = new Date(now);
      end.setHours(16, 0, 0);

      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          department,
          role_required: role,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          required_headcount: parseInt(headcount),
          demand_level: demand,
          required_skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          required_certifications: certs.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        showToast('New operational shift created!', 'success');
        onSuccess();
      }
    } catch (err) {
      showToast('Failed to create shift', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 font-display">Create New Operational Shift</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><i data-lucide="x" className="w-5 h-5"></i></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Shift Title</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. ICU Night Intensive Support"
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Department</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Operations & Logistics">Operations & Logistics</option>
                <option value="IT & Cloud Infrastructure">IT & Cloud Infrastructure</option>
                <option value="Customer Operations">Customer Operations</option>
                <option value="Finance & Risk Management">Finance & Risk Management</option>
                <option value="Quality & Compliance">Quality & Compliance</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Role Required</label>
              <input
                required
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="Senior Logistics Dispatcher"
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Required Headcount</label>
              <input
                type="number"
                min="1"
                max="10"
                value={headcount}
                onChange={e => setHeadcount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Demand Level</label>
              <select
                value={demand}
                onChange={e => setDemand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="surge">Surge</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Required Skills (comma separated)</label>
            <input
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="ICU Care, ACLS"
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Required Certifications</label>
            <input
              value={certs}
              onChange={e => setCerts(e.target.value)}
              placeholder="BLS, ACLS"
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-xs">Create Shift</button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ---------------- MODAL: Add Employee ----------------
function AddEmployeeModal({ t, onClose, onSuccess, showToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Emergency');
  const [role, setRole] = useState('Emergency Nurse');
  const [skills, setSkills] = useState('Triage, CPR, BLS');
  const [certs, setCerts] = useState('BLS');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          department,
          role,
          hourly_rate: 42.0,
          max_weekly_hours: 40.0,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          certifications: certs.split(',').map(c => ({
            name: c.trim(),
            code: `${c.trim()}-2026`,
            expiry: '2027-12-31',
            status: 'Active'
          }))
        })
      });
      if (res.ok) {
        showToast('New employee registered in roster!', 'success');
        onSuccess();
      }
    } catch (err) {
      showToast('Failed to create employee', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 font-display">Add Personnel to Directory</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><i data-lucide="x" className="w-5 h-5"></i></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Full Name</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Dr. Emily Thorne"
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="emily.thorne@metrohealth.org"
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Department</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Operations & Logistics">Operations & Logistics</option>
                <option value="IT & Cloud Infrastructure">IT & Cloud Infrastructure</option>
                <option value="Customer Operations">Customer Operations</option>
                <option value="Finance & Risk Management">Finance & Risk Management</option>
                <option value="Quality & Compliance">Quality & Compliance</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Role Title</label>
              <input
                required
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="Operations Dispatch Specialist"
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Skills (comma separated)</label>
            <input
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="ICU Care, Triage, CPR"
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Certifications (comma separated)</label>
            <input
              value={certs}
              onChange={e => setCerts(e.target.value)}
              placeholder="BLS, ACLS, ATLS"
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-xs">Add Personnel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Render into DOM
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<ShiftWiseApp />);

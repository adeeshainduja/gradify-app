import { useState, useEffect } from 'react';
import { 
  Award, 
  TrendingUp, 
  Calculator, 
  HelpCircle, 
  Sparkles, 
  Scale, 
  BookOpen, 
  GraduationCap,
  PieChart,
  BarChart2,
  CheckCircle2,
  BarChart3,
  Loader2,
  Target
} from 'lucide-react';
import { 
  Semester, 
  Subject, 
  scalePoints, 
  gradeToPoints, 
  AVAILABLE_GRADES, 
  GradeType 
} from '../types';
import { gpaTrend, getHistory, predictGPA } from '../api/gpaApi';
import { assignmentAnalytics, subjectPerformance } from '../api/analyticsApi';

interface GpaAnalyticsViewProps {
  semesters: Semester[];
  subjects: Subject[];
  profile: any;
}

export default function GpaAnalyticsView({
  semesters,
  subjects,
  profile
}: GpaAnalyticsViewProps) {
  // Simulator grade states for subjects currently marked 'IP' (In Progress)
  const currentSemester = semesters.find(s => s.isCurrent) || semesters[semesters.length - 1];
  const ipSubjects = subjects.filter(sub => sub.grade === 'IP');

  // Load standard predicted grades as their original targets initially, fallback to 'A'
  const [predictions, setPredictions] = useState<Record<string, GradeType>>(() => {
    const initial: Record<string, GradeType> = {};
    ipSubjects.forEach(s => {
      initial[s.id] = s.targetGrade || 'A';
    });
    return initial;
  });

  const [trendData, setTrendData] = useState<{
    semesterName: string;
    sgpa: number;
    cgpa: number;
  }[]>([]);
  const [assignmentAnalyticsData, setAssignmentAnalyticsData] = useState<{
    total: number;
    completed: number;
    percentage: number;
  } | null>(null);
  const [subjectPerformanceData, setSubjectPerformanceData] = useState<{
    name: string;
    credits: number;
    currentGrade: string;
    progress: number;
  }[]>([]);
  
  // ── Backend GPA History ─────────────────────────────────────────────────────
  const [gpaHistory, setGpaHistory] = useState<{semesterName: string; sgpa: number; cgpa: number}[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Weighted Prediction (Backend) ───────────────────────────────────────────
  const [midAssignments, setMidAssignments] = useState<Array<{id: string, score: number}>>([
    { id: '1', score: 80 },
    { id: '2', score: 75 },
    { id: '3', score: 78 }
  ]);
  const [predFinal, setPredFinal] = useState<number>(85);
  
  const [predResult, setPredResult] = useState<{
    average: number;
    expectedGrade: string;
    expectedGPA: number;
    confidence: number;
    outlook: string;
  } | null>(null);
  const [predLoading, setPredLoading] = useState(false);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [trendRes, assignmentsRes, subjectsRes, historyRes] = await Promise.all([
          gpaTrend(),
          assignmentAnalytics(),
          subjectPerformance(),
          getHistory().catch(() => ({ data: [] }))
        ]);
        if (trendRes.data) {
          setTrendData(trendRes.data);
        }
        if (assignmentsRes.data) setAssignmentAnalyticsData(assignmentsRes.data);
        if (subjectsRes.data) setSubjectPerformanceData(subjectsRes.data);
        if (historyRes && historyRes.data) setGpaHistory(historyRes.data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      }
    };
    loadAnalytics();
  }, []);

  const handlePredictGradeChange = (subId: string, gradeStr: GradeType) => {
    setPredictions({ ...predictions, [subId]: gradeStr });
  };

  // ── Weighted Grade Predictor Handlers ──────────────────────────────────────
  const addMidAssignment = () => {
    setMidAssignments([
      ...midAssignments,
      { id: Date.now().toString(), score: 80 }
    ]);
  };

  const removeMidAssignment = (id: string) => {
    if (midAssignments.length > 1) {
      setMidAssignments(midAssignments.filter(a => a.id !== id));
    }
  };

  const updateMidAssignment = (id: string, score: number) => {
    setMidAssignments(midAssignments.map(a => 
      a.id === id ? { ...a, score } : a
    ));
  };

  const handlePredict = async () => {
    try {
      setPredLoading(true);
      const response = await predictGPA({
        midAssignments: midAssignments.map(a => ({ score: a.score })),
        final: predFinal
      });
      setPredResult(response.data);
    } catch (err: any) {
      console.error('Prediction failed:', err?.response?.data?.message || err.message);
    } finally {
      setPredLoading(false);
    }
  };

  // GPA calculation algorithms
  const calculateHistoricalGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    const gradedSubjects = subjects.filter(s => s.grade !== 'IP');
    if (gradedSubjects.length === 0) return 0;

    gradedSubjects.forEach(s => {
      totalPoints += gradeToPoints(s.grade) * s.credits;
      totalCredits += s.credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits) : 0;
  };

  const calculatePredictedGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    subjects.forEach(s => {
      let gradePoints = 0;
      if (s.grade === 'IP') {
        const simulatedGrade = predictions[s.id] || 'A';
        gradePoints = gradeToPoints(simulatedGrade);
      } else {
        gradePoints = gradeToPoints(s.grade);
      }

      totalPoints += gradePoints * s.credits;
      totalCredits += s.credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits) : 0;
  };

  const calculateSemesterGPA = (semId: string) => {
    let totalPoints = 0;
    let totalCredits = 0;

    const semGraded = subjects.filter(s => s.semesterId === semId && s.grade !== 'IP');
    if (semGraded.length === 0) return null;

    semGraded.forEach(s => {
      totalPoints += gradeToPoints(s.grade) * s.credits;
      totalCredits += s.credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits) : 0;
  };

  // Compute variables
  const historicalGpa = calculateHistoricalGPA();
  const scaledHistoricalGpa = scalePoints(historicalGpa, profile.gpaScale);
  const simulatedGpa = calculatePredictedGPA();
  const scaledSimulatedGpa = scalePoints(simulatedGpa, profile.gpaScale);

  // Semesters line chart calculations
  // Use backend trend data when available, fall back to local computation
  const chartSemesters = trendData.length > 0
    ? trendData.map(d => ({
        id: d.semesterName,
        name: d.semesterName,
        gpa: d.sgpa
      }))
    : semesters
        .map(sem => {
          const gpaValue = calculateSemesterGPA(sem.id);
          return {
            id: sem.id,
            name: sem.name,
            gpa: gpaValue
          };
        })
        .sort((a,b) => (a.name.localeCompare(b.name)));

  const validChartSemesters = chartSemesters.filter(d => d.gpa !== null) as { id: string; name: string; gpa: number }[];

  // Define scale mapping for Letter Grade to value details helper view
  const gradeScaleGrid = [
    { grade: 'A+/A', points: 4.0, desc: 'Excellent Mastery' },
    { grade: 'A-', points: 3.7, desc: 'High Honors' },
    { grade: 'B+', points: 3.3, desc: 'Commendable Achievement' },
    { grade: 'B', points: 3.0, desc: 'Above Average' },
    { grade: 'B-', points: 2.7, desc: 'Satisfactory Performance' },
    { grade: 'C+', points: 2.3, desc: 'Average / Competent' },
    { grade: 'C', points: 2.0, desc: 'Passing Credit' },
    { grade: 'D', points: 1.0, desc: 'Marginal Credit' },
    { grade: 'F', points: 0.0, desc: 'Failure / No Credit' },
  ];

  return (
    <div className="space-y-8">
      {/* Visual Analytics Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GPA Stats Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-md font-bold font-headline text-slate-950 flex items-center gap-1.5 mb-2">
              <Award className="text-amber-500" size={18} />
              <span>Current vs Simulated GPA</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Compares completed transcript history against predictive simulated grades.
            </p>
          </div>

          <div className="space-y-4 border-y border-slate-50 py-4 my-2">
            <div>
              <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold tracking-wider">Completed GPA</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold font-headline text-slate-900">{scaledHistoricalGpa.toFixed(2)}</span>
                <span className="text-xs text-slate-400">/ {profile.gpaScale.toFixed(1)}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold tracking-wider flex items-center gap-1">
                <span>Simulated Target GPA</span>
                <Sparkles size={11} className="text-blue-500 animate-pulse" />
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold font-headline text-blue-700">{scaledSimulatedGpa.toFixed(2)}</span>
                <span className="text-xs text-slate-400">/ {profile.gpaScale.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 text-[11px] leading-relaxed text-slate-500">
            {scaledSimulatedGpa >= profile.targetGpa ? (
              <span className="text-emerald-700 font-semibold font-sans">
                🎉 Awesome! Your predicted GPA ({scaledSimulatedGpa.toFixed(2)}) is meeting your personal target of {profile.targetGpa.toFixed(2)}. Stay focused!
              </span>
            ) : (
              <span className="text-amber-700 font-sans font-medium">
                ⚠️ Your simulated grades path falls slightly below your target of {profile.targetGpa.toFixed(2)}. Modify the sliders or study plans to pull it up!
              </span>
            )}
          </div>
        </div>

        {/* GPA Trend Over Semesters (Custom crafted line chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold font-headline text-slate-950 flex items-center gap-1.5 mb-2">
              <TrendingUp className="text-blue-600" size={18} />
              <span>Semestral GPA Progression</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">Visual trend line showing GPA scores by semester chronologies.</p>
          </div>

          <div className="w-full relative h-48 mt-4 mb-2 flex items-center justify-center">
            {validChartSemesters.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No historical semester scores to display.</p>
            ) : (
              // Custom SVG Responsive Line Graph
              <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible shrink-0 select-none">
                {/* Reference Grid lines */}
                <line x1="50" y1="20" x2="470" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                <line x1="50" y1="70" x2="470" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                <line x1="50" y1="120" x2="470" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                <line x1="50" y1="140" x2="470" y2="140" stroke="#e2e8f0" strokeWidth="1" />

                {/* Y-Axis scale marks */}
                <text x="35" y="24" className="text-[10px] fill-slate-400 font-mono" textAnchor="end">4.0</text>
                <text x="35" y="74" className="text-[10px] fill-slate-400 font-mono" textAnchor="end">3.0</text>
                <text x="35" y="124" className="text-[10px] fill-slate-400 font-mono" textAnchor="end">2.0</text>

                {/* Compute nodes positioning */}
                {(() => {
                  const paddingLeft = 60;
                  const paddingRight = 440;
                  const totalWidth = paddingRight - paddingLeft;
                  const widthStep = validChartSemesters.length > 1 ? totalWidth / (validChartSemesters.length - 1) : totalWidth;

                  // Map GPA (scaled back to 4.0 scale internally) to y height: 20px (GPA 4.0) to 140px (GPA 1.0)
                  const getYValue = (gpa: number) => {
                    // Normalize gpa to be out of 4.0 max scale
                    const internalGpa = profile.gpaScale === 5.0 ? (gpa / 5.0) * 4.0 : gpa;
                    // Scale internalGpa (range 1.0 to 4.0) into Y coordinates (140 to 20)
                    const normalized = (internalGpa - 1.0) / 3.0; // 0 to 1
                    return 140 - (normalized * 120);
                  };

                  const points = validChartSemesters.map((d, index) => ({
                    x: paddingLeft + index * widthStep,
                    y: getYValue(d.gpa),
                    gpa: scalePoints(d.gpa, profile.gpaScale),
                    name: d.name
                  }));

                  // Build SVG Path points string
                  const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                  return (
                    <>
                      {/* Gradient Fill Area */}
                      {points.length > 1 && (
                        <path 
                          d={`${pathString} L ${points[points.length - 1].x} 140 L ${points[0].x} 140 Z`}
                          fill="url(#gpa-grad)"
                          opacity="0.12"
                        />
                      )}
                      
                      {/* Linear gradient definition */}
                      <defs>
                        <linearGradient id="gpa-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>
                      </defs>

                      {/* Line Connecting nodes */}
                      <path 
                        d={pathString} 
                        fill="none" 
                        stroke="#2563eb" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />

                      {/* Display Node Circles and hover-like labels */}
                      {points.map((p, idx) => (
                        <g key={idx} className="group/node pointer-events-auto">
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="5" 
                            fill="#ffffff" 
                            stroke="#2563eb" 
                            strokeWidth="3" 
                            className="transition-all hover:r-7 cursor-pointer"
                          />
                          {/* GPA labels on Node hover */}
                          <text 
                            x={p.x} 
                            y={p.y - 12} 
                            className="text-[10px] font-bold fill-slate-800 text-center font-mono" 
                            textAnchor="middle"
                          >
                            {p.gpa.toFixed(2)}
                          </text>

                          {/* X-Axis Semester Name labels */}
                          <text 
                            x={p.x} 
                            y="156" 
                            className="text-[9px] font-bold fill-slate-400 uppercase tracking-wider font-sans" 
                            textAnchor="middle"
                          >
                            {p.name}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            )}
          </div>
        </div>

      </div>

      {/* GPA Simulator Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-headline text-slate-950 flex items-center gap-1.5">
              <Calculator className="text-blue-600" size={20} />
              <span>Interactive GPA Projection Playground</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Calculate standard goals by simulating final marks for In Progress courses in the current semester (<strong>{currentSemester?.name}</strong>).
            </p>
          </div>
          <span className="text-xs font-semibold bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1 shrink-0 font-sans">
            <Sparkles size={13} className="text-emerald-600 shrink-0" />
            <span>Simulated GPA: <strong>{scaledSimulatedGpa.toFixed(2)}</strong></span>
          </span>
        </div>

        {ipSubjects.length === 0 ? (
          <div className="py-6 text-center text-slate-400 bg-slate-50 border border-dashed rounded-xl max-w-lg mx-auto">
            <HelpCircle className="mx-auto mb-2 text-slate-300" size={28} />
            <p className="font-sans text-xs">No &ldquo;In Progress (IP)&rdquo; courses registered in this semester to simulate.</p>
            <p className="text-[10px] text-slate-400 font-sans mt-1">To test projection, change a course status grade to &lsquo;IP&rsquo; in the Subjects page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Direct Slider Lists */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-extrabold text-slate-400 font-sans select-none tracking-widest mb-1">Simulate Grades:</h4>
              
              {ipSubjects.map((sub) => {
                const subPointScore = predictions[sub.id] || 'A';
                return (
                  <div 
                    key={sub.id} 
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-2.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">{sub.code}</span>
                        <h5 className="font-bold text-xs text-slate-800 leading-tight truncate max-w-[200px] font-sans">{sub.name}</h5>
                      </div>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-sans shrink-0 uppercase">
                        {sub.credits} Credits
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-6">
                      <span className="text-[10px] font-bold text-slate-500 font-sans">Projected Grade:</span>
                      
                      {/* Selection select menu */}
                      <div className="relative">
                        <select
                           value={subPointScore}
                           onChange={(e) => handlePredictGradeChange(sub.id, e.target.value as GradeType)}
                           className="text-xs font-bold font-mono text-blue-700 bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-1 px-3.5 pr-8 appearance-none cursor-pointer"
                        >
                          {AVAILABLE_GRADES.filter(g => g !== 'IP').map(g => (
                            <option key={g} value={g}>{g} - ({gradeToPoints(g).toFixed(1)} pts)</option>
                          ))}
                        </select>
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none">&#9662;</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Matrix Guidelines Details */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100/50 space-y-4">
              <h4 className="text-xs uppercase font-extrabold text-slate-400 font-sans tracking-widest flex items-center gap-1 bg-slate-100 p-2 rounded">
                <Scale size={14} className="text-slate-500" />
                <span>Points System Matrix (4.0 Scale)</span>
              </h4>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
                {gradeScaleGrid.map((item, id) => (
                  <div key={id} className="flex justify-between items-center bg-white/70 hover:bg-white p-2 rounded-lg border border-slate-50 transition-colors">
                    <span className="font-bold text-slate-800 font-mono tracking-wider">{item.grade}</span>
                    <div className="text-right">
                      <span className="font-sans text-[10px] text-slate-400 font-medium block">{item.desc}</span>
                      <span className="font-mono font-bold text-blue-700 text-[11px]">{item.points.toFixed(1)} Points</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── Weighted GPA Prediction (Backend API) ───────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-headline text-slate-950 flex items-center gap-1.5">
              <Target className="text-violet-600" size={20} />
              <span>Weighted Grade Predictor</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Enter your assessment scores and we'll predict your expected grade and GPA impact.
              <span className="ml-1 font-medium text-slate-500">
                Weights: Mid 30% · Final 70%
              </span>
            </p>
          </div>
          {predResult && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shrink-0 font-sans border ${
              predResult.outlook === 'Excellent'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : predResult.outlook === 'Good'
                ? 'bg-blue-50 border-blue-100 text-blue-800'
                : 'bg-amber-50 border-amber-100 text-amber-800'
            }`}>
              <Sparkles size={13} className="shrink-0" />
              <span>{predResult.outlook}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Score Inputs */}
          <div className="space-y-4">
            {/* Mid Assignments Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-extrabold text-slate-400 font-sans tracking-widest">Mid Assignments (30%)</h4>
                <button
                  onClick={addMidAssignment}
                  className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded hover:bg-violet-100"
                >
                  + Add Assignment
                </button>
              </div>

              {midAssignments.map((assignment, index) => (
                <div key={assignment.id} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 font-sans">Assignment {index + 1}</span>
                    <div className="flex items-center gap-2">
                      {midAssignments.length > 1 && (
                        <button
                          onClick={() => removeMidAssignment(assignment.id)}
                          className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded hover:bg-rose-100"
                        >
                          Remove
                        </button>
                      )}
                      <span className="text-xs font-mono font-bold text-slate-800 w-8 text-right">{assignment.score}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={assignment.score}
                    onChange={(e) => updateMidAssignment(assignment.id, Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-300 font-mono">
                    <span>0</span><span>50</span><span>100</span>
                  </div>
                </div>
              ))}

              {/* Final Exam */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 font-sans">Final Exam (70%)</span>
                  <span className="text-xs font-mono font-bold text-slate-800 w-8 text-right">{predFinal}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={predFinal}
                  onChange={(e) => setPredFinal(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-[9px] text-slate-300 font-mono">
                  <span>0</span><span>50</span><span>100</span>
                </div>
              </div>

              <button
                onClick={handlePredict}
                disabled={predLoading}
                className="w-full mt-2 py-2.5 px-4 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {predLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <BarChart3 size={16} />
                )}
                {predLoading ? 'Calculating...' : 'Predict My Grade'}
              </button>
            </div>
          </div>

          {/* Prediction Result */}
          <div className="flex flex-col justify-center">
            {predResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-sans block mb-1">Avg Score</span>
                    <span className="text-3xl font-extrabold font-headline text-slate-950 text-slate-900">{predResult.average.toFixed(1)}</span>
                    <span className="text-xs text-slate-400 font-sans block">/ 100</span>
                  </div>
                  <div className="bg-violet-50 rounded-2xl p-4 text-center border border-violet-100">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 font-sans block mb-1">Expected Grade</span>
                    <span className="text-3xl font-extrabold font-headline text-slate-950 text-violet-700">{predResult.expectedGrade}</span>
                    <span className="text-xs text-violet-400 font-sans block">{predResult.expectedGPA.toFixed(1)} pts</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl p-4 border border-violet-100/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600 font-sans">Expected GPA</span>
                    <span className="text-lg font-extrabold font-headline text-slate-950 text-violet-700">{predResult.expectedGPA.toFixed(1)} / 4.0</span>
                  </div>
                  {/* GPA Bar */}
                  <div className="w-full h-2 bg-white rounded-full border border-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-700"
                      style={{ width: `${(predResult.expectedGPA / 4.0) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600 font-sans">Confidence</span>
                    <span className="text-xs font-bold text-emerald-600 font-mono">{predResult.confidence}%</span>
                  </div>
                  <p className={`text-xs font-semibold font-sans ${
                    predResult.outlook === 'Excellent' ? 'text-emerald-700' :
                    predResult.outlook === 'Good' ? 'text-blue-700' : 'text-amber-700'
                  }`}>
                    {predResult.outlook === 'Excellent' && '🎉 Excellent! You\'re on track for top marks.'}
                    {predResult.outlook === 'Good' && '✅ Good performance! Keep it consistent.'}
                    {predResult.outlook === 'Needs Improvement' && '⚠️ Needs more effort — focus on finals.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 bg-slate-50 border border-dashed rounded-xl">
                <BarChart3 className="mx-auto mb-2 text-slate-300" size={32} />
                <p className="font-sans text-xs font-medium">Adjust the sliders and click</p>
                <p className="font-sans text-xs text-slate-300">"Predict My Grade" to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Completion Rate */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <h3 className="text-md font-bold font-headline text-slate-950 flex items-center gap-1.5">
          <CheckCircle2 className="text-emerald-600" size={18} />
          <span>Assignment Completion Rate</span>
        </h3>
        <p className="text-xs text-slate-400 font-sans">Overall completion progress based on academic registry.</p>

        {assignmentAnalyticsData ? (
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex justify-between text-xs font-sans mb-1">
                <span className="font-bold text-slate-800">{assignmentAnalyticsData.completed} of {assignmentAnalyticsData.total} completed</span>
                <span className="font-bold text-emerald-700">{assignmentAnalyticsData.percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${assignmentAnalyticsData.percentage}%` }} 
                />
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] text-slate-400 font-sans uppercase font-bold">Total</p>
              <p className="text-lg font-extrabold font-headline text-slate-900">{assignmentAnalyticsData.total}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Loading completion data...</p>
        )}
      </div>

      {/* Subject Performance Analysis */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <h3 className="text-md font-bold font-headline text-slate-950 flex items-center gap-1.5">
          <BarChart2 className="text-blue-600" size={18} />
          <span>Subject Performance Analysis</span>
        </h3>
        <p className="text-xs text-slate-400 font-sans">Subject-level grade and progress overview from live records.</p>

        {subjectPerformanceData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectPerformanceData.map((sub, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-xs text-slate-900 font-sans truncate max-w-[70%]">{sub.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{sub.credits} Credits</span>
                </div>
                <div className="flex justify-between items-center text-xs font-sans">
                  <span className="text-slate-500">Grade</span>
                  <span className="font-bold text-slate-900">{sub.currentGrade || 'N/A'}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${sub.progress}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 font-sans mt-1">Progress: {sub.progress}%</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No subject performance data available yet.</p>
        )}
      </div>

      {/* ── Backend GPA History Table ────────────────────────────────────────── */}
      {(gpaHistory.length > 0 || historyLoading) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-md font-bold font-headline text-slate-950 flex items-center gap-1.5 mb-4">
            <GraduationCap className="text-blue-600" size={18} />
            <span>Official GPA Record</span>
            <span className="ml-auto text-[10px] text-slate-400 font-sans font-normal">Synced from GPA Service</span>
          </h3>

          {historyLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-xs font-sans">Loading history...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-3 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Semester</th>
                    <th className="text-center py-2 px-3 text-slate-400 font-bold uppercase tracking-wider text-[10px]">SGPA</th>
                    <th className="text-center py-2 px-3 text-slate-400 font-bold uppercase tracking-wider text-[10px]">CGPA</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {gpaHistory.map((record, i) => {
                    const prevCgpa = i > 0 ? gpaHistory[i - 1].cgpa : null;
                    const trend = prevCgpa === null ? null : record.cgpa > prevCgpa ? '↑' : record.cgpa < prevCgpa ? '↓' : '→';
                    return (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-medium text-slate-800">{record.semesterName}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-blue-700">{record.sgpa.toFixed(2)}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">{record.cgpa.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right">
                          {trend && (
                            <span className={`font-bold text-sm ${
                              trend === '↑' ? 'text-emerald-500' :
                              trend === '↓' ? 'text-rose-500' : 'text-slate-400'
                            }`}>{trend}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

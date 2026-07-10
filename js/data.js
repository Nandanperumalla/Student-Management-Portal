// ============================================================
// Procedural "database". Deterministic → stable across reloads.
// ============================================================
import { rng } from "./rng.js";

const FIRST_M = ["Aarav","Vivaan","Aditya","Arjun","Reyansh","Krishna","Ishaan","Rohan","Kabir","Ayaan","Dhruv","Karthik","Sai","Aryan","Rahul","Nikhil","Vikram","Aniruddh","Harsh","Yash","Tarun","Manish","Rajat","Siddharth","Pranav","Akhil","Vishal","Deepak","Gaurav","Aakash","Naveen","Sandeep","Varun","Ashwin","Rishabh","Aman","Suraj","Praveen","Abhinav","Karan"];
const FIRST_F = ["Aadhya","Ananya","Diya","Ishita","Kavya","Meera","Nithya","Priya","Riya","Saanvi","Sneha","Trisha","Anjali","Divya","Pooja","Shreya","Neha","Aishwarya","Lakshmi","Swathi","Bhavana","Harini","Keerthi","Manasa","Nandini","Pallavi","Ramya","Sahana","Tanvi","Vaishnavi","Deepika","Gayathri","Sruthi","Varsha","Yamini","Chaitra","Sanjana","Madhuri","Roshni","Aparna"];
const SUR = ["Sharma","Verma","Reddy","Naidu","Rao","Iyer","Nair","Menon","Patel","Shah","Gupta","Agarwal","Singh","Kumar","Chowdhury","Das","Bose","Mukherjee","Pillai","Kaur","Bhat","Hegde","Shetty","Kulkarni","Deshpande","Joshi","Mehta","Chauhan","Yadav","Mishra","Pandey","Nambiar","Krishnan","Subramanian","Raju","Varma","Banerjee","Ghosh","Sinha","Malhotra"];
const CITIES = [["Hyderabad","Telangana"],["Bengaluru","Karnataka"],["Chennai","Tamil Nadu"],["Mumbai","Maharashtra"],["Pune","Maharashtra"],["Delhi","Delhi"],["Kochi","Kerala"],["Visakhapatnam","Andhra Pradesh"],["Vijayawada","Andhra Pradesh"],["Coimbatore","Tamil Nadu"],["Mysuru","Karnataka"],["Nagpur","Maharashtra"],["Kolkata","West Bengal"],["Jaipur","Rajasthan"],["Lucknow","Uttar Pradesh"],["Bhopal","Madhya Pradesh"]];
const BLOOD = ["O+","A+","B+","AB+","O-","A-","B-","AB-"];
const CATEGORY = ["General","OBC","SC","ST","EWS"];
const QUOTA = ["Merit","Management","Sports","NRI"];
const ACHV = ["Hackathon Winner","Paper Published","GATE Qualified","Dean's List","Sports Captain","Coding Contest Top 10","NCC Cadet","Cultural Lead","Robotics Champion","Best Project Award","Internship at MNC","Patent Filed"];
const AVATAR_G = [["#5b8cff","#8b5cff"],["#1fe08a","#7cff5c"],["#ff4d6d","#ff9d4d"],["#22a7ff","#22e0d6"],["#a86bff","#ff6bd6"],["#1fd6d0","#3aa8ff"],["#ffce4d","#ff9d4d"],["#34e0a1","#22a7ff"]];

export const DEPARTMENTS = [
  { code: "CSE",  name: "Computer Science & Engineering", hod: "Dr. Ramesh Iyer",      color: "#5b8cff" },
  { code: "AIML", name: "Artificial Intelligence & ML",    hod: "Dr. Sneha Kulkarni",    color: "#a86bff" },
  { code: "ECE",  name: "Electronics & Communication",     hod: "Dr. Vikram Rao",        color: "#22a7ff" },
  { code: "EEE",  name: "Electrical & Electronics",        hod: "Dr. Anjali Deshpande",  color: "#1fd6d0" },
  { code: "MECH", name: "Mechanical Engineering",          hod: "Dr. Sanjay Patel",      color: "#ff9d4d" },
  { code: "CIVIL",name: "Civil Engineering",               hod: "Dr. Karthik Menon",     color: "#34e0a1" },
  { code: "IT",   name: "Information Technology",          hod: "Dr. Priya Nair",        color: "#ff6bd6" },
  { code: "DS",   name: "Data Science",                    hod: "Dr. Arjun Reddy",       color: "#ffce4d" },
];

const DEPT_WEIGHTS = [["CSE",150],["AIML",90],["ECE",110],["EEE",70],["MECH",90],["CIVIL",60],["IT",90],["DS",40]];
const SECTIONS = ["A","B","C"];

function gradeFromCgpa(c) {
  if (c >= 9) return "O"; if (c >= 8) return "A+"; if (c >= 7) return "A";
  if (c >= 6) return "B+"; if (c >= 5) return "B"; return "C";
}
function pad(n, w) { return String(n).padStart(w, "0"); }
function slugName(n) { return n.toLowerCase().replace(/[^a-z ]/g, "").replace(/\s+/g, "."); }

function buildStudents(n) {
  const list = [];
  const deptCounters = {};
  for (let i = 0; i < n; i++) {
    const gender = rng.bool(0.52) ? "M" : "F";
    const first = rng.pick(gender === "M" ? FIRST_M : FIRST_F);
    const last = rng.pick(SUR);
    const name = `${first} ${last}`;
    const deptCode = rng.weighted(DEPT_WEIGHTS);
    const dept = DEPARTMENTS.find((d) => d.code === deptCode);
    deptCounters[deptCode] = (deptCounters[deptCode] || 0) + 1;
    const year = rng.weighted([[1, 28], [2, 26], [3, 24], [4, 22]]);
    const admissionYear = 2026 - (year - 1);
    const semester = year * 2 - rng.int(0, 1);
    const cgpa = +rng.normal(7.6, 1.05, 4.8, 9.9).toFixed(2);
    const attendance = Math.round(rng.normal(84, 9, 52, 100));
    const feeTotal = rng.pick([120000, 135000, 145000, 160000, 185000]);
    const scholarship = rng.bool(0.16);
    const payRatio = scholarship ? rng.float(0.85, 1, 2) : rng.weighted([[1, 55], [0.7, 20], [0.45, 15], [0.1, 10]]);
    const feePaid = Math.round(feeTotal * payRatio);
    const feeDue = feeTotal - feePaid;
    const [city, state] = rng.pick(CITIES);
    const hostel = rng.bool(0.36);
    const transport = !hostel && rng.bool(0.42);
    const placed = year === 4 && rng.bool(cgpa > 8 ? 0.8 : 0.45);
    const grade = gradeFromCgpa(cgpa);
    const nAchv = rng.weighted([[0, 30], [1, 34], [2, 22], [3, 14]]);
    const achievements = rng.shuffle(ACHV).slice(0, nAchv);
    const backlogs = cgpa < 6 ? rng.int(1, 4) : rng.bool(0.12) ? rng.int(1, 2) : 0;
    const gp = rng.pick(AVATAR_G);

    list.push({
      id: i + 1,
      rollNo: `${admissionYear}${deptCode}${pad(deptCounters[deptCode], 3)}`,
      name, first, last, gender,
      initials: (first[0] + last[0]).toUpperCase(),
      avatar: gp,
      dob: `${2026 - (17 + year)}-${pad(rng.int(1, 12), 2)}-${pad(rng.int(1, 28), 2)}`,
      email: `${slugName(name)}${rng.int(1, 99)}@student.erp.edu`,
      phone: `+91 ${rng.int(70, 99)}${rng.int(10000, 99999)}${pad(rng.int(0, 999), 3)}`,
      deptCode, deptName: dept.name, deptColor: dept.color,
      year, semester, section: rng.pick(SECTIONS),
      cgpa, sgpa: +Math.min(10, cgpa + rng.float(-0.4, 0.5, 2)).toFixed(2),
      grade, attendance,
      backlogs,
      feeTotal, feePaid, feeDue,
      feeStatus: feeDue === 0 ? "Paid" : feeDue > feeTotal * 0.5 ? "Overdue" : "Partial",
      scholarship,
      city, state,
      address: `${rng.int(1, 200)}, ${rng.pick(["MG Road","Green Park","Lake View","Sunrise Colony","Nehru Nagar","Rose Garden"])}, ${city}`,
      bloodGroup: rng.pick(BLOOD),
      category: rng.pick(CATEGORY),
      quota: rng.weighted([["Merit", 70], ["Management", 18], ["Sports", 6], ["NRI", 6]]),
      guardianName: `${rng.pick(gender === "M" ? FIRST_M : SUR)} ${last}`,
      guardianPhone: `+91 ${rng.int(70, 99)}${rng.int(10000, 99999)}${pad(rng.int(0, 999), 3)}`,
      guardianRelation: rng.pick(["Father", "Mother", "Guardian"]),
      hostel, hostelBlock: hostel ? rng.pick(["A", "B", "C", "D"]) : null, hostelRoom: hostel ? rng.int(101, 420) : null,
      transport, route: transport ? `Route ${rng.int(1, 18)}` : null,
      placement: placed ? { status: "Placed", company: rng.pick(["Google","Microsoft","Amazon","TCS","Infosys","Deloitte","Accenture","Adobe","Zoho","Flipkart","Oracle","Salesforce"]), ctc: rng.float(4.5, 44, 1) } : { status: year === 4 ? "In Process" : "Eligible", company: null, ctc: null },
      achievements,
      admissionYear,
      status: rng.bool(0.97) ? "Active" : "On Leave",
      riskScore: 0, // filled after
    });
  }
  // AI risk score derived from attendance, cgpa, backlogs, fee overdue
  for (const s of list) {
    let r = 0;
    r += (85 - s.attendance) * 1.15;
    r += (7.8 - s.cgpa) * 9;
    r += s.backlogs * 10;
    if (s.feeStatus === "Overdue") r += 16;
    s.riskScore = Math.max(2, Math.min(98, Math.round(r + 22)));
    s.riskBand = s.riskScore >= 66 ? "High" : s.riskScore >= 42 ? "Medium" : "Low";
    // AI predicted next-sem CGPA (trend)
    s.predictedCgpa = +Math.max(4, Math.min(10, s.cgpa + rng.float(-0.35, 0.45, 2))).toFixed(2);
  }
  // Ranks by cgpa
  list.slice().sort((a, b) => b.cgpa - a.cgpa).forEach((s, i) => (s.rank = i + 1));
  return list;
}

function buildFaculty(n) {
  const desig = ["Professor", "Associate Professor", "Assistant Professor", "Sr. Lecturer"];
  const out = [];
  for (let i = 0; i < n; i++) {
    const gender = rng.bool(0.6) ? "M" : "F";
    const name = `Dr. ${rng.pick(gender === "M" ? FIRST_M : FIRST_F)} ${rng.pick(SUR)}`;
    const dept = rng.pick(DEPARTMENTS);
    out.push({
      id: i + 1, name, dept: dept.code,
      designation: rng.pick(desig),
      experience: rng.int(2, 28),
      papers: rng.int(0, 42),
      rating: rng.float(3.4, 5, 1),
      subjects: rng.int(1, 4),
    });
  }
  return out;
}

// ---- Aggregations for dashboards / charts ----
function aggregate(students, faculty) {
  const total = students.length;
  const sum = (f) => students.reduce((s, x) => s + f(x), 0);
  const revenue = sum((s) => s.feePaid);
  const pending = sum((s) => s.feeDue);
  const avgCgpa = +(sum((s) => s.cgpa) / total).toFixed(2);
  const avgAtt = Math.round(sum((s) => s.attendance) / total);
  const y4 = students.filter((s) => s.year === 4);
  const placed = y4.filter((s) => s.placement.status === "Placed");
  const placementRate = y4.length ? Math.round((placed.length / y4.length) * 100) : 0;

  const byDept = DEPARTMENTS.map((d) => ({
    ...d,
    count: students.filter((s) => s.deptCode === d.code).length,
    avgCgpa: (() => { const a = students.filter((s) => s.deptCode === d.code); return a.length ? +(a.reduce((x, s) => x + s.cgpa, 0) / a.length).toFixed(2) : 0; })(),
    placed: students.filter((s) => s.deptCode === d.code && s.placement.status === "Placed").length,
  }));

  const grades = ["O", "A+", "A", "B+", "B", "C"].map((g) => ({ g, n: students.filter((s) => s.grade === g).length }));

  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
  const attTrend = months.map((m, i) => ({ x: m, y: Math.round(rng.normal(83 + Math.sin(i) * 3, 3, 74, 94)) }));
  const feeTrend = months.map((m) => ({ x: m, y: rng.int(28, 74) }));
  const enrollTrend = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr, i) => ({ x: String(yr), y: 480 + i * 32 + rng.int(-20, 20) }));

  const topPerformers = students.slice().sort((a, b) => b.cgpa - a.cgpa).slice(0, 6);
  const riskStudents = students.slice().sort((a, b) => b.riskScore - a.riskScore).slice(0, 6);
  const topRecruiters = (() => {
    const m = {};
    placed.forEach((s) => (m[s.placement.company] = (m[s.placement.company] || 0) + 1));
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, n]) => ({ name, n }));
  })();

  return {
    total, faculty: faculty.length, departments: DEPARTMENTS.length,
    revenue, pending, avgCgpa, avgAtt, placementRate,
    scholarships: students.filter((s) => s.scholarship).length,
    hostel: students.filter((s) => s.hostel).length,
    transport: students.filter((s) => s.transport).length,
    library: 5000, libraryIssued: 3120,
    byDept, grades, attTrend, feeTrend, enrollTrend,
    topPerformers, riskStudents, topRecruiters,
    highRisk: students.filter((s) => s.riskBand === "High").length,
    defaulters: students.filter((s) => s.feeStatus === "Overdue").length,
  };
}

const NOTIF_SEED = [
  ["info", "Semester results published", "Odd semester results are now live for all departments.", "2h"],
  ["success", "Fee collection milestone", "₹3.1 Cr collected this term — 78% of target.", "5h"],
  ["danger", "Attendance risk alert", "12 students flagged below 65% attendance by AI.", "8h"],
  ["warning", "Exam schedule updated", "Internal-II timetable revised for CSE & AIML.", "1d"],
  ["info", "New placement drive", "Google campus drive scheduled for Aug 24.", "1d"],
  ["success", "Scholarship approved", "112 merit scholarships processed successfully.", "2d"],
  ["info", "Library additions", "240 new titles added to the digital catalogue.", "3d"],
];

export function buildDatabase() {
  const students = buildStudents(700);
  const faculty = buildFaculty(80);
  const stats = aggregate(students, faculty);
  const notifications = NOTIF_SEED.map((n, i) => ({ id: i, type: n[0], title: n[1], desc: n[2], time: n[3] }));
  return { students, faculty, departments: DEPARTMENTS, stats, notifications };
}

export const fmt = {
  inr: (n) => "₹" + (n >= 1e7 ? (n / 1e7).toFixed(2) + " Cr" : n >= 1e5 ? (n / 1e5).toFixed(2) + " L" : n.toLocaleString("en-IN")),
  inrFull: (n) => "₹" + n.toLocaleString("en-IN"),
  num: (n) => n.toLocaleString("en-IN"),
};

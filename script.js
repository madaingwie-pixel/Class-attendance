// Data awal siswa contoh (mudah dipahami siswa Indonesia, bisa dihapus/diganti kapan saja)
const defaultStudents = [
  { id: 1, name: "Budi Santoso", info: "Absen 01 • Kelompok Gryffindor", status: "Hadir" },
  { id: 2, name: "Siti Aminah", info: "Absen 02 • Kelompok Ravenclaw", status: "Hadir" },
  { id: 3, name: "Rizky Pratama", info: "Absen 03 • Kelompok Hufflepuff", status: "Izin" },
  { id: 4, name: "Nadia Putri", info: "Absen 04 • Kelompok Slytherin", status: "Belum" }
];

let students = JSON.parse(localStorage.getItem('absensiKelasIndonesia')) || defaultStudents;

// Menampilkan tanggal hari ini dalam Bahasa Indonesia
function displayDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date().toLocaleDateString('id-ID', options);
  document.getElementById('currentDate').textContent = today;
}

// Menyimpan perubahan data otomatis di memori HP
function saveToStorage() {
  localStorage.setItem('absensiKelasIndonesia', JSON.stringify(students));
  renderStudents();
}

// Menambah siswa baru ke daftar
function addStudent() {
  const nameInput = document.getElementById('studentName');
  const infoInput = document.getElementById('studentInfo');
  
  const name = nameInput.value.trim();
  const info = infoInput.value.trim() || "Siswa Reguler";

  if (!name) {
    alert("Silakan tulis nama siswa terlebih dahulu!");
    return;
  }

  const newStudent = {
    id: Date.now(),
    name: name,
    info: info,
    status: "Belum"
  };

  students.push(newStudent);
  nameInput.value = "";
  infoInput.value = "";
  saveToStorage();
}

// Mengubah status kehadiran siswa
function setStatus(id, newStatus) {
  students = students.map(student => 
    student.id === id ? { ...student, status: newStatus } : student
  );
  saveToStorage();
}

// Menghapus siswa dari daftar
function deleteStudent(id) {
  if (confirm("Yakin ingin menghapus nama siswa ini dari daftar?")) {
    students = students.filter(student => student.id !== id);
    saveToStorage();
  }
}

// Mengatur ulang semua status absensi untuk hari berikutnya
function resetAttendance() {
  if (confirm("Atur ulang semua status kehadiran menjadi belum absen untuk hari ini?")) {
    students = students.map(student => ({ ...student, status: "Belum" }));
    saveToStorage();
  }
}

// Menyalin rekap absensi untuk langsung dikirim ke grup WhatsApp kelas/guru
function copyReport() {
  const dateText = document.getElementById('currentDate').textContent;
  let hadir = 0, izinSakit = 0, alpa = 0;

  let listText = "";
  students.forEach((s, index) => {
    if (s.status === "Hadir") hadir++;
    if (s.status === "Izin" || s.status === "Sakit") izinSakit++;
    if (s.status === "Alpa") alpa++;

    const icon = s.status === "Hadir" ? "✅" : 
                 s.status === "Izin" ? "📩" : 
                 s.status === "Sakit" ? "🩺" : 
                 s.status === "Alpa" ? "❌" : "⏳";

    listText += `${index + 1}. ${s.name} (${s.info}) — *${s.status}* ${icon}\n`;
  });

  const report = `🏫 *LAPORAN ABSENSI KELAS*\n📅 ${dateText}\n\n` +
                 `📊 *Rekap Kehadiran:*\n• Hadir: ${hadir} siswa\n• Izin/Sakit: ${izinSakit} siswa\n• Alpa: ${alpa} siswa\n\n` +
                 `📋 *Daftar Nama Siswa:*\n${listText}`;

  navigator.clipboard.writeText(report).then(() => {
    alert("Laporan absensi berhasil disalin! Silakan tempel (Paste) di grup WhatsApp.");
  });
}

// Menampilkan daftar siswa ke layar
function renderStudents() {
  const listContainer = document.getElementById('studentList');
  listContainer.innerHTML = "";

  let hadirCount = 0;
  let excusedCount = 0;
  let alpaCount = 0;

  students.forEach(student => {
    if (student.status === "Hadir") hadirCount++;
    if (student.status === "Izin" || student.status === "Sakit") excusedCount++;
    if (student.status === "Alpa") alpaCount++;

    const card = document.createElement('div');
    card.className = 'student-card';
    card.innerHTML = `
      <div class="student-info">
        <h3>${student.name}</h3>
        <span>${student.info}</span>
      </div>
      <div class="status-controls">
        <button class="status-btn ${student.status === 'Hadir' ? 'active-hadir' : ''}" 
                onclick="setStatus(${student.id}, 'Hadir')">Hadir</button>
        <button class="status-btn ${student.status === 'Izin' ? 'active-izin' : ''}" 
                onclick="setStatus(${student.id}, 'Izin')">Izin</button>
        <button class="status-btn ${student.status === 'Sakit' ? 'active-sakit' : ''}" 
                onclick="setStatus(${student.id}, 'Sakit')">Sakit</button>
        <button class="status-btn ${student.status === 'Alpa' ? 'active-alpa' : ''}" 
                onclick="setStatus(${student.id}, 'Alpa')">Alpa</button>
        <button class="btn-delete" title="Hapus Siswa" onclick="deleteStudent(${student.id})">✖</button>
      </div>
    `;
    listContainer.appendChild(card);
  });

  document.getElementById('totalCount').textContent = students.length;
  document.getElementById('presentCount').textContent = hadirCount;
  document.getElementById('excusedCount').textContent = excusedCount;
  document.getElementById('absentCount').textContent = alpaCount;
}

// --- FITUR INSTALASI KE HP (PWA) ---
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      installBtn.style.display = 'none';
    }
    deferredPrompt = null;
  }
});

// Jalankan saat aplikasi dibuka
displayDate();
renderStudents();

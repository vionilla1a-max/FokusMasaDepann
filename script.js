// ... (Kode Anda sebelumnya)

// NAV & MODAL
function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const dest = document.getElementById(pageId);
  if (dest) { dest.classList.remove('hidden'); dest.classList.add('active'); window.scrollTo(0,0); }

  // render page-specific
  if (pageId === 'page-dashboard') renderDashboard();
  if (pageId === 'page-history') renderHistoryPage();
  if (pageId === 'page-analysis') renderAnalysisPage();
  if (pageId === 'page-settings') renderSettingsPage(); // <--- Menambahkan pemanggilan fungsi yang hilang
  if (pageId === 'page-settings-limit') renderSettingsLimitPage();
  if (pageId === 'page-settings-kategori') renderSettingsKategoriPage();
  if (pageId === 'page-settings-motivasi') renderSettingsMotivasiPage();
  if (pageId === 'page-settings-notifikasi') renderSettingsNotifikasiPage();
}

// ... (Kode Anda sebelumnya)

// TRANSAKSI
function switchTxType(type) {
// ... (Fungsi Anda)
}

function saveTransaction() {
  const amount = parseFloat(document.getElementById('form-tx-nominal').value) || 0;
  const category = (currentTxType === 'pengeluaran') ? document.getElementById('form-tx-kategori').value : 'Pemasukan';
  const note = document.getElementById('form-tx-alasan').value;
  const date = document.getElementById('form-tx-tanggal').value || getISODate();

  if (!amount || amount <= 0) return showToast('Nominal harus diisi dan > 0','error');
  // Perbaikan: Pastikan kategori yang dipilih ada jika tipenya pengeluaran
  if (currentTxType === 'pengeluaran' && !category) return showToast('Pilih kategori untuk pengeluaran','error');

  const tx = { id: Date.now().toString(), type: currentTxType, amount, category, note, date };
  db.transactions.push(tx);
  db.saldo += (currentTxType === 'pemasukan') ? amount : -amount;
  saveDB();
  hideModal('modal-add-tx');
  showToast('Transaksi berhasil disimpan!','success');
  renderDashboard();
}

// --- FUNGSI TAMBAHAN (DREAM & TRANSACTION DELETE) ---

// DREAM (Hilang dari kode Anda, diasumsikan dipanggil dari modal-edit-dream)
function saveDream() {
    const title = document.getElementById('form-dream-title').value.trim();
    const targetAmount = parseFloat(document.getElementById('form-dream-target').value) || 0;
    const targetDate = document.getElementById('form-dream-date').value || getISODate();

    if (!title) return showToast('Judul impian harus diisi', 'error');
    if (targetAmount <= 0) return showToast('Target nominal harus > 0', 'error');
    if (!targetDate) return showToast('Tanggal target harus diisi', 'error');

    db.dream.title = title;
    db.dream.targetAmount = targetAmount;
    db.dream.targetDate = targetDate;
    saveDB();
    hideModal('modal-edit-dream');
    showToast('Impian berhasil diperbarui!', 'success');
    renderDashboard();
}

// DELETE TRANSAKSI (Diasumsikan diperlukan untuk manajemen riwayat)
function deleteTransaction(id) {
    const index = db.transactions.findIndex(t => t.id === id);
    if (index === -1) return;

    const tx = db.transactions[index];
    
    // Sesuaikan saldo
    if (tx.type === 'pemasukan') {
        db.saldo -= tx.amount;
    } else { // pengeluaran
        db.saldo += tx.amount;
    }

    // Hapus transaksi
    db.transactions.splice(index, 1);
    saveDB();
    showToast('Transaksi berhasil dihapus!', 'success');
    
    // Perbarui tampilan jika berada di halaman History/Analysis
    if (!document.getElementById('page-history').classList.contains('hidden')) renderHistoryPage();
    if (!document.getElementById('page-dashboard').classList.contains('hidden')) renderDashboard();
    if (!document.getElementById('page-analysis').classList.contains('hidden')) renderAnalysisPage();
}

// ... (Kode Anda sebelumnya)

// HISTORY & ANALYSIS
function renderHistoryPage() {
  const filter = document.getElementById('history-filter-time') ? document.getElementById('history-filter-time').value : 'month';
  const filtered = filterTransactions(db.transactions, filter).slice().sort((a,b)=> new Date(b.date) - new Date(a.date));
  const listEl = document.getElementById('history-full-list');
  const totalInEl = document.getElementById('hist-total-in');
  const totalOutEl = document.getElementById('hist-total-out');

  let totalIn = 0, totalOut = 0, html = '';
  if (!filtered.length) {
    listEl.innerHTML = '<p class="text-center text-gray-500 py-8">Tidak ada transaksi untuk periode ini.</p>';
  } else {
    filtered.forEach(tx => {
      if (tx.type === 'pemasukan') totalIn += tx.amount; else totalOut += tx.amount;
      const amountHtml = tx.type === 'pemasukan' ? `<span class="font-bold text-success">+${formatRupiah(tx.amount)}</span>` : `<span class="font-bold text-danger">-${formatRupiah(tx.amount)}</span>`;
      // Menambahkan tombol Hapus
      html += `<div class="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                  <div class="flex-grow">
                    <p class="font-semibold text-gray-800">${tx.category}</p>
                    <p class="text-sm text-gray-500">${formatDate(tx.date)}${tx.note ? ' - '+tx.note : ''}</p>
                  </div>
                  <div class="text-right mr-3">${amountHtml}</div>
                   <button class="text-red-500 hover:text-red-700 ml-2" onclick="deleteTransaction('${tx.id}')">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                   </button>
               </div>`;
    });
    listEl.innerHTML = html;
  }
  totalInEl.textContent = formatRupiah(totalIn);
  totalOutEl.textContent = formatRupiah(totalOut);
}

// ... (Kode Anda sebelumnya)

// SETTINGS

// FUNGSI INI HILANG, diasumsikan sebagai fungsi default untuk halaman Pengaturan utama
function renderSettingsPage() {
    // Biasanya fungsi ini tidak melakukan apa-apa selain menampilkan halaman utama settings.
    // Jika ada elemen di halaman settings yang perlu di-render, tambahkan di sini.
}

function renderSettingsLimitPage() {
// ... (Fungsi Anda)
}
function saveSettingsLimit() {
  const val = parseFloat(document.getElementById('setting-limit-bulanan').value) || 0;
  db.settings.limitBulanan = val; saveDB(); showToast('Limit berhasil disimpan!','success'); navigateTo('page-settings'); // <--- Perbaikan: Memastikan navigasi kembali ke 'page-settings'
}

function renderSettingsKategoriPage() {
// ... (Fungsi Anda)
}
function addCategory() {
// ... (Fungsi Anda)
}
function deleteCategory(i) {
// ... (Fungsi Anda)
}

function renderSettingsMotivasiPage() {
// ... (Fungsi Anda)
}
function saveSettingsMotivasi() {
  db.settings.motivasi.kuning = document.getElementById('setting-motivasi-kuning').value;
  db.settings.motivasi.merah = document.getElementById('setting-motivasi-merah').value;
  saveDB(); showToast('Motivasi berhasil disimpan!','success'); navigateTo('page-settings'); // <--- Perbaikan: Memastikan navigasi kembali ke 'page-settings'
}

function renderSettingsNotifikasiPage() {
// ... (Fungsi Anda)
}
function saveSettingsNotifikasi() {
  db.settings.notifikasi.aktif = document.getElementById('setting-notif-aktif').checked;
  db.settings.notifikasi.waktu = document.getElementById('setting-notif-waktu').value;
  saveDB(); showToast('Pengaturan notifikasi disimpan!','success'); navigateTo('page-settings'); // <--- Perbaikan: Memastikan navigasi kembali ke 'page-settings'
}

// ... (Kode Anda sebelumnya)

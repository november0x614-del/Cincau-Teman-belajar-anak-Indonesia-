# Rencana Implementasi: Narasi Suara Otomatis & Parental Gate (Standar Industri Anak)

Rencana ini merinci penambahan dua pilar penting standar industri aplikasi anak (COPPA & Kids EdTech) pada aplikasi Companion Anak: **Sistem Narasi Suara Otomatis (Read-Aloud)** untuk seluruh teks percakapan dan kartu belajar, serta **Parental Gate berbasis Tantangan Perkalian Acak** untuk mengamankan akses pengaturan orang tua.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Prioritas Utama Terpilih**: Narasi suara otomatis untuk seluruh teks pembelajaran dan dialog Cincau (mendukung aksesibilitas anak Fase A yang sedang belajar membaca).
> - **Mekanisme Parental Gate**: Tantangan perkalian matematika acak untuk dewasa (contoh: 7 × 8 = ?) sebelum membuka pengaturan atau perubahan data sensitif.
> - **Batas Waktu Layar**: Ditiadakan untuk fase saat ini sesuai pilihan pengguna.
> - **Sintesis Suara (TTS)**: Menggunakan Web Speech Synthesis API (`id-ID`) berlatensi rendah tanpa ketergantungan API pihak ketiga eksternal berbayar, disinkronkan dengan animasi mulut berbicara maskot Cincau.

- **Confirmed Decision 1**: Narasi suara otomatis diaktifkan dengan tombol pengeras suara yang dapat di-toggle (auto-speak vs manual tap) dan sinkronisasi emosi Cincau saat berbicara (`talking`).
- **Confirmed Decision 2**: Parental Gate terpasang pada tombol Pengaturan Orang Tua / Edit Profil Anak di pojok aplikasi.

---

## 1. Overview & Core Concept

- **Tujuan**: Meningkatkan kenyamanan dan kemandirian anak usia SD (Kelas 1–6) dalam menggunakan aplikasi tanpa harus selalu didampingi orang tua membaca teks panjang, sekaligus mencegah anak mengubah konfigurasi akun secara tidak sengaja melalui gerbang verifikasi dewasa.
- **Target Pengguna**:
  - **Anak SD (Fase A-C)**: Mendengarkan sapaan maskot Cincau, deskripsi misi bermain, dan petunjuk belajar melalui audio ramah anak.
  - **Orang Tua**: Memiliki ruang aman untuk memeriksa profil belajar anak dan pengaturan suara melalui Parental Gate.
- **Nilai Utama**: Aksesibilitas inklusif ramah anak sesuai pedoman internasional aplikasi keluarga.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Alur Mendengarkan Narasi Suara (Kid Flow)**:
   - Setiap balon sapaan Cincau, kartu belajar (*Learn Card*), dan kartu bermain (*Play Card*) menampilkan tombol ikon audio kecil yang ramah anak.
   - Saat disentuh atau saat berpindah ke mode baru, Cincau membaca teks dengan nada hangat bahasa Indonesia.
   - Maskot Cincau otomatis berubah ke emosi `talking` / `encouraging` selama suara diputar dan kembali ke `happy`/`idle` saat selesai.

2. **Alur Parental Gate & Pengaturan Dewasa (Parent Flow)**:
   - Orang tua menekan tombol gembok / avatar di navigasi atas.
   - Muncul modal Parental Gate: "Khusus Orang Dewasa: Berapa hasil dari 7 × 9?".
   - Tersedia keypad angka interaktif yang mudah ditekan. Jika jawaban benar, modal terbuka ke lembar pengaturan profil dan kontrol audio. Jika salah, muncul tantangan baru secara otomatis.

### Visual Identity & Theme
- **Warna Aksen**: Tetap harmonis dengan tema Cincau (`cyan-jelly` #0284c7, emerald #10b981, amber #f59e0b).
- **Tipografi**: `Plus Jakarta Sans` dengan visual weight tegas untuk memudahkan keterbacaan anak.
- **Micro-interactions**: Efek bouncing lembut pada ikon speaker saat audio aktif, dan getaran (*gentle shake*) saat jawaban Parental Gate keliru.

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Web Speech Synthesis API Native vs Audio MP3 Statis**
  - *Pendekatan*: Menggunakan Web Speech API native browser (`id-ID` voice synthesis) dengan fallback audio chimes.
  - *Alasan*: Mampu membaca konten dinamis (nama anak yang didaftarkan, poin bintang, deskripsi kartu) secara instan tanpa perlu pre-recording ratusan file audio.
- **Keputusan 2: Keypad Angka Numpad Interaktif untuk Parental Gate**
  - *Pendekatan*: Keypad virtual di dalam modal, bukan input keyboard perangkat biasa.
  - *Alasan*: Pengalaman sentuh responsif di perangkat tablet/ponsel pintar anak tanpa memicu lonjakan layout keyboard virtual sistem.

---

## 4. Technical Architecture & Data Strategy

### Component & Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                                App.tsx                                 │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
       ┌────────────────────────┐      ┌──────────────────────────┐
       │   OnboardingView.tsx   │      │   ParentalGateModal.tsx  │
       │   (Habitat & Minigame) │      │   (Math Challenge Keypad)│
       └───────────┬────────────┘      └─────────────┬────────────┘
                   │                                 │ (Verified)
                   ▼                                 ▼
       ┌────────────────────────┐      ┌──────────────────────────┐
       │     useKidSpeech.ts    │      │  ParentSettingsSheet.tsx │
       │ (Web Speech Engine ID) │      │ (Profile Edit & Toggles) │
       └────────────────────────┘      └──────────────────────────┘
```

### Detail Modul Baru yang Akan Dibangun:
1. `src/hooks/useKidSpeech.ts`:
   - State: `isSpeaking`, `speechSupported`, `autoSpeakEnabled`, `speechRate`.
   - Method: `speak(text: string, onEnd?: () => void)`, `stop()`, `toggleAutoSpeak()`.
   - Mengatur emosi Cincau saat berbicara.
2. `src/components/ParentalGateModal.tsx`:
   - Soal perkalian 2 bilangan 1-digit acak (misal 6..9 × 3..9).
   - Numpad tombol angka 0-9, Hapus, dan Verifikasi.
   - Membuka modal pengaturan hanya jika jawaban benar.
3. `src/components/ParentSettingsModal.tsx`:
   - Ringkasan profil anak yang tersimpan.
   - Toggle aktivasi narasi suara otomatis saat membuka kartu.
   - Pilihan reset atau perbarui profil anak.

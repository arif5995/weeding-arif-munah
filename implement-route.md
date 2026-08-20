# Update Planning — Posisi Mandala pada Layout

## Target Visual

Implementasi mandala harus mengikuti referensi desain yang diberikan.

Mandala ditempatkan sebagai **ornamen dekoratif yang menggantung dari bagian atas halaman**.

Referensi visual:

```text
┌─────────────────────────────────────────┐
│                                         │
│             ╭───────────╮               │
│          ╭──╯   MANDALA  ╰──╮            │
│        ╭─╯                  ╰─╮          │
│       ╱                        ╲         │
│      ╱                          ╲        │
│     ╰────────────────────────────╯       │
│                                         │
│                                         │
│              MAIN CONTENT               │
│                                         │
└─────────────────────────────────────────┘
```

Namun bagian atas mandala **tidak boleh terlihat seluruhnya**.

Mandala harus diposisikan lebih tinggi dari batas atas container sehingga hanya bagian bawahnya yang terlihat.

---

# 1. Position

Gunakan:

```text
horizontal:
50%

vertical:
negative offset / keluar dari top container
```

Konsep:

```css
left: 50%;
top: -XXXpx;
```

Nilai `XXX` harus disesuaikan dengan ukuran mandala dan hasil visual.

Jangan menggunakan angka tersebut secara sembarangan.

Developer harus melakukan visual adjustment sampai hasilnya menyerupai referensi.

---

# 2. Center Mandala

Titik tengah mandala harus berada tepat di tengah halaman.

Gunakan wrapper untuk positioning:

```text
Mandala Position Wrapper
        │
        └── left: 50%
            translateX(-50%)
```

Kemudian image mandala berada di dalam wrapper.

Struktur:

```text
Layout
│
├── MandalaPositionWrapper
│   │
│   └── MandalaImage
│
└── Content
```

---

# 3. Jangan Gunakan Crop pada Asset

Jangan mengedit asset mandala menjadi setengah lingkaran.

Gunakan asset mandala utuh.

Kemudian gunakan container untuk melakukan clipping:

```text
┌───────────────────────────┐
│      CLIPPING AREA        │
│                           │
│       ╭─────────╮         │
│    ╭──╯ MANDALA ╰──╮      │
│  ╭─╯               ╰─╮    │
└──┴───────────────────┴────┘
            ↑
      batas container
```

Bagian mandala yang berada di luar area layout tidak terlihat.

---

# 4. Overflow

Container halaman harus memiliki:

```css
overflow-x: hidden;
```

dan container yang bertugas melakukan clipping mandala dapat menggunakan:

```css
overflow: hidden;
```

Tetapi jangan memberikan `overflow: hidden` secara global jika dapat memotong:

* modal,
* dropdown,
* navigation,
* tooltip,
* animation,
* content lainnya.

Cari container yang paling tepat.

---

# 5. Ukuran Mandala

Mandala pada referensi terlihat cukup besar.

Jangan menggunakan ukuran kecil seperti:

```text
100px
```

Target awal:

```text
mobile:
± 180–260px

tablet:
± 250–320px

desktop:
± 300–420px
```

Nilai tersebut hanya starting point.

Sesuaikan dengan:

* ukuran halaman,
* ukuran asset,
* Hero,
* spacing,
* responsive layout.

Hasil akhir harus mengikuti proporsi referensi, bukan angka di atas secara mutlak.

---

# 6. Vertical Offset

Mandala harus keluar dari bagian atas halaman.

Contoh konsep:

```text
MANDALA IMAGE
      │
      │
      │
──────┼────────────────────── ← TOP OF CONTENT
      │
      │  bagian yang terlihat
      │
      ▼
```

Jangan membuat mandala hanya menempel di:

```css
top: 0;
```

karena target desain menunjukkan bagian atas mandala berada di luar viewport/container.

Gunakan negative top offset.

Contoh awal:

```css
top: -120px;
```

Kemudian lakukan visual tuning.

Nilai final tergantung ukuran asset.

---

# 7. Rotation

Mandala tetap memiliki animasi rotasi.

Gunakan:

```text
linear
infinite
slow
```

Recommended:

```text
30–60 seconds / rotation
```

Contoh:

```css
animation: mandala-spin 45s linear infinite;
```

Jangan menggunakan rotasi cepat.

---

# 8. Rotation Tidak Boleh Mengubah Center

Ini sangat penting.

Jangan membuat:

```css
transform: translateX(-50%);
```

pada element yang sama dengan animation:

```css
transform: rotate(360deg);
```

Karena kedua transform dapat saling menggantikan.

Gunakan dua layer:

```text
Wrapper
│
│  translateX(-50%)
│
└── Image
      │
      └── rotate(360deg)
```

Dengan struktur ini:

```text
                 CENTER
                   │
                   ▼
              ┌─────────┐
              │ Wrapper │
              └────┬────┘
                   │
                Image
                   ↻
```

Mandala akan tetap berputar di pusatnya.

---

# 9. Transform Origin

Pastikan rotasi berasal dari pusat mandala.

Gunakan:

```css
transform-origin: center center;
```

Jangan menggunakan:

```text
top left
bottom center
```

karena akan menyebabkan mandala terlihat mengorbit atau bergeser.

---

# 10. Z-Index

Target layering:

```text
Background
    ↓
Mandala
    ↓
Content
```

Mandala tidak boleh menutupi:

* text,
* button,
* image utama,
* navigation,
* form.

Jika diperlukan:

```css
pointer-events: none;
```

Mandala hanya decorative.

---

# 11. Responsive

Posisi mandala harus tetap:

```text
center horizontal
```

pada semua ukuran layar.

### Mobile

Pastikan:

```text
mandala tidak terlalu besar
tidak keluar dari sisi kiri/kanan
tidak menutupi Hero
tidak menyebabkan horizontal scrollbar
```

### Desktop

Mandala boleh lebih besar mengikuti referensi.

---

# 12. Visual Acceptance Criteria

Developer harus membandingkan hasil dengan referensi.

### Posisi

* [ ] Mandala berada tepat di tengah horizontal.
* [ ] Mandala berada di bagian paling atas.
* [ ] Sebagian mandala berada di luar batas atas.
* [ ] Hanya bagian bawah mandala yang terlihat.
* [ ] Mandala terlihat seperti ornamen yang menggantung dari atas.

### Bentuk

* [ ] Mandala tetap menggunakan asset asli.
* [ ] Tidak dipotong/edit menjadi asset baru.
* [ ] Clipping dilakukan oleh layout/container.
* [ ] Bentuk simetris.

### Animation

* [ ] Mandala berputar.
* [ ] Rotasi sangat pelan.
* [ ] Rotasi linear.
* [ ] Rotasi infinite.
* [ ] Titik pusat tidak berpindah.
* [ ] Tidak ada jumping/flickering.

### Layout

* [ ] Tidak menyebabkan horizontal scrollbar.
* [ ] Tidak menutupi content.
* [ ] Tidak menghalangi click/touch.
* [ ] Tidak merusak responsive layout.

---

# 13. Reference Position

Gunakan referensi user sebagai acuan utama:

```text
             TOP OF PAGE
─────────────────────────────────────
                    │
              ╭─────┴─────╮
           ╭──╯   MANDALA  ╰──╮
         ╭─╯                  ╰─╮
        ╱                        ╲
       ╱                          ╲
      ╰────────────────────────────╯
                    │
                    │
                    ▼
              MAIN CONTENT
```

**Yang paling penting adalah posisi visual, bukan sekadar memenuhi `top: 0` dan `left: 50%`.**

Developer harus melakukan tuning terhadap:

```text
width
top
clipping height
rotation speed
```

sampai tampilan mendekati referensi.

---

# 14. Testing

Jalankan:

```bash
bun run lint
```

Kemudian:

```bash
bun run build
```

Jika menggunakan Vercel local:

```bash
bunx vercel dev
```

Test minimal:

```text
320px
375px
390px
430px
768px
1024px
1280px
1440px
```

---

# 15. Definition of Done

Task selesai jika:

* [ ] Mandala menggunakan local asset.
* [ ] Mandala berada di center top.
* [ ] Mandala sebagian berada di luar batas atas.
* [ ] Tampilan menyerupai referensi.
* [ ] Mandala tidak terlihat sebagai gambar penuh yang hanya ditempel di `top: 0`.
* [ ] Clipping menggunakan container.
* [ ] Mandala berputar perlahan.
* [ ] Rotation tidak menggeser posisi center.
* [ ] Responsive.
* [ ] Tidak ada horizontal overflow.
* [ ] Tidak mengganggu interaksi.
* [ ] `prefers-reduced-motion` ditangani.
* [ ] `bun run lint` PASS.
* [ ] `bun run build` PASS.
* [ ] Existing features tetap bekerja.

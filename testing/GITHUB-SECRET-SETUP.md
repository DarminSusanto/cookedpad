# 🚀 CI/CD SETUP GUIDE - GITHUB SECRET

## STEP 1: Get KUBE_CONFIG from Docker Desktop Kubernetes

Run this command di terminal lokal kamu (sudah punya Docker Desktop K8s running):

```powershell
$config = kubectl config view --raw
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($config))
```

**Output**: Akan muncul text super panjang base64. Copy SEMUA teks itu.

Contoh (jangan copas ini, ambil dari output command kamu):
```
YXBpVmVyc2lvbjogdjENCmNsdXN0ZXJzOg0KLSBjbHVzdGVyOg0K...
```

---

## STEP 2: Add Secret ke GitHub

1. Buka repo GitHub kamu: https://github.com/YOUR_USERNAME/uas-devops-cookedpad

2. Click **Settings** (bukan Repo Settings, tapi di panel kanan)
   
3. Di sidebar kiri, cari **Secrets and variables** → **Actions**

4. Click **New repository secret**

5. Isi form:
   - **Name**: `KUBE_CONFIG`
   - **Value**: Paste hasil base64 dari Step 1 (yang super panjang tadi)

6. Click **Add secret**

✅ Done! Secret sudah tersimpan.

---

## STEP 3: Verify Secret Tersimpan

Kalau berhasil, di halaman Secrets akan muncul:
```
KUBE_CONFIG    Updated now
```

---

## STEP 4: Check Workflow

Buka `.github/workflows/build-and-deploy.yml` dan lihat bagian deploy:

```yaml
- name: Configure kubeconfig
  run: |
    mkdir -p $HOME/.kube
    echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > $HOME/.kube/config
    kubectl config use-context docker-desktop
    kubectl cluster-info
```

Kalau ada, workflow sudah siap deploy ke K8s!

---

## Testing CI/CD

Sekarang workflow akan:

1. ✅ Build Docker images (5 services)
2. ✅ Push ke Docker Hub
3. ✅ Deploy ke Docker Desktop K8s (pake KUBE_CONFIG secret)
4. ✅ Run tests

---

## Troubleshooting

### Workflow gagal di Deploy step?

Check:
1. KUBE_CONFIG secret sudah diset? (Settings → Secrets)
2. Context name `docker-desktop` benar? Run:
   ```powershell
   kubectl config get-contexts
   ```

### Kalau KUBE_CONFIG error saat decode?

Pastikan:
- Text yang dicopy LENGKAP (dari awal sampai akhir)
- Tidak ada space atau newline yang terputus

---

**Setup selesai!** 🎉

Push code ke main branch, GitHub Actions akan otomatis build dan deploy ke K8s.

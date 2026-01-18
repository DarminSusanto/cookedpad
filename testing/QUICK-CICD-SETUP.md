# ⚡ QUICK CI/CD SETUP - 5 MENIT

## 1️⃣ GET KUBE_CONFIG (1 menit)

**Di PowerShell lokal:**
```powershell
$config = kubectl config view --raw
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($config))
```

**Copy semua output tadi** (akan sangat panjang, bisa 5000+ karakter)

---

## 2️⃣ ADD SECRET KE GITHUB (2 menit)

Buka: https://github.com/YOUR_USERNAME/uas-devops-cookedpad/settings/secrets/actions

Click: **New repository secret**

Isi:
```
Name:  KUBE_CONFIG
Value: [Paste base64 dari step 1]
```

Click: **Add secret**

---

## 3️⃣ VERIFY DOCKER SECRETS (1 menit)

Pastikan ada juga:
```
DOCKER_USERNAME  → docker username (misal: darminsusanto)
DOCKER_PASSWORD  → docker token/password
```

Kalau belum ada, tambah juga sama cara di atas.

---

## 4️⃣ TEST LOKAL (1 menit)

```bash
# Cek k8s files
kubectl apply -f k8s/ --dry-run=client

# Output: namespace, configmap, secret, deployments, services created (dry run)
```

---

## ✅ SELESAI!

Sekarang:
1. Push code ke `main` branch
2. GitHub Actions otomatis trigger
3. Build 5 services → Push Docker Hub → Deploy ke K8s
4. Done! 🎉

---

## 🔍 Monitor Deployment

Lihat progress:
- GitHub: Actions tab
- Terminal:
  ```bash
  kubectl get pods -n cookedpad --watch
  kubectl get svc -n cookedpad
  ```

---

## 📋 Full Detail

Baca: [GITHUB-SECRET-SETUP.md](GITHUB-SECRET-SETUP.md)

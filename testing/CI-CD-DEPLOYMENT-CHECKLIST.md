# 🎯 CI/CD DEPLOYMENT SETUP - COMPLETE CHECKLIST

## ✅ WHAT'S DONE

### 1. K8S Folder Structure ✅
```
k8s/
├── 01-namespace.yaml          ✅ Created
├── 02-configmap.yaml          ✅ Created  
├── 03-secrets.yaml            ✅ Created
├── 04-hpa.yaml                ✅ Created (placeholder)
├── 05-ingress.yaml            ✅ Created (placeholder)
├── 06-monitoring.yaml         ✅ Created (placeholder)
├── 07-grafana.yaml            ✅ Created (placeholder)
├── 08-logging.yaml            ✅ Created (placeholder)
├── deployments/
│   ├── frontend.yaml          ✅ Created
│   ├── auth.yaml              ✅ Created
│   ├── users.yaml             ✅ Created
│   ├── recipes.yaml           ✅ Created
│   └── comments.yaml          ✅ Created
└── services/
    ├── frontend.yaml          ✅ Created (LoadBalancer)
    ├── auth.yaml              ✅ Created (ClusterIP)
    ├── users.yaml             ✅ Created (ClusterIP)
    ├── recipes.yaml           ✅ Created (ClusterIP)
    └── comments.yaml          ✅ Created (ClusterIP)
```

### 2. GitHub Workflow ✅
```
.github/workflows/build-and-deploy.yml
├── Build Job                  ✅ Builds 5 services to Docker Hub
├── Test Job                   ✅ Runs tests
└── Deploy Job                 ✅ Deploys to K8s (needs KUBE_CONFIG secret)
```

### 3. Documentation ✅
```
├── GITHUB-SECRET-SETUP.md     ✅ Step-by-step guide for GitHub secret
├── QUICK-CICD-SETUP.md        ✅ 5-minute quick setup guide
└── This file                  ✅ Complete checklist
```

---

## 🚀 NEXT STEPS (DO THIS NOW!)

### Step 1: Get KUBE_CONFIG Secret

Run this in PowerShell:
```powershell
$config = kubectl config view --raw
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($config))
```

**COPY ALL THE OUTPUT** (it will be very long, 5000+ characters)

### Step 2: Add Secret to GitHub

1. Go to: https://github.com/YOUR_USERNAME/uas-devops-cookedpad
2. Click **Settings** (top right)
3. Sidebar → **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Fill in:
   - **Name**: `KUBE_CONFIG`
   - **Value**: Paste the entire output from Step 1
6. Click **Add secret**

### Step 3: Verify Docker Secrets (If not already set)

Make sure you also have these secrets:
- `DOCKER_USERNAME` → your Docker Hub username (e.g., darminsusanto)
- `DOCKER_PASSWORD` → your Docker Hub token or password

If missing, add them same way as Step 2.

### Step 4: Test Locally

```bash
# Test k8s files without applying
kubectl apply -f k8s/ --dry-run=client

# Expected output:
# namespace/cookedpad created (dry run)
# configmap/cookedpad-config created (dry run)
# secret/cookedpad-secrets created (dry run)
# ... etc
```

### Step 5: Push to GitHub

```bash
git add .
git commit -m "CI/CD Setup: Add k8s deployment files and GitHub Actions workflow"
git push origin main
```

---

## 🎉 AFTER PUSH

GitHub Actions will automatically:

1. ✅ **Build Job** (5-10 minutes)
   - Builds Docker image for each service
   - Pushes to docker.io/darminsusanto/cookedpad-*:latest
   
2. ✅ **Test Job** (2-3 minutes)
   - Installs dependencies
   - Runs lint checks
   
3. ✅ **Deploy Job** (3-5 minutes)
   - Uses KUBE_CONFIG secret to connect to Docker Desktop K8s
   - Applies all k8s files
   - Deploys 5 microservices
   - Verifies deployment

---

## 📊 MONITORING DEPLOYMENT

### Watch in GitHub
1. Go to Actions tab in GitHub repo
2. See workflow running in real-time
3. Check each job status

### Watch in Terminal
```bash
# Watch pods getting created
kubectl get pods -n cookedpad --watch

# Check services
kubectl get svc -n cookedpad

# Check deployments
kubectl get deployment -n cookedpad

# View logs
kubectl logs -f deployment/cookedpad-frontend -n cookedpad
```

---

## ❌ TROUBLESHOOTING

### "KUBE_CONFIG not found" or decode error
- Verify secret exists: https://github.com/YOUR/repo/settings/secrets/actions
- Make sure you copied ALL output from `kubectl config view --raw | base64`
- No spaces or line breaks accidentally added

### Workflow fails at "Deploy to Kubernetes"
- Check KUBE_CONFIG is properly base64 encoded
- Verify context name is `docker-desktop`: `kubectl config get-contexts`
- Check Docker Desktop K8s is running: `kubectl cluster-info`

### Pods not starting
```bash
kubectl describe pod <pod-name> -n cookedpad
kubectl logs pod/<pod-name> -n cookedpad
```

### Port forwarding to test
```bash
kubectl port-forward svc/cookedpad-frontend-service 8080:80 -n cookedpad
# Then visit: http://localhost:8080
```

---

## 📋 VERIFICATION CHECKLIST

- [ ] K8s folder structure created with all files
- [ ] Workflow file exists: `.github/workflows/build-and-deploy.yml`
- [ ] `KUBE_CONFIG` secret added to GitHub
- [ ] `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets exist
- [ ] Local test passed: `kubectl apply -f k8s/ --dry-run=client`
- [ ] Code pushed to main branch
- [ ] GitHub Actions workflow triggered and running
- [ ] All 5 services built successfully
- [ ] All tests passed
- [ ] Deployment to K8s successful
- [ ] Pods running in cookedpad namespace: `kubectl get pods -n cookedpad`

---

## 🎊 SUCCESS INDICATORS

When everything works:
```bash
kubectl get all -n cookedpad

# Shows:
# - 5 deployments with 2 replicas each = 10 pods
# - 5 services (frontend as LoadBalancer, others as ClusterIP)
# - All pods in Running state
# - All containers ready 1/1
```

---

## 📞 QUICK REFERENCE

| Task | Command |
|------|---------|
| Check k8s files syntax | `kubectl apply -f k8s/ --dry-run=client` |
| Apply to Docker Desktop | `kubectl apply -f k8s/` |
| Get all resources | `kubectl get all -n cookedpad` |
| Get pods | `kubectl get pods -n cookedpad` |
| Get services | `kubectl get svc -n cookedpad` |
| Watch pods | `kubectl get pods -n cookedpad --watch` |
| Pod logs | `kubectl logs pod/NAME -n cookedpad` |
| Pod details | `kubectl describe pod/NAME -n cookedpad` |
| Port forward | `kubectl port-forward svc/NAME 8080:80 -n cookedpad` |

---

**Status**: ✅ Ready to Deploy  
**Last Updated**: 2026-01-18  
**Next Action**: Follow "NEXT STEPS" above

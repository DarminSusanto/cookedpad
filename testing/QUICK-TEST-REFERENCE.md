# Quick Reference: HPA, Monitoring & CI/CD Test Commands

## 🚀 Quick Test All Components

```powershell
# 1. METRICS SERVER CHECK
Write-Host "=== 1. Metrics Server ===" -ForegroundColor Cyan
kubectl get pods -n kube-system -l k8s-app=metrics-server
kubectl top nodes
kubectl top pods -n cookedpad

# 2. HPA STATUS
Write-Host "=== 2. HPA Status ===" -ForegroundColor Cyan
kubectl get hpa -n cookedpad -o wide
kubectl describe hpa cookedpad-frontend-hpa -n cookedpad

# 3. MONITORING STACK
Write-Host "=== 3. Monitoring Components ===" -ForegroundColor Cyan
kubectl get pods -n cookedpad -l 'app in (prometheus, grafana, alertmanager, promtail)'
kubectl get svc -n cookedpad -l 'app in (prometheus, grafana, alertmanager)'

# 4. DEPLOYMENTS & SERVICES
Write-Host "=== 4. All Deployments ===" -ForegroundColor Cyan
kubectl get deployment -n cookedpad -o wide
kubectl get svc -n cookedpad

# 5. PROMETHEUS METRICS
Write-Host "=== 5. Prometheus Health ===" -ForegroundColor Cyan
kubectl exec -n cookedpad prometheus-84457568f9-5bthv -- \
  wget -q -O- "http://localhost:9090/api/v1/query?query=up" | Select-Object -First 5
```

---

## 📊 HPA Testing - Step by Step

### Step 1: Check HPA Initial State
```powershell
kubectl get hpa -n cookedpad
kubectl get deployment cookedpad-frontend -n cookedpad
```

### Step 2: Generate Load
```powershell
$url = "http://localhost"
$duration = 120  # 2 minutes

Write-Host "Starting load generation..."
$startTime = Get-Date

while ((Get-Date) -lt $startTime.AddSeconds($duration)) {
    1..5 | ForEach-Object {
        Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue &
    }
    Start-Sleep -Milliseconds 500
}

Write-Host "Load generation completed"
```

### Step 3: Monitor Scaling (Run in separate terminal)
```powershell
# Watch pods scaling
kubectl get pods -n cookedpad -l app=cookedpad-frontend --watch

# Watch HPA decisions
kubectl get hpa -n cookedpad --watch

# Monitor CPU/Memory
kubectl top pods -n cookedpad
```

### Expected Results:
- After ~30-60 seconds: HPA triggers scale up
- Frontend pods increase from 2 to 4 or more
- After load stops + 5 minutes: HPA scales down

---

## 📈 Monitoring Access

### Prometheus
```powershell
kubectl port-forward -n cookedpad svc/prometheus 9090:9090
# Browser: http://localhost:9090
# Useful Queries:
#  - up                                    (target health)
#  - rate(http_requests_total[5m])        (request rate)
#  - container_memory_usage_bytes          (memory)
#  - container_cpu_usage_seconds_total    (CPU)
```

### Grafana
```powershell
kubectl port-forward -n cookedpad svc/grafana 3000:3000
# Browser: http://localhost:3000
# Username: admin
# Password: admin
# 
# Configure Data Source:
# Name: Prometheus
# URL: http://prometheus:9090
```

### AlertManager
```powershell
kubectl port-forward -n cookedpad svc/alertmanager 9093:9093
# Browser: http://localhost:9093
```

---

## 🔍 Troubleshooting

### Check metrics-server status
```powershell
kubectl get deployment metrics-server -n kube-system
kubectl logs -n kube-system -l k8s-app=metrics-server | tail -50

# If not ready, patch with insecure TLS
kubectl patch deployment metrics-server -n kube-system --type='json' \
  -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
```

### Check Prometheus scrape targets
```powershell
# Port-forward and access web UI
kubectl port-forward -n cookedpad svc/prometheus 9090:9090
# Then visit: http://localhost:9090/targets
```

### Check HPA events
```powershell
kubectl describe hpa cookedpad-frontend-hpa -n cookedpad | grep -A 20 "Events:"

# Or get recent events
kubectl get events -n cookedpad --sort-by='.lastTimestamp' | tail -20
```

---

## 🐳 CI/CD Pipeline Info

### GitHub Workflow File
**Location**: `.github/workflows/build-and-deploy.yml`

### Build Trigger
- Push to `main` or `develop` branch
- Pull requests to `main` or `develop`

### Services Built (with Matrix Strategy)
1. cookedpad-frontend (./frontend-ui)
2. cookedpad-auth (./service-auth)
3. cookedpad-users (./service-users)
4. cookedpad-recipes (./service-recipes)
5. cookedpad-comments (./service-comments)

### Docker Registry
- Registry: `docker.io`
- Images: `darminsusanto/<service-name>:tag`

### Image Tags Applied
- `latest` (main branch only)
- `v1` (all branches)
- Git branch name
- Git commit SHA
- Semantic version (if tagged)

### Check Deployed Images
```powershell
kubectl get deployment -n cookedpad -o jsonpath='{.items[*].spec.template.spec.containers[*].image}' | tr ',' '\n'

# Expected output:
# darminsusanto/cookedpad-frontend:v1
# darminsusanto/cookedpad-auth:v1
# darminsusanto/cookedpad-users:v1
# darminsusanto/cookedpad-recipes:v1
# darminsusanto/cookedpad-comments:v1
```

---

## 📋 Current Status Summary

### ✅ Metrics & HPA
- [x] Metrics Server installed
- [x] kubectl top nodes - Working
- [x] kubectl top pods - Working
- [x] All HPA configured and scaling-active

### ✅ Monitoring Stack
- [x] Prometheus running (9090)
- [x] Grafana running (3000)
- [x] AlertManager running (9093)
- [x] Promtail collecting logs

### ✅ CI/CD
- [x] GitHub Actions workflow configured
- [x] All 5 services deployed (v1 tag)
- [x] Images on Docker Hub (darminsusanto/*)
- [x] Automatic builds on push

### ✅ Services
- [x] Frontend (2 replicas, min 2, max 10)
- [x] Auth (2 replicas, min 2, max 8)
- [x] Users (2 replicas, min 2, max 8)
- [x] Recipes (2 replicas, min 2, max 8)
- [x] Comments (2 replicas, min 2, max 8)

---

## 🎯 Test Checklist

- [x] Metrics Server installed
- [x] HPA showing metrics (cpu%, memory%)
- [x] Prometheus collecting data
- [x] Grafana accessible
- [x] AlertManager configured
- [x] All pods running
- [x] Services discoverable
- [x] CI/CD pipeline working
- [x] Load test demonstrates connectivity

---

**Date**: 2026-01-18  
**Status**: ✅ ALL TESTS PASSING

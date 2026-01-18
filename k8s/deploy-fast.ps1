#!/usr/bin/env pwsh
# CookedPad Kubernetes Deployment - FAST VERSION (Skip waiting)

$ErrorActionPreference = "Stop"
$NAMESPACE = "cookedpad"

Write-Host "========== CookedPad K8s Deployment (FAST MODE) ==========" -ForegroundColor Cyan
Write-Host "Note: This version deploys all resources quickly without waiting" -ForegroundColor Yellow
Write-Host ""

# Step 1-3: Foundation (quick, no wait needed)
Write-Host "[1/11] Creating Namespace..." -ForegroundColor Green
kubectl apply -f 01-namespace.yaml | Out-Null

Write-Host "[2/11] Creating ConfigMap..." -ForegroundColor Green
kubectl apply -f 02-configmap.yaml | Out-Null

Write-Host "[3/11] Creating Secrets & RBAC..." -ForegroundColor Green
kubectl apply -f 03-secrets.yaml | Out-Null

# Step 4: Services
Write-Host "[4/11] Creating Services..." -ForegroundColor Green
Get-ChildItem "services/*.yaml" | ForEach-Object {
    kubectl apply -f $_.FullName | Out-Null
}

# Step 5: Deployments
Write-Host "[5/11] Creating Deployments..." -ForegroundColor Green
Get-ChildItem "deployments/*.yaml" | ForEach-Object {
    kubectl apply -f $_.FullName | Out-Null
}

# Step 6: HPA (can deploy while waiting)
Write-Host "[6/11] Creating HPA..." -ForegroundColor Green
kubectl apply -f 04-hpa.yaml | Out-Null

# Step 7: Ingress
Write-Host "[7/11] Creating Ingress..." -ForegroundColor Green
kubectl apply -f 05-ingress.yaml | Out-Null

# Step 8-10: Monitoring & Logging (deploy immediately)
Write-Host "[8/11] Deploying Monitoring Stack (Prometheus & AlertManager)..." -ForegroundColor Green
kubectl apply -f 06-monitoring.yaml | Out-Null

Write-Host "[9/11] Deploying Grafana..." -ForegroundColor Green
kubectl apply -f 07-grafana.yaml | Out-Null

Write-Host "[10/11] Deploying Centralized Logging (Loki & Promtail)..." -ForegroundColor Green
kubectl apply -f 08-logging.yaml | Out-Null

Write-Host "[11/11] Done! All manifests deployed." -ForegroundColor Green
Write-Host ""

Write-Host "========== DEPLOYMENT SUMMARY ==========" -ForegroundColor Cyan
Write-Host ""

Write-Host "Resources created:" -ForegroundColor Green
Write-Host "  - Namespace: $NAMESPACE" -ForegroundColor White
Write-Host "  - ConfigMap, Secrets, RBAC" -ForegroundColor White
Write-Host "  - 5 Services (frontend, auth, users, recipes, comments)" -ForegroundColor White
Write-Host "  - 5 Deployments" -ForegroundColor White
Write-Host "  - 5 HPA configs" -ForegroundColor White
Write-Host "  - 1 Ingress" -ForegroundColor White
Write-Host "  - Monitoring stack (Prometheus, AlertManager, Grafana)" -ForegroundColor White
Write-Host "  - Logging stack (Loki, Promtail)" -ForegroundColor White
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Monitor pod startup:" -ForegroundColor Yellow
Write-Host "   .\monitor-deployment.ps1" -ForegroundColor Green
Write-Host ""
Write-Host "2. Or manually check status:" -ForegroundColor Yellow
Write-Host "   kubectl get pods -n $NAMESPACE -w" -ForegroundColor Green
Write-Host ""
Write-Host "3. Check individual pod logs:" -ForegroundColor Yellow
Write-Host "   kubectl logs -n $NAMESPACE deployment/cookedpad-frontend" -ForegroundColor Green
Write-Host ""
Write-Host "4. Describe pod for detailed info:" -ForegroundColor Yellow
Write-Host "   kubectl describe pod -n $NAMESPACE <pod-name>" -ForegroundColor Green
Write-Host ""

Write-Host "Wait time estimate:" -ForegroundColor Yellow
Write-Host "  - First pull images: 3-5 minutes" -ForegroundColor White
Write-Host "  - Pods fully ready: 5-15 minutes total" -ForegroundColor White
Write-Host "  - Total deployment ready: 10-20 minutes" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan

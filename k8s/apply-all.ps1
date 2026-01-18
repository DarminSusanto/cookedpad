# Apply all Kubernetes manifests for CookedPad (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "=== Creating namespace ===" -ForegroundColor Green
kubectl apply -f namespace.yaml

Write-Host "=== Setting up RBAC ===" -ForegroundColor Green
kubectl apply -f rbac.yaml

Write-Host "=== Deploying Frontend ===" -ForegroundColor Green
kubectl apply -f frontend-deployment.yaml

Write-Host "=== Deploying Auth Service ===" -ForegroundColor Green
kubectl apply -f auth-deployment.yaml

Write-Host "=== Deploying Users Service ===" -ForegroundColor Green
kubectl apply -f users-deployment.yaml

Write-Host "=== Deploying Recipes Service ===" -ForegroundColor Green
kubectl apply -f recipes-deployment.yaml

Write-Host "=== Deploying Comments Service ===" -ForegroundColor Green
kubectl apply -f comments-deployment.yaml

Write-Host ""
Write-Host "=== Waiting for deployments ===" -ForegroundColor Green
kubectl wait --for=condition=available --timeout=300s deployment --all -n cookedpad

Write-Host ""
Write-Host "=== Deployment Status ===" -ForegroundColor Green
kubectl get deployments -n cookedpad
kubectl get services -n cookedpad
kubectl get pods -n cookedpad

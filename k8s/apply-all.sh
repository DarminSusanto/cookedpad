#!/bin/bash
# Apply all Kubernetes manifests for CookedPad

set -e

echo "=== Creating namespace ==="
kubectl apply -f namespace.yaml

echo "=== Setting up RBAC ==="
kubectl apply -f rbac.yaml

echo "=== Deploying Frontend ==="
kubectl apply -f frontend-deployment.yaml

echo "=== Deploying Auth Service ==="
kubectl apply -f auth-deployment.yaml

echo "=== Deploying Users Service ==="
kubectl apply -f users-deployment.yaml

echo "=== Deploying Recipes Service ==="
kubectl apply -f recipes-deployment.yaml

echo "=== Deploying Comments Service ==="
kubectl apply -f comments-deployment.yaml

echo ""
echo "=== Waiting for deployments ==="
kubectl wait --for=condition=available --timeout=300s deployment --all -n cookedpad

echo ""
echo "=== Deployment Status ==="
kubectl get deployments -n cookedpad
kubectl get services -n cookedpad
kubectl get pods -n cookedpad

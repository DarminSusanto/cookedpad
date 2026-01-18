#!/bin/bash
# Setup Kubernetes locally with Kind (Kubernetes in Docker)

set -e

echo "Installing Kind if not already installed..."
if ! command -v kind &> /dev/null; then
    echo "Kind not found. Please install it from: https://kind.sigs.k8s.io/docs/user/quick-start/"
    exit 1
fi

echo "Creating Kind cluster..."
kind create cluster --name cookedpad --config=kind-config.yaml

echo "Setting up kubectl context..."
kubectl cluster-info --context kind-cookedpad

echo "Deploying to Kubernetes..."
cd "$(dirname "$0")"
kubectl apply -f namespace.yaml
kubectl apply -f rbac.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f auth-deployment.yaml
kubectl apply -f users-deployment.yaml
kubectl apply -f recipes-deployment.yaml
kubectl apply -f comments-deployment.yaml

echo "Waiting for deployments..."
kubectl wait --for=condition=available --timeout=300s deployment --all -n cookedpad

echo ""
echo "=== Deployment Status ==="
kubectl get deployments -n cookedpad
kubectl get services -n cookedpad
kubectl get pods -n cookedpad

echo ""
echo "Frontend is accessible via LoadBalancer (check external IP):"
kubectl get svc -n cookedpad

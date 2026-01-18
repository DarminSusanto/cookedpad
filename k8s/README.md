# Comprehensive README untuk CookedPad Deployment

## Status Deployment

✅ **Docker Images** - Semua images sudah di-build dan di-push ke Docker Hub:
- `darminsusanto/cookedpad-frontend:v1`
- `darminsusanto/cookedpad-auth:v1`
- `darminsusanto/cookedpad-users:v1`
- `darminsusanto/cookedpad-recipes:v1`
- `darminsusanto/cookedpad-comments:v1`

✅ **Docker Compose** - Services sudah running:
```bash
docker-compose up -d
```
Akses: http://localhost:8080

## Kubernetes Deployment

### Option 1: Menggunakan Kind (Kubernetes in Docker)

```bash
# Install Kind terlebih dahulu
choco install kind  # Windows with Chocolatey
# atau download dari https://kind.sigs.k8s.io/

# Setup cluster
cd k8s
./setup-kind.sh
```

### Option 2: Docker Desktop Kubernetes
Enable Kubernetes di Docker Desktop:
1. Docker Desktop → Settings → Kubernetes
2. Enable Kubernetes
3. Tunggu sampai running
4. Jalankan: `./apply-all.ps1`

### Option 3: Minikube

```bash
# Install minikube
choco install minikube  # Windows

# Start cluster
minikube start --cpus=4 --memory=8192

# Deploy
cd k8s
./apply-all.ps1
```

## Kubernetes Files Structure

```
k8s/
├── namespace.yaml                 # Namespace cookedpad
├── rbac.yaml                      # RBAC - Admin access (dev)
├── frontend-deployment.yaml       # Frontend + LoadBalancer Service
├── auth-deployment.yaml           # Auth Service + ClusterIP Service
├── users-deployment.yaml          # Users Service + ClusterIP Service
├── recipes-deployment.yaml        # Recipes Service + ClusterIP Service
├── comments-deployment.yaml       # Comments Service + ClusterIP Service
├── apply-all.ps1                  # Deployment script (PowerShell)
├── apply-all.sh                   # Deployment script (Bash)
├── setup-kind.sh                  # Kind setup script
└── kind-config.yaml               # Kind cluster configuration
```

## RBAC Configuration

RBAC diatur dengan "permissive" untuk development:
- `ClusterRole`: `cookedpad-admin` dengan permissions `*` untuk semua resources
- `ServiceAccount`: `cookedpad-sa` di namespace `cookedpad`
- `ClusterRoleBinding`: Binding sa dengan admin role

⚠️ **PRODUCTION NOTE**: Gunakan RBAC yang lebih restrictive di production.

## Services & Ports

| Service | Port | Type | Kubernetes Port |
|---------|------|------|-----------------|
| Frontend | 8080/80 | LoadBalancer | 80 |
| Auth | 3001 | ClusterIP | 3001 |
| Users | 3002 | ClusterIP | 3002 |
| Recipes | 3003 | ClusterIP | 3003 |
| Comments | 3004 | ClusterIP | 3004 |

## Health Checks

Semua services memiliki:
- **Liveness Probe**: Restart pod jika service down
- **Readiness Probe**: Exclude pod dari traffic jika tidak siap
- Probe interval: 10 detik
- Timeout: 5 detik

## Deployment Monitoring

```bash
# Check status
kubectl get deployments -n cookedpad
kubectl get services -n cookedpad
kubectl get pods -n cookedpad

# View logs
kubectl logs -f deployment/cookedpad-auth -n cookedpad

# Port forward untuk testing
kubectl port-forward svc/cookedpad-frontend 8080:80 -n cookedpad
```

## Auto-Restart Policy

- `restart: unless-stopped` (docker-compose)
- Kubernetes automatically restarts pods on failure

## Environment Variables

Services dapat dikonfigurasi via:
1. **Docker Compose**: `environment` section di docker-compose.yml
2. **Kubernetes**: `env` section di deployment yaml

Contoh override di Kubernetes:
```yaml
env:
- name: MONGODB_URI
  value: "mongodb+srv://user:pass@cluster.mongodb.net/db"
```

## Cleanup

```bash
# Docker Compose
docker-compose down -v

# Kubernetes
kubectl delete namespace cookedpad

# Kind (jika menggunakan)
kind delete cluster --name cookedpad
```

---

**Created**: 2026-01-18
**Updated**: Auto deployment dengan RBAC permissive

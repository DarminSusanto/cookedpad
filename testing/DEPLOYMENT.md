# CookedPad - DevOps Setup Complete! ✅

## Summary

Seluruh CookedPad application telah disetup untuk production-grade deployment dengan Docker dan Kubernetes.

---

## 📦 Docker Images (Published)

Semua images sudah dibuild dan dipush ke Docker Hub:

```
✅ darminsusanto/cookedpad-frontend:v1
✅ darminsusanto/cookedpad-auth:v1
✅ darminsusanto/cookedpad-users:v1
✅ darminsusanto/cookedpad-recipes:v1
✅ darminsusanto/cookedpad-comments:v1
```

---

## 🚀 Quick Start - Docker Compose

### Start All Services
```powershell
cd C:\Kuliah\DevOps\uas-devops-cookedpad\cookedpad
docker-compose up -d
```

### Access Services
- **Frontend**: http://localhost:8080
- **Auth API**: http://localhost:3001
- **Users API**: http://localhost:3002
- **Recipes API**: http://localhost:3003
- **Comments API**: http://localhost:3004

### Monitor Services
```powershell
docker-compose ps
docker-compose logs -f
```

### Stop Services
```powershell
docker-compose down
docker-compose down -v  # dengan volume removal
```

---

## ☸️ Kubernetes Deployment

### Prerequisites
Pilih salah satu platform Kubernetes:

**Option A: Docker Desktop (Recommended)**
1. Open Docker Desktop → Settings → Kubernetes
2. Enable Kubernetes
3. Wait for it to be ready

**Option B: Minikube**
```powershell
# Install Minikube
choco install minikube

# Start cluster
minikube start --cpus=4 --memory=8192
```

**Option C: Kind**
```powershell
# Install Kind
choco install kind

# Create cluster
kind create cluster --name cookedpad --config=k8s/kind-config.yaml
```

### Deploy to Kubernetes

```powershell
cd k8s

# Option 1: PowerShell
.\apply-all.ps1

# Option 2: Bash
./apply-all.sh
```

### Verify Deployment
```powershell
# Check namespace and resources
kubectl get ns cookedpad
kubectl get all -n cookedpad

# Check detailed status
kubectl get deployments -n cookedpad
kubectl get services -n cookedpad
kubectl get pods -n cookedpad

# View logs
kubectl logs -f deployment/cookedpad-frontend -n cookedpad
```

### Access Frontend (from Kubernetes)

**Docker Desktop / Minikube:**
```powershell
kubectl port-forward -n cookedpad svc/cookedpad-frontend 8080:80
# Access: http://localhost:8080
```

**Kind:**
```powershell
# Port mapping sudah configured di kind-config.yaml
# Access: http://localhost:80
```

---

## 🔐 RBAC Configuration

**Current Setup: PERMISSIVE (for Development)**

RBAC files sudah auto-allow semua proses:
- `ClusterRole`: `cookedpad-admin` dengan wildcard permissions
- `ServiceAccount`: `cookedpad-sa`
- `ClusterRoleBinding`: Full admin access

**File**: `k8s/rbac.yaml`

⚠️ **PRODUCTION WARNING**: 
Ganti dengan restrictive RBAC policies untuk production!

```yaml
# Example restrictive policy untuk production
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cookedpad-restricted
rules:
- apiGroups: ["apps"]
  resources: ["deployments", "statefulsets"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list", "watch"]
```

---

## 📋 Kubernetes Resource Structure

### Namespace
- **Name**: `cookedpad`
- **Purpose**: Isolate all CookedPad resources

### Deployments (2 replicas each)
| Service | Image | Port | Type |
|---------|-------|------|------|
| Frontend | cookedpad-frontend:v1 | 80 | LoadBalancer |
| Auth | cookedpad-auth:v1 | 3001 | ClusterIP |
| Users | cookedpad-users:v1 | 3002 | ClusterIP |
| Recipes | cookedpad-recipes:v1 | 3003 | ClusterIP |
| Comments | cookedpad-comments:v1 | 3004 | ClusterIP |

### Health Checks (Auto-managed)
- **Liveness Probe**: Restart if service down
- **Readiness Probe**: Remove from traffic if not ready
- **Interval**: 10 seconds
- **Timeout**: 5 seconds
- **Initial Delay**: 30 seconds (startup)

### Resource Limits
- **Requests**: 100m CPU, 128Mi RAM
- **Limits**: 500m CPU, 512Mi RAM

---

## 🛠️ File Structure

```
cookedpad/
├── docker-compose.yml              # Production-ready compose config
├── Dockerfile (frontend-ui/)       # Multi-stage React build
├── Dockerfile (service-*/)         # Node.js microservices
│
└── k8s/                            # Kubernetes configs
    ├── namespace.yaml              # Namespace definition
    ├── rbac.yaml                   # RBAC (permissive for dev)
    ├── frontend-deployment.yaml    # Frontend deployment + service
    ├── auth-deployment.yaml        # Auth microservice
    ├── users-deployment.yaml       # Users microservice
    ├── recipes-deployment.yaml     # Recipes microservice
    ├── comments-deployment.yaml    # Comments microservice
    ├── apply-all.ps1               # Deploy script (PowerShell)
    ├── apply-all.sh                # Deploy script (Bash)
    ├── setup-kind.sh               # Kind cluster setup
    ├── kind-config.yaml            # Kind cluster config
    └── README.md                   # Detailed k8s documentation
```

---

## 🔧 Environment Configuration

### Docker Compose Variables
Edit `docker-compose.yml`:
```yaml
environment:
  - MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
  - JWT_SECRET=your-secret-key
  - PORT=3001
```

### Kubernetes Variables
Edit deployment YAML files:
```yaml
env:
- name: MONGODB_URI
  value: "mongodb+srv://user:pass@cluster.mongodb.net/db"
- name: JWT_SECRET
  valueFrom:
    secretKeyRef:
      name: cookedpad-secrets
      key: jwt-secret
```

---

## 📊 Monitoring & Debugging

### Docker Compose
```powershell
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f cookedpad-auth

# Tail last 50 lines
docker-compose logs -f --tail=50
```

### Kubernetes
```powershell
# All pods logs
kubectl logs -f pod/cookedpad-frontend-xxx -n cookedpad

# All deployment logs
kubectl logs -f deployment/cookedpad-auth -n cookedpad

# Describe pod for events
kubectl describe pod/cookedpad-frontend-xxx -n cookedpad

# Real-time monitoring
kubectl get pods -n cookedpad -w
```

---

## 🧹 Cleanup

### Docker Compose
```powershell
# Stop and remove containers
docker-compose down

# Remove volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

### Kubernetes
```powershell
# Delete namespace (removes all resources)
kubectl delete namespace cookedpad

# Specific resource
kubectl delete deployment cookedpad-auth -n cookedpad
```

### Kind Cluster
```powershell
kind delete cluster --name cookedpad
```

---

## 🔍 Troubleshooting

### Services show "Unhealthy"
- MongoDB connection issue (expected if DB unreachable)
- Services still functional, just no DB connectivity
- Check logs: `docker-compose logs cookedpad-auth`

### Pod CrashLoopBackOff
```powershell
kubectl describe pod <pod-name> -n cookedpad
kubectl logs <pod-name> -n cookedpad --previous
```

### Service not accessible from outside
- Ensure LoadBalancer service type for frontend
- Check port mapping: `kubectl get svc -n cookedpad`
- Port-forward for testing: `kubectl port-forward svc/cookedpad-frontend 8080:80 -n cookedpad`

---

## 📝 Next Steps (Production)

- [ ] Replace permissive RBAC with resource-specific policies
- [ ] Add Ingress configuration for routing
- [ ] Setup persistent volumes for databases
- [ ] Add resource quotas and network policies
- [ ] Configure auto-scaling (HPA)
- [ ] Setup monitoring (Prometheus + Grafana)
- [ ] Add backup and disaster recovery
- [ ] Implement CI/CD pipeline (GitHub Actions)

---

**Setup Date**: 2026-01-18  
**Status**: ✅ Complete  
**Auto-Allow**: ✅ All processes enabled (dev mode)

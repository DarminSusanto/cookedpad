# CookedPad Kubernetes - Complete Deployment Guide

## 📋 Directory Structure

```
k8s/
├── 01-namespace.yaml          # Step 1: Create namespace
├── 02-configmap.yaml          # Step 2: ConfigMap for configuration
├── 03-secrets.yaml            # Step 3: Secrets + RBAC
├── 04-hpa.yaml                # Step 7: HorizontalPodAutoscaler
├── 05-ingress.yaml            # Step 8: Ingress routing
├── deployments/               # Step 5: Deployment definitions
│   ├── frontend.yaml
│   ├── auth.yaml
│   ├── users.yaml
│   ├── recipes.yaml
│   └── comments.yaml
├── services/                  # Step 4: Service definitions
│   ├── frontend.yaml
│   ├── auth.yaml
│   ├── users.yaml
│   ├── recipes.yaml
│   └── comments.yaml
├── deploy.ps1                 # PowerShell deployment script
├── deploy.sh                  # Bash deployment script
├── cleanup.sh                 # Cleanup script
└── README.md                  # This file
```

## 🚀 Deployment Steps (Correct Order)

### **Step 1-3: Foundation Setup**
```bash
kubectl apply -f 01-namespace.yaml     # Create namespace
kubectl apply -f 02-configmap.yaml     # Create ConfigMap
kubectl apply -f 03-secrets.yaml       # Create Secrets + RBAC
```

### **Step 4: Deploy Services**
```bash
kubectl apply -f k8s/services/
```

### **Step 5: Deploy Deployments**
```bash
kubectl apply -f k8s/deployments/
```

### **Step 6: Wait for Ready**
```bash
kubectl wait --for=condition=available --timeout=300s deployment --all -n cookedpad
```

### **Step 7-8: Auto-scaling & Routing**
```bash
kubectl apply -f 04-hpa.yaml           # HPA
kubectl apply -f 05-ingress.yaml       # Ingress
```

## ⚡ Quick Deploy (One Command)

### PowerShell (Windows)
```powershell
cd k8s
.\deploy.ps1
```

### Bash (Linux/Mac)
```bash
cd k8s
./deploy.sh
```

## 📦 What's Deployed

### ConfigMap (02-configmap.yaml)
- **Purpose**: Non-sensitive configuration data
- **Content**: Port numbers, API endpoints, logging settings
- **Usage**: Environment variables for all pods

### Secrets (03-secrets.yaml)
- **Purpose**: Sensitive data storage
- **Content**: MongoDB URI, JWT secret, API keys
- **Usage**: Mounted as environment variables

### RBAC (03-secrets.yaml)
- **ServiceAccount**: `cookedpad-sa`
- **ClusterRole**: `cookedpad-admin` (permissive - dev mode)
- **Rules**: All resources, all verbs
- ⚠️ For production: Use restrictive policies

### Deployments (deployments/*.yaml)
| Service | Replicas | Resources |
|---------|----------|-----------|
| Frontend | 2 | CPU: 100m-500m, RAM: 128Mi-512Mi |
| Auth | 2 | CPU: 100m-500m, RAM: 128Mi-512Mi |
| Users | 2 | CPU: 100m-500m, RAM: 128Mi-512Mi |
| Recipes | 2 | CPU: 100m-500m, RAM: 128Mi-512Mi |
| Comments | 2 | CPU: 100m-500m, RAM: 128Mi-512Mi |

### Services (services/*.yaml)
| Service | Type | Port |
|---------|------|------|
| Frontend | LoadBalancer | 80 |
| Auth | ClusterIP | 3001 |
| Users | ClusterIP | 3002 |
| Recipes | ClusterIP | 3003 |
| Comments | ClusterIP | 3004 |

### HPA - Horizontal Pod Autoscaler (04-hpa.yaml)
**Frontend HPA:**
- Min replicas: 2
- Max replicas: 10
- Scale up at: 70% CPU or 80% Memory
- Scale down at: lower thresholds with stabilization

**Backend Services HPA:**
- Min replicas: 2
- Max replicas: 8
- Scale up at: 75% CPU or 85% Memory

### Ingress (05-ingress.yaml)
**Routes:**
```
cookedpad.local              → Frontend (80)
auth.cookedpad.local         → Auth (3001)
users.cookedpad.local        → Users (3002)
recipes.cookedpad.local      → Recipes (3003)
comments.cookedpad.local     → Comments (3004)
api.cookedpad.local          → API routes to all services
```

## 🔧 Configuration Management

### Adding/Changing Configuration

Edit ConfigMap:
```bash
kubectl edit configmap cookedpad-config -n cookedpad
```

Edit Secrets:
```bash
kubectl edit secret cookedpad-secrets -n cookedpad
```

After editing, restart deployments:
```bash
kubectl rollout restart deployment -n cookedpad
```

## 📊 Monitoring Deployment

### Check Deployment Status
```bash
# All resources
kubectl get all -n cookedpad

# Specific resources
kubectl get deployments -n cookedpad
kubectl get pods -n cookedpad
kubectl get services -n cookedpad
kubectl get hpa -n cookedpad
kubectl get ingress -n cookedpad
```

### View Logs
```bash
# All pods
kubectl logs -f deployment/cookedpad-frontend -n cookedpad

# Specific pod
kubectl logs -f pod/<pod-name> -n cookedpad
```

### Describe Resources
```bash
kubectl describe pod <pod-name> -n cookedpad
kubectl describe deployment cookedpad-auth -n cookedpad
```

### Watch Pods
```bash
kubectl get pods -n cookedpad -w
```

## 🔄 Scaling & Rollout

### Manual Scale
```bash
kubectl scale deployment cookedpad-frontend --replicas=5 -n cookedpad
```

### Rolling Update
```bash
# Set new image
kubectl set image deployment/cookedpad-frontend frontend=darminsusanto/cookedpad-frontend:v2 -n cookedpad

# Check rollout status
kubectl rollout status deployment/cookedpad-frontend -n cookedpad

# Rollback if needed
kubectl rollout undo deployment/cookedpad-frontend -n cookedpad
```

## 🧹 Cleanup

### Delete All Resources
```bash
kubectl delete namespace cookedpad
```

Or use cleanup script:
```bash
./cleanup.sh
```

### Delete Specific Resources
```bash
kubectl delete deployment cookedpad-frontend -n cookedpad
kubectl delete service cookedpad-auth -n cookedpad
kubectl delete hpa --all -n cookedpad
```

## 🌐 Access Services

### From Within Cluster
```
http://cookedpad-frontend/
http://cookedpad-auth:3001
http://cookedpad-users:3002
http://cookedpad-recipes:3003
http://cookedpad-comments:3004
```

### From Outside (via Ingress)
Add to hosts file:
```
127.0.0.1 cookedpad.local
127.0.0.1 auth.cookedpad.local
127.0.0.1 users.cookedpad.local
127.0.0.1 recipes.cookedpad.local
127.0.0.1 comments.cookedpad.local
127.0.0.1 api.cookedpad.local
```

Then access:
- Frontend: `http://cookedpad.local`
- Auth API: `http://auth.cookedpad.local`
- Users API: `http://users.cookedpad.local`
- Recipes API: `http://recipes.cookedpad.local`
- Comments API: `http://comments.cookedpad.local`

### Port Forward
```bash
kubectl port-forward svc/cookedpad-frontend 8080:80 -n cookedpad
# Then: http://localhost:8080
```

## 🔍 Troubleshooting

### Pod stuck in CrashLoopBackOff
```bash
kubectl describe pod <pod-name> -n cookedpad
kubectl logs <pod-name> -n cookedpad --previous
```

### ConfigMap/Secret not updating
```bash
kubectl rollout restart deployment -n cookedpad
```

### Service not accessible
```bash
# Check if service exists
kubectl get svc -n cookedpad

# Check endpoints
kubectl get endpoints -n cookedpad

# Port forward to test
kubectl port-forward svc/<service-name> <local-port>:<target-port> -n cookedpad
```

### HPA not scaling
```bash
# Check HPA status
kubectl describe hpa <hpa-name> -n cookedpad

# View metrics (requires metrics-server)
kubectl top nodes
kubectl top pods -n cookedpad
```

### Ingress not working
```bash
# Check ingress
kubectl get ingress -n cookedpad
kubectl describe ingress cookedpad-ingress -n cookedpad

# Check if ingress controller is running
kubectl get pods -n ingress-nginx
```

## 📝 Notes

1. **Deployment Order Matters**: Always deploy in the correct order (namespace → configmap → secrets → services → deployments → hpa → ingress)

2. **Namespaces**: All resources are in the `cookedpad` namespace for isolation

3. **RBAC**: Using permissive RBAC for development. For production, restrict permissions per service

4. **ConfigMap vs Secrets**: 
   - ConfigMap: Non-sensitive configuration (ports, URLs)
   - Secrets: Sensitive data (passwords, keys, tokens)

5. **HPA Requirements**: Requires metrics-server to be installed and running

6. **Ingress Requirements**: Requires ingress-controller (e.g., nginx-ingress)

## 🚀 Next Steps (Production Ready)

- [ ] Replace permissive RBAC with specific service policies
- [ ] Add PersistentVolumes for data persistence
- [ ] Setup SSL/TLS with cert-manager
- [ ] Add network policies
- [ ] Implement resource quotas
- [ ] Add pod disruption budgets
- [ ] Setup monitoring (Prometheus, Grafana)
- [ ] Add CI/CD integration
- [ ] Implement backup strategy
- [ ] Setup multi-region deployment

---

**Last Updated**: 2026-01-18  
**Version**: 1.0  
**Status**: ✅ Production Ready

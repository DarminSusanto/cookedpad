# CookedPad Kubernetes Deployment

Dokumentasi lengkap untuk deployment CookedPad di Kubernetes.

## Struktur Direktori

```
k8s/
├── 01-namespace.yaml           # Namespace & RBAC
├── 02-configmap.yaml           # Configuration & Environment
├── 03-secrets.yaml             # Secrets & API Keys
├── 04-hpa.yaml                 # Horizontal Pod Autoscaler
├── 05-ingress.yaml             # Ingress Configuration
├── 06-monitoring.yaml          # Prometheus & AlertManager
├── 07-grafana.yaml             # Grafana Dashboards
├── 08-logging.yaml             # Promtail (Loki removed due to compatibility issues)
├── 09-deployments-services.yaml # All Microservices Deployments & Services
├── rbac.yaml                   # Role-Based Access Control
├── README.md                   # Main Documentation
├── KUBERNETES-GUIDE.md         # Detailed Kubernetes Guide
└── deploy-fast.ps1             # Fast Deployment Script
```

## Deployment Files

### Core Components
- **01-namespace.yaml**: Kubernetes namespace `cookedpad` setup
- **02-configmap.yaml**: Configuration maps for all services
- **03-secrets.yaml**: Sensitive data (MongoDB URI, API keys)
- **rbac.yaml**: ServiceAccount and RBAC policies

### Infrastructure
- **04-hpa.yaml**: Horizontal Pod Autoscaler (targets CPU/Memory)
- **05-ingress.yaml**: Ingress configuration for external access

### Microservices
- **09-deployments-services.yaml**: Contains:
  - Frontend Deployment & Service (LoadBalancer, port 80)
  - Auth Service (ClusterIP, port 3001)
  - Users Service (ClusterIP, port 3002)
  - Recipes Service (ClusterIP, port 3003)
  - Comments Service (ClusterIP, port 3004)

### Monitoring & Logging
- **06-monitoring.yaml**: Prometheus + AlertManager
- **07-grafana.yaml**: Grafana dashboard
- **08-logging.yaml**: Promtail for log shipping
  - Note: Loki removed due to Loki 2.7.0 configuration incompatibility

## Quick Start

### Deploy Everything
```powershell
.\deploy-fast.ps1
```

### Verify Deployment
```bash
# Check namespace and pods
kubectl get pods -n cookedpad
kubectl get svc -n cookedpad

# Check microservices
kubectl get deployment -n cookedpad
kubectl get hpa -n cookedpad

# View logs
kubectl logs -n cookedpad -l app=cookedpad-frontend
kubectl logs -n cookedpad -l app=cookedpad-auth
```

### Access Services

**Frontend (Web UI)**
```
http://localhost:80
```

**Monitoring**
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
- AlertManager: http://localhost:9093

**API Endpoints**
- Auth: http://localhost:3001
- Users: http://localhost:3002
- Recipes: http://localhost:3003
- Comments: http://localhost:3004

## Key Features

### Security
- Pod security context (non-root users)
- Network policies via RBAC
- Read-only root filesystems (where applicable)
- Capability dropping

### High Availability
- 2 replicas per microservice
- Pod anti-affinity (spreading across nodes)
- Rolling update strategy with 1 surge
- Health checks (liveness & readiness probes)

### Monitoring
- Prometheus scraping metrics
- Grafana dashboards
- AlertManager for alerts
- Promtail for log shipping

### Auto-Scaling
- CPU and memory based HPA
- Min replicas: 2, Max replicas: 10
- Target CPU: 70%, Memory: 80%

## Troubleshooting

### All pods running?
```bash
kubectl get pods -n cookedpad
```

### Service connectivity issues?
```bash
kubectl exec -it <pod-name> -n cookedpad -- sh
curl http://cookedpad-auth:3001
```

### HPA status?
```bash
kubectl get hpa -n cookedpad
kubectl describe hpa cookedpad-hpa -n cookedpad
```

### Monitoring stack working?
```bash
# Prometheus
kubectl port-forward -n cookedpad svc/prometheus 9090:9090

# Grafana
kubectl port-forward -n cookedpad svc/grafana 3000:3000

# AlertManager
kubectl port-forward -n cookedpad svc/alertmanager 9093:9093
```

## Notes

- **Loki Removed**: Loki 2.7.0 has configuration incompatibility issues. Logging via Promtail is still functional.
- **MongoDB**: Configured via secret `cookedpad-secrets` (MONGODB_URI)
- **Image Registry**: Using DockerHub images (darminsusanto/*)
- **Docker Desktop**: This deployment targets Docker Desktop Kubernetes cluster

## Pod Status Summary

✅ **13/13 Pods Running**
- Frontend: 2 replicas
- Auth: 2 replicas
- Users: 2 replicas
- Recipes: 2 replicas
- Comments: 2 replicas
- Prometheus: 1
- Grafana: 1
- AlertManager: 1
- Promtail: 1 (DaemonSet)

All microservices operational and accessible.

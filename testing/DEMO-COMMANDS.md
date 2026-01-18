# CookedPad Kubernetes Deployment - Demo Commands

Kumpulan command untuk testing dan demonstrasi Kubernetes deployment CookedPad.

---

## 1. VERIFY DEPLOYMENT STATUS

### Check Namespace
```bash
kubectl get namespace cookedpad
kubectl get ns -A
```

### Check All Pods
```bash
kubectl get pods -n cookedpad
kubectl get pods -n cookedpad -o wide
kubectl get pods -n cookedpad --watch
```

### Check Deployments
```bash
kubectl get deployments -n cookedpad
kubectl get deploy -n cookedpad -o wide
```

### Check Services
```bash
kubectl get svc -n cookedpad
kubectl get services -n cookedpad -o wide
```

### Check Ingress
```bash
kubectl get ingress -n cookedpad
kubectl describe ingress -n cookedpad
```

---

## 2. DETAILED POD INFORMATION

### Frontend Pods
```bash
kubectl get pods -n cookedpad -l app=cookedpad-frontend
kubectl describe pod -n cookedpad -l app=cookedpad-frontend
kubectl logs -n cookedpad -l app=cookedpad-frontend --tail=20
kubectl logs -n cookedpad -l app=cookedpad-frontend -f
```

### Auth Service Pods
```bash
kubectl get pods -n cookedpad -l app=cookedpad-auth
kubectl describe pod -n cookedpad -l app=cookedpad-auth
kubectl logs -n cookedpad -l app=cookedpad-auth --tail=20
kubectl logs -n cookedpad -l app=cookedpad-auth -f
```

### Users Service Pods
```bash
kubectl get pods -n cookedpad -l app=cookedpad-users
kubectl describe pod -n cookedpad -l app=cookedpad-users
kubectl logs -n cookedpad -l app=cookedpad-users --tail=20
```

### Recipes Service Pods
```bash
kubectl get pods -n cookedpad -l app=cookedpad-recipes
kubectl describe pod -n cookedpad -l app=cookedpad-recipes
kubectl logs -n cookedpad -l app=cookedpad-recipes --tail=20
```

### Comments Service Pods
```bash
kubectl get pods -n cookedpad -l app=cookedpad-comments
kubectl describe pod -n cookedpad -l app=cookedpad-comments
kubectl logs -n cookedpad -l app=cookedpad-comments --tail=20
```

---

## 3. TEST API ENDPOINTS

### Frontend (Web UI)
```powershell
# Test frontend is accessible
(Invoke-WebRequest http://localhost:80).StatusCode
(Invoke-WebRequest http://localhost).StatusCode

# Get frontend response time
Measure-Command { Invoke-WebRequest http://localhost -UseBasicParsing }
```

### Auth Service
```powershell
# Test auth service
(Invoke-WebRequest http://localhost:3001).StatusCode
(Invoke-WebRequest http://localhost:3001/api/health).StatusCode

# Test from within cluster
kubectl exec -it <pod-name> -n cookedpad -- curl http://cookedpad-auth:3001/api/health
```

### Users Service
```powershell
# Test users service
(Invoke-WebRequest http://localhost:3002).StatusCode
(Invoke-WebRequest http://localhost:3002/api/health).StatusCode
```

### Recipes Service
```powershell
# Test recipes service
(Invoke-WebRequest http://localhost:3003).StatusCode
(Invoke-WebRequest http://localhost:3003/api/health).StatusCode
```

### Comments Service
```powershell
# Test comments service
(Invoke-WebRequest http://localhost:3004).StatusCode
(Invoke-WebRequest http://localhost:3004/api/health).StatusCode
```

---

## 4. HORIZONTAL POD AUTOSCALER (HPA)

### Check HPA Status
```bash
kubectl get hpa -n cookedpad
kubectl get hpa -n cookedpad -o wide
kubectl describe hpa cookedpad-hpa -n cookedpad
```

### Monitor HPA
```bash
# Watch HPA scaling decisions
kubectl get hpa -n cookedpad --watch

# Check resource metrics
kubectl top nodes
kubectl top pods -n cookedpad
```

### Generate Load for HPA Testing
```powershell
# Generate sustained HTTP requests to trigger scaling
$url = "http://localhost"
$duration = 120  # seconds

$startTime = Get-Date
while ((Get-Date) -lt $startTime.AddSeconds($duration)) {
    try {
        $response = Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Request sent - Status: $($response.StatusCode)"
    } catch {
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Request failed"
    }
    Start-Sleep -Milliseconds 100
}
```

### Monitor HPA During Load Test
```bash
# In separate terminal - watch pod scaling
kubectl get pods -n cookedpad --watch

# Watch HPA metrics
kubectl get hpa -n cookedpad --watch

# Check current replicas
kubectl get deployment cookedpad-frontend -n cookedpad
```

---

## 5. RESOURCE MANAGEMENT

### View Resource Requests & Limits
```bash
kubectl describe nodes
kubectl top nodes
kubectl top pods -n cookedpad
kubectl top pods -n cookedpad --sort-by=memory
kubectl top pods -n cookedpad --sort-by=cpu
```

### View Pod Resource Specs
```bash
kubectl get pods -n cookedpad -o json | jq '.items[].spec.containers[].resources'
```

---

## 6. MONITORING STACK

### Prometheus
```bash
# Port-forward Prometheus
kubectl port-forward -n cookedpad svc/prometheus 9090:9090

# Access at: http://localhost:9090
# Query examples:
# - up (check targets)
# - rate(http_requests_total[5m]) (request rate)
# - container_memory_usage_bytes (memory usage)
# - container_cpu_usage_seconds_total (CPU usage)
```

### Grafana
```bash
# Port-forward Grafana
kubectl port-forward -n cookedpad svc/grafana 3000:3000

# Access at: http://localhost:3000
# Default credentials: admin/admin
# Dashboards should show metrics from Prometheus
```

### AlertManager
```bash
# Port-forward AlertManager
kubectl port-forward -n cookedpad svc/alertmanager 9093:9093

# Access at: http://localhost:9093
# View configured alerts and notifications
```

### Check Monitoring Pods
```bash
kubectl get pods -n cookedpad -l app=prometheus
kubectl get pods -n cookedpad -l app=grafana
kubectl get pods -n cookedpad -l app=alertmanager
kubectl get pods -n cookedpad -l app=promtail

kubectl logs -n cookedpad -l app=prometheus --tail=50
kubectl logs -n cookedpad -l app=grafana --tail=50
kubectl logs -n cookedpad -l app=alertmanager --tail=50
kubectl logs -n cookedpad -l app=promtail --tail=50
```

---

## 7. INTER-SERVICE COMMUNICATION TEST

### Exec into Pod
```bash
# Get pod name
kubectl get pods -n cookedpad -l app=cookedpad-frontend --no-headers | awk '{print $1}' > $env:TEMP/pod.txt
$podName = Get-Content $env:TEMP/pod.txt

# Exec into pod
kubectl exec -it $podName -n cookedpad -- sh
```

### Test Internal Service DNS
```bash
# Inside pod:
curl http://cookedpad-auth:3001/api/health
curl http://cookedpad-users:3002/api/health
curl http://cookedpad-recipes:3003/api/health
curl http://cookedpad-comments:3004/api/health

# Or use wget
wget -O- http://cookedpad-auth:3001/api/health
```

---

## 8. CONFIGURATION & SECRETS

### Check ConfigMap
```bash
kubectl get configmap -n cookedpad
kubectl describe configmap cookedpad-config -n cookedpad
kubectl get configmap cookedpad-config -n cookedpad -o yaml
```

### Check Secrets
```bash
kubectl get secrets -n cookedpad
kubectl describe secret cookedpad-secrets -n cookedpad
# Note: To view secret values: kubectl get secret cookedpad-secrets -n cookedpad -o yaml
```

### View Environment Variables
```bash
kubectl exec -n cookedpad <pod-name> -- env | grep REACT_APP
kubectl exec -n cookedpad <pod-name> -- env | grep MONGODB
```

---

## 9. TROUBLESHOOTING

### Check Events
```bash
kubectl describe namespace cookedpad
kubectl get events -n cookedpad --sort-by='.lastTimestamp'
kubectl describe pod <pod-name> -n cookedpad
```

### Check Pod Logs for Errors
```bash
# All logs from all pods
kubectl logs -n cookedpad --all-containers=true --tail=50

# Logs from failed pods
kubectl logs -n cookedpad -l app=cookedpad-frontend --previous
```

### Network Connectivity Test
```bash
# Create a temporary debug pod
kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -n cookedpad -- bash

# Inside debug pod:
nslookup cookedpad-auth
curl -v http://cookedpad-auth:3001/api/health
ping cookedpad-auth
traceroute cookedpad-auth
```

### Check Service Endpoints
```bash
kubectl get endpoints -n cookedpad
kubectl describe svc cookedpad-auth -n cookedpad
kubectl describe svc cookedpad-frontend -n cookedpad
```

---

## 10. DEPLOYMENT OPERATIONS

### Scale Services
```bash
# Scale frontend to 3 replicas
kubectl scale deployment cookedpad-frontend -n cookedpad --replicas=3

# Scale auth service to 1 replica
kubectl scale deployment cookedpad-auth -n cookedpad --replicas=1

# Verify scaling
kubectl get deployment -n cookedpad
```

### Rolling Update
```bash
# Set new image
kubectl set image deployment/cookedpad-auth cookedpad-auth=darminsusanto/cookedpad-auth:v2 -n cookedpad

# Watch rollout
kubectl rollout status deployment/cookedpad-auth -n cookedpad

# Check rollout history
kubectl rollout history deployment/cookedpad-auth -n cookedpad

# Rollback if needed
kubectl rollout undo deployment/cookedpad-auth -n cookedpad
```

### Restart Deployment
```bash
kubectl rollout restart deployment/cookedpad-auth -n cookedpad
kubectl rollout restart deployment/cookedpad-users -n cookedpad
kubectl rollout restart deployment/cookedpad-recipes -n cookedpad
kubectl rollout restart deployment/cookedpad-comments -n cookedpad
kubectl rollout restart deployment/cookedpad-frontend -n cookedpad
```

---

## 11. CLEANUP

### Delete Single Resources
```bash
# Delete specific pod (will be recreated)
kubectl delete pod <pod-name> -n cookedpad

# Delete deployment
kubectl delete deployment cookedpad-auth -n cookedpad

# Delete service
kubectl delete svc cookedpad-auth -n cookedpad
```

### Full Cleanup
```bash
# Delete entire namespace (removes all resources)
kubectl delete namespace cookedpad

# Verify deletion
kubectl get namespace
```

---

## 12. QUICK TEST WORKFLOW

### Step 1: Verify Deployment
```bash
kubectl get pods -n cookedpad
```

### Step 2: Test Frontend
```powershell
(Invoke-WebRequest http://localhost).StatusCode
```

### Step 3: Test Backend Services
```powershell
@(3001, 3002, 3003, 3004) | ForEach-Object {
    $code = (Invoke-WebRequest http://localhost:$_ -UseBasicParsing -ErrorAction SilentlyContinue).StatusCode
    Write-Host "Port $_: $code"
}
```

### Step 4: Check Monitoring
```bash
kubectl port-forward -n cookedpad svc/prometheus 9090:9090
kubectl port-forward -n cookedpad svc/grafana 3000:3000
# Visit http://localhost:9090 and http://localhost:3000
```

### Step 5: Check HPA Status
```bash
kubectl get hpa -n cookedpad
kubectl describe hpa cookedpad-hpa -n cookedpad
```

### Step 6: Generate Load (Optional)
```powershell
# Run load test script above
# Monitor scaling with: kubectl get pods -n cookedpad --watch
```

---

## 13. USEFUL ALIASES (Optional)

```bash
# Add to your shell profile for quick access
alias kc="kubectl"
alias kcn="kubectl -n cookedpad"
alias kgp="kubectl get pods -n cookedpad"
alias kgd="kubectl get deployments -n cookedpad"
alias kgs="kubectl get svc -n cookedpad"
alias kl="kubectl logs -n cookedpad"
```

---

## Notes

- **Frontend URL**: http://localhost (LoadBalancer service)
- **Backend Services**: Only accessible internally (ClusterIP)
- **Monitoring**: Prometheus (9090), Grafana (3000), AlertManager (9093)
- **Namespace**: `cookedpad`
- **All pods should be in Running state**
- **Loki removed**: Use Promtail for log shipping
- **HPA enabled**: Auto-scales based on CPU (70%) and Memory (80%)

---

## Troubleshooting Quick Reference

| Issue | Command |
|-------|---------|
| Pod not starting | `kubectl describe pod <name> -n cookedpad` |
| Service not responding | `kubectl get endpoints -n cookedpad` |
| Check logs | `kubectl logs -n cookedpad -l app=<name>` |
| Memory issues | `kubectl top pods -n cookedpad` |
| Network problems | `kubectl exec -it <pod> -n cookedpad -- sh` |
| HPA not scaling | `kubectl describe hpa cookedpad-hpa -n cookedpad` |
| Connection refused | `kubectl get svc -n cookedpad` |

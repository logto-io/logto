# Logto helm charts

This Logto Chart is the best way to operate Grafana OnCall on Kubernetes.

## Usage (before release)

```bash
git clone https://github.com/lingdie/logto.git
cd logto && git checkout helm

# set common.env.db_url and other envs in values.yaml
# set core.endpoint and admin.endpoint in values.yaml if necessary
helm install logto helm --set common.env.db_url=${db_url}
```

access the logto service by port-forwarding

```bash
kubectl port-forward svc/logto-admin 3002:3002
```
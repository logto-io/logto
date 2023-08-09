# Logto helm charts

This Logto Chart is the best way to operate Grafana OnCall on Kubernetes.

## Usage (before release)

```bash
git clone https://github.com/lingdie/logto.git
cd logto && git checkout helm

# set common.env.dbURL and other envs in values.yaml
# set core.endpoint and admin.endpoint in values.yaml if necessary
helm install logto helm --set common.env.dbURL=${dbURL}
```

access the logto service by port-forwarding

** If you want to use another port or domain, please set value `admin.endpoint` **
```bash
kubectl port-forward svc/logto-admin 3002:3002
```
{{- define "logto.fullname" -}}
{{- if contains .Chart.Name .Release.Name -}}
{{- .Release.Name | trunc 52 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 52 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "logto.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "logto.chartLabels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service | quote }}
{{- end -}}

{{- define "logto.labels" -}}
{{ include "logto.chartLabels" . }}
app.kubernetes.io/version: {{ default .Chart.AppVersion .Values.image.tag | trunc 63 | trimAll "-_." | quote }}
{{ include "logto.selectorLabels" . }}
{{- end -}}

{{- define "logto.podOptions" -}}
automountServiceAccountToken: false
{{- with .Values.serviceAccountName }}
serviceAccountName: {{ . | quote }}
{{- end }}
{{- with .Values.nodeSelector }}
nodeSelector:
  {{- toYaml . | nindent 2 }}
{{- end }}
{{- with .Values.tolerations }}
tolerations:
  {{- toYaml . | nindent 2 }}
{{- end }}
{{- with .Values.affinity }}
affinity:
  {{- toYaml . | nindent 2 }}
{{- end }}
{{- end -}}

{{- define "logto.image" -}}
{{- printf "%s:%s" .Values.image.repository (default .Chart.AppVersion .Values.image.tag) -}}
{{- end -}}

{{- define "logto.dbEnv" -}}
- name: DB_URL
  valueFrom:
    secretKeyRef:
      name: {{ required "database.existingSecret is required" .Values.database.existingSecret | quote }}
      key: {{ .Values.database.secretKey | quote }}
{{- end -}}

{{- define "logto.redisName" -}}
{{- printf "%s-redis" (include "logto.fullname" .) -}}
{{- end -}}

{{- define "logto.redisSelectorLabels" -}}
app.kubernetes.io/name: {{ include "logto.redisName" . | quote }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "logto.redisLabels" -}}
{{ include "logto.chartLabels" . }}
{{ include "logto.redisSelectorLabels" . }}
app.kubernetes.io/component: cache
{{- end -}}

{{- define "logto.redisPasswordEnv" -}}
- name: REDIS_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ required "redis.existingSecret is required in bundled mode" .Values.redis.existingSecret | quote }}
      key: {{ .Values.redis.passwordKey | quote }}
{{- end -}}

{{- define "logto.redisEnv" -}}
{{- $mode := .Values.redis.mode -}}
{{- if not (has $mode (list "disabled" "bundled" "external")) -}}
{{- fail "redis.mode must be disabled, bundled, or external" -}}
{{- end -}}
{{- if ne $mode "disabled" -}}
{{- range .Values.extraEnv -}}
{{- if or (eq .name "REDIS_URL") (and (eq $mode "bundled") (eq .name "REDIS_PASSWORD")) -}}
{{- fail "configure Redis with redis.* or extraEnv, not both" -}}
{{- end -}}
{{- end -}}
{{- end -}}
{{- if eq $mode "bundled" -}}
{{ include "logto.redisPasswordEnv" . }}
- name: REDIS_URL
  value: {{ printf "redis://:$(REDIS_PASSWORD)@%s:6379" (include "logto.redisName" .) | quote }}
{{- else if eq $mode "external" -}}
- name: REDIS_URL
  valueFrom:
    secretKeyRef:
      name: {{ required "redis.existingSecret is required in external mode" .Values.redis.existingSecret | quote }}
      key: {{ .Values.redis.urlKey | quote }}
{{- end -}}
{{- end -}}

{{- define "logto.writableMounts" -}}
- name: alteration-scripts
  mountPath: /etc/logto/packages/cli/alteration-scripts
- name: tmp
  mountPath: /tmp
{{- end -}}

{{- define "logto.writableVolumes" -}}
- name: alteration-scripts
  emptyDir: {}
- name: tmp
  emptyDir: {}
{{- end -}}

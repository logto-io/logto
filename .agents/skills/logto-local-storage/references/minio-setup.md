# MinIO setup for Logto `storageProvider`

```bash
# Start MinIO
docker run -d --name logto-minio -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"

# Create a public-read bucket
docker exec logto-minio mc alias set local http://127.0.0.1:9000 minioadmin minioadmin
docker exec logto-minio mc mb local/logto-avatars --ignore-existing
docker exec logto-minio mc anonymous set download local/logto-avatars

# Insert provider config (change host if the browser runs elsewhere)
export DB_URL="${DB_URL:-postgres://postgres:p0stgr3s@localhost:5432/logto}"
docker exec logto-postgres psql -U postgres -d logto -c "
INSERT INTO systems (key, value) VALUES (
  'storageProvider',
  '{
    \"provider\": \"S3Storage\",
    \"endpoint\": \"http://127.0.0.1:9000\",
    \"region\": \"us-east-1\",
    \"bucket\": \"logto-avatars\",
    \"accessKeyId\": \"minioadmin\",
    \"accessSecretKey\": \"minioadmin\",
    \"forcePathStyle\": true,
    \"publicUrl\": \"http://127.0.0.1:9000/logto-avatars\"
  }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
"

# Restart pnpm start:dev, then:
curl -s -H 'development-user-id: dev' http://localhost:3001/api/user-assets/service-status
```

## Remove / reset

```bash
docker rm -f logto-minio
docker exec logto-postgres psql -U postgres -d logto -c "DELETE FROM systems WHERE key = 'storageProvider';"
# Restart core
```

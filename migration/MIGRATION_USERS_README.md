# Migrace uživatelů do Logto

Tento dokument popisuje postup pro zprovoznění a spuštění migrace uživatelů (zejména s hesly ve formátu `sha512crypt`) do vaší lokální instance Logto.

## 1. Požadavky

Pro spuštění projektu a migračních skriptů budete potřebovat:

- **Node.js**: verze `^22.14.0`
- **pnpm**: verze `^9.0.0` nebo `^10.0.0`
- **PostgreSQL**: doporučena verze `17-alpine` (běžící v Dockeru)

## 2. Spuštění vývojového prostředí

### PostgreSQL
Spusťte databázi pomocí Dockeru:
```bash
docker run -d --name logto-postgres -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=p0stgr3s -e POSTGRES_DB=logto postgres:17-alpine
```

### Inicializace Logto
Nastavte URL databáze a inicializujte ji:
```bash
export DB_URL="postgres://postgres:p0stgr3s@localhost:5432/logto"
pnpm cli db seed
pnpm cli connector link -p .
pnpm start:dev
```

## 3. Konfigurace Logto Console (M2M Aplikace)

Pro fungování migračního skriptu je nutné vytvořit Machine-to-Machine aplikaci, která má přístup k Management API:

1. Otevřete Logto Console (obvykle na `http://localhost:5002`).
2. Přejděte do **Applications**.
3. Klikněte na **Create Application** a vyberte **Machine-to-Machine**.
4. Pojmenujte ji (např. "Migration Tool").
5. Po vytvoření získáte **App ID** a **App Secret**.
6. V záložce **API Access** přiřaďte aplikaci přístup k **Logto Management API** a vyberte potřebné scopes (nebo "all").
7. **API Indicator** pro Management API je obvykle `https://default.logto.app/api`.

## 4. Nastavení přihlašování e-mailem

Po migraci uživatelů, kteří mají e-mail, je často žádoucí povolit přihlašování e-mailem namísto uživatelského jména. V Logto Console:

1. Přejděte do **Sign-in & account** > **Sign-up and sign-in**.
2. V sekci **SIGN IN** vyberte možnost přihlášení e-mailem.
3. **Důležité**: Je nutné deaktivovat vyžadování ověřovacího kódu (**verification code**), aby se uživatelé mohli přihlásit pouze heslem.
4. Tato funkce je plně funkční pouze v případě, že máte nastavený **email connector**.

## 5. Nastavení souboru .env

V kořenovém adresáři projektu vytvořte nebo upravte soubor `.env` a doplňte hodnoty získané z Console:

```env
DB_URL=postgresql://postgres:p0stgr3s@127.0.0.1:5432/logto
LOGTO_ENDPOINT=http://localhost:3001

APP_ID=vaše_m2m_app_id
APP_SECRET=vaše_m2m_app_secret
API_INDICATOR=https://default.logto.app/api
```

## 6. Podpora sha512crypt (Úprava Logto Core)

Pokud migrujete uživatele s hesly ve formátu `$6$rounds=...`, je nutné mít upravený Logto Core (viz `migration/migration/MIGRATION_GUIDE.md` pro detaily o patchování `packages/core/src/utils/password.ts`).

Před spuštěním migrace se ujistěte, že je Logto sestaveno s těmito změnami:
```bash
pnpm ci:build
```

## 7. Spuštění migrace

Samotný migrační skript se nachází v adresáři `migration/`. Před prvním spuštěním nainstalujte závislosti v tomto adresáři:

```bash
cd migration
npm install
```

Ujistěte se, že soubor s daty (např. `csvdata.csv`) je správně umístěn a cesta v `import.ts` mu odpovídá. Poté spusťte migraci:

```bash
npm start
```

Průběh můžete sledovat v konzoli. Případné chyby budou zapsány do `migration/errors.log`.

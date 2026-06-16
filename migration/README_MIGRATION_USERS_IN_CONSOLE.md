# Migrácia používateľov pomocou CSV v Logto Console

Tento návod popisuje proces migrácie používateľov z externého systému do Logto pomocou novej funkcie **Import CSV** priamo v administračnom rozhraní (Logto Console).

## 1. Technické predpoklady

Pre úspešné spustenie vývojového prostredia a vykonanie migrácie budete potrebovať:

*   **Node.js**: verzia `^22.14.0` (odporúčame použiť `nvm` a príkaz `nvm use` pre aktiváciu verzie definovanej v súbore `.nvmrc`)
*   **pnpm**: verzia `^9.0.0` alebo `^10.0.0`
*   **PostgreSQL**: odporúčaná verzia `17-alpine` (bežiaca v Docker)

## 2. Spustenie vývojového prostredia a databázy

### PostgreSQL
Spustite databázu pomocou Docker:
```bash
docker run -d --name logto-postgres -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=p0stgr3s -e POSTGRES_DB=logto postgres:17-alpine
```

### Inicializácia Logto
Nastavte URL databázy a inicializujte ju (v koreňovom adresári projektu):
```bash
export DB_URL="postgres://postgres:p0stgr3s@localhost:5432/logto"
pnpm cli db seed
pnpm cli connector link -p .
pnpm start:dev
```

## 3. Porovnanie s pôvodným migračným skriptom
V minulosti bolo potrebné spúšťať migračný skript manuálne cez terminál, čo vyžadovalo konfiguráciu M2M aplikácie a nastavovanie `.env` súborov. Nový prístup v Logto Console tieto kroky eliminuje:
*   **Žiadna M2M aplikácia**: Import využíva vašu aktuálnu session prihláseného správcu.
*   **Bez terminálu**: Celý proces prebieha v prehliadači (po nastavení prostredia).
*   **Spätná väzba v reálnom čase**: Vidíte priebeh importu a prípadné chyby priamo v UI.

## 4. Príprava CSV súboru

Súbor musí byť vo formáte `.csv` a mal by obsahovať nasledujúce stĺpce (hlavička je povinná):

| Stĺpec | Povinný | Popis |
| :--- | :--- | :--- |
| `username` | Áno | E-mailová adresa používateľa (mapuje sa na `primaryEmail`). |
| `password` | Nie | Heslo používateľa (čistý text alebo `sha512crypt` hash začínajúci na `$6$`). |
| `first_name` | Nie | Meno používateľa (uloží sa do `customData` a použije sa pre pole `name`). |
| `last_name` | Nie | Priezvisko používateľa (uloží sa do `customData` a použije sa pre pole `name`). |
| `id` | Nie | Pôvodné ID používateľa (uloží sa do `customData.old_id`). |
| `name` | Nie | Celé meno používateľa (ak chýba, vyskladá sa z `first_name` a `last_name`). |

**Príklad `migration.csv`:**
```csv
id,username,password,first_name,last_name
1,john.doe@example.com,$6$salt$hashedpassword,John,Doe
2,jane.smith@example.com,plaintext123,Jane,Smith
```

## 5. Konfigurácia Logto Core (Podpora hesiel)

Ak migrujete používateľov so zašifrovanými heslami (napr. z PHP systémov používajúcich `sha512crypt`), musíte zabezpečiť, aby váš Logto Core tento algoritmus podporoval.

### Zásah do `password.ts`
V súbore `packages/core/src/utils/password.ts` je implementovaná podpora pre `Legacy` algoritmus. Funkcia `executeLegacyHash` obsahuje vetvu pre `sha512crypt`, ktorá využíva knižnicu `sha512crypt-node`.

```typescript
if (algorithm === 'sha512crypt') {
  return sha512crypt(inputPassword, encryptedPassword) as string;
}
```

### Build a Docker
Ak spúšťate Logto cez Docker, uistite sa, že vaše zmeny v Core sú zahrnuté v obraze. V `docker-compose.yml` používame `build: .`, čo znamená, že Dockerfile v koreni projektu zostaví aplikáciu aj s vašimi úpravami.

Pred nasadením odporúčame spustiť:
```bash
pnpm prepack
```

## 6. Nastavenie Sign-in Experience

Aby sa migrovaní používatelia mohli prihlásiť, musíte v Logto Console (sekcia **Sign-in Experience > Sign-in & account**) nastaviť:

1.  **Metóda prihlásenia**: Povoliť `Email` + `Password`.
2.  **Overenie**: **Vypnúť** podmienku "Verification code" pre e-mail pri prihlasovaní heslom, inak bude systém od migrovaných používateľov vyžadovať kód, ktorý nemajú ako zadať pri prvom prihlásení.
3.  **Konektor**: Musíte mať nakonfigurovaný funkčný e-mailový konektor (napr. SendGrid alebo SMTP).

## 7. Postup importu v Console

1.  Prejdite do sekcie **User Management**.
2.  V hornom paneli kliknite na tlačidlo **Import CSV** (ikona cloudu).
3.  V otvorenom okne vyberte váš pripravený `.csv` súbor.
4.  Kliknite na **Start Import**.
5.  Sledujte progres:
    *   **Success**: Používateľ bol úspešne vytvorený alebo už existoval (409 Conflict - systém ho preskočí, čo sa považuje za vybavené).
    *   **Failed**: Chyba pri volaní API (napr. nevalidný e-mail).

Po dokončení sa zoznam používateľov automaticky aktualizuje.

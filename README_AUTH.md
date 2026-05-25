# Autenticação com Email e Senha - App Motorista

## 🔧 Configuração

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Edite o arquivo `.env`:
```bash
nano .env
```

Atualize com seus dados do PostgreSQL:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=seu_banco
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
JWT_SECRET=sua_chave_secreta_bem_segura
```

### 3. Preparar Banco de Dados
Execute as migrations no DBeaver:
```sql
-- Adicionar colunas de autenticação
ALTER TABLE "public"."drivers"
ADD COLUMN IF NOT EXISTS "email" varchar(320) NOT NULL UNIQUE;

ALTER TABLE "public"."drivers"
ADD COLUMN IF NOT EXISTS "passwordHash" varchar(255) NOT NULL;

ALTER TABLE "public"."drivers"
ADD COLUMN IF NOT EXISTS "ativo" boolean DEFAULT true;

ALTER TABLE "public"."drivers"
ADD COLUMN IF NOT EXISTS "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "public"."drivers"
ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_drivers_email ON "public"."drivers"("email");
CREATE INDEX IF NOT EXISTS idx_drivers_ativo ON "public"."drivers"("ativo");
```

### 4. Inserir Motoristas de Teste
```sql
INSERT INTO "public"."drivers" (
  "name", "cpf", "phone", "email", "passwordHash", 
  "licensenumber", "licensecategory", "status", "ativo"
) VALUES (
  'João Silva', '12345678901', '11999999999', 'joao@example.com',
  '$2b$10$YOvVfYWnNQxnZQqKlWZkzOQqKlWZkzOQqKlWZkzOQqKlWZkzOQqKl',
  '12345678901234567890', 'D', 'active', true
) ON CONFLICT (email) DO NOTHING;
```

## 🚀 Executar

### Terminal 1 - Backend
```bash
npm run dev:server
```

### Terminal 2 - Frontend
```bash
npm run dev
```

### Ambos Simultaneamente
```bash
npm run dev:all
```

## 📝 Endpoints

### Login
```bash
POST /api/login
Content-Type: application/json

{
  "cpf": "12345678901",
  "senha": "password123"
}
```

### Obter Dados do Motorista
```bash
GET /api/motoristas/me
Authorization: Bearer SEU_TOKEN_AQUI
```

### Health Check
```bash
GET /api/health
```

## 🔑 Credenciais de Teste

CPF: `12345678901`
Senha: `password123`

## 📋 Arquivos Criados

- `server.mjs` - Backend Node.js com Express
- `.env` - Variáveis de ambiente
- `package.json` - Dependências atualizadas
- `README_AUTH.md` - Este arquivo

## ✅ Checklist

- [ ] Dependências instaladas (`npm install`)
- [ ] `.env` configurado com dados do PostgreSQL
- [ ] Migrations executadas no banco
- [ ] Motoristas de teste inseridos
- [ ] Backend rodando (`npm run dev:server`)
- [ ] Frontend rodando (`npm run dev`)
- [ ] Login funcionando

## 🐛 Troubleshooting

### Erro: "Cannot find module 'express'"
```bash
npm install
```

### Erro: "ECONNREFUSED" ao conectar no banco
Verifique se:
- PostgreSQL está rodando
- Dados em `.env` estão corretos
- Banco existe

### Erro: "Token inválido"
- Verifique se `JWT_SECRET` em `.env` está correto
- Token pode ter expirado (7 dias)

## 📞 Suporte

Para mais informações, consulte a documentação do projeto.

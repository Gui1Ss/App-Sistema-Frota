import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 8000;

// ============================================================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// ============================================================================
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
  console.error('Erro na conexão com o banco:', err);
});

// ============================================================================
// MIDDLEWARES
// ============================================================================
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado' });
    }
    req.user = user;
    next();
  });
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

// Gerar hash de senha
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Verificar senha
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Gerar JWT
function generateToken(motoristId) {
  return jwt.sign(
    { id: motoristId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
}

// ============================================================================
// ENDPOINTS DE AUTENTICAÇÃO
// ============================================================================

// POST /api/login - Login com CPF e senha
app.post('/api/login', async (req, res) => {
  try {
    const { cpf, senha } = req.body;

    // Validação
    if (!cpf || !senha) {
      return res.status(400).json({ message: 'CPF e senha são obrigatórios' });
    }

    // Buscar motorista no banco
    const result = await pool.query(
      'SELECT * FROM "public"."drivers" WHERE "cpf" = $1 AND "ativo" = true',
      [cpf.replace(/\D/g, '')]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'CPF ou senha inválidos' });
    }

    const motorista = result.rows[0];

    // Verificar senha
    const senhaValida = await verifyPassword(senha, motorista.passwordHash);
    if (!senhaValida) {
      return res.status(401).json({ message: 'CPF ou senha inválidos' });
    }

    // Gerar token
    const token = generateToken(motorista.id);

    // Retornar token e dados do motorista
    res.json({
      token,
      motorista: {
        id: motorista.id,
        name: motorista.name,
        cpf: motorista.cpf,
        phone: motorista.phone,
        email: motorista.email,
        licensenumber: motorista.licensenumber,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
});

// GET /api/motoristas/me - Obter dados do motorista autenticado
app.get('/api/motoristas/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "public"."drivers" WHERE "id" = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Motorista não encontrado' });
    }

    const motorista = result.rows[0];
    res.json({
      motorista: {
        id: motorista.id,
        name: motorista.name,
        cpf: motorista.cpf,
        phone: motorista.phone,
        email: motorista.email,
        licensenumber: motorista.licensenumber,
      },
    });
  } catch (error) {
    console.error('Erro ao obter dados do motorista:', error);
    res.status(500).json({ message: 'Erro ao obter dados' });
  }
});

// POST /api/logout - Logout (apenas para limpeza no cliente)
app.post('/api/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// ============================================================================
// ENDPOINTS DE TESTE
// ============================================================================

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

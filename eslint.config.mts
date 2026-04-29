import js from '@eslint/js';
import globals from 'globals';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Pastas que o ESLint deve ignorar
  {
    ignores: ['coverage/**', 'dist/**', 'drizzle/**', 'node_modules/**'],
  },

  // Importa configurações padrão de JS, TS e do Sonar
  js.configs.recommended,
  ...tseslint.configs.recommended,
  (sonarjs.configs as any).recommended, 

  // Configuração principal do projeto (Node.js e Testes)
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      // Erro se houver variável parada. Ignora se começar com underline (ex: _id)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // --- REGRAS DE QUALIDADE (MESS DETECTOR) ---

      // Limita caminhos lógicos. Se a função tiver muitos "if/else", ela bloqueia.
      'complexity': ['error', 10], 

      // Mede o quão difícil é ler o código. Se tiver muita lógica aninhada, avisa.
      'sonarjs/cognitive-complexity': ['warn', 15],

      // Não permite mais de 3 níveis de aninhamento (ex: um if dentro de outro if dentro de um loop)
      'max-depth': ['warn', 3],

      // Evita usar 'any'. Te obriga a tipar as coisas corretamente.
      '@typescript-eslint/no-explicit-any': 'warn',

      // Avisa se você esquecer console.log no código
      'no-console': 'warn',
    },
  },

  // Ajuste para arquivos que rodam no navegador (pasta public)
  {
    files: ['public/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser, // Reconhece window, document, etc.
      },
    },
  }
);
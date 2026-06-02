# Configuração do Supabase Auth

## 1. Habilitar recuperação de senha

Certifique-se de que estas configurações estão corretas no painel do Supabase:

### Authentication > Providers > Email

- ✅ Desativar "Enable email confirmations"
- ✅ Ativar "Enable email verification"

### Authentication > URL Configuration

Adicione a seguinte URL de redirecionamento:

```
http://localhost:5173/reset-password        # Desenvolvimento local
https://seu-dominio.vercel.app/reset-password   # Produção
```

## 2. Email Templates

No Supabase, vá para **Authentication > Email Templates** e configure:

### Reset Password Email

Garanta que o link contém a URL de redirecionamento:
```
{{ .ConfirmationURL }}
```

Este URL deve apontar para `/reset-password` na sua aplicação.

## 3. Testar fluxo

1. Acesse a página de login
2. Clique em "Esqueceu sua senha?"
3. Informe seu email
4. Verifique o email e clique no link
5. Você deve ser redirecionado automaticamente para `/reset-password`

## Troubleshooting

Se o link não funcionar:

- Verifique se a URL de redirecionamento está correta em **Authentication > URL Configuration**
- Confirme que o email foi desativado confirmação em **Providers > Email**
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Tente em uma janela anônima/privada
- Verifique o console do navegador (F12) para erros

## Variáveis de ambiente

Certifique-se de que `.env.local` tem:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

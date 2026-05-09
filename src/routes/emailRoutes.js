const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { authenticate } = require('../middleware/auth');

// Configuração do transporter com seus dados
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'wealeyr537@gmail.com',
        pass: process.env.EMAIL_PASS || 'xbhxpypajtdbbnhs'
    }
});

// Verificar conexão
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Erro na configuração do email:', error);
    } else {
        console.log('✅ Servidor de email configurado com sucesso!');
    }
});

// Enviar email
router.post('/enviar-email', authenticate, async (req, res) => {
    const { para, assunto, mensagem, aluno_nome } = req.body;

    if (!para || !mensagem) {
        return res.status(400).json({ error: 'Destinatário e mensagem são obrigatórios' });
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
                    <h2 style="color: #2563eb;">📊 Help School</h2>
                    <p style="color: #6b7280;">Sistema de Acompanhamento Escolar</p>
                </div>
                <div style="padding: 20px 0;">
                    ${aluno_nome ? `<p style="font-size: 16px;"><strong>👨‍🎓 Aluno:</strong> ${aluno_nome}</p>` : ''}
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p style="margin: 0; white-space: pre-line; font-size: 14px; line-height: 1.5;">${mensagem.replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
                    <p>Este é um email automático do sistema Help School.</p>
                    <p>&copy; 2026 Help School - Todos os direitos reservados</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const mailOptions = {
        from: `"Help School" <${process.env.EMAIL_USER || 'wealeyr537@gmail.com'}>`,
        to: para,
        subject: assunto || 'Comunicado Importante - Help School',
        html: htmlContent,
        text: mensagem
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email enviado:', info.messageId);
        res.json({ success: true, message: 'Email enviado com sucesso!', messageId: info.messageId });
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        res.status(500).json({ error: 'Erro ao enviar email: ' + error.message });
    }
});

// Enviar SMS (simulado - integrar com Twilio/Zenvia posteriormente)
router.post('/enviar-sms', authenticate, async (req, res) => {
    const { telefone, mensagem } = req.body;

    if (!telefone || !mensagem) {
        return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios' });
    }

    // Limpar telefone
    const telefoneLimpo = telefone.replace(/\D/g, '');

    console.log(`📱 [SMS Simulado] Para: ${telefoneLimpo} | Mensagem: ${mensagem.substring(0, 100)}...`);

    // Simulação de envio bem-sucedido
    res.json({
        success: true,
        message: `SMS enviado para ${telefone}`,
        observacao: 'Configurar integração com provedor de SMS (Twilio/Zenvia) para envio real'
    });
});

// Rota para testar email
router.post('/testar-email', async (req, res) => {
    const { para } = req.body;

    try {
        await transporter.sendMail({
            from: `"Help School" <${process.env.EMAIL_USER}>`,
            to: para || process.env.EMAIL_USER,
            subject: 'Teste - Help School',
            html: '<h1>Teste de Configuração</h1><p>Se você está vendo este email, a configuração está funcionando!</p>',
            text: 'Teste de Configuração - Help School'
        });
        res.json({ success: true, message: 'Email de teste enviado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao enviar email de teste: ' + error.message });
    }
});

module.exports = router;
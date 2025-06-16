<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .code-box { background: #f8f9fa; border: 2px dashed #6366f1; padding: 20px; text-align: center; margin: 20px 0; }
        .code { font-size: 24px; font-weight: bold; color: #6366f1; letter-spacing: 2px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #6366f1;">Capinha Digital</h1>
            <h2>Obrigado pela sua compra!</h2>
        </div>

        <p>Olá {{ $activationCode->customer_name }},</p>

        <p>Sua compra foi processada com sucesso! Aqui está seu código de ativação:</p>

        <div class="code-box">
            <div class="code">{{ $activationCode->code }}</div>
        </div>

        <p><strong>Detalhes da compra:</strong></p>
        <ul>
            <li><strong>Plano:</strong> {{ ucfirst($activationCode->plan) }}</li>
            <li><strong>Valor:</strong> R$ {{ number_format($activationCode->amount, 2, ',', '.') }}</li>
            <li><strong>Data:</strong> {{ $activationCode->sold_at->format('d/m/Y H:i') }}</li>
        </ul>

        <p>Para criar seu cartão digital, clique no botão abaixo:</p>

        <div style="text-align: center;">
            <a href="{{ route('card.create') }}" class="button">Criar Meu Cartão</a>
        </div>

        <p><strong>Instruções:</strong></p>
        <ol>
            <li>Clique no link acima</li>
            <li>Digite o código de ativação</li>
            <li>Preencha suas informações</li>
            <li>Personalize o visual</li>
            <li>Ative seu cartão!</li>
        </ol>

        <p>Se precisar de ajuda, responda este email ou entre em contato conosco.</p>

        <p>Atenciosamente,<br>
        Equipe Capinha Digital</p>
    </div>
</body>
</html>

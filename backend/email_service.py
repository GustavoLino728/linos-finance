# email_service.py
from flask_mail import Mail, Message
import os

# Criar instância do Mail (sem app ainda)
mail = Mail()

def init_mail(app):
    """Inicializa Flask-Mail com a aplicação"""
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USE_SSL'] = True
    app.config['MAIL_USERNAME'] = os.getenv('GMAIL_USER')
    app.config['MAIL_PASSWORD'] = os.getenv('GMAIL_APP_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('GMAIL_USER')
    
    mail.init_app(app)
    print("✅ Flask-Mail inicializado")

def send_reset_email(email, reset_link):
    """Envia email de reset de senha"""
    try:
        msg = Message(
            'Redefinir Senha - Lino$ Finance',
            recipients=[email]
        )
        
        msg.html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f9fc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #0d47a1; margin-bottom: 20px;">🔐 Redefinir Senha</h2>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Você solicitou a redefinição de senha da sua conta <strong>Lino$ Finance</strong>.
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Clique no botão abaixo para criar uma nova senha:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" 
                   style="background-color: #0d47a1; 
                          color: white; 
                          padding: 15px 40px; 
                          text-decoration: none; 
                          border-radius: 5px;
                          display: inline-block;
                          font-weight: bold;
                          font-size: 16px;">
                  Redefinir Senha
                </a>
              </div>
              
              <div style="background-color: #f5f9fc; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                  Ou copie e cole este link no seu navegador:
                </p>
                <p style="color: #0d47a1; font-size: 14px; word-break: break-all; margin: 10px 0 0 0;">
                  {reset_link}
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; line-height: 1.6;">
                <strong>⏰ Este link expira em 1 hora.</strong><br><br>
                Se você não solicitou esta redefinição, ignore este email e sua senha permanecerá inalterada.<br><br>
                Por segurança, nunca compartilhe este link com outras pessoas.
              </p>
            </div>
          </body>
        </html>
        """
        
        mail.send(msg)
        print(f"✅ Email enviado com sucesso para: {email}")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao enviar email: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False

import json
import os
import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def handler(event: dict, context) -> dict:
    """Отправка кода подтверждения на email при регистрации."""
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    body = json.loads(event.get("body") or "{}")
    email = body.get("email", "").strip()

    if not email or "@" not in email:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Некорректный email"}),
        }

    code = "".join(random.choices(string.digits, k=6))

    smtp_host = os.environ.get("SMTP_HOST", "")
    smtp_port = int(os.environ.get("SMTP_PORT", "465"))
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_password = os.environ.get("SMTP_PASSWORD", "")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Код подтверждения — Vl Video"
    msg["From"] = smtp_user
    msg["To"] = email

    html = f"""
    <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:32px;background:#f9f9f9;border-radius:16px;">
      <h2 style="margin:0 0 8px;color:#111">Vl Video</h2>
      <p style="color:#555;margin:0 0 24px;">Твой код подтверждения:</p>
      <div style="font-size:40px;font-weight:900;letter-spacing:12px;color:#3B82F6;text-align:center;padding:24px;background:#fff;border-radius:12px;margin-bottom:24px;">{code}</div>
      <p style="color:#888;font-size:13px;">Код действителен 10 минут. Если ты не регистрировался — просто проигнорируй это письмо.</p>
    </div>
    """

    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, email, msg.as_string())

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({"success": True, "code": code}),
    }

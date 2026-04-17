from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, EmailStr
import databutton as db
from datetime import datetime
import json
from typing import List, Dict, Optional, Any, Literal
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

router = APIRouter()

# SMTP configuration
SMTP_HOST = os.environ.get("SMTP_HOST", "mail.bertiefoundation.org")
SMTP_PORT = 465
SMTP_FROM = os.environ.get("SMTP_EMAIL", "info@bertiefoundation.org")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

# Common email styles to ensure consistent branding
EMAIL_STYLES = """
<style>
    body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2563EB; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    h1 { margin: 0; font-size: 24px; }
    h2 { font-size: 20px; margin-top: 0; }
    p { line-height: 1.6; }
    .button { display: inline-block; background-color: #2563EB; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; }
    .social { margin-top: 20px; }
    .social a { color: #2563EB; text-decoration: none; margin: 0 10px; }
</style>
"""

# Email template types
TemplateType = Literal[
    "volunteer_application", 
    "contact_form", 
    "donation", 
    "feedback", 
    "success_story",
    "newsletter"
]

# Common model for email notifications
class EmailNotification(BaseModel):
    to: str
    subject: str
    content_html: str
    content_text: str

# Function to send emails with error handling
def send_email(notification: EmailNotification) -> bool:
    """Send an email via SMTP SSL on port 465"""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = notification.subject
        msg["From"] = f"Bertie Foundation <{SMTP_FROM}>"
        msg["To"] = notification.to

        # Always wrap HTML in a full document so CSS renders correctly in all email clients
        html_body = notification.content_html
        if not html_body.strip().lower().startswith("<!doctype") and "<html" not in html_body.lower():
            html_body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>{notification.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
{html_body}
</body>
</html>"""

        msg.attach(MIMEText(html_body, "html"))
        if notification.content_text:
            msg.attach(MIMEText(notification.content_text, "plain"))

        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.login(SMTP_FROM, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, notification.to, msg.as_string())

        print(f"Email sent successfully to {notification.to}")
        return True
    except Exception as e:
        print(f"Error sending email to {notification.to}: {str(e)}")
        return False

# Helper function to convert HTML to plain text
def html_to_plain_text(html_content: str) -> str:
    """Convert HTML content to plain text by removing tags"""
    tags_to_remove = [
        '<div class="header">', '</div>', '<div class="content">', '<div class="footer">', 
        '<h1>', '</h1>', '<h2>', '</h2>', '<h3>', '</h3>', '<p>', '</p>', 
        '<strong>', '</strong>', '<style>', '</style>', '<ul>', '</ul>', 
        '<li>', '</li>', '<div class="social">', '</a>', ' | ', '<small>', 
        '</small>', '<a href="', '" target="_blank">', '<br>', '<hr>'
    ]
    plain_text = html_content
    for tag in tags_to_remove:
        plain_text = plain_text.replace(tag, '')
    return plain_text

# Template generators for each form type
def get_admin_template(template_type: TemplateType, data: dict) -> str:
    """Generate admin notification email template based on form type"""
    if template_type == "volunteer_application":
        return f"""
        {EMAIL_STYLES}
        <div class="header">
            <h1>New Volunteer Application</h1>
        </div>
        <div class="content">
            <h2>Application Details</h2>
            <p><strong>Name:</strong> {data.get('name')}</p>
            <p><strong>Email:</strong> {data.get('email')}</p>
            <p><strong>Interests:</strong> {', '.join(data.get('interests', []))}</p>
            <p><strong>Message:</strong> {data.get('message')}</p>
            <p><strong>Submitted at:</strong> {data.get('submitted_at')}</p>
        </div>
        <div class="footer">
            <p>Bertie Foundation - Admin Notification</p>
        </div>
        """
    
    elif template_type == "contact_form":
        return f"""
        {EMAIL_STYLES}
        <div class="header">
            <h1>New Contact Form Submission</h1>
        </div>
        <div class="content">
            <h2>Contact Details</h2>
            <p><strong>Name:</strong> {data.get('name')}</p>
            <p><strong>Email:</strong> {data.get('email')}</p>
            <p><strong>Subject:</strong> {data.get('subject')}</p>
            <p><strong>Message:</strong> {data.get('message')}</p>
            <p><strong>Submitted at:</strong> {data.get('submitted_at')}</p>
        </div>
        <div class="footer">
            <p>Bertie Foundation - Admin Notification</p>
        </div>
        """
    
    elif template_type == "donation":
        return f"""
        {EMAIL_STYLES}
        <div class="header">
            <h1>New Donation Received</h1>
        </div>
        <div class="content">
            <h2>Donation Details</h2>
            <p><strong>Donor:</strong> {data.get('name') or 'Anonymous'}</p>
            <p><strong>Email:</strong> {data.get('email')}</p>
            <p><strong>Amount:</strong> ${data.get('amount')}</p>
            <p><strong>Message:</strong> {data.get('message', 'No message provided')}</p>
            <p><strong>Donation Date:</strong> {data.get('submitted_at')}</p>
        </div>
        <div class="footer">
            <p>Bertie Foundation - Admin Notification</p>
        </div>
        """
    
    elif template_type == "feedback":
        return f"""
        {EMAIL_STYLES}
        <div class="header">
            <h1>New Feedback Submission</h1>
        </div>
        <div class="content">
            <h2>Feedback Details</h2>
            <p><strong>Rating:</strong> {data.get('rating')}/5</p>
            <p><strong>Category:</strong> {data.get('category')}</p>
            <p><strong>Comment:</strong> {data.get('comment')}</p>
            <p><strong>Email:</strong> {data.get('email', 'Not provided')}</p>
            <p><strong>Submitted at:</strong> {data.get('created_at')}</p>
        </div>
        <div class="footer">
            <p>Bertie Foundation - Admin Notification</p>
        </div>
        """
    
    elif template_type == "success_story":
        return f"""
        {EMAIL_STYLES}
        <div class="header">
            <h1>New Success Story Submission</h1>
        </div>
        <div class="content">
            <h2>Story Details</h2>
            <p><strong>Title:</strong> {data.get('title')}</p>
            <p><strong>Author:</strong> {data.get('name')}</p>
            <p><strong>Email:</strong> {data.get('email')}</p>
            <p><strong>Program:</strong> {data.get('program')}</p>
            <p><strong>Impact:</strong> {data.get('impact')}</p>
            <p><strong>Tags:</strong> {', '.join(data.get('tags', []))}</p>
            <h3>Story Content:</h3>
            <p>{data.get('story')}</p>
            <p><strong>Image URL:</strong> {data.get('imageUrl', 'No image provided')}</p>
        </div>
        <div class="footer">
            <p>Bertie Foundation - Admin Notification</p>
        </div>
        """
    
    elif template_type == "newsletter":
        return f"""
        {EMAIL_STYLES}
        <div class="header">
            <h1>New Newsletter Subscription</h1>
        </div>
        <div class="content">
            <h2>Subscription Details</h2>
            <p><strong>Email:</strong> {data.get('email')}</p>
            <p><strong>Subscribed at:</strong> {data.get('subscribed_at')}</p>
            <p><strong>Source:</strong> {data.get('source', 'website')}</p>
        </div>
        <div class="footer">
            <p>Bertie Foundation - Admin Notification</p>
        </div>
        """
    
    else:
        return f"""
        {EMAIL_STYLES}
        <div class="header">
            <h1>New Form Submission</h1>
        </div>
        <div class="content">
            <h2>Form Details</h2>
            <p>A new form of type "{template_type}" has been submitted.</p>
            <p>Please check the admin dashboard for details.</p>
        </div>
        <div class="footer">
            <p>Bertie Foundation - Admin Notification</p>
        </div>
        """

def get_user_template(template_type: TemplateType, data: dict) -> str:
    """Generate user confirmation email template based on form type"""
    if template_type == "volunteer_application":
        return f"""
        {EMAIL_STYLES}
        <div class="header">
            <h1>Thank You for Volunteering!</h1>
        </div>
        <div class="content">
            <h2>Hello {data.get('name')}!</h2>
            <p>Thank you for your interest in volunteering with the Bertie Foundation. We've received your application and will review it shortly.</p>
            <p>We'll contact you soon to discuss the next steps and potential opportunities that match your interests in {', '.join(data.get('interests', []))}.</p>
            <p>If you have any questions in the meantime, please don't hesitate to contact us at <a href="mailto:volunteers@bertiefoundation.org">volunteers@bertiefoundation.org</a>.</p>
        </div>
        <div class="footer">
            <div class="social">
                <a href="https://www.facebook.com/BertieFoundation" target="_blank">Facebook</a> | 
                <a href="https://x.com/BertieFndtn" target="_blank">Twitter / X</a> | 
                <a href="https://www.instagram.com/bertie_foundation/" target="_blank">Instagram</a>
            </div>
            <p><small>Bertie Foundation - Making a difference together</small></p>
        </div>
        """
    
    elif template_type == "contact_form":
        return f"""
        {EMAIL_STYLES}
        <style>
            .bf-hero {{ background: linear-gradient(135deg, #1d4ed8 0%, #2563EB 60%, #3b82f6 100%); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .bf-hero h1 {{ margin: 0 0 8px 0; font-size: 28px; color: #ffffff; letter-spacing: -0.5px; }}
            .bf-hero p {{ margin: 0; font-size: 15px; color: #bfdbfe; }}
            .bf-body {{ background: #ffffff; padding: 36px 36px 20px 36px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }}
            .bf-greeting {{ font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }}
            .bf-intro {{ font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 24px; }}
            .bf-badge {{ display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 6px 14px; font-size: 13px; color: #1d4ed8; font-weight: 600; margin-bottom: 24px; }}
            .bf-card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 24px; margin-bottom: 28px; }}
            .bf-card-label {{ font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 4px; }}
            .bf-card-value {{ font-size: 14px; color: #1e293b; line-height: 1.6; }}
            .bf-divider {{ border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }}
            .bf-cta {{ text-align: center; margin: 28px 0; }}
            .bf-cta a {{ display: inline-block; background: #2563EB; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 0.2px; }}
            .bf-timeline {{ display: flex; gap: 0; margin: 20px 0; }}
            .bf-step {{ flex: 1; text-align: center; padding: 14px 10px; background: #f1f5f9; border: 1px solid #e2e8f0; }}
            .bf-step:first-child {{ border-radius: 8px 0 0 8px; }}
            .bf-step:last-child {{ border-radius: 0 8px 8px 0; }}
            .bf-step-icon {{ font-size: 20px; margin-bottom: 4px; }}
            .bf-step-label {{ font-size: 11px; font-weight: 600; color: #64748b; }}
            .bf-step.active {{ background: #2563EB; border-color: #2563EB; }}
            .bf-step.active .bf-step-label {{ color: #ffffff; }}
            .bf-footer-box {{ background: #1e293b; padding: 24px 36px; border-radius: 0 0 10px 10px; text-align: center; }}
            .bf-footer-box p {{ margin: 0 0 12px 0; font-size: 12px; color: #94a3b8; line-height: 1.6; }}
            .bf-social a {{ color: #93c5fd; text-decoration: none; margin: 0 8px; font-size: 12px; font-weight: 600; }}
        </style>
        <div style="background:#f1f5f9; padding: 30px 10px; font-family: Arial, sans-serif;">
        <div style="max-width: 580px; margin: 0 auto;">

            <!-- Hero -->
            <div class="bf-hero">
                <p style="font-size:13px; color:#bfdbfe; margin:0 0 12px 0; font-weight:600; letter-spacing:1px; text-transform:uppercase;">Bertie Foundation</p>
                <h1>Message Received! ✉️</h1>
                <p>We've got your message and will be in touch shortly.</p>
            </div>

            <!-- Body -->
            <div class="bf-body">
                <div class="bf-greeting">Hello, {data.get('name', 'Friend')}! 👋</div>
                <p class="bf-intro">
                    Thank you for reaching out to the <strong>Bertie Foundation</strong>. We truly appreciate you taking the time to contact us — every message matters to us and our community.
                </p>

                <div style="text-align:center;">
                    <span class="bf-badge">⏱ Expected Response: Within 24–48 Hours</span>
                </div>

                <!-- Progress Steps -->
                <div class="bf-timeline">
                    <div class="bf-step active">
                        <div class="bf-step-icon">📨</div>
                        <div class="bf-step-label">Received</div>
                    </div>
                    <div class="bf-step">
                        <div class="bf-step-icon">🔍</div>
                        <div class="bf-step-label">In Review</div>
                    </div>
                    <div class="bf-step">
                        <div class="bf-step-icon">💬</div>
                        <div class="bf-step-label">Response Sent</div>
                    </div>
                </div>

                <hr class="bf-divider" />

                <!-- Message Summary -->
                <p style="font-size:13px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:14px;">Your Message Summary</p>

                <div class="bf-card">
                    <div class="bf-card-label">Subject</div>
                    <div class="bf-card-value">{data.get('subject', 'N/A')}</div>
                </div>

                <div class="bf-card">
                    <div class="bf-card-label">Category</div>
                    <div class="bf-card-value" style="text-transform:capitalize;">{data.get('category', 'General Inquiry')}</div>
                </div>

                <div class="bf-card">
                    <div class="bf-card-label">Your Message</div>
                    <div class="bf-card-value">{data.get('message', '')}</div>
                </div>

                <hr class="bf-divider" />

                <p style="font-size:14px; color:#475569; line-height:1.7; margin-bottom:8px;">
                    Our team reviews all messages during <strong>office hours (Mon–Fri, 9 AM – 4 PM Thailand Time, GMT+7)</strong>. You can expect a reply within <strong>24 to 48 hours</strong>.
                </p>
                <p style="font-size:14px; color:#475569; line-height:1.7; margin-bottom:28px;">
                    If your matter is urgent, feel free to email us directly at
                    <a href="mailto:info@bertiefoundation.org" style="color:#2563EB; font-weight:600;">info@bertiefoundation.org</a>
                    or call us at <strong>+66 97 343 2151</strong>.
                </p>

                <!-- CTA -->
                <div class="bf-cta">
                    <a href="https://metaearth.riff.works/bertie-foundation">Visit Our Website</a>
                </div>
            </div>

            <!-- Footer -->
            <div class="bf-footer-box">
                <p>You're receiving this email because you submitted a message through the Bertie Foundation website.</p>
                <div class="bf-social">
                    <a href="https://www.instagram.com/bertie_foundation/">Instagram</a>
                    <a href="https://www.linkedin.com/company/bertie-foundation/">LinkedIn</a>
                    <a href="https://x.com/BertieFndtn">Twitter / X</a>
                    <a href="https://www.youtube.com/@BertieFoundation">YouTube</a>
                </div>
                <p style="margin-top:14px;">© 2026 Bertie Foundation · Making a difference together 💙</p>
            </div>

        </div>
        </div>
        """
    
    elif template_type == "donation":
        return f"""
        {EMAIL_STYLES}
        <div class="header">
            <h1>Thank You for Your Donation!</h1>
        </div>
        <div class="content">
            <h2>Hello {data.get('name', 'Generous Supporter')}!</h2>
            <p>Thank you for your generous donation of <strong>${data.get('amount')}</strong> to the Bertie Foundation. Your contribution will help us continue our mission of making a positive impact in our communities.</p>
            <p>This email serves as your donation receipt for tax purposes. Please keep it for your records.</p>
            <p><strong>Donation Details:</strong></p>
            <ul>
                <li>Amount: ${data.get('amount')}</li>
                <li>Date: {data.get('submitted_at')}</li>
                <li>Transaction ID: {data.get('transaction_id', 'N/A')}</li>
            </ul>
            <p>To learn more about how your donation is making a difference, visit our <a href="https://bertiefoundation.org/impact">Impact page</a>.</p>
        </div>
        <div class="footer">
            <p>The Bertie Foundation is a registered 501(c)(3) nonprofit organization. All donations are tax-deductible to the extent allowed by law.</p>
            <div class="social">
                <a href="https://www.facebook.com/BertieFoundation" target="_blank">Facebook</a> | 
                <a href="https://x.com/BertieFndtn" target="_blank">Twitter / X</a> | 
                <a href="https://www.instagram.com/bertie_foundation/" target="_blank">Instagram</a>
            </div>
            <p><small>Bertie Foundation - Making a difference together</small></p>
        </div>
        """
    
    elif template_type == "feedback":
        return f"""
        {EMAIL_STYLES}
        <div class="header">
            <h1>Thank You for Your Feedback</h1>
        </div>
        <div class="content">
            <h2>We Value Your Input!</h2>
            <p>Thank you for taking the time to share your feedback with the Bertie Foundation. Your input helps us improve our programs and services.</p>
            <p>We've recorded your feedback and will consider it as we continue to develop our initiatives.</p>
            {"<p>We noticed you rated us " + str(data.get('rating')) + "/5. " + ("We're sorry we didn't meet your expectations." if data.get('rating', 0) < 4 else "We're glad you had a positive experience!") + "</p>" if data.get('rating') else ""}
            <p>If you have any additional thoughts or would like to discuss your feedback further, please don't hesitate to contact us.</p>
        </div>
        <div class="footer">
            <div class="social">
                <a href="https://www.facebook.com/BertieFoundation" target="_blank">Facebook</a> | 
                <a href="https://x.com/BertieFndtn" target="_blank">Twitter / X</a> | 
                <a href="https://www.instagram.com/bertie_foundation/" target="_blank">Instagram</a>
            </div>
            <p><small>Bertie Foundation - Making a difference together</small></p>
        </div>
        """
    
    elif template_type == "success_story":
        return f"""
        {EMAIL_STYLES}
        <div class="header">
            <h1>Thank You for Sharing Your Success Story</h1>
        </div>
        <div class="content">
            <h2>Hello {data.get('name')}!</h2>
            <p>Thank you for sharing your inspiring success story with the Bertie Foundation. Personal stories like yours help demonstrate the real impact of our programs and inspire others to get involved.</p>
            <p>Your story "<strong>{data.get('title')}</strong>" has been received and is currently under review by our team. Once approved, it will be featured on our website and potentially in other promotional materials.</p>
            <p>We may contact you if we need any additional information or clarification.</p>
        </div>
        <div class="footer">
            <div class="social">
                <a href="https://www.facebook.com/BertieFoundation" target="_blank">Facebook</a> | 
                <a href="https://x.com/BertieFndtn" target="_blank">Twitter / X</a> | 
                <a href="https://www.instagram.com/bertie_foundation/" target="_blank">Instagram</a>
            </div>
            <p><small>Bertie Foundation - Making a difference together</small></p>
        </div>
        """
    
    elif template_type == "newsletter":
        return f"""
        {EMAIL_STYLES}
        <div class="header">
            <h1>Welcome to the Bertie Foundation Newsletter!</h1>
        </div>
        <div class="content">
            <h2>Thank You for Subscribing</h2>
            <p>You are now subscribed to receive updates from the Bertie Foundation. We'll keep you informed about our programs, events, success stories, and opportunities to get involved.</p>
            <p>Our newsletter is sent monthly, and we promise not to flood your inbox.</p>
            <p>If you have any questions or want to learn more about our work, visit our <a href="https://bertiefoundation.org">website</a>.</p>
        </div>
        <div class="footer">
            <p>If you no longer wish to receive these emails, you can <a href="https://bertiefoundation.org/unsubscribe">unsubscribe</a> at any time.</p>
            <div class="social">
                <a href="https://www.facebook.com/BertieFoundation" target="_blank">Facebook</a> | 
                <a href="https://x.com/BertieFndtn" target="_blank">Twitter / X</a> | 
                <a href="https://www.instagram.com/bertie_foundation/" target="_blank">Instagram</a>
            </div>
            <p><small>Bertie Foundation - Making a difference together</small></p>
        </div>
        """
    
    else:
        return f"""
        {EMAIL_STYLES}
        <div class="header">
            <h1>Thank You for Your Submission</h1>
        </div>
        <div class="content">
            <h2>We've Received Your Information</h2>
            <p>Thank you for submitting your information to the Bertie Foundation. We've received your submission and will process it accordingly.</p>
            <p>If you have any questions, please contact us at <a href="mailto:info@bertiefoundation.org">info@bertiefoundation.org</a>.</p>
        </div>
        <div class="footer">
            <div class="social">
                <a href="https://www.facebook.com/BertieFoundation" target="_blank">Facebook</a> | 
                <a href="https://x.com/BertieFndtn" target="_blank">Twitter / X</a> | 
                <a href="https://www.instagram.com/bertie_foundation/" target="_blank">Instagram</a>
            </div>
            <p><small>Bertie Foundation - Making a difference together</small></p>
        </div>
        """

def get_email_content(template_type: str, data: dict) -> str:
    """Returns the HTML content for a specific email template."""
    
    # Base URL for all links
    base_url = "https://bertiefoundation.org"
    
    # --- TEMPLATES ---
    
    # Notification to Admin
    if template_type == "admin_notification":
        form_name = data.get("form_type", "N/A").replace("_", " ").title()
        timestamp = data.get("timestamp", "N/A")
        
        fields_html = ""
        for key, value in data.items():
            if key not in ["form_type", "timestamp"]:
                field_name = key.replace("_", " ").title()
                fields_html += f"<li><strong>{field_name}:</strong> {value}</li>"
        
        return f"""
        {EMAIL_STYLES}
        <div class="container notification">
            <div class="header">
                <h1>New Form Submission: {form_name}</h1>
            </div>
            <div class="content">
                <h2>Submission Details</h2>
                <ul>
                    {fields_html}
                </ul>
                <p><small>Received at: {timestamp}</small></p>
            </div>
            <div class="footer">
                <p>Bertie Foundation - Admin Notification</p>
            </div>
        </div>
        """
    
    # Welcome to User
    elif template_type == "welcome":
        subscriber_id = data.get('id', '')
        unsubscribe_link = f"{base_url}/unsubscribe/{subscriber_id}" if subscriber_id else f"{base_url}/unsubscribe"

        return f"""
        {EMAIL_STYLES}
        <div class="header">
            <h1>Welcome to the Bertie Foundation Newsletter!</h1>
        </div>
        <div class="content">
            <h2>Thank You for Subscribing</h2>
            <p>You are now subscribed to receive updates from the Bertie Foundation. We'll keep you informed about our programs, events, success stories, and opportunities to get involved.</p>
            <p>Our newsletter is sent monthly, and we promise not to flood your inbox.</p>
            <p>If you have any questions or want to learn more about our work, visit our <a href="{base_url}">website</a>.</p>
        </div>
        <div class="footer">
            <p>If you no longer wish to receive these emails, you can <a href="{unsubscribe_link}">unsubscribe</a> at any time.</p>
            <div class="social">
                <a href="https://www.facebook.com/BertieFoundation" target="_blank">Facebook</a> | 
                <a href="https://x.com/BertieFndtn" target="_blank">Twitter / X</a> | 
                <a href="https://www.instagram.com/bertie_foundation/" target="_blank">Instagram</a>
            </div>
            <p><small>Bertie Foundation - Making a difference together</small></p>
        </div>
        """
    
    # Fallback for unknown template
    else:
        return f"""
        {EMAIL_STYLES}
        <div class="container">
            <h1>Test Notification</h1>
            <p>This is a test email for the '{template_type}' template.</p>
            <p>Data received: <pre>{json.dumps(data, indent=2)}</pre></p>
        </div>
        """

def send_form_notifications(form_type: str, form_data: dict, admin_recipients: list = None) -> Dict[str, bool]:
    """Send both admin and user notifications for form submissions
    
    Args:
        form_type: Type of form submission (volunteer, contact, etc.)
        form_data: Form submission data
        admin_recipients: List of admin email addresses to notify
        
    Returns:
        Dict with status of admin and user email sending
    """
    result = {"admin_sent": False, "user_sent": False}
    
    # Default admin email if none provided
    if not admin_recipients:
        admin_recipients = ["info@bertiefoundation.org"]
    
    # Get current timestamp if not provided
    if "submitted_at" not in form_data:
        form_data["submitted_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Generate admin notification template
    admin_html = get_admin_template(form_type, form_data)
    admin_text = html_to_plain_text(admin_html)
    
    # Send notifications to all admin emails
    admin_success = False
    for admin_email in admin_recipients:
        # Build a descriptive subject line
        name = form_data.get("name", "").strip()
        date_str = datetime.now().strftime("%m/%d/%Y")
        if form_type == "feedback":
            category = form_data.get("category", "General Feedback")
            admin_subject = f"New Feedback Submission | {category} | {name} | {date_str}" if name else f"New Feedback Submission | {category} | {date_str}"
        else:
            form_label = form_type.replace('_', ' ').title()
            admin_subject = f"New {form_label} Submission | {name} | {date_str}" if name else f"New {form_label} Submission | {date_str}"

        admin_notification = EmailNotification(
            to=admin_email,
            subject=admin_subject,
            content_html=admin_html,
            content_text=admin_text
        )
        if send_email(admin_notification):
            admin_success = True
    
    result["admin_sent"] = admin_success
    
    # Send user confirmation/welcome email
    if form_type in ["newsletter", "volunteer", "volunteer_application", "contact", "contact_form", "success_story", "success_stories", "feedback", "donation"]:
        user_email = form_data.get("email")
        if user_email:
            # Map incoming form_type to the correct template key
            if form_type == "newsletter":
                template_key = "welcome"
            elif form_type in ["contact", "contact_form"]:
                template_key = "contact_form"
            elif form_type in ["volunteer", "volunteer_application"]:
                template_key = "volunteer_application"
            elif form_type in ["success_story", "success_stories"]:
                template_key = "success_story"
            else:
                template_key = form_type
            
            # Get the correct email content
            user_html = get_user_template(template_key, form_data)
            user_text = html_to_plain_text(user_html)
            
            # Determine subject line
            if form_type == "newsletter":
                subject = "Welcome to the Bertie Foundation Newsletter!"
            elif form_type in ["volunteer", "volunteer_application"]:
                subject = "Thank You for Your Volunteer Application - Bertie Foundation"
            elif form_type in ["success_story", "success_stories"]:
                subject = "Thank You for Sharing Your Story - Bertie Foundation"
            elif form_type == "feedback":
                subject = "Thank You for Your Feedback - Bertie Foundation"
            elif form_type == "donation":
                subject = "Thank You for Your Generous Donation - Bertie Foundation"
            else:
                subject = "Thank You for Contacting Bertie Foundation"

            user_notification = EmailNotification(
                to=user_email,
                subject=subject,
                content_html=user_html,
                content_text=user_text
            )
            result["user_sent"] = send_email(user_notification)
    
    return result

@router.post("/test-notification", tags=["admin"])
def test_notification(template_type: TemplateType, recipient_email: str):
    """Test endpoint for email notifications (development only)"""
    # Create test data based on template type
    test_data = {
        "name": "Test User",
        "email": recipient_email,
        "submitted_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    if template_type == "volunteer_application":
        test_data.update({
            "interests": ["Education", "Technology"],
            "message": "I would like to volunteer to help with your education programs.",
            "skills": ["Teaching", "Programming"]
        })
    elif template_type == "contact_form":
        test_data.update({
            "subject": "Question about programs",
            "message": "I would like to learn more about your education initiatives."
        })
    elif template_type == "donation":
        test_data.update({
            "amount": 50.00,
            "message": "Keep up the great work!",
            "transaction_id": "TEST-1234567890"
        })
    elif template_type == "feedback":
        test_data.update({
            "rating": 4,
            "category": "website",
            "comment": "Your website is great but could use more information about programs.",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
    elif template_type == "success_story":
        test_data.update({
            "title": "How Bertie Foundation Changed My Life",
            "story": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "program": "Education Initiative",
            "impact": "High",
            "tags": ["education", "success", "community"]
        })
    elif template_type == "newsletter":
        test_data.update({
            "subscribed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "source": "website-test"
        })
    
    # Send test notifications
    result = send_form_notifications(template_type, test_data, [recipient_email])
    
    return {
        "status": "success",
        "message": f"Test notifications for {template_type} sent",
        "result": result
    }

"""
Bertie Foundation — Email Notification Templates
File: backend/app/apis/email_notifications/__init__.py

Color fix: replaced old maroon #6B0000 with the site's official red #D9232D
(from tailwind.config.js: 'bertie-red': '#D9232D')
"""

EMAIL_STYLES = """
<style>
.email-wrap { background: #f4f4f4; padding: 32px 16px; font-family: Georgia, 'Times New Roman', serif; }
.email-card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 4px; overflow: hidden; }
.email-header { background: #D9232D; padding: 32px 40px; text-align: center; }
.email-logo { color: #ffffff; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; font-family: Arial, sans-serif; margin-bottom: 8px; opacity: 0.85; }
.email-logo-name { color: #ffffff; font-size: 22px; font-weight: bold; font-family: Georgia, serif; margin: 0; letter-spacing: 1px; }
.email-divider { width: 40px; height: 2px; background: #ffffff; opacity: 0.4; margin: 14px auto 0; }
.email-body { padding: 36px 40px 28px; }
.email-greeting { font-size: 20px; color: #1a1a1a; margin: 0 0 16px; font-family: Georgia, serif; }
.email-text { font-size: 15px; color: #444; line-height: 1.75; margin: 0 0 20px; font-family: Arial, sans-serif; }
.email-highlight { background: #fff5f5; border-left: 3px solid #D9232D; padding: 14px 18px; margin: 20px 0; border-radius: 0 4px 4px 0; }
.email-highlight p { margin: 4px 0; font-size: 14px; color: #333; font-family: Arial, sans-serif; }
.email-highlight .label { font-weight: bold; color: #D9232D; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.email-btn-wrap { text-align: center; margin: 28px 0 8px; }
.email-btn { display: inline-block; background: #D9232D; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 3px; font-size: 14px; font-family: Arial, sans-serif; letter-spacing: 0.5px; font-weight: bold; }
.email-footer { background: #f9f9f9; border-top: 1px solid #ebebeb; padding: 20px 40px; text-align: center; }
.email-footer p { font-size: 12px; color: #999; font-family: Arial, sans-serif; margin: 4px 0; line-height: 1.6; }
.email-footer a { color: #D9232D; text-decoration: none; }
</style>
"""

def _wrap(body_html: str, recipient_name: str = '') -> str:
    """Wrap email body in the standard Bertie Foundation header/footer shell."""
    greeting = f"Hello, {recipient_name}!" if recipient_name else "Hello!"
    return f"""
{EMAIL_STYLES}
<div class="email-wrap">
  <div class="email-card">
    <div class="email-header">
      <div class="email-logo">The</div>
      <div class="email-logo-name">Bertie Foundation</div>
      <div class="email-divider"></div>
    </div>
    <div class="email-body">
      <p class="email-greeting">{greeting}</p>
      {body_html}
    </div>
    <div class="email-footer">
      <p>© 2026 The Bertie Foundation &nbsp;·&nbsp; <a href="https://bertiefoundation.org">bertiefoundation.org</a></p>
      <p>info@bertiefoundation.org &nbsp;·&nbsp; <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</div>
"""


# ─── Contact Form Confirmation ────────────────────────────────────────────────

def contact_confirmation(name: str, message_preview: str) -> str:
    body = f"""
      <p class="email-text">Thank you for reaching out to the Bertie Foundation. We have received your message and one of our team members will be in touch with you within <strong>24–48 hours</strong>.</p>
      <div class="email-highlight">
        <p class="label">Your message</p>
        <p style="margin-top:8px; font-style:italic; color:#555;">"{message_preview}"</p>
      </div>
      <p class="email-text">In the meantime, we invite you to explore our website to learn more about our programs, community impact, and upcoming events.</p>
      <div class="email-btn-wrap">
        <a href="https://bertiefoundation.org" class="email-btn">Visit Our Website</a>
      </div>
    """
    return _wrap(body, name)


# ─── Volunteer Application Confirmation ───────────────────────────────────────

def volunteer_confirmation(name: str, interests: list[str], availability: str) -> str:
    interests_str = ', '.join(interests) if interests else '—'
    body = f"""
      <p class="email-text">We are thrilled to welcome you to the Bertie Foundation volunteer family! Your application has been received and is currently under review.</p>
      <div class="email-highlight">
        <p class="label">Your application details</p>
        <p style="margin-top:8px;color:#555;"><strong>Interests:</strong> {interests_str}</p>
        <p style="color:#555;"><strong>Availability:</strong> {availability or '—'}</p>
      </div>
      <p class="email-text">A member of our team will reach out to you soon with next steps. We look forward to making a difference together.</p>
      <div class="email-btn-wrap">
        <a href="https://bertiefoundation.org" class="email-btn">Learn More About Us</a>
      </div>
    """
    return _wrap(body, name)


# ─── Donation Confirmation ────────────────────────────────────────────────────

def donation_confirmation(name: str, amount: str, date: str, program: str) -> str:
    body = f"""
      <p class="email-text">Your generosity means the world to us and to the community we serve. We are deeply grateful for your contribution to the Bertie Foundation.</p>
      <div class="email-highlight">
        <p class="label">Donation confirmation</p>
        <p style="margin-top:8px;color:#555;"><strong>Amount:</strong> {amount}</p>
        <p style="color:#555;"><strong>Date:</strong> {date}</p>
        <p style="color:#555;"><strong>Program:</strong> {program}</p>
      </div>
      <p class="email-text">Your donation directly supports our programs and creates lasting impact in the lives of those we serve. Thank you for believing in our mission.</p>
      <div class="email-btn-wrap">
        <a href="https://bertiefoundation.org/impact" class="email-btn">See Our Impact</a>
      </div>
    """
    return _wrap(body, name)


# ─── Newsletter Welcome ───────────────────────────────────────────────────────

def newsletter_welcome() -> str:
    body = """
      <p class="email-text">You are now officially part of the Bertie Foundation community. We are so glad to have you with us.</p>
      <p class="email-text">As a subscriber, you will be the first to know about:</p>
      <div class="email-highlight">
        <p style="margin:4px 0;color:#555;">&#10003; &nbsp;Volunteer opportunities</p>
        <p style="margin:4px 0;color:#555;">&#10003; &nbsp;Community events and programs</p>
        <p style="margin:4px 0;color:#555;">&#10003; &nbsp;Impact stories from our community</p>
        <p style="margin:4px 0;color:#555;">&#10003; &nbsp;Ways to get involved and give back</p>
      </div>
      <p class="email-text">We are excited to share our journey with you.</p>
      <div class="email-btn-wrap">
        <a href="https://bertiefoundation.org" class="email-btn">Explore Our Website</a>
      </div>
    """
    return _wrap(body, '')


# ─── Story Submission Confirmation ───────────────────────────────────────────

def story_confirmation(name: str, story_title: str, submitted_date: str) -> str:
    body = f"""
      <p class="email-text">Thank you for sharing your story with the Bertie Foundation. Submissions like yours inspire our entire community and remind us why this work matters so much.</p>
      <div class="email-highlight">
        <p class="label">Story received</p>
        <p style="margin-top:8px;font-style:italic;color:#555;">"{story_title}"</p>
        <p style="color:#999;font-size:13px;">Under review · Submitted {submitted_date}</p>
      </div>
      <p class="email-text">Once approved by our team, your story will be featured on our website to inspire others in the community.</p>
      <div class="email-btn-wrap">
        <a href="https://bertiefoundation.org" class="email-btn">Visit Our Website</a>
      </div>
    """
    return _wrap(body, name)

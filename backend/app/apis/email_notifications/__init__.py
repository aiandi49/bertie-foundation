
<style>
.email-wrap { background: #f4f4f4; padding: 32px 16px; font-family: Georgia, 'Times New Roman', serif; }
.email-card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 4px; overflow: hidden; }
.email-header { background: #6B0000; padding: 32px 40px; text-align: center; }
.email-header img-placeholder { display:block; }
.email-logo { color: #ffffff; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; font-family: Arial, sans-serif; margin-bottom: 8px; opacity: 0.8; }
.email-logo-name { color: #ffffff; font-size: 22px; font-weight: bold; font-family: Georgia, serif; margin: 0; letter-spacing: 1px; }
.email-divider { width: 40px; height: 2px; background: #c9a84c; margin: 14px auto 0; }
.email-body { padding: 36px 40px 28px; }
.email-greeting { font-size: 20px; color: #1a1a1a; margin: 0 0 16px; font-family: Georgia, serif; }
.email-text { font-size: 15px; color: #444; line-height: 1.75; margin: 0 0 20px; font-family: Arial, sans-serif; }
.email-highlight { background: #fdf8ee; border-left: 3px solid #c9a84c; padding: 14px 18px; margin: 20px 0; border-radius: 0 4px 4px 0; }
.email-highlight p { margin: 4px 0; font-size: 14px; color: #333; font-family: Arial, sans-serif; }
.email-highlight .label { font-weight: bold; color: #6B0000; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.email-btn-wrap { text-align: center; margin: 28px 0 8px; }
.email-btn { display: inline-block; background: #6B0000; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 3px; font-size: 14px; font-family: Arial, sans-serif; letter-spacing: 0.5px; font-weight: bold; }
.email-footer { background: #f9f9f9; border-top: 1px solid #ebebeb; padding: 20px 40px; text-align: center; }
.email-footer p { font-size: 12px; color: #999; font-family: Arial, sans-serif; margin: 4px 0; line-height: 1.6; }
.email-footer a { color: #6B0000; text-decoration: none; }
.tab-row { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.tab { padding: 7px 14px; border-radius: 20px; font-size: 13px; cursor: pointer; border: 1px solid #ddd; background: #fff; color: #555; font-family: Arial, sans-serif; }
.tab.active { background: #6B0000; color: #fff; border-color: #6B0000; }
</style>

<div class="tab-row">
  <button class="tab active" onclick="showTab('contact')">Contact form</button>
  <button class="tab" onclick="showTab('volunteer')">Volunteer</button>
  <button class="tab" onclick="showTab('donation')">Donation</button>
  <button class="tab" onclick="showTab('newsletter')">Newsletter</button>
  <button class="tab" onclick="showTab('story')">Share story</button>
</div>

<div class="email-wrap">
  <div class="email-card">
    <div class="email-header">
      <div class="email-logo">The</div>
      <div class="email-logo-name">Bertie Foundation</div>
      <div class="email-divider"></div>
    </div>

    <div class="email-body" id="email-body">
      <p class="email-greeting">Hello, Marcus!</p>
      <p class="email-text">Thank you for reaching out to the Bertie Foundation. We have received your message and one of our team members will be in touch with you within <strong>24–48 hours</strong>.</p>
      <div class="email-highlight">
        <p class="label">Your message</p>
        <p style="margin-top:8px; font-style:italic; color:#555;">"I would love to learn more about your mentorship programs and how I can get involved in the community."</p>
      </div>
      <p class="email-text">In the meantime, we invite you to explore our website to learn more about our programs, community impact, and upcoming events.</p>
      <div class="email-btn-wrap">
        <a href="#" class="email-btn">Visit Our Website</a>
      </div>
    </div>

    <div class="email-footer">
      <p>© 2026 The Bertie Foundation &nbsp;·&nbsp; <a href="#">bertiefoundation.org</a></p>
      <p>info@bertiefoundation.org &nbsp;·&nbsp; <a href="#">Unsubscribe</a></p>
    </div>
  </div>
</div>

<script>
const templates = {
  contact: {
    greeting: 'Hello, Marcus!',
    body: `<p class="email-text">Thank you for reaching out to the Bertie Foundation. We have received your message and one of our team members will be in touch with you within <strong>24–48 hours</strong>.</p>
    <div class="email-highlight"><p class="label">Your message</p><p style="margin-top:8px;font-style:italic;color:#555;">"I would love to learn more about your mentorship programs and how I can get involved in the community."</p></div>
    <p class="email-text">In the meantime, we invite you to explore our website to learn more about our programs, community impact, and upcoming events.</p>
    <div class="email-btn-wrap"><a href="#" class="email-btn">Visit Our Website</a></div>`
  },
  volunteer: {
    greeting: 'Hello, Marcus!',
    body: `<p class="email-text">We are thrilled to welcome you to the Bertie Foundation volunteer family! Your application has been received and is currently under review.</p>
    <div class="email-highlight">
      <p class="label">Your application details</p>
      <p style="margin-top:8px;color:#555;"><strong>Interests:</strong> Mentorship, Community Events</p>
      <p style="color:#555;"><strong>Availability:</strong> Weekends</p>
    </div>
    <p class="email-text">A member of our team will reach out to you soon with next steps. We look forward to making a difference together.</p>
    <div class="email-btn-wrap"><a href="#" class="email-btn">Learn More About Us</a></div>`
  },
  donation: {
    greeting: 'Hello, Marcus!',
    body: `<p class="email-text">Your generosity means the world to us and to the community we serve. We are deeply grateful for your contribution to the Bertie Foundation.</p>
    <div class="email-highlight">
      <p class="label">Donation confirmation</p>
      <p style="margin-top:8px;color:#555;"><strong>Amount:</strong> $150.00</p>
      <p style="color:#555;"><strong>Date:</strong> June 3, 2026</p>
      <p style="color:#555;"><strong>Program:</strong> Youth Mentorship</p>
    </div>
    <p class="email-text">Your donation directly supports our programs and creates lasting impact in the lives of those we serve. Thank you for believing in our mission.</p>
    <div class="email-btn-wrap"><a href="#" class="email-btn">See Our Impact</a></div>`
  },
  newsletter: {
    greeting: 'Welcome to the family!',
    body: `<p class="email-text">You are now officially part of the Bertie Foundation community. We are so glad to have you with us.</p>
    <p class="email-text">As a subscriber, you will be the first to know about:</p>
    <div class="email-highlight">
      <p style="margin:4px 0;color:#555;">&#10003; &nbsp;Volunteer opportunities</p>
      <p style="margin:4px 0;color:#555;">&#10003; &nbsp;Community events and programs</p>
      <p style="margin:4px 0;color:#555;">&#10003; &nbsp;Impact stories from our community</p>
      <p style="margin:4px 0;color:#555;">&#10003; &nbsp;Ways to get involved and give back</p>
    </div>
    <p class="email-text">We are excited to share our journey with you.</p>
    <div class="email-btn-wrap"><a href="#" class="email-btn">Explore Our Website</a></div>`
  },
  story: {
    greeting: 'Hello, Marcus!',
    body: `<p class="email-text">Thank you for sharing your story with the Bertie Foundation. Submissions like yours inspire our entire community and remind us why this work matters so much.</p>
    <div class="email-highlight">
      <p class="label">Story received</p>
      <p style="margin-top:8px;font-style:italic;color:#555;">"How the Bertie Foundation changed my life"</p>
      <p style="color:#999;font-size:13px;">Under review · Submitted June 3, 2026</p>
    </div>
    <p class="email-text">Once approved by our team, your story will be featured on our website to inspire others in the community.</p>
    <div class="email-btn-wrap"><a href="#" class="email-btn">Visit Our Website</a></div>`
  }
};

function showTab(key) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  const t = templates[key];
  document.getElementById('email-body').innerHTML = `<p class="email-greeting">${t.greeting}</p>${t.body}`;
}
</script>

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { first_name, last_name, email, firm, subject, message } = req.body;

  if (!first_name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Suncerray Capital Contact Form <onboarding@resend.dev>',
        to: ['info@suncerraycapital.com'],
        reply_to: email,
        subject: `New Inquiry — ${subject || 'General'} from ${first_name} ${last_name}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #0a0a0a;">
            <h2 style="font-size: 24px; font-weight: 400; margin-bottom: 32px; border-bottom: 1px solid #e8e4df; padding-bottom: 16px;">
              New Contact Form Submission
            </h2>
            <table style="width: 100%; font-size: 15px; line-height: 1.8;">
              <tr>
                <td style="color: #8c8882; width: 140px; padding: 6px 0;">Name</td>
                <td style="padding: 6px 0;">${first_name} ${last_name}</td>
              </tr>
              <tr>
                <td style="color: #8c8882; padding: 6px 0;">Email</td>
                <td style="padding: 6px 0;">${email}</td>
              </tr>
              ${firm ? `<tr>
                <td style="color: #8c8882; padding: 6px 0;">Firm</td>
                <td style="padding: 6px 0;">${firm}</td>
              </tr>` : ''}
              <tr>
                <td style="color: #8c8882; padding: 6px 0;">Regarding</td>
                <td style="padding: 6px 0;">${subject || 'General Inquiry'}</td>
              </tr>
            </table>
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e8e4df;">
              <p style="color: #8c8882; font-size: 13px; margin-bottom: 12px; letter-spacing: 0.1em; text-transform: uppercase;">Message</p>
              <p style="font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${message}</p>
            </div>
            <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e8e4df; font-size: 12px; color: #8c8882;">
              Suncerray Capital Inc. &nbsp;·&nbsp; San Antonio, TX &nbsp;·&nbsp; suncerraycapital.com
            </div>
          </div>
        `
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

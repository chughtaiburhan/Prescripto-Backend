# Email Configuration Setup Guide

## 📧 Email Service Configuration

The email verification system is currently set up for development. To enable real email sending in production, follow these steps:

## 🔧 Setup Options

### Option 1: Gmail SMTP (Recommended for testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"

3. **Add Environment Variables**:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### Option 2: SendGrid (Recommended for production)

1. **Create SendGrid Account** at sendgrid.com
2. **Verify Sender Domain** or use Single Sender Verification
3. **Get API Key** from SendGrid dashboard

4. **Add Environment Variables**:
```env
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=your-verified-email@yourdomain.com
```

### Option 3: AWS SES

1. **Set up AWS SES** in your AWS account
2. **Verify Email Address** or domain
3. **Get AWS credentials**

4. **Add Environment Variables**:
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
EMAIL_FROM=your-verified-email@yourdomain.com
```

## 🚀 Implementation

### For Gmail SMTP:
```bash
npm install nodemailer @types/nodemailer
```

### For SendGrid:
```bash
npm install @sendgrid/mail
```

### For AWS SES:
```bash
npm install @aws-sdk/client-ses
```

## 📝 Current Features

- ✅ **4-digit verification codes**
- ✅ **Beautiful HTML email templates**
- ✅ **5-minute expiration**
- ✅ **Development mode with console logging**
- ✅ **Production-ready structure**

## 🔒 Security Features

- ✅ **Email validation**
- ✅ **Code expiration**
- ✅ **One-time use codes**
- ✅ **Rate limiting protection**

## 📱 User Experience

- ✅ **Top popup notification**
- ✅ **Auto-fill verification code**
- ✅ **Copy to clipboard button**
- ✅ **Countdown timer for resend**
- ✅ **Role-based redirects after verification**

## 🛠️ Development vs Production

### Development Mode:
- Shows verification code in top popup
- Logs email content to console
- Auto-fills verification code
- No real email sending

### Production Mode:
- Sends real emails
- Hides verification code from frontend
- Professional email templates
- Secure email delivery

## 📞 Support

For email configuration issues:
1. Check environment variables
2. Verify email service credentials
3. Test with development mode first
4. Check email service logs 
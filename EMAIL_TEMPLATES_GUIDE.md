# 📧 Email Templates Customization Guide

This guide explains how to customize the email templates sent by Supabase for Cognicare, including the signup confirmation email.

---

## 📋 Overview

Supabase sends several types of emails:
1. **Confirm signup** - Email confirmation when user signs up
2. **Magic link** - Passwordless login link
3. **Change email address** - Email change confirmation
4. **Reset password** - Password reset link
5. **Invite user** - User invitation (admin)

---

## 🎨 Customizing Email Templates in Supabase

### Step 1: Access Email Templates

1. **Go to Supabase Dashboard**
   - Navigate to your project: https://app.supabase.com
   - Click on **Authentication** in the left sidebar
   - Click on **Email Templates** tab

### Step 2: Customize Confirm Signup Email

This is the email users receive when they sign up.

#### Recommended Template (Arabic/English Bilingual)

```html
<h2>مرحباً بك في Cognicare! 🧠</h2>
<h2>Welcome to Cognicare! 🧠</h2>

<p>شكراً لك على الانضمام إلى منصة Cognicare - منصة دعم شاملة للأطفال ذوي الاحتياجات الخاصة.</p>
<p>Thank you for joining Cognicare - a comprehensive support platform for children with special needs.</p>

<p><strong>يرجى تأكيد بريدك الإلكتروني للبدء:</strong></p>
<p><strong>Please confirm your email address to get started:</strong></p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
    تأكيد البريد الإلكتروني / Confirm Email
  </a>
</p>

<p>أو انسخ الرابط التالي في المتصفح:</p>
<p>Or copy this link into your browser:</p>
<p style="word-break: break-all; color: #14b8a6;">{{ .ConfirmationURL }}</p>

<hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">

<h3>ما بعد التفعيل:</h3>
<h3>After Confirmation:</h3>

<ul style="text-align: right; direction: rtl;">
  <li>سجل الدخول إلى حسابك</li>
  <li>أضف معلومات طفلك</li>
  <li>ابدأ استخدام الألعاب والتحليلات</li>
  <li>تواصل مع المجتمع والأخصائيين</li>
</ul>

<ul style="text-align: left; direction: ltr;">
  <li>Log in to your account</li>
  <li>Add your child's information</li>
  <li>Start using games and analytics</li>
  <li>Connect with the community and specialists</li>
</ul>

<hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">

<p style="color: #6b7280; font-size: 12px;">
  إذا لم تطلب هذا الحساب، يمكنك تجاهل هذه الرسالة.<br>
  If you didn't request this account, you can safely ignore this email.
</p>

<p style="color: #6b7280; font-size: 12px;">
  © 2024 Cognicare. جميع الحقوق محفوظة.<br>
  © 2024 Cognicare. All rights reserved.
</p>
```

#### Template Variables Available

- `{{ .ConfirmationURL }}` - The confirmation link
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Confirmation token (if needed)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL

### Step 3: Customize Reset Password Email

```html
<h2>إعادة تعيين كلمة المرور</h2>
<h2>Reset Password</h2>

<p>لقد طلبت إعادة تعيين كلمة المرور لحسابك في Cognicare.</p>
<p>You requested to reset your password for your Cognicare account.</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    إعادة تعيين كلمة المرور / Reset Password
  </a>
</p>

<p style="color: #ef4444; font-size: 14px;">
  <strong>ملاحظة:</strong> هذا الرابط صالح لمدة ساعة واحدة فقط.<br>
  <strong>Note:</strong> This link is valid for 1 hour only.
</p>

<p style="color: #6b7280; font-size: 12px;">
  إذا لم تطلب إعادة التعيين، يمكنك تجاهل هذه الرسالة.<br>
  If you didn't request a password reset, you can safely ignore this email.
</p>
```

### Step 4: Customize Magic Link Email

```html
<h2>رابط تسجيل الدخول السحري</h2>
<h2>Magic Link</h2>

<p>انقر على الرابط أدناه لتسجيل الدخول إلى Cognicare:</p>
<p>Click the link below to sign in to Cognicare:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    تسجيل الدخول / Sign In
  </a>
</p>

<p style="color: #6b7280; font-size: 12px;">
  هذا الرابط صالح لمدة ساعة واحدة فقط.<br>
  This link is valid for 1 hour only.
</p>
```

---

## 🎨 Branding Your Emails

### Recommended Settings

1. **From Name**: `Cognicare`
2. **From Email**: `noreply@cognicare.tn` (or your domain)
3. **Reply To**: `support@cognicare.tn`
4. **Subject Lines**:
   - Confirm signup: `تأكيد حسابك في Cognicare / Confirm your Cognicare account`
   - Reset password: `إعادة تعيين كلمة المرور / Reset your password`
   - Magic link: `رابط تسجيل الدخول / Sign in to Cognicare`

### Color Scheme

Use Cognicare brand colors:
- **Primary**: `#14b8a6` (Teal)
- **Secondary**: `#06b6d4` (Cyan)
- **Text**: `#1f2937` (Dark gray)
- **Background**: `#ffffff` (White)

---

## 📝 Step-by-Step Instructions

### In Supabase Dashboard:

1. **Go to Authentication → Email Templates**

2. **Select Template Type**
   - Click on "Confirm signup" template

3. **Edit the Template**
   - Replace the default template with the custom one above
   - Use the variables like `{{ .ConfirmationURL }}`

4. **Preview**
   - Use the "Preview" button to see how it looks
   - Test with different email clients

5. **Save**
   - Click "Save" to apply changes

6. **Test**
   - Sign up with a test email
   - Verify the email looks correct
   - Check spam folder if needed

---

## 🔧 Advanced: Custom SMTP (Optional)

For better deliverability and branding, you can use custom SMTP:

### Step 1: Get SMTP Credentials

Use a service like:
- **SendGrid** (recommended)
- **Mailgun**
- **Amazon SES**
- **Postmark**

### Step 2: Configure in Supabase

1. Go to **Authentication → Settings**
2. Scroll to **SMTP Settings**
3. Enable **Custom SMTP**
4. Enter your SMTP credentials:
   - Host: `smtp.sendgrid.net` (example)
   - Port: `587`
   - Username: Your SMTP username
   - Password: Your SMTP password
   - Sender email: `noreply@cognicare.tn`
   - Sender name: `Cognicare`

### Step 3: Verify Domain (Recommended)

1. Add SPF record to your domain
2. Add DKIM record
3. Verify in Supabase dashboard

---

## 🌍 Multi-Language Support

The templates above include both Arabic and English. For French support, add:

```html
<h2>Bienvenue sur Cognicare! 🧠</h2>
<p>Merci de rejoindre Cognicare - une plateforme de soutien complète pour les enfants ayant des besoins spéciaux.</p>
```

---

## ✅ Testing Checklist

After customizing templates:

- [ ] Test signup confirmation email
- [ ] Test password reset email
- [ ] Test magic link email
- [ ] Verify emails work in:
  - [ ] Gmail
  - [ ] Outlook
  - [ ] Apple Mail
  - [ ] Mobile email clients
- [ ] Check spam folder
- [ ] Verify links work correctly
- [ ] Test RTL layout for Arabic
- [ ] Verify branding colors

---

## 🐛 Troubleshooting

### Emails not sending?

1. Check **Authentication → Settings → Email Auth**
   - Ensure "Enable email provider" is ON
   - Check "Confirm email" setting

2. Check **Rate Limits**
   - Supabase has rate limits on free tier
   - Upgrade if needed

3. Check **SMTP Settings**
   - If using custom SMTP, verify credentials
   - Check SMTP logs

### Emails going to spam?

1. **Use Custom SMTP** (better deliverability)
2. **Verify Domain** (SPF, DKIM records)
3. **Warm up domain** (gradually increase sending)
4. **Avoid spam trigger words** in subject/content

### Links not working?

1. Check **Site URL** in Supabase settings
2. Verify `{{ .ConfirmationURL }}` is in template
3. Check redirect URLs in Authentication settings

---

## 📚 Additional Resources

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Email Best Practices](https://supabase.com/docs/guides/auth/auth-email)

---

## 💡 Tips

1. **Keep it simple** - Don't overload with too much text
2. **Clear call-to-action** - Make the button prominent
3. **Mobile-friendly** - Test on mobile devices
4. **Bilingual** - Support Arabic and English (and French)
5. **Brand consistency** - Use Cognicare colors and logo
6. **Security** - Include expiration times for links
7. **Help text** - Include "didn't request this?" message

---

**Need help?** Check the [SETUP.md](./SETUP.md) for more configuration details.


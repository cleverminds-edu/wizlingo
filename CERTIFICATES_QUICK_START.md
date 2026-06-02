# Certificates Quick Start Guide

## How It Works

When a student earns a major badge (WORD_WIZARD, VOICE_WIZARD, LANGUAGE_WIZARD, GRAND_WIZARD), they automatically get:
1. A downloadable PDF certificate
2. A public verification page with QR code
3. A shareable link with unique verification code

## Using Certificates

### For Students
1. **View Certificate**: Navigate to `/certificate/[verifyCode]`
2. **Download PDF**: Click "📥 Download PDF" button
3. **Print**: Click "🖨️ Print Certificate" button
4. **Share**: Copy the certificate URL or scan QR code

### For Parents/Guardians
1. **Verify Certificate**: Scan QR code on certificate
2. **View Details**: Certificate verification page shows:
   - Student name
   - Badge type and emoji
   - Achievement description
   - Issue date
   - Unique verification code

## API Quick Reference

### Generate Certificate
```bash
POST /api/certificates/generate
Content-Type: application/json

{
  "studentId": "student_id",
  "badgeType": "WORD_WIZARD"
}
```

### Download Certificate
```bash
GET /api/certificates/download?studentId=student_id&badgeType=WORD_WIZARD&verifyCode=ABC123DEF456
```

### Verify Certificate
```bash
GET /api/certificates/verify?code=ABC123DEF456
```

## Component Usage

```tsx
import CertificateDownloadButton from '@/components/certificate-download-button';

<CertificateDownloadButton
  studentId="student_id"
  badgeType="WORD_WIZARD"
  verifyCode="ABC123DEF456"
/>
```

## Certificate Types

### SPARK (✨)
- Awarded on first session
- "Reading Journey Begins"
- Orange/Yellow colors

### WORD_WIZARD (📚)
- 80%+ reading accuracy
- "Reading Comprehension Mastery"
- Blue/Indigo colors

### VOICE_WIZARD (🎤)
- 75%+ speaking fluency
- "Speaking Fluency Master"
- Purple/Pink colors

### LANGUAGE_WIZARD (🧙)
- 10+ sessions completed
- "Consistent Learning Dedication"
- Green/Teal colors

### GRAND_WIZARD (👑)
- All 4 badges earned
- "Language Legend"
- Amber/Gold colors

## Key Features

✓ Professional, printable certificates
✓ QR codes for verification
✓ Unique verification codes
✓ No server-side PDF dependencies
✓ Mobile-responsive design
✓ Public verification (shareable)
✓ Automatic creation with badges
✓ Beautiful, branded styling

## Customization

Edit certificate content in `lib/certificate-templates.ts`:
- Change colors in `CERTIFICATE_STYLES`
- Modify text in `CERTIFICATE_TEMPLATES`
- Adjust layout in `generateCertificatePDFAsHTML()`

## File Locations

| File | Purpose |
|------|---------|
| `lib/certificate-templates.ts` | Certificate content & styling |
| `lib/pdf-certificate-generator.ts` | HTML/PDF generation |
| `components/certificate-download-button.tsx` | Download button component |
| `app/api/certificates/generate/route.ts` | Generate endpoint |
| `app/api/certificates/download/route.ts` | Download endpoint |
| `app/api/certificates/verify/route.ts` | Verify endpoint |
| `app/certificate/[verifyCode]/page.tsx` | Certificate viewer page |

## Database

Certificates are auto-created when badges are earned:

```typescript
// In lib/badges.ts
await prisma.badge.create({ data: { studentId, type } });
await prisma.certificate.create({
  data: { studentId, badgeType: type }
});
```

## Troubleshooting

**PDF not downloading?**
- Check browser console for errors
- Ensure html2pdf.js CDN is accessible
- Verify student has earned the badge

**QR code not scanning?**
- Use another QR reader app
- Check that domain is accessible
- Verify verifyCode in URL

**Certificate not showing?**
- Check verifyCode is correct
- Verify student/badge exists in database
- Check network tab for API errors

## Next Steps

1. **Test**: Generate a certificate for a test student
2. **Customize**: Adjust colors/text as needed
3. **Share**: Copy certificate URL to share with parents
4. **Monitor**: Track certificate downloads in analytics
5. **Enhance**: Add email notifications when certificates are earned

---

For detailed documentation, see `CERTIFICATES_IMPLEMENTATION.md`

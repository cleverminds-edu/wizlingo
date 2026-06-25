# Google Cloud Text-to-Speech Setup Guide

## Overview
This guide shows how to enable high-quality Google Cloud TTS for WizLingo, replacing the robotic Web Speech API.

**Quality Improvement:** From 4/10 (Web Speech) → 9/10 (Google Cloud)  
**Cost:** ~$72/year for 100 students  
**Setup Time:** 10 minutes

---

## Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click "Select a Project" → "New Project"
3. Name it: `wizlingo-tts`
4. Click "Create"
5. Wait 1-2 minutes for project to be created

---

## Step 2: Enable Text-to-Speech API

1. In Google Cloud Console, search for "Text-to-Speech"
2. Click "Text-to-Speech API"
3. Click "Enable"
4. Wait 30 seconds

---

## Step 3: Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in:
   - **Service account name:** `wizlingo-tts`
   - **Service account ID:** Auto-filled, keep as is
   - Click "Create and Continue"
4. Click "Continue" (optional roles)
5. Click "Done"

---

## Step 4: Create API Key

1. Click the created service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON"
5. Click "Create"
6. A JSON file downloads automatically

**Save this file securely!** This is your credentials.

---

## Step 5: Get API Key String

There are two ways to set up credentials:

### Option A: API Key (Simpler)
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key (looks like: `AIzaSy...`)

### Option B: Service Account JSON (More Secure)
Use the JSON file downloaded in Step 4

---

## Step 6: Add to Railway

### Option A: Using API Key

```bash
railway variables set GOOGLE_TTS_API_KEY your_api_key_here
```

Replace `your_api_key_here` with the API key from Step 5.

### Option B: Using Service Account JSON

```bash
railway variables set GOOGLE_APPLICATION_CREDENTIALS /path/to/credentials.json
```

Or base64 encode it:

```bash
# Encode the JSON file
cat /path/to/credentials.json | base64

# Set in Railway
railway variables set GOOGLE_APPLICATION_CREDENTIALS_B64 output_from_above
```

---

## Step 7: Verify Setup

Check that the variable is set:

```bash
railway variables list | grep GOOGLE
```

Should show:
```
GOOGLE_TTS_API_KEY=AIzaSy...
```

---

## Step 8: Test

Deploy the app:

```bash
railway up
```

Then:
1. Start a speaking session
2. Check browser console
3. Look for: `✅ Using Google Cloud TTS`

If you see `⚠️ Google TTS not available`, the API key isn't set correctly.

---

## Troubleshooting

### "Google TTS not configured"
- API key not set in Railway variables
- **Fix:** Run Step 6

### "Authentication failed"
- API key is wrong or expired
- **Fix:** Create a new API key

### "Rate limited"
- Too many requests too quickly
- **Fix:** Normal, API has rate limiting. Try again.

### "No audio content in response"
- Text might be empty
- Character might not be recognized
- **Fix:** Check the text being sent

---

## Monitoring Costs

Google Cloud gives:
- ✅ Free tier: 1 million characters/month
- ✅ After: $4 per million characters

Track usage:
1. Go to Google Cloud Console
2. Navigation menu → "Billing"
3. Select your project
4. See breakdown by service

---

## Character Voice Mapping

The app automatically maps characters to voices:

**Female Voices:**
- Mom, Sarah, Emma, Aisha, Teacher, Librarian, Maya, Eco, Meera
- → `en-IN-Standard-A` (warm, natural)

**Male Voices:**
- Alex, Jamie, Ravi, Professor, Chef, Explorer, Coach, Tech, Sage, Mentor, Marco
- → `en-IN-Standard-B` (professional, clear)

---

## Fallback Behavior

If Google TTS isn't available:
1. App checks for API key
2. If not found, uses Web Speech API (browser native)
3. Students still get speaking sessions, just with robotic voice

---

## Next Steps

After setup:
1. ✅ Deploy with `railway up`
2. ✅ Test speaking sessions
3. ✅ Monitor costs in Google Cloud Console
4. ✅ Collect user feedback on voice quality

---

## Support

**Issue:** Voices sound wrong?
- Check character voice mapping in `lib/google-tts.ts`

**Issue:** API cost too high?
- Reduce speech synthesis usage
- Or switch to cheaper TTS (ElevenLabs, Azure)

**Issue:** Setup errors?
- Check Railway variables are set correctly
- Verify API key has Text-to-Speech permission
- Check Google Cloud quota (usually unlimited)


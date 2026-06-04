# 🌐 Domain Strategy: WizLingo Subdomain vs Separate Domain

**Decision Point:** Should WizLingo use `wizlingo.edvanta.co.in` or `wizlingo.app`?

---

## 📊 Comparison

| Factor | `wizlingo.edvanta.co.in` | `wizlingo.app` |
|--------|-------------------------|------------------|
| **URL Length** | Long (27 chars) | Short (12 chars) |
| **Brand Identity** | Tied to Edvanta | Independent brand |
| **Typing on Phone** | Hard (subdomains + .co.in) | Easy (just "wizlingo.app") |
| **Brand Recognition** | Shares parent brand | Standalone product |
| **B2C Growth** | Limits growth (too corporate) | Perfect for consumer apps |
| **SEO** | Inherits Edvanta domain authority | Starts fresh, builds independent |
| **Cost** | Free (subdomain) | $10-12/year |
| **Future Pivot** | Hard (locked to Edvanta brand) | Easy (independent) |
| **School Perception** | "Part of Edvanta" | "Professional EdTech" |

---

## 🎯 Recommendation by Stage

### Stage 1: Pilot Schools (June-July 2026)
**Use:** `wizlingo.edvanta.co.in`
- **Why:** Cost savings, internal testing, school trust from Edvanta connection
- **Setup:** 5 minutes (add DNS record)
- **Teachers see:** Edvanta-backed product → increased trust

### Stage 2: B2B Expansion (Aug-Dec 2026)
**Upgrade to:** `wizlingo.co.in` (preferred) OR `wizlingo.app`
- **Why:** Scale beyond Edvanta; establish independent brand
- **When:** After proving success with 5+ schools
- **Redirect:** Keep subdomain pointing to new domain

### Stage 3: Public Beta (Jan 2027+)
**Lock in:** `wizlingo.co.in` (Indian schools) + `wizlingo.app` (global)
- **Why:** Separate branded website, international reach
- **Setup:** Domain + SSL certificate

---

## 🔧 Technical Setup

### Option 1: Subdomain (Now)

**DNS Record (Add to edvanta.co.in):**
```
wizlingo  CNAME  app.railway.app  (or your hosting)
```

**In Code:**
```env
# .env.local
NEXT_PUBLIC_APP_URL=https://wizlingo.edvanta.co.in
```

**In Next.js:**
```typescript
// No changes needed — automatic from env var
```

**Cost:** $0 (free with Edvanta domain)  
**Setup Time:** 5 minutes  
**Traffic:** app.railway.app → wizlingo.edvanta.co.in

---

### Option 2: Separate Domain (June)

**Buy Domain:**
```bash
# Recommended registrars
Domain.com    → wizlingo.co.in ($4-6/year)
GoDaddy       → wizlingo.co.in ($10/year)
Namecheap     → wizlingo.app ($8.88/year)
```

**DNS Setup (Route 53 or your registrar):**
```
wizlingo.co.in  A    35.201.123.45  (Railway IP)
                AAAA 2600:1901:...  (IPv6)
```

**SSL Certificate:** Auto-setup via Railway (free)

**In Code:**
```env
# .env.local
NEXT_PUBLIC_APP_URL=https://wizlingo.co.in
```

**Cost:** $5-12/year  
**Setup Time:** 15 minutes (wait for DNS propagation 2-24h)  
**Traffic:** Direct to app

---

## 🚀 Recommended Timeline

### **Right Now (June 7):**
- Use `wizlingo.edvanta.co.in`
- Add DNS record pointing to Railway
- Launch with pilot schools
- Zero cost, instant trust from Edvanta brand

### **After Pilot Success (July 15):**
- Register `wizlingo.co.in` ($4-6/year)
- Update DNS to point to your app
- Keep subdomain as redirect for existing links
- Announce "WizLingo is now independent brand"

### **Public Launch (Jan 2027):**
- Both `wizlingo.co.in` (primary) and `wizlingo.app` (backup)
- Global presence with .app domain
- Optional: `wizlingo.com` if budget allows

---

## 📱 Student Experience

### Subdomain (Now)
```
Student QR Code → wizlingo.edvanta.co.in
Manual URL → Long, hard to remember
Teacher shares → "Go to Edvanta's WizLingo"
Parent Google → "Edvanta Education"
```

### Separate Domain (Later)
```
Student QR Code → wizlingo.co.in
Manual URL → Short, easy to remember
Teacher shares → "Go to WizLingo"
Parent Google → "WizLingo" (future)
```

---

## 🎨 Branding Impact

### With Subdomain
```
✅ Advantages:
- Instant trust (Edvanta brand)
- Schools know Edvanta already
- Free domain
- Easy internal management

❌ Disadvantages:
- Doesn't scale for consumer growth
- Limits brand independence
- Longer URL = lower conversion
- "Edvanta's app" vs "WizLingo"
```

### With Separate Domain
```
✅ Advantages:
- Independent EdTech brand
- Short memorable URL
- Better for B2C growth
- Own SEO authority
- Professional appearance

❌ Disadvantages:
- Initial cost ($5-12/year)
- Lost Edvanta brand halo
- New users don't know Edvanta
- Setup delay (DNS propagation)
```

---

## 💡 My Recommendation

### **Phase 1 (Now - June 15):** USE SUBDOMAIN
```
wizlingo.edvanta.co.in
```
**Reasoning:**
- Free, instant setup
- Pilot schools trust Edvanta brand
- Test product-market fit first
- Can switch anytime later

### **Phase 2 (Post-Success - July 15):** MIGRATE TO `wizlingo.co.in`
```
(After proving 100+ students are engaged)
```
**Reasoning:**
- Establish independent brand
- Cheaper than .com
- Perfect for Indian school market
- Prepare for B2C launch

### **Phase 3 (Public Launch - Jan 2027):** ADD `wizlingo.app`
```
Primary: wizlingo.co.in
Backup: wizlingo.app (for global)
```
**Reasoning:**
- .app domain signals modern EdTech
- .co.in targets Indian schools
- Both enhance credibility
- Cost: ~$20/year for both

---

## 🔄 Migration Path (No Downtime)

**Current (June 7):**
```
Add DNS:
wizlingo  CNAME  app.railway.app
```

**Week of July 15 (after pilot success):**
```
1. Register wizlingo.co.in
2. Point DNS to same Railway app
3. Update NEXT_PUBLIC_APP_URL in env
4. Add 301 redirect from subdomain to new domain
5. Update all docs/links
6. Wait 24h for DNS propagation
```

**No downtime** — old links still work via redirect.

---

## 📋 Action Items

### **For Now (Go With Subdomain)**
- [ ] DNS Team: Add `wizlingo CNAME app.railway.app` to edvanta.co.in
- [ ] Update env var: `NEXT_PUBLIC_APP_URL=https://wizlingo.edvanta.co.in`
- [ ] Test subdomain works: curl https://wizlingo.edvanta.co.in/api/health
- [ ] Update QR codes to use subdomain
- [ ] Send school login links with subdomain

### **For July 15 (After Pilot Success)**
- [ ] Decide between `wizlingo.co.in` (recommended) or `wizlingo.app`
- [ ] Register domain ($5-12)
- [ ] Update DNS and env var
- [ ] Create 301 redirect from subdomain
- [ ] Update docs/marketing

### **For Jan 2027 (Public Launch)**
- [ ] Consider adding backup domain (.app)
- [ ] Setup global CDN (CloudFront)
- [ ] Announce "WizLingo now available globally"

---

## ⚡ Quick Decision Tree

```
Are you launching NOW? → Use wizlingo.edvanta.co.in ✅
Do pilot schools trust Edvanta? → Yes, use subdomain ✅
Will you scale to 500+ students? → Later add independent domain
Want to do B2C? → Plan for wizlingo.co.in or .app
Budget conscious? → Start subdomain, migrate later
Want independence now? → Pay $10 for wizlingo.app today
```

---

## 🌍 Global vs India-First

**If India-First (Recommended for 2026):**
- Primary: `wizlingo.co.in` (Indian domain extension)
- Signals: "Made for Indian schools"
- Cost: $4-6/year
- Perfect for B2B school sales

**If Global from Start:**
- Primary: `wizlingo.app` (global tech brand)
- Signals: "Modern EdTech platform"
- Cost: $8.88-12/year
- Better for consumer apps + international

**Hybrid (Future-Proof):**
- Phase 2026: `wizlingo.co.in` (schools)
- Phase 2027: `wizlingo.app` (global + B2C)
- Cost: $12-18/year for both
- Maximum flexibility

---

## 📞 DNS Instructions for Edvanta Team

**To add subdomain now:**

```bash
# Add this to edvanta.co.in DNS records:
Record Type: CNAME
Name: wizlingo
Value: app.railway.app
TTL: 3600 (1 hour)

# Test:
nslookup wizlingo.edvanta.co.in
curl https://wizlingo.edvanta.co.in/api/health
# Should return: {"status": "healthy"}
```

---

## Summary Table

| Stage | Domain | Cost | Status |
|-------|--------|------|--------|
| **Pilot (Now)** | wizlingo.edvanta.co.in | $0 | 🚀 Launch |
| **Growth (July)** | wizlingo.co.in | $5 | 📅 Planned |
| **Scale (Jan)** | wizlingo.app | $9 | 📅 Optional |

---

**Final Answer:** Start with `wizlingo.edvanta.co.in` for zero cost, instant launch, and Edvanta brand trust. Upgrade to `wizlingo.co.in` after proving success with schools (mid-July). Add `wizlingo.app` only if going global (Jan 2027+).


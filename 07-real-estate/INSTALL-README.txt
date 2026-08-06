# Liz G Realtor — update instructions

This zip contains the updated Real Estate site (formerly "Meridian Realty",
now "Liz Garcia, California Real Estate Agent" / "Liz G Realtor").

## What changed
- Brand renamed to Liz G Realtor
- Title: Liz Garcia, California Real Estate Agent
- Cities removed → now Northern / Central / Southern California
- Top ticker carousel: Bakersfield, Taft, Tehachapi, Kern County, CA
- Added CA DRE #02094010 (About section + footer)
- Contact form now emails you via Formspree; the email address is hidden
- Secret-door menu label updated to "Liz G Realtor"

## How to install (drag & drop)
1. Unzip this file.
2. Open your `websites` project folder, then the `lizgarcia-site` folder inside it.
3. Copy these over the existing ones, choosing "Replace" when asked:
   - the whole `07-real-estate` folder
   - `shared/door-lock.js`
4. In VS Code terminal, run:
       git add -A
       git commit -m "Update real estate to Liz G Realtor"
       git push
5. Cloudflare rebuilds in about a minute — the change is then live.

## One more step to make the contact form work
The form has a placeholder. To receive messages at lizgsmc@gmail.com:
1. Sign up at formspree.io using lizgsmc@gmail.com.
2. Create a new form (send-to: lizgsmc@gmail.com) and copy its form ID
   (the part after /f/ in the URL it gives you).
3. In 07-real-estate/index.html, find YOUR_FORM_ID and replace it with your ID.
4. Save, then git add/commit/push again.
Until then, the form shows but won't deliver.

## You do NOT need to touch GoDaddy or DNS
This site lives inside your portfolio, behind the secret door at lizgarseeyah.com.
Pushing to GitHub is all that's needed. Do not change nameservers or add DNS
records in GoDaddy.

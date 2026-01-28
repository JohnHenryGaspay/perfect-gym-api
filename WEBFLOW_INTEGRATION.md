# Webflow Integration Instructions

## Problem
Your API returns a redirect URL, but Webflow doesn't automatically redirect the browser when receiving a JSON response. You need custom JavaScript to handle this.

## Solution
Follow these steps to add the redirect functionality to your Webflow form:

### Step 1: Update Your Form Field Names
In Webflow Designer, make sure your form fields have these exact names:
- `Name` (for the name field)
- `Email` (for the email field)  
- `Phone` (for the phone field - optional)

### Step 2: Add Custom Code to Webflow
1. Open your Webflow project
2. Go to **Project Settings** → **Custom Code**
3. Scroll to **Footer Code** (before </body> tag)
4. Copy and paste the code from `webflow-form-handler.js`
5. Update the form selector if needed:
   ```javascript
   const form = document.querySelector('form[data-name="YOUR_FORM_NAME"]');
   ```

### Step 3: Adjust Form Settings (Optional)
- In Webflow, you can remove the default success message since the redirect will happen automatically
- Make sure "Disable reCAPTCHA" if you don't need it (or handle it in the custom code)

### Step 4: Test
1. Publish your Webflow site
2. Submit the form
3. You should be redirected to: `https://www.chasingbetter247.com.au/thank-you-subscribe`

## Troubleshooting

### Check Browser Console
Open browser DevTools (F12) and check the Console tab for:
- "Submitting form data: ..." - confirms form is being intercepted
- "API response: ..." - confirms API is responding
- "Redirecting to: ..." - confirms redirect is being triggered
- Any error messages

### Common Issues

1. **Form not found error**
   - Update the selector: `document.querySelector('form[data-name="YOUR_FORM_NAME"]')`
   - Or use a simpler selector: `document.querySelector('form')`

2. **CORS errors**
   - Your API already has CORS enabled, so this shouldn't be an issue

3. **Field names don't match**
   - Make sure Webflow field names match exactly: `Name`, `Email`, `Phone`

4. **No redirect happening**
   - Check that the API is returning `"success": true` and a `"redirect"` URL
   - Test the API directly: `curl https://perfect-gym-api.vercel.app/lead -X POST -H "Content-Type: application/json" -d '{"Name":"Test User","Email":"test@example.com"}'`

## Testing Your API
You can test the API directly to ensure it's working:

```bash
curl https://perfect-gym-api.vercel.app/lead \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"Name":"Test User","Email":"test@example.com","Phone":"1234567890"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Lead created successfully",
  "leadId": 12345,
  "redirect": "https://www.chasingbetter247.com.au/thank-you-subscribe"
}
```

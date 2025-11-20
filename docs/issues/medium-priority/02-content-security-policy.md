# 🛡️ Add Content Security Policy headers

**Labels:** `security`, `medium-priority`

## Problem
The application has no Content Security Policy (CSP) configured, increasing XSS risk.

## Impact
- Increased vulnerability to XSS attacks
- No protection against malicious script injection
- External API integrations could be exploited

## Proposed Solution
Add CSP via meta tag in `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
           script-src 'self' 'unsafe-inline'; 
           style-src 'self' 'unsafe-inline'; 
           img-src 'self' data: https:; 
           connect-src 'self' 
                       https://json.edhrec.com 
                       https://api.scryfall.com 
                       https://vercel.com;
           font-src 'self' data:;">
```

Or configure via server headers if deployed to a custom server.

## Testing
1. Add CSP
2. Test all functionality still works
3. Check browser console for CSP violations
4. Adjust policy as needed

## References
- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

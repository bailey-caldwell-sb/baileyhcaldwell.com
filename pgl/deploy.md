# Deployment Instructions for baileyhcaldwell.com/pgl

## Manual Deployment Steps

1. **Upload Files to Your Web Server**
   - Copy all files from this directory to your web server's `/pgl/` subdirectory
   - Ensure the following files are uploaded:
     - `index.html`
     - `styles.css`
     - `app.js`
     - `README.md`

2. **File Structure on Server**
   ```
   baileyhcaldwell.com/
   └── pgl/
       ├── index.html
       ├── styles.css
       ├── app.js
       └── README.md
   ```

3. **Server Configuration (Optional)**
   - If using Apache, create a `.htaccess` file in the `/pgl/` directory
   - If using Nginx, add the configuration to your server block

4. **Test the Deployment**
   - Visit `https://baileyhcaldwell.com/pgl/`
   - Verify the page loads correctly
   - Test the Yahoo authentication flow

## Alternative: Use Netlify Drop

1. Go to [netlify.com/drop](https://netlify.com/drop)
2. Drag and drop this entire folder
3. Get the generated URL
4. Set up a redirect from baileyhcaldwell.com/pgl to the Netlify URL

## CORS Considerations

The application includes a CORS proxy for Yahoo API requests. For production use, consider:
- Setting up your own CORS proxy server
- Implementing server-side API calls
- Using Yahoo's OAuth flow on the backend

## Files Ready for Deployment

All files in this directory are production-ready and optimized for deployment.

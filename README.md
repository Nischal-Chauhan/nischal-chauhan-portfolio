# Nischal Chauhan — Portfolio

This is a Next.js portfolio customized with resume-supported information while retaining the original template's visual design, 3D hero scene, animations, fonts, and navigation structure.

## Requirements
- Node.js 20.9 or newer (recommended for the included Next.js version)
- npm

## Run locally
```bash
npm install
npm run dev
```
Then open http://localhost:3000.

## Production build
```bash
npm run build
npm start
```

## Before deploying
Set `NEXT_PUBLIC_SITE_URL` to your actual public portfolio URL in the deployment environment (for example, the domain you configure in Vercel). The project intentionally does not invent a public domain. The default `http://localhost:3000` is only for local development and should be replaced before publishing.

The contact form submits directly from the browser to Web3Forms (Free plan) using the public access key from `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`. Set that variable in the deployment environment and test the form after deployment. There is no server-side form route; client-side validation and the honeypot are spam deterrents only, not trusted server-side protection.

## Project content
Only two projects listed in the supplied resume are included: Face-Recognition Attendance System and Safety Hazard Detection. Technical implementation details and performance metrics that were not provided in the resume are not claimed. The Journal is empty until real articles are ready to publish.

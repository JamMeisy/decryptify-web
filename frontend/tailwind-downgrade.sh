#!/bin/bash
# This script will downgrade Tailwind CSS to a more stable version
echo "Downgrading Tailwind CSS to v3.4.1..."
cd frontend
npm uninstall tailwindcss postcss autoprefixer
npm install tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.18 --save-dev
echo "Done! Now restart your development server with: npm run dev"

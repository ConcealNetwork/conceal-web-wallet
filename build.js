/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
 * Copyright (c) 2018-2025 Conceal Community, Conceal.Network & Conceal Devs
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const workboxBuild = require('workbox-build');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Function to generate SHA384 integrity hash for a file
const generateIntegrityHash = (filePath) => {
	try {
		const fileContent = fs.readFileSync(filePath);
		const hash = crypto.createHash('sha384').update(fileContent).digest('base64');
		return `sha384-${hash}`;
	} catch (error) {
		console.error(`Error generating hash for ${filePath}:`, error);
		return null;
	}
};

// Function to generate SHA384 integrity hash for allowed pages
const generateAllowedPagesHash = (content) => {
	const hash = crypto.createHash('sha384').update(content).digest('base64');
	return `sha384-${hash}`;
};

// Function to generate SHA384 integrity hash for allowed exceptions
const generateAllowedExceptionsHash = (exceptions) => {
	// Use the same SHA-3 implementation as the browser code
	const sha3 = require('./src/lib/sha3.js');
	const hash = sha3.sha3_384(exceptions.join(','));
	return `sha384-${hash}`;
};

// Function to update environment file with integrity hashes
const updateIntegrityHashes = () => {
	const envPath = path.join(__dirname, '.env');
	let envContent = '';
	
	if (fs.existsSync(envPath)) {
		envContent = fs.readFileSync(envPath, 'utf8');
	}

	// Update API integrity hash
	const apiHtmlPath = path.join(__dirname, 'src', 'api.html');
	const apiIntegrityHash = generateIntegrityHash(apiHtmlPath);
	if (apiIntegrityHash) {
		console.log(`Generated new integrity hash for api.html`);
		if (!envContent.includes('API_INTEGRITY_HASH=')) {
			envContent += `API_INTEGRITY_HASH=${apiIntegrityHash}`;
		} else {
			envContent = envContent.replace(
				/API_INTEGRITY_HASH=.*/,
				`API_INTEGRITY_HASH=${apiIntegrityHash}`
			);
		}
	}

	// Generate hash for allowed exceptions
	const allowedPagesPath = path.join(__dirname, 'src', 'lib', 'config', 'allowedPages.ts');
	const allowedPagesContent = fs.readFileSync(allowedPagesPath, 'utf8');
	
	// Extract the allowedExceptions array using regex - specifically target allowedExceptions
	const exceptionsMatch = allowedPagesContent.match(/export const allowedExceptions = \[([\s\S]*?)\]/);
	if (!exceptionsMatch) {
		console.error('Could not find allowedExceptions array in allowedPages.ts');
		return;
	}
	
	// Get the content between square brackets, remove quotes and commas, then split and clean
	const exceptionsContent = exceptionsMatch[1]
		.replace(/['"]/g, '') // Remove quotes
		.replace(/,/g, '')    // Remove commas
		.replace(/\s+/g, '')  // Remove all whitespace
		.trim();              // Final trim
		
	const exceptionsHash = generateAllowedExceptionsHash([exceptionsContent]);
	// console.log('Generated hash:', exceptionsHash);
	
	// Update the hash in the compiled JS file
	const allowedPagesJsPath = path.join(__dirname, 'src', 'lib', 'config', 'allowedPages.js');
	if (fs.existsSync(allowedPagesJsPath)) {
		let jsContent = fs.readFileSync(allowedPagesJsPath, 'utf8');
		jsContent = jsContent.replace(
			/ALLOWED_EXCEPTIONS_INTEGRITY_HASH = 'sha384-.*'/,
			`ALLOWED_EXCEPTIONS_INTEGRITY_HASH = '${exceptionsHash}'`
		);
		fs.writeFileSync(allowedPagesJsPath, jsContent);
		console.log(`Updated allowedPages.js with new exceptions integrity hash`);
	} else {
		console.error('Could not find allowedPages.js to update hash');
	}

	// Write updated content back to .env
	fs.writeFileSync(envPath, envContent);
	console.log('Updated .env with new integrity hashes');
};

// NOTE: This should be run *AFTER* all your assets are built
const buildSW = () => {
	// This will return a Promise
	return workboxBuild.injectManifest({
		swSrc: 'src/service-worker-raw.js',
		swDest: 'src/service-worker.js',
		globDirectory: 'src',
		globPatterns: [
			'**\/*.{js,css,html,json,png,ico,jpg}',
		],
		globIgnores:[
			'd/Vue.js', 'src/service-worker-raw.js'
		]
	});
};

// Update integrity hashes before building SW
updateIntegrityHashes();
buildSW();

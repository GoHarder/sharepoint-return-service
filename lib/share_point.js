// Node Imports
const https = require('https');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const fs = require('fs');
const _path = require('path');

// NPM Imports
const sharePointAuth = require('node-sp-auth');

// Local Imports
const { credentialOptions, folderUrl, url: sharePointUrl } = require('../config.json').sharePoint;

/** Instance of the Node string decoder */
const decoder = new StringDecoder('utf-8');

/** The base url of the folder to operate in */
const baseUrl = `${sharePointUrl}/_api/web`;

/** The share point module library object */
const lib = {};

/**
 * Adds a file to a folder
 * @param {string} folderName The name of the folder
 * @param {string} fileName The name of the file
 */
lib.addFile = async (folderName, fileName) => {
   // Create the payload
   let payload = fs.readFileSync(_path.join(process.cwd(), '../Outputs', folderName, fileName));

   // Prepare the request details
   let { headers } = await sharePointAuth.getAuth(sharePointUrl, credentialOptions);

   const { protocol, hostname, path, query } = url.parse(`${baseUrl}/GetFolderByServerRelativeUrl('${folderUrl}/${folderName}')/Files/add(url='${fileName}',overwrite=true)`);

   headers = {
      ...headers,
      Accept: 'application/json;odata=verbose',
      'Content-Type': 'octet-stream',
      'Content-Length': Buffer.byteLength(payload),
   };

   const requestDetails = {
      method: 'POST',
      protocol,
      hostname,
      path,
      query,
      headers,
   };

   // Start a response buffer
   let buffer = '';

   // Send the request
   const req = https.request(requestDetails, (res) => {
      res.on('data', (data) => {
         buffer += decoder.write(data);
      });

      res.on('end', () => {
         buffer += decoder.end();
         // console.log(res.statusCode);

         if (res.statusCode !== 200) {
            buffer = JSON.parse(buffer);
            console.log(buffer);
         }
      });

      res.on('error', (err) => {
         console.log(err);
      });
   });

   req.write(payload);

   req.end();
};

/**
 * Creates a new folder
 * @param {string} folderName The name of the new folder
 */
lib.createFolder = async (folderName) => {
   // Create the payload
   let payload = {
      ServerRelativeUrl: `${folderUrl}/${folderName}`,
   };

   payload = JSON.stringify(payload);

   // Prepare the request details
   let { headers } = await sharePointAuth.getAuth(sharePointUrl, credentialOptions);

   const { protocol, hostname, path, query } = url.parse(`${baseUrl}/folders`);

   headers = {
      ...headers,
      Accept: 'application/json;odata=verbose',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
   };

   const requestDetails = {
      method: 'Post',
      protocol,
      hostname,
      path,
      query,
      headers,
   };

   // Start a response buffer
   let buffer = '';

   // Send the request
   const req = https.request(requestDetails, (res) => {
      res.on('data', (data) => {
         buffer += decoder.write(data);
      });

      res.on('end', () => {
         buffer += decoder.end();
         // console.log('Add Folder', res.statusCode);

         if (res.statusCode !== 200) {
            buffer = JSON.parse(buffer);
            // console.log(buffer);
         }

         return true;
      });

      res.on('error', (err) => {
         console.log(err);

         return false;
      });
   });

   req.write(payload);

   req.end();
};

// Exporting the module library
module.exports = lib;

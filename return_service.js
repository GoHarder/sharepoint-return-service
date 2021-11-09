// Node Imports
const path = require('path');
const fs = require('fs');

// Local Imports
const { addFile, createFolder } = require('./lib/share_point');
const Queue = require('./lib/queue');

/** The folder queue instance */
const folderQueue = new Queue();

const folderEvents = folderQueue.events;

/** The output directory to watch for changes */
const outputDir = path.join(process.cwd(), '../Outputs');

/** Watches the output directory and adds to queue */
const watch = () => {
   console.log(`Watching ${outputDir}`);

   fs.watch(outputDir, { recursive: false }, (event, name) => {
      if (name) folderQueue.enqueue(name);
   });
};

const respond = async () => {
   const name = folderQueue.dequeue();

   const folderName = path.join(outputDir, name);

   try {
      const files = fs.readdirSync(folderName);

      await createFolder(name);

      setTimeout(() => {
         files.forEach(async (fileName) => {
            addFile(name, fileName);
         });
      }, 5000);
   } catch (error) {
      console.error("Folder wasn't found");
   }

   return;
};

/** Inits the return service */
const init = async () => {
   watch();

   folderEvents.on('start-queue', async () => {
      while (folderQueue.length > 0) {
         await respond();
      }
   });
};

init();

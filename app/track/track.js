const fs = require('fs');
const musicmetadata = require('musicmetadata');

// create a new parser from a node ReadStream
const parser = musicmetadata(fs.createReadStream('../../assets/7th_Saga_Seven_Songs_for_Seventh_Saga_II_Water_OC_ReMix.mp3'), function (err, metadata) {
  if (err) throw err;
//   console.log(metadata);
  console.log(`data:image/${metadata.picture[0].format},${metadata.picture[0].data.toString('base64')}`);
});

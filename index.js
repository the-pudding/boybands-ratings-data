const request = require('request');
const d3 = require('d3');
const uploadToS3 = require('./upload-to-s3');
const AWS_PATH = '2018/11/boybands-data';

function downloadSheet({ id, gid }) {
  return new Promise((resolve, reject) => {
    const base = 'https://docs.google.com/spreadsheets/u/1/d';
    const url = `${base}/${id}/export?format=csv&id=${id}&gid=${gid}`;

    request(url, (err, response, body) => {
      if (err) reject(err);
      const data = d3.csvParseRows(body);
      resolve(data);
    });
  });
}

function init() {
  downloadSheet({
    id: '1JhRnxcm2ldKvdQQ0rMJ-bGU78Hw8gRN3h4BP0EBIXog',
    gid: '169265451'
  }).then(response => {
    const data = response.slice(15).map(d => ({
      slug: d[1],
      rating: d[2],
      count: d[3]
    }));
    const nested = d3
      .nest()
      .key(d => d.slug)
      .entries(data);

    const string = JSON.stringify(nested, null, 2);
    const path = `${AWS_PATH}/user-ratings`;
    uploadToS3({ string, path, ext: 'json' })
      .then(() => {
        process.exit();
      })
      .catch(console.log);
  });
}

init();

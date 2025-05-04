// const fetch = require('node-fetch');
fetch('https://api.github.com').then(res => res.text()).then(console.log).catch(console.error);
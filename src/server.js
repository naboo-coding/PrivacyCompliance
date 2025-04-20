const express = require('express');
const cors = require('cors');
const consentApi = require('../lib/consent/consentApi');
const config = require('../config');

const app = express();
const PORT = config.PORT || process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/consent', consentApi);

app.get('/', (req, res) => {
  res.send('Privacy Compliance API is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 
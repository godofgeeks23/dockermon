const express = require('express');
var Docker = require('dockerode');

const app = express();
var docker = new Docker();

const port = 3000;

app.get('/', (req, res) => {
  res.send('dockermon API!');
});

app.get('/containers', (req, res) => {
    docker.listContainers(function (err, containers) {
        res.json({containers});
    });
    }
);

app.get('/containers/:id', (req, res) => {
    docker.getContainer(req.params.id).inspect(function (err, container) {
        res.json({container});
    });
    }
);

// get images
app.get('/images', (req, res) => {
    docker.listImages(function (err, images) {
        res.json({images});
    });
    }
);

// stream logs from container
app.get('/containers/:id/logs', (req, res) => {
    const containerId = req.params.id;
  
    docker.getContainer(containerId).logs({
      follow: true,
      stdout: true,
      stderr: true
    }, (err, stream) => {
      if (err) {
        return res.status(500).send({ message: 'Error fetching container logs' });
      }
  
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');
  
      stream.pipe(res);
    });
  });
  

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

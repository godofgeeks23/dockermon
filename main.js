const express = require("express");

var Docker = require("dockerode");

const app = express();
var docker = new Docker();

const port = 3000;

// test route
app.get("/", (req, res) => {
  res.send("dockermon API!");
});

// api to test stream
app.get("/teststream", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.write("hello\n");
  setTimeout(() => {
    res.write("world\n");
    setTimeout(() => {
      res.end("end\n");
    }, 1000);
  }, 1000);
});

app.get("/containers", (req, res) => {
  docker.listContainers(function (err, containers) {
    res.json({ containers });
  });
});

app.get("/containers/:id", (req, res) => {
  docker.getContainer(req.params.id).inspect(function (err, container) {
    res.json({ container });
  });
});

// get images
app.get("/images", (req, res) => {
  docker.listImages(function (err, images) {
    res.json({ images });
  });
});

// stream logs from container - not properly functional till now. pending work
app.get("/containers/:id/logs", (req, res) => {
  const containerId = req.params.id;
  var container = docker.getContainer(containerId);
  container.logs(
    { follow: true, stdout: true, stderr: true },
    function (err, stream) {
      if (err) {
        return res
          .status(500)
          .send({ message: "Error fetching container logs" });
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      stream.setEncoding("utf8");
      stream.on("data", function (chunk) {
        // console.log(chunk);
        res.write(chunk);
      });
      stream.on("end", function () {
        res.end("Container logs stream ended");
      });
    }
  );
});

// start container
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

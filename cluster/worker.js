process.on("message", (task) => {
  process.send({ status: "done", url: task.url });
});

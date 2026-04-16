import { fork } from "child_process";

export function runCluster(urls) {
  return urls.map(url => {
    const w = fork("./cluster/worker.js");
    w.send({ url });
    return w;
  });
}

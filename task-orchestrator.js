import { selectEngine } from "./execution/router.executor.js";

export async function runTask(task) {
  const engine = selectEngine(task);

  console.log(`Running task on engine: ${engine}`);

  return {
    engine,
    task,
    status: "planned"
  };
}

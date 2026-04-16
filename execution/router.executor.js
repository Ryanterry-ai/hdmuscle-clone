import fs from "fs-extra";

/**
 * AI Execution Engine Router
 * Auto-detects environment and routes tasks accordingly
 */

export function detectExecutionEngine(context = {}) {
  const env = process.env;
  const userAgent = env.USER_AGENT || "";
  const runtime = process.version;

  // ----------------------------
  // 1. EXPLICIT USER OVERRIDE
  // ----------------------------
  if (context.engine) {
    return context.engine;
  }

  // ----------------------------
  // 2. OPENCODE DETECTION
  // ----------------------------
  if (
    env.OPENCODE ||
    env.OPENCODE_ENV ||
    runtime.includes("node") && env.OPENCODE_MODE
  ) {
    return "opencode";
  }

  // ----------------------------
  // 3. CLAUDE DETECTION
  // ----------------------------
  if (
    env.CLAUDE ||
    env.ANTHROPIC_API_KEY ||
    userAgent.toLowerCase().includes("claude")
  ) {
    return "claude";
  }

  // ----------------------------
  // 4. GPT / OPENAI DETECTION
  // ----------------------------
  if (
    env.OPENAI_API_KEY ||
    env.GPT_MODE ||
    env.CHATGPT ||
    userAgent.toLowerCase().includes("openai")
  ) {
    return "gpt";
  }

  // ----------------------------
  // 5. LOCAL MODEL DETECTION
  // ----------------------------
  if (
    env.OLLAMA ||
    env.LOCAL_MODEL ||
    env.LLAMA ||
    env.MISTRAL
  ) {
    return "local";
  }

  // ----------------------------
  // 6. DEFAULT SAFE MODE
  // ----------------------------
  return "opencode";
}

/**
 * TASK ROUTER
 */
export function routeTask(task, context = {}) {
  const engine = detectExecutionEngine(context);

  console.log(`🧠 Detected Engine: ${engine}`);
  console.log(`📦 Task Type: ${task.type || "general"}`);

  switch (engine) {
    case "opencode":
      return {
        engine,
        mode: "automation",
        handler: "OpenCodeExecutor",
        priority: "high",
        capabilities: [
          "crawl",
          "download_assets",
          "extract_data",
          "file_generation"
        ]
      };

    case "claude":
      return {
        engine,
        mode: "reasoning",
        handler: "ClaudeExecutor",
        priority: "design",
        capabilities: [
          "shopify_theme_generation",
          "ui_structure",
          "liquid_conversion"
        ]
      };

    case "gpt":
      return {
        engine,
        mode: "hybrid",
        handler: "GPTExecutor",
        priority: "balanced",
        capabilities: [
          "analysis",
          "code_generation",
          "assistance"
        ]
      };

    case "local":
      return {
        engine,
        mode: "offline",
        handler: "LocalExecutor",
        priority: "low_cost",
        capabilities: [
          "basic_crawl",
          "light_processing"
        ]
      };

    default:
      return {
        engine: "opencode",
        mode: "fallback",
        handler: "OpenCodeExecutor",
        priority: "safe_default"
      };
  }
}

export function selectEngine(task, context = {}) {
  return detectExecutionEngine({
    ...context,
    task
  });
}

/**
 * EXECUTION DECISION ENGINE
 * decides WHAT should run where
 */
export function executeSmartPipeline(task, context = {}) {
  const route = routeTask(task, context);

  return {
    ...route,

    executionPlan: {
      step1: "detect_environment",
      step2: "select_executor",
      step3: "assign_workers",
      step4: "run_pipeline",
      step5: "validate_output"
    },

    optimization: {
      costOptimized: route.engine !== "claude",
      speedOptimized: route.engine === "opencode",
      qualityMode: route.engine === "claude"
    }
  };
}

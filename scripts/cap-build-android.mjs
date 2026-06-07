import { existsSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

function javaExecutableFrom(home) {
  if (!home) {
    return null;
  }

  const candidate = path.join(
    home,
    "bin",
    process.platform === "win32" ? "java.exe" : "java",
  );
  return existsSync(candidate) ? candidate : null;
}

function resolveJavaHome() {
  const candidates = [
    process.env.JAVA_HOME,
    "C:\\Program Files\\Android\\Android Studio\\jbr",
  ];

  for (const candidate of candidates) {
    const javaExecutable = javaExecutableFrom(candidate);
    if (javaExecutable) {
      return { javaHome: candidate, javaExecutable };
    }
  }

  return null;
}

function resolveAndroidSdk() {
  const candidates = [
    process.env.ANDROID_SDK_ROOT,
    process.env.ANDROID_HOME,
    path.join(os.homedir(), "AppData", "Local", "Android", "Sdk"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function run(command, args, options = {}) {
  const { cwd, env: extraEnv = {} } = options;
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      ...extraEnv,
    },
    cwd,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const java = resolveJavaHome();
const androidSdk = resolveAndroidSdk();

if (!java) {
  console.error(
    "No Java 11+ runtime found. Install Android Studio or set JAVA_HOME to a JDK 11+ installation.",
  );
  process.exit(1);
}

if (!androidSdk) {
  console.error(
    "Android SDK not found. Install the Android SDK or set ANDROID_SDK_ROOT/ANDROID_HOME to its path.",
  );
  process.exit(1);
}

// Ensure android/local.properties points to the SDK
const localPropsPath = path.resolve("android", "local.properties");
if (!existsSync(localPropsPath)) {
  const sdkDir = androidSdk.replace(/\\/g, "\\\\");
  writeFileSync(localPropsPath, `sdk.dir=${sdkDir}\n`, "utf8");
  console.log(`Wrote android/local.properties -> sdk.dir=${androidSdk}`);
}

run("npx", ["cap", "sync", "android"], {
  env: {
    JAVA_HOME: java.javaHome,
    PATH: `${path.join(java.javaHome, "bin")}${path.delimiter}${process.env.PATH}`,
  },
});

run("gradlew.bat", ["assembleDebug"], {
  env: {
    JAVA_HOME: java.javaHome,
    PATH: `${path.join(java.javaHome, "bin")}${path.delimiter}${process.env.PATH}`,
  },
  cwd: path.resolve("android"),
});

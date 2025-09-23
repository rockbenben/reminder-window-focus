import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

// Get the version type from command line args (patch, minor, major)
const versionType = process.argv[2] || "patch";

function updateManifestAndVersions(targetVersion) {
  // read minAppVersion from manifest.json and bump version to target version
  let manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
  const { minAppVersion } = manifest;
  manifest.version = targetVersion;
  writeFileSync("manifest.json", JSON.stringify(manifest, null, 2));
  console.log(`Updated manifest.json to version ${targetVersion}`);

  // update versions.json with target version and minAppVersion from manifest.json
  // only update if this is a new minAppVersion that hasn't been recorded before
  let versions = JSON.parse(readFileSync("versions.json", "utf8"));
  const existingMinAppVersions = Object.values(versions);
  const isNewMinAppVersion = !existingMinAppVersions.includes(minAppVersion);

  if (isNewMinAppVersion) {
    versions[targetVersion] = minAppVersion;
    writeFileSync("versions.json", JSON.stringify(versions, null, 2));
    console.log(`Updated versions.json: ${targetVersion} -> ${minAppVersion} (new minAppVersion)`);
  } else {
    console.log(`Skipped versions.json update: minAppVersion ${minAppVersion} already exists`);
  }
}

try {
  // Update package.json version without creating git tag
  console.log(`Bumping ${versionType} version...`);
  execSync(`yarn version --${versionType} --no-git-tag-version`, { stdio: "inherit" });

  // Get the new version
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  const newVersion = packageJson.version;

  // Update manifest and versions files
  console.log(`Updating manifest and versions files for v${newVersion}...`);
  updateManifestAndVersions(newVersion);

  // Git operations
  console.log("Adding files to git...");
  execSync("git add manifest.json versions.json package.json", { stdio: "inherit" });

  console.log(`Committing changes for ${newVersion}...`);
  execSync(`git commit -m "chore(release): bump version to ${newVersion}"`, { stdio: "inherit" });

  console.log(`Creating tag ${newVersion}...`);
  execSync(`git tag ${newVersion}`, { stdio: "inherit" });

  console.log(`✅ Successfully bumped to v${newVersion}`);
  console.log(`Run 'git push && git push --tags' to publish`);
} catch (error) {
  console.error("❌ Error during version bump:", error.message);
  process.exit(1);
}

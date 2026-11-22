{
  lib,
  stdenv,
  nodejs-slim_24,
  pnpm_12,
  fetchPnpmDeps,
  pnpmConfigHook,
  makeWrapper,
}:

let
  nodejs = nodejs-slim_24;
  pnpm = pnpm_12;
in
stdenv.mkDerivation (finalAttrs: {
  pname = "linejs-cli";
  version = (lib.importJSON ./packages/cli/package.json).version;

  # The Nix files are not part of the build, so editing them does not
  # invalidate the (slow) dependency fetch below.
  src = lib.cleanSourceWith {
    src = ./.;
    filter =
      path: _type:
      !(builtins.elem (baseNameOf path) [
        "flake.nix"
        "flake.lock"
        "package.nix"
      ]);
  };

  pnpmDeps = fetchPnpmDeps {
    inherit (finalAttrs) pname version src;
    inherit pnpm;
    fetcherVersion = 5;
    hash = "sha256-AE9APNZps40XMCj3cM88duUeWkGT74G2s/1WUlLHJJo=";
  };

  nativeBuildInputs = [
    nodejs
    pnpm
    pnpmConfigHook
    makeWrapper
  ];

  # Keep pnpm at the version from nixpkgs instead of letting it
  # download the `packageManager` version from the registry.
  env = {
    npm_config_manage_package_manager_versions = "false";
    pnpm_config_manage_package_manager_versions = "false";
  };

  # pnpm's config hook and deploy both need a writable HOME; keep it
  # identical for every phase so the configured store is reused.
  preConfigure = ''
    export HOME=$TMPDIR
  '';

  buildPhase = ''
    runHook preBuild

    # Build the CLI and the workspace packages it depends on.
    pnpm --filter @evex-dev/linejs-cli... run build

    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall

    # Point the workspace packages at their built `dist` entry points, the
    # same way `publishConfig` does for npm.
    node -e 'const fs=require("node:fs");for(const f of process.argv.slice(1)){const p=JSON.parse(fs.readFileSync(f,"utf8")),c=p.publishConfig||{};for(const k of ["main","module","types","exports"])if(c[k]!=null)p[k]=c[k];fs.writeFileSync(f,JSON.stringify(p,null,"\t")+"\n")}' packages/linejs/package.json packages/types/package.json

    mkdir -p $out/lib
    pnpm --filter @evex-dev/linejs-cli deploy --prod --offline $out/lib/linejs-cli
    rm -f $out/lib/linejs-cli/pnpm-lock.yaml $out/lib/linejs-cli/pnpm-workspace.yaml

    mkdir -p $out/bin
    makeWrapper ${nodejs}/bin/node $out/bin/line \
      --add-flags $out/lib/linejs-cli/dist/line.mjs

    runHook postInstall
  '';

  meta = {
    description = "Command-line interface and MCP server for LINEJS";
    homepage = "https://linejs.evex.land";
    license = lib.licenses.mit;
    mainProgram = "line";
    platforms = [
      "x86_64-linux"
      "aarch64-linux"
      "aarch64-darwin"
    ];
  };
})

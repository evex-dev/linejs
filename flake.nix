{
  description = "LINEJS command-line interface (`line`)";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      inherit (nixpkgs) lib;

      systems = [
        "x86_64-linux"
        "aarch64-linux"
        # nixos-unstable dropped x86_64-darwin in 26.11 and evaluating it now
        # throws, so Intel Macs need the `nixpkgs-26.05-darwin` input instead.
        "aarch64-darwin"
      ];

      forAllSystems = lib.genAttrs systems;
    in
    {
      packages = forAllSystems (
        system:
        let
          linejsCli = nixpkgs.legacyPackages.${system}.callPackage ./package.nix { };
        in
        {
          default = linejsCli;
          line = linejsCli;
        }
      );

      apps = forAllSystems (system: {
        update-pnpm-deps-hash =
          let
            pkgs = nixpkgs.legacyPackages.${system};
          in
          {
            type = "app";
            program = lib.getExe (
              pkgs.writeShellApplication {
                name = "update-pnpm-deps-hash";
                runtimeInputs = [
                  pkgs.gnugrep
                  pkgs.gnused
                ];
                # nix-update evaluates the flake with nix-instantiate, which
                # cannot open the flake source on Nix installs with lazy trees.
                # Build the fetcher with a fake hash and copy the reported
                # hash back instead; package.nix is not part of the source, so
                # editing it does not change what is fetched.
                text = ''
                  file=package.nix
                  old=$(grep -oE 'hash = "sha256-[A-Za-z0-9+/]{43}="' "$file" | grep -oE 'sha256-[^"]+')
                  fake=${lib.fakeHash}
                  sed -i "s|$old|$fake|" "$file"
                  if out=$(nix build --no-link .#default.pnpmDeps 2>&1); then
                    sed -i "s|$fake|$old|" "$file"
                    echo "pnpmDeps built with a fake hash; refusing to update" >&2
                    exit 1
                  fi
                  new=$(printf '%s\n' "$out" | grep -oE 'got: +sha256-[A-Za-z0-9+/]{43}=' | grep -oE 'sha256-.*' | head -n 1 || true)
                  if [ -z "$new" ]; then
                    sed -i "s|$fake|$old|" "$file"
                    printf '%s\n' "$out" >&2
                    exit 1
                  fi
                  sed -i "s|$fake|$new|" "$file"
                  if [ "$new" = "$old" ]; then
                    echo "pnpmDeps hash is up to date: $new"
                  else
                    echo "pnpmDeps hash: $old -> $new"
                  fi
                '';
              }
            );
            meta.description = "Refresh the pnpmDeps hash in package.nix from pnpm-lock.yaml";
          };
        default = {
          type = "app";
          program = "${self.packages.${system}.default}/bin/line";
          meta.description = "LINEJS command-line interface";
        };
        line = {
          type = "app";
          program = "${self.packages.${system}.line}/bin/line";
          meta.description = "LINEJS command-line interface";
        };
      });

      checks = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          package = self.packages.${system}.default;
        in
        {
          build = package;
          version = pkgs.testers.testVersion {
            inherit package;
            command = "line --version";
          };
        }
      );

      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell {
            packages = [
              pkgs.nodejs_24
              pkgs.pnpm_12
            ];
          };
        }
      );

      formatter = forAllSystems (system: nixpkgs.legacyPackages.${system}.nixfmt-tree);
    };
}

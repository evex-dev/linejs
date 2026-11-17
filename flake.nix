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
                runtimeInputs = [ pkgs.nix-update ];
                text = ''
                  nix-update --flake --version=skip default
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

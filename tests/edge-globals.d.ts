// Type-check the deployed Edge modules using the locally installed packages.
// Runtime provider tests use the Node bridge; this declaration emits no code.
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
  test(name: string, task: () => void | Promise<void>): void;
};

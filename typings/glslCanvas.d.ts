declare module "glslCanvas" {
  export default class {
    constructor(canvas: HTMLCanvasElement, contextOptions?: ContextOptions, options?: { onError: (errorCode: number) => void });
    load(fragmentSource: string, vertexSource?: string): void;
    setUniform(name: string, ...value: number[] | Float32Array[]): void;
    loadTexture (name: string, urlElementOrData: string, options?: object): void;
  }

  interface ContextOptions {
    vertexString?: string;
    fragmentString?: string;
  }

  interface TextureOptions {
    url: string;
    data: string;
    width: number;
    height: number;
  }
}


export class AssetLoader {
  private images = new Map<string, HTMLImageElement>();

  async loadImage(key: string, src: string): Promise<HTMLImageElement> {
    if (this.images.has(key)) {
      return this.images.get(key)!;
    }

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });

    this.images.set(key, image);
    return image;
  }

  getImage(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }
}

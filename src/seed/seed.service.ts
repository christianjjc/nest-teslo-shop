import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productService: ProductsService) {}

  async runSeed() {
    await this.insertNewProducts();
    return 'SEED EXECUTED s!';
  }

  private async insertNewProducts() {
    await this.productService.deleteAllProducts();

    const products = initialData.products;

    const instertPromises = [];

    products.forEach((product) => {
      instertPromises.push(this.productService.create(product));
    });

    await Promise.all(instertPromises);

    return true;
  }
}

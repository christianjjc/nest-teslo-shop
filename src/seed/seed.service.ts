import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertNewUsers();
    await this.insertNewProducts(adminUser);
    return 'SEED EXECUTED s!';
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts();
    const qb = this.userRepository.createQueryBuilder();
    await qb.delete().where({}).execute();
  }

  private async insertNewUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];
    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });
    const dbUsers = await this.userRepository.save(seedUsers);
    return dbUsers[2];
  }

  private async insertNewProducts(user: User) {
    const seedProducts = initialData.products;
    const instertPromises = [];
    seedProducts.forEach((product) => {
      instertPromises.push(this.productService.create(product, user));
    });
    await Promise.all(seedProducts);
    return true;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
    collection_handle?: string;
    is_active?: boolean;
  }) {
    const { skip = 0, take = 50, search, collection_handle, is_active } = params;

    const where: Prisma.ProductWhereInput = {};
    
    if (search) {
      const searchLower = search.toLowerCase();
      where.OR = [
        { title: { contains: searchLower } },
        { handle: { contains: searchLower } },
      ];
    }
    
    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    if (collection_handle) {
      where.collections = {
        some: {
          collection: { handle: collection_handle },
        },
      };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          images: { orderBy: { position: 'asc' } },
          collections: { include: { collection: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total, skip, take };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
        collections: { include: { collection: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findByHandle(handle: string) {
    const product = await this.prisma.product.findUnique({
      where: { handle },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
        collections: { include: { collection: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }

  async addImage(productId: string, data: { src: string; alt?: string; position?: number }) {
    return this.prisma.productImage.create({
      data: {
        product_id: productId,
        src: data.src,
        alt: data.alt,
        position: data.position || 0,
      },
    });
  }

  async removeImage(imageId: string) {
    await this.prisma.productImage.delete({ where: { id: imageId } });
    return { success: true };
  }
}

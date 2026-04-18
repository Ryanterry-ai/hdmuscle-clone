import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { skip?: number; take?: number; search?: string; is_active?: boolean }) {
    const { skip = 0, take = 50, search, is_active } = params;

    const where: Prisma.CollectionWhereInput = {};
    
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

    const [collections, total] = await Promise.all([
      this.prisma.collection.findMany({
        where,
        skip,
        take,
        include: {
          children: true,
          _count: { select: { products: true } },
        },
        orderBy: { sort_order: 'asc' },
      }),
      this.prisma.collection.count({ where }),
    ]);

    return { collections, total, skip, take };
  }

  async findOne(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        products: { include: { product: { include: { images: true } } } },
        children: true,
        parent: true,
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  async findByHandle(handle: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { handle },
      include: {
        products: { 
          include: { product: { include: { images: true } } },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  async create(data: Prisma.CollectionCreateInput) {
    return this.prisma.collection.create({ data });
  }

  async update(id: string, data: Prisma.CollectionUpdateInput) {
    return this.prisma.collection.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.collection.delete({ where: { id } });
    return { success: true };
  }

  async addProduct(collectionId: string, productId: string, position?: number) {
    return this.prisma.productCollection.create({
      data: {
        collection_id: collectionId,
        product_id: productId,
        position: position || 0,
      },
    });
  }

  async removeProduct(collectionId: string, productId: string) {
    await this.prisma.productCollection.delete({
      where: {
        product_id_collection_id: {
          product_id: productId,
          collection_id: collectionId,
        },
      },
    });
    return { success: true };
  }
}

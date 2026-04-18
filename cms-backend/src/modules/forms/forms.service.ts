import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.form.findMany({ orderBy: { created_at: 'desc' } });
  }

  async findOne(id: string) {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form) throw new NotFoundException('Form not found');
    return form;
  }

  async submit(formId: string, data: any, ip?: string) {
    const [submission] = await Promise.all([
      this.prisma.formSubmission.create({ data: { form_id: formId, data, ip } }),
      this.prisma.form.update({ where: { id: formId }, data: { submissions: { increment: 1 } } }),
    ]);
    return submission;
  }

  async getSubmissions(formId: string) {
    return this.prisma.formSubmission.findMany({ where: { form_id: formId }, orderBy: { created_at: 'desc' } });
  }

  async create(data: any) {
    return this.prisma.form.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.form.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.form.delete({ where: { id } });
    return { success: true };
  }
}

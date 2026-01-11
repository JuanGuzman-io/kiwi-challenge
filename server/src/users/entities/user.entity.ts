import { User as PrismaUser } from '@prisma/client';

export class User implements PrismaUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

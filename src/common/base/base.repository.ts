import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

export const capitalizeFirst = (str: string): string => {
  return str.match('^[a-z]')
    ? str.charAt(0).toUpperCase() + str.substring(1)
    : str;
};

export type ObjectData = {
  [key: string]: any;
};

export type IPrismaModelMethods =
  | 'findUnique'
  | 'findUniqueOrThrow'
  | 'findFirst'
  | 'findFirstOrThrow'
  | 'findMany'
  | 'create'
  | 'createMany'
  | 'createManyAndReturn'
  | 'delete'
  | 'update'
  | 'deleteMany'
  | 'updateMany'
  | 'upsert'
  | 'aggregate'
  | 'groupBy'
  | 'count';

export type PrismaModelMethodArgs<
  T extends Capitalize<Prisma.ModelName>,
  M extends IPrismaModelMethods,
> = Prisma.TypeMap['model'][T]['operations'][M]['args'];

export type IPrismaModelMethodResults<
  T extends Capitalize<Prisma.ModelName>,
  M extends IPrismaModelMethods,
> = Prisma.TypeMap['model'][T]['operations'][M]['result'];

export type FindOneOptions<T extends Capitalize<Prisma.ModelName>> = {
  [K in keyof PrismaModelMethodArgs<T, 'findFirst'>]: K extends 'where'
    ? never
    : PrismaModelMethodArgs<T, 'findFirst'>[K];
} & {
  errorIfFound?: boolean;
  errorMessage?: string;
};

export type PrismaDelegate<
  Client extends PrismaClient,
  Model extends Uncapitalize<Prisma.ModelName>,
> = Client[Model] extends {
  count: (...args: unknown[]) => Promise<number>;
  findMany: (...args: unknown[]) => Promise<unknown[]>;
  findFirst: (...args: unknown[]) => Promise<unknown>;
  findFirstOrThrow: (...args: unknown[]) => Promise<unknown>;
  delete: (...args: unknown[]) => Promise<unknown>;
  create: (...args: unknown[]) => Promise<unknown>;
  createMany: (...args: unknown[]) => Promise<unknown>;
  update: (...args: unknown[]) => Promise<unknown>;
  groupBy: (...args: unknown[]) => Promise<unknown>;
  aggregate: (...args: unknown[]) => Promise<unknown>;
  findUniqueOrThrow: (...args: unknown[]) => Promise<unknown>;
  deleteMany: (...args: unknown[]) => Promise<unknown>;
  updateMany: (...args: unknown[]) => Promise<unknown>;
  upsert: (...args: unknown[]) => Promise<unknown>;
  findUnique: (...args: unknown[]) => Promise<unknown>;
}
  ? Client[Model]
  : never;

export type RepoType<Model extends Capitalize<Prisma.ModelName>> =
  PrismaDelegate<PrismaClient, Uncapitalize<Model>>;

export type FindManyResult<Model extends Capitalize<Prisma.ModelName>> =
  Required<IPrismaModelMethodResults<Model, 'findMany'>>;
export type CreateResult<Model extends Capitalize<Prisma.ModelName>> = Required<
  IPrismaModelMethodResults<Model, 'create'>
>;
export type UpdateResult<Model extends Capitalize<Prisma.ModelName>> = Required<
  IPrismaModelMethodResults<Model, 'update'>
>;
export type AggregateResult<Model extends Capitalize<Prisma.ModelName>> =
  Required<IPrismaModelMethodResults<Model, 'aggregate'>>;
export type CreateManyResult<Model extends Capitalize<Prisma.ModelName>> =
  Required<IPrismaModelMethodResults<Model, 'createMany'>>;
export type CountResult<Model extends Capitalize<Prisma.ModelName>> = Required<
  IPrismaModelMethodResults<Model, 'count'>
>;
export type FindFirstResult<Model extends Capitalize<Prisma.ModelName>> =
  Required<IPrismaModelMethodResults<Model, 'findFirstOrThrow'>>;
export type UpsertResult<Model extends Capitalize<Prisma.ModelName>> = Required<
  IPrismaModelMethodResults<Model, 'upsert'>
>;
export type GroupByResult<Model extends Capitalize<Prisma.ModelName>> =
  Required<IPrismaModelMethodResults<Model, 'groupBy'>>;

export class Repository<ModelName extends Capitalize<Prisma.ModelName>> {
  private readonly repo: RepoType<ModelName>;

  constructor(
    public prisma: PrismaClient,
    protected model: Uncapitalize<ModelName>,
  ) {
    this.repo = prisma[this.model] as RepoType<ModelName>;
  }

  async findById<T>(id: string, options?: FindOneOptions<ModelName>) {
    const result = await this.repo.findUnique({ where: { id }, ...options });
    return result as T extends ObjectData ? T : FindFirstResult<ModelName>;
  }

  async findAndCountAll<T>(
    payload: PrismaModelMethodArgs<ModelName, 'findMany'>,
  ) {
    const { skip, take, where } = payload;
    const [count, rows] = await this.prisma.$transaction(async (tx) => {
      const count = await (tx[this.model] as RepoType<ModelName>).count({
        where,
        skip,
        take,
      });
      const rows = await (tx[this.model] as RepoType<ModelName>).findMany(
        payload,
      );
      return [count, rows] as const;
    });

    return {
      count,
      records: rows as T extends ObjectData ? T : FindManyResult<ModelName>,
    };
  }

  async findMany<T>(payload?: PrismaModelMethodArgs<ModelName, 'findMany'>) {
    return this.repo.findMany(payload) as unknown as T extends ObjectData
      ? T
      : FindManyResult<ModelName>;
  }

  async create<T>(payload: PrismaModelMethodArgs<ModelName, 'create'>) {
    return this.repo.create(payload) as unknown as T extends ObjectData
      ? T
      : CreateResult<ModelName>;
  }

  async createMany(payload: PrismaModelMethodArgs<ModelName, 'createMany'>) {
    return this.repo.createMany(
      payload,
    ) as unknown as CreateManyResult<ModelName>;
  }

  async update<T>(payload: PrismaModelMethodArgs<ModelName, 'update'>) {
    if (payload.where.id) {
      await this.findOneOrThrow({ where: { id: payload.where.id } });
    }
    return this.repo.update(payload) as unknown as T extends ObjectData
      ? T
      : UpdateResult<ModelName>;
  }

  async findOne<T>(payload: PrismaModelMethodArgs<ModelName, 'findFirst'>) {
    const result = await this.repo.findFirst(payload);
    return result as T extends ObjectData ? T : FindFirstResult<ModelName>;
  }

  async findOneOrThrow<T>(
    payload: PrismaModelMethodArgs<ModelName, 'findFirst'>,
    errorMessage?: string,
  ) {
    const result = await this.repo.findFirst(payload);
    const schema = capitalizeFirst(String(this.model));

    if (!result) {
      throw new NotFoundException(errorMessage ?? `${schema} not found!`);
    }
    return result as T extends ObjectData ? T : FindFirstResult<ModelName>;
  }

  async findOneAndThrow<T>(
    payload: PrismaModelMethodArgs<ModelName, 'findFirst'>,
    errorMessage?: string,
  ) {
    const result = await this.repo.findFirst(payload);
    const schema = capitalizeFirst(String(this.model));

    if (result) {
      throw new BadRequestException(errorMessage ?? `${schema} already exists`);
    }
    return result as T extends ObjectData ? T : FindFirstResult<ModelName>;
  }

  async count<T>(payload?: PrismaModelMethodArgs<ModelName, 'count'>) {
    return this.repo.count(payload) as unknown as T extends number
      ? T
      : CountResult<ModelName>;
  }

  async upsert(payload: PrismaModelMethodArgs<ModelName, 'upsert'>) {
    return this.repo.upsert(payload) as unknown as UpsertResult<ModelName>;
  }

  async groupBy(payload: PrismaModelMethodArgs<ModelName, 'groupBy'>) {
    return this.repo.groupBy(payload) as unknown as GroupByResult<ModelName>;
  }

  async aggregate(payload: PrismaModelMethodArgs<ModelName, 'aggregate'>) {
    return this.repo.aggregate(
      payload,
    ) as unknown as AggregateResult<ModelName>;
  }

  async delete(payload: PrismaModelMethodArgs<ModelName, 'delete'>) {
    await this.repo.delete(payload);
  }

  async deleteMany(payload: PrismaModelMethodArgs<ModelName, 'deleteMany'>) {
    await this.repo.deleteMany(payload);
  }
}

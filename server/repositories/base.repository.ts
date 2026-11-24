import "server-only";

export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  find(filter?: Record<string, unknown>): Promise<T[]>;
  create(item: Partial<T>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

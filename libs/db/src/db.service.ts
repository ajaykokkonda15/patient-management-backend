import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class DbService {
  constructor(private readonly dataSource: DataSource) {}

  get db() {
    return this.dataSource;
  }

  // Raw query
  query(sql: string, params?: any[]) {
    return this.dataSource.query(sql, params);
  }

  // Transaction helper
  async transaction<T>(fn: (tx: EntityManager) => Promise<T>) {
    return this.dataSource.transaction(fn);
  }
}

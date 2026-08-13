import { DataSource } from 'typeorm';

interface TableRow {
  tablename: string;
}

export async function truncateDatabase(
  dataSource: DataSource,
): Promise<void> {
  const tables = (await dataSource.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename != 'migrations'
  `)) as TableRow[];

  if (tables.length === 0) {
    return;
  }

  const tableNames = tables
    .map(({ tablename }) => `"${tablename}"`)
    .join(', ');

  await dataSource.query(
    `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`,
  );
}
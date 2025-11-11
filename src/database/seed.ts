import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { randomUUIDv7 } from 'bun';
import { addDays } from 'date-fns';

const createAdminIfNotExists = async () => {
  const existingAdmin = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, 'admin@system.com'),
  });

  if (existingAdmin) {
    console.log('Admin user already exists. Skipping creation.');

    return;
  }

  const [admin] = await db
    .insert(schema.users)
    .values({
      id: randomUUIDv7(),
      email: 'admin@system.com',
      role: 'admin',
      organization: 'system',
      name: 'System Administrator',
    })
    .returning();

  await db.insert(schema.accounts).values({
    accountId: randomUUIDv7(),
    userId: admin.id,
    password: await Bun.password.hash('admin@123'),
    providerId: 'credential',
  });
};

const getRandomStatus = () => {
  const statuses = ['pending', 'in_progress', 'resolved', 'rejected'];

  return statuses[Math.floor(Math.random() * statuses.length)];
};

const generateRandomReports = async (count: number) => {
  console.log(`Generating ${count} random reports...`);

  for (let i = 0; i < count; i++) {
    const status = getRandomStatus();
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000));
    const completedAt =
      status === 'resolved' ? addDays(createdAt, Math.floor(Math.random() * 60)) : null;

    const [report] = await db
      .insert(schema.reports)
      .values({
        title: `Random Report ${i + 1}`,
        description: `This is a description for random report ${i + 1}.`,
        latitude: (-3.119028 + Math.random() * 0.1).toString(),
        longitude: (-60.021731 + Math.random() * 0.1).toString(),
        address: `Street ${Math.floor(Math.random() * 1000)}, City`,
        status,
        createdAt,
        completedAt,
      })
      .returning();

    if (report) {
      await db.insert(schema.reportsTimelines).values({
        reportId: report.id,
        action: 'created',
      });
    }

    console.log(`Created report ${i + 1}/${count}`);
  }

  console.log('Random report generation completed.');
};

async function main() {
  await createAdminIfNotExists();
  await generateRandomReports(1_000);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .then(() => {
    console.log('Seed completed successfully.');
    process.exit(0);
  });

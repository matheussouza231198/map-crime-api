import { randomUUIDv7 } from 'bun';
import { decimal, jsonb, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';
import { relations } from 'drizzle-orm';

export const reports = pgTable('reports', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUIDv7()),
  assignedToId: text('assigned_to_id').references(() => users.id, {
    onDelete: 'restrict',
    onUpdate: 'cascade',
  }),
  code: text('code').notNull().unique(),
  status: text('status').notNull().default('pending'),
  title: text('title').notNull(),
  description: text('description').notNull(),
  attachments: jsonb('attachments').notNull().default([]),
  note: text('note'),
  address: text('address').notNull(),
  latitude: decimal('latitude').notNull(),
  longitude: decimal('longitude').notNull(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const reportsTimelines = pgTable('reports_timelines', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUIDv7()),
  reportId: text('report_id')
    .references(() => reports.id, { onDelete: 'restrict', onUpdate: 'cascade' })
    .notNull(),
  userId: text('created_by').references(() => users.id, {
    onDelete: 'restrict',
    onUpdate: 'cascade',
  }),
  action: varchar('action').notNull(),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
});

export const reportsRelations = relations(reports, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [reports.assignedToId],
    references: [users.id],
  }),
  timeline: many(reportsTimelines),
}));

export const reportsTimelinesRelations = relations(reportsTimelines, ({ one }) => ({
  report: one(reports, {
    fields: [reportsTimelines.reportId],
    references: [reports.id],
  }),
  createdBy: one(users, {
    fields: [reportsTimelines.userId],
    references: [users.id],
  }),
}));

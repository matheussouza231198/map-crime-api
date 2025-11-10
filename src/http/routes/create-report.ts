import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { randomUUIDv7 } from 'bun';
import Elysia, { fileType } from 'elysia';
import { z } from 'zod/v4';

const MAX_UPLOAD_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const fileSchema = z
  .any()
  .refine((file) => file instanceof File, 'Invalid file upload.')
  .refine((file) => file.size <= MAX_UPLOAD_SIZE, 'File size should be less than 5MB.')
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    'Only .jpg, .jpeg, .png, webp, and pdf formats are allowed.',
  )
  .refine(async (file) => {
    const type = await fileType(file, ACCEPTED_IMAGE_TYPES);

    return !!type;
  }, 'Could not verify file type by magic number.');

const createReportBodySchema = z.object({
  title: z.string().nonempty(),
  description: z.string().nonempty(),
  address: z.string().nonempty(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  attachments: z
    .array(fileSchema)
    .or(fileSchema)
    .optional()
    .describe('File(s) to be attached to the report'),
});

async function uploadFile(file: File) {
  const ext = file.name.split('.').pop();
  const filename = `${randomUUIDv7()}.${ext}`;

  const { pathname } = Bun.pathToFileURL(`public/uploads/${filename}`);

  await Bun.write(pathname, file);

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    url: `http://localhost:3333/static/uploads/${filename}`,
  };
}

export const createReportRoute = new Elysia().post(
  '/reports',
  async ({ status, body }) => {
    const { title, description, address, latitude, longitude, attachments } = body;

    let uploadedFiles: Array<{
      name: string;
      size: number;
      type: string;
      url: string;
    }> = [];

    if (attachments) {
      const files = attachments instanceof File ? [attachments] : (attachments as File[]);

      uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const { name, size, type, url } = await uploadFile(file);

          return { name, size, type, url };
        }),
      );
    }

    const [report] = await db
      .insert(schema.reports)
      .values({
        title,
        description,
        address,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        status: 'pending',
        attachments: JSON.stringify(uploadedFiles),
      })
      .returning();

    await db.insert(schema.reportsTimelines).values({
      reportId: report.id,
      action: 'created',
      createdAt: new Date(),
    });

    return status(201, {
      code: report.code,
    });
  },
  {
    detail: {
      tags: ['reports'],
      description: 'Create a new report with the given details',
    },
    body: createReportBodySchema,
    response: {
      201: z.object({
        code: z.string().startsWith('RPT-'),
      }),
    },
  },
);

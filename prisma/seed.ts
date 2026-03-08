import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('HelloHello@123', 10);

  const parent = await prisma.user.upsert({
    where: { email: 'jignesh@gmail.com' },
    update: {},
    create: {
      fullName: 'Jignesh Bariya',
      email: 'jignesh@gmail.com',
      passwordHash,
      role: Role.PARENT,
    },
  });

  const mentor = await prisma.user.upsert({
    where: { email: 'ayansh@gmail.com' },
    update: {},
    create: {
      fullName: 'Ayansh Bariya',
      email: 'ayansh@gmail.com',
      passwordHash,
      role: Role.MENTOR,
    },
  });

  const student = await prisma.student.upsert({
    where: { email: 'himansh@gmail.com' },
    update: {},
    create: {
      fullName: 'Himansh Bariya',
      email: 'himansh@gmail.com',
      parentId: parent.id,
      notes: 'Needs additional support in algebra and revision practice.',
    },
  });

  const lesson = await prisma.lesson.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Algebra Foundations',
      description: 'Introductory algebra lesson for middle school students.',
      mentorId: mentor.id,
    },
  });

  await prisma.booking.upsert({
    where: {
      studentId_lessonId: {
        studentId: student.id,
        lessonId: lesson.id,
      },
    },
    update: {},
    create: {
      studentId: student.id,
      lessonId: lesson.id,
    },
  });

  await prisma.session.createMany({
    data: [
      {
        lessonId: lesson.id,
        date: new Date('2026-03-15T10:00:00.000Z'),
        topic: 'Linear expressions',
        summary: 'Covered variables, constants, and simple expressions.',
      },
      {
        lessonId: lesson.id,
        date: new Date('2026-03-22T10:00:00.000Z'),
        topic: 'Equation basics',
        summary: 'Introduced solving one-step equations.',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed completed successfully');
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

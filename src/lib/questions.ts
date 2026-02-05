import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Question {
  id: string;
  text: string;
  type: string;
  options: string[] | null;
  placeholder?: string;
  isDefault: boolean;
  order: number;
  gameId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    email: string;
    name: string | null;
  };
}

export const defaultQuestions = [
  {
    text: "Baby's Weight (in g)",
    type: 'NUMBER',
    placeholder: 'e.g., 3200',
    options: null,
  },
  {
    text: "Baby's Length (in cm)",
    type: 'NUMBER',
    placeholder: 'e.g., 50',
    options: null,
  },
  {
    text: 'Birth Date',
    type: 'DATE',
    placeholder: null,
    options: null,
  },
  {
    text: 'Sex of the Baby',
    type: 'SELECT',
    placeholder: null,
    options: ['Boy', 'Girl', 'Diverse'],
  },
  {
    text: 'How many diapers in the first week?',
    type: 'NUMBER',
    placeholder: 'e.g., 70',
    options: null,
  },
  {
    text: 'How many photos in the first 24h?',
    type: 'NUMBER',
    placeholder: 'e.g., 150',
    options: null,
  },
  {
    text: 'The Scrabble value of the first name?',
    type: 'NUMBER',
    placeholder: 'e.g., 25',
    options: null,
  },
  {
    text: 'How many names?',
    type: 'NUMBER',
    placeholder: 'e.g., 2',
    options: null,
  },
  {
    text: 'Hair color?',
    type: 'COLORPICKER',
    placeholder: null,
    options: null,
  },
  {
    text: 'Time of birth',
    type: 'TIME',
    placeholder: null,
    options: null,
  },
];

export async function initializeDefaultQuestions(
  gameId: string,
  createdBy: string
): Promise<Question[]> {
  const questionPromises = defaultQuestions.map((questionData, index) => {
    return prisma.question.create({
      data: {
        text: questionData.text,
        type: questionData.type,
        placeholder: questionData.placeholder,
        options: questionData.options || undefined,
        gameId,
        createdBy,
        order: index + 1,
        isDefault: true,
      },
      include: {
        creator: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  });

  return Promise.all(questionPromises) as Promise<Question[]>;
}

export async function getAllQuestionsForGame(gameId: string): Promise<Question[]> {
  return prisma.question.findMany({
    where: { gameId },
    orderBy: { order: 'asc' },
    include: {
      creator: {
        select: { id: true, email: true, name: true },
      },
    },
  }) as Promise<Question[]>;
}

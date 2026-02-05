interface ActualResults {
  [questionId: string]: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  placeholder?: string;
  options: string[] | null;
  isDefault: boolean;
  order: number;
}

interface Prediction {
  question: string;
  answer: string | null;
}

interface ParticipantScore {
  userId: string;
  userEmail: string;
  userName?: string;
  totalScore: number;
  questionScores: {
    question: string;
    predicted: string | null;
    actual: string;
    score: number;
    isNumerical: boolean;
  }[];
}

interface Question {
  id: string;
  text: string;
  type: string;
}

export function calculateParticipantScores(
  participants: Array<{
    userId: string;
    userEmail: string;
    userName?: string;
    predictions: Prediction[];
  }>,
  actualResults: ActualResults,
  publishedQuestions: Question[]
): ParticipantScore[] {
  // Step 1: Calculate raw difference scores for every participant and question
  const participantRawScores = participants.map((participant) => {
    const questionScores: ParticipantScore['questionScores'] = [];

    publishedQuestions.forEach((question) => {
      const prediction = participant.predictions.find((p) => p.question === question.text);
      const actualValue = actualResults[question.id];

      if (actualValue !== undefined) {
        const score = calculateQuestionScore(question, prediction?.answer || null, actualValue);
        questionScores.push({
          question: question.text,
          predicted: prediction?.answer || null,
          actual: actualValue,
          score: score.value, // Raw difference
          isNumerical: score.isNumerical,
        });
      }
    });

    return {
      userId: participant.userId,
      userEmail: participant.userEmail,
      userName: participant.userName,
      totalScore: 0, // Will be replaced by normalized score
      questionScores,
    };
  });

  // Step 2: Find the maximum raw score for each question across all participants
  const maxScoresByQuestion: { [key: string]: number } = {};
  publishedQuestions.forEach((question) => {
    const scoresForQuestion = participantRawScores
      .map((p) => p.questionScores.find((qs) => qs.question === question.text)?.score ?? 0)
      .filter((score) => score !== undefined);

    maxScoresByQuestion[question.text] = Math.max(...scoresForQuestion, 0);
  });

  // Step 3: Calculate normalized scores and the new total score
  const finalScores = participantRawScores.map((participant) => {
    let newTotalScore = 0;

    const normalizedQuestionScores = participant.questionScores.map((qs) => {
      const maxScore = maxScoresByQuestion[qs.question];
      let normalizedScore = 0;

      if (qs.isNumerical) {
        if (qs.predicted === null) {
          // User didn't answer, gets the worst score of 1
          normalizedScore = 1;
        } else if (maxScore > 0) {
          normalizedScore = qs.score / maxScore;
        }
        // If maxScore is 0, it means everyone was perfect, so score is 0.
      }

      newTotalScore += normalizedScore;

      // We can return the normalized score in the `score` field
      return { ...qs, score: normalizedScore };
    });

    return {
      ...participant,
      totalScore: newTotalScore,
      questionScores: normalizedQuestionScores,
    };
  });

  return finalScores;
}

// Helper function to get the actual value for a specific question
// Currently unused but kept for future reference
/*
function getActualValueForQuestion(question: string, actualResults: ActualResults): string | null {
  if (question.includes('Weight') && actualResults.weight) return actualResults.weight;
  if (question.includes('Length') && actualResults.length) return actualResults.length;
  if (question.includes('Birth Date') && actualResults.birthDate) return actualResults.birthDate;
  if (question.includes('Sex of the Baby') && actualResults.sex) return actualResults.sex;
  if (question.includes('diapers') && actualResults.diapers) return actualResults.diapers;
  if (question.includes('photos') && actualResults.photos) return actualResults.photos;
  if (question.includes('Scrabble') && actualResults.scrabbleValue) return actualResults.scrabbleValue;
  if (question.includes('How many names') && actualResults.nameCount) return actualResults.nameCount;
  if (question.includes('Hair color') && actualResults.hairColor) return actualResults.hairColor;
  if (question.includes('Time of birth') && actualResults.timeOfBirth) return actualResults.timeOfBirth;
  
  return null;
}
*/

function calculateQuestionScore(
  question: Question,
  predicted: string | null,
  actual: string
): { value: number; isNumerical: boolean } {
  // For non-scoreable questions, return 0
  if (!predicted) {
    return { value: 0, isNumerical: false };
  }

  switch (question.type) {
    case 'NUMBER':
      const predictedNum = parseFloat(predicted.replace(',', '.'));
      const actualNum = parseFloat(actual.replace(',', '.'));

      if (isNaN(predictedNum) || isNaN(actualNum)) {
        return { value: 0, isNumerical: false };
      }

      // Calculate absolute difference
      const difference = Math.abs(actualNum - predictedNum);
      return { value: difference, isNumerical: true };

    case 'DATE':
      try {
        const predictedDate = new Date(predicted);
        const actualDate = new Date(actual);

        // Add timezone offset to treat dates as UTC and avoid off-by-one day errors
        predictedDate.setMinutes(predictedDate.getMinutes() + predictedDate.getTimezoneOffset());
        actualDate.setMinutes(actualDate.getMinutes() + actualDate.getTimezoneOffset());

        if (isNaN(predictedDate.getTime()) || isNaN(actualDate.getTime())) {
          return { value: 0, isNumerical: false };
        }

        const differenceInMs = Math.abs(actualDate.getTime() - predictedDate.getTime());
        const differenceInDays = Math.round(differenceInMs / (1000 * 60 * 60 * 24));

        return { value: differenceInDays, isNumerical: true };
      } catch {
        return { value: 0, isNumerical: false };
      }

    case 'TIME':
      try {
        const [predictedHours, predictedMinutes] = predicted.split(':').map(Number);
        const [actualHours, actualMinutes] = actual.split(':').map(Number);

        if (
          isNaN(predictedHours) ||
          isNaN(predictedMinutes) ||
          isNaN(actualHours) ||
          isNaN(actualMinutes)
        ) {
          return { value: 0, isNumerical: false };
        }

        const predictedTotalMinutes = predictedHours * 60 + predictedMinutes;
        const actualTotalMinutes = actualHours * 60 + actualMinutes;

        const difference = Math.abs(actualTotalMinutes - predictedTotalMinutes);
        return { value: difference, isNumerical: true };
      } catch {
        return { value: 0, isNumerical: false };
      }

    case 'SELECT':
      // Exact match scoring for SELECT questions
      return {
        value: predicted.toLowerCase() === actual.toLowerCase() ? 0 : 1,
        isNumerical: false,
      };

    case 'COLORPICKER':
      // Color matching - calculate color distance using RGB values
      try {
        const predictedColor = hexToRgb(predicted);
        const actualColor = hexToRgb(actual);

        if (!predictedColor || !actualColor) {
          return { value: 0, isNumerical: false };
        }

        // Calculate Euclidean distance in RGB space
        const rDiff = predictedColor.r - actualColor.r;
        const gDiff = predictedColor.g - actualColor.g;
        const bDiff = predictedColor.b - actualColor.b;

        const colorDistance = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);

        return { value: colorDistance, isNumerical: true };
      } catch {
        return { value: 0, isNumerical: false };
      }

    default:
      return { value: 0, isNumerical: false };
  }
}

/*
function isNumericalQuestion(questionType: string): boolean {
  return ['NUMBER', 'DATE', 'TIME', 'COLORPICKER'].includes(questionType);
}
*/

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace('#', '');

  // Handle 3-digit hex colors (e.g., #RGB -> #RRGGBB)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  // Validate hex format
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return null;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

export function getLeaderboard(participantScores: ParticipantScore[]): ParticipantScore[] {
  // Sort by total score (ascending - lower is better)
  // Filter out participants with 0 total score (no numerical predictions)
  return participantScores
    .filter((p) => p.totalScore > 0 || p.questionScores.some((q) => q.isNumerical))
    .sort((a, b) => a.totalScore - b.totalScore);
}

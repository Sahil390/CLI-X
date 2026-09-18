import inquirer from 'inquirer';

export async function prompt(questions: inquirer.QuestionCollection): Promise<Record<string, unknown>> {
  return inquirer.prompt(questions);
}

export async function select(
  message: string,
  choices: string[] | readonly (string | { name: string; value: string })[]
): Promise<string> {
  const answer = await prompt([
    {
      type: 'list',
      name: 'value',
      message,
      choices: choices.map((c) => (typeof c === 'string' ? { name: c, value: c } : c)),
    },
  ]);
  return answer.value as string;
}

export async function input(message: string, defaultAnswer?: string): Promise<string> {
  const answer = await prompt([
    {
      type: 'input',
      name: 'value',
      message,
      default: defaultAnswer,
    },
  ]);
  return answer.value as string;
}

export async function confirm(message: string): Promise<boolean> {
  const answer = await prompt([
    {
      type: 'confirm',
      name: 'value',
      message,
      default: true,
    },
  ]);
  return answer.value as boolean;
}

export async function password(message: string): Promise<string> {
  const answer = await prompt([
    {
      type: 'password',
      name: 'value',
      message,
    },
  ]);
  return answer.value as string;
}

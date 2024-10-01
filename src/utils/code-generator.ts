import { Model, Document } from 'mongoose';

interface MyDocument extends Document {
  code: string;
}

export const generateCode = async <T extends MyDocument>(model: Model<T>, codeField: string): Promise<string> => {
  const codeGenerator = await model.findOne().sort({ code: -1 });

  if (!codeGenerator) {
    return `${codeField}001`;
  }

  if (codeGenerator.code) {
    const lastCode = codeGenerator.code;
    const numericPart = parseInt(lastCode.substring(1));
    const newCode = (numericPart + 1).toString().padStart(3, '0');
    return `${codeField}${newCode}`;
  } else {
    throw new Error('Last does not have a code property');
  }
};

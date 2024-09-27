import { MemberModel } from '../model/member-model';

export const generateMemberCode = async (): Promise<string> => {
  const lastMember = await MemberModel.findOne().sort({ code: -1 });
  if (!lastMember) {
    return 'M001';
  }

  const lastCode = lastMember.code;
  const numericPart = parseInt(lastCode.substring(1));
  const newCode = (numericPart + 1).toString().padStart(3, '0');
  return `M${newCode}`;
};

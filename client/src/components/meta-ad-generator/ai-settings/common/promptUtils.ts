export const extractOutputStructure = (prompt: string) => {
  const outputRequirementMatch = prompt.match(/(CRITICAL OUTPUT REQUIREMENT:[\s\S]*?Your response must follow this exact[^:]*structure:[^}]*})/i);
  if (outputRequirementMatch) return outputRequirementMatch[1];
  const arrayStructureMatch = prompt.match(/(CRITICAL OUTPUT REQUIREMENT:[\s\S]*?Your response must follow this exact[^:]*structure:[^}]*\])/i);
  if (arrayStructureMatch) return arrayStructureMatch[1];
  const textStructureMatch = prompt.match(/(CRITICAL OUTPUT REQUIREMENT:[\s\S]*?You MUST return your response as[^.]*\.)/i);
  if (textStructureMatch) return textStructureMatch[1];
  return null;
};

export const getEditablePrompt = (prompt: string) => {
  const structure = extractOutputStructure(prompt);
  return structure ? prompt.replace(structure, '').trim() : prompt;
};

export const reconstructPrompt = (editableContent: string, originalPrompt: string) => {
  const structure = extractOutputStructure(originalPrompt);
  if (!structure) return editableContent;

  const lines = (editableContent || '').split('\n');
  const firstBlankIdx = lines.findIndex((line) => line.trim() === '');

  // If no blank line exists, append the structure at the end to avoid shuffling content
  if (firstBlankIdx === -1) {
    return `${editableContent.trim()}\n\n${structure}`.trim();
  }

  const beforeStructure = lines.slice(0, firstBlankIdx).join('\n');
  const afterStructure = lines.slice(firstBlankIdx).join('\n');

  return `${beforeStructure.trim()}\n\n${structure}\n\n${afterStructure.trim()}`.trim();
};


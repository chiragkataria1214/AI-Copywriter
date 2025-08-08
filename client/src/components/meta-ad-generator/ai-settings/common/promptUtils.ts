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
  if (structure) {
    const lines = editableContent.split('\n');
    const insertIndex = lines.findIndex(line => line.trim() === '') || 1;
    const beforeStructure = lines.slice(0, insertIndex).join('\n');
    const afterStructure = lines.slice(insertIndex).join('\n');
    return `${beforeStructure}\n\n${structure}\n\n${afterStructure}`.trim();
  }
  return editableContent;
};


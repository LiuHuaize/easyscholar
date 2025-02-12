export function generateAPA(paper: any) {
  if (!paper) return '';
  
  const authors = paper.authors?.map((author: any) => author.name) || [];
  const authorStr = authors.length > 0 
    ? authors.length > 1 
      ? `${authors[0].split(' ').pop()} et al.` 
      : authors[0].split(' ').pop()
    : 'Anonymous';
  
  const year = paper.year || new Date().getFullYear();
  const title = paper.title || '';
  const venue = paper.venue || '';
  
  return `${authorStr} (${year}). ${title}${venue ? `. ${venue}` : ''}.`;
} 
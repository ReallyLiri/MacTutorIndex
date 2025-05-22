import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function nameToId(name: string): string {
  const parts = name.split(' ');
  if (parts.length === 1) return name;
  
  const lastName = parts[parts.length - 1];
  const restOfName = parts.slice(0, parts.length - 1).join('_');
  
  return `${lastName}_${restOfName}`;
}

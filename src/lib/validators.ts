import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['text/csv', 'application/vnd.ms-excel'];

export const correlationFormSchema = z.object({
  csvFile: z
    .custom<FileList>((val) => val instanceof FileList, 'Arquivo CSV requerido')
    .refine((files) => files && files.length === 1, 'Arquivo CSV requerido.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `O arquivo excedeu o limite de 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only .csv files are accepted.'
    ),
  xColumn: z.string().min(1, 'Informe o nome da coluna do Eixo X'),
  yColumn: z.string().min(1, 'Informe o nome da coluna do Eixo Y'),
  xLabel: z.string().min(1, 'Informe o título do eixo X'),
  yLabel: z.string().min(1, 'Informe o título do eixo Y'),
  imageWidth: z.coerce.number().int().min(100, 'Larguna mínima 100px.').max(2000, 'Largura máxima 2000px.'),
  imageHeight: z.coerce.number().int().min(100, 'Altura mínima 100px.').max(2000, 'Altura máxima 2000px.'),
  filterCondition: z.string().optional(),
});

export type CorrelationFormValues = z.infer<typeof correlationFormSchema>;

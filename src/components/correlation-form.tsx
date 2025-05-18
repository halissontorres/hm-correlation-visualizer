
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { Loader2, AlertCircle, BarChartBig } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { correlationFormSchema, type CorrelationFormValues } from '@/lib/validators';
import { useToast } from '@/hooks/use-toast';


const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://127.0.0.1:5000';

export default function CorrelationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [renderedImageSize, setRenderedImageSize] = useState<{width: number, height: number} | null>(null);
  const { toast } = useToast();

  const form = useForm<CorrelationFormValues>({
    resolver: zodResolver(correlationFormSchema),
    defaultValues: {
      xColumn: '',
      yColumn: '',
      xLabel: '',
      yLabel: '',
      imageWidth: 1000,
      imageHeight: 600,
      filterCondition: '',
    },
  });

  const onSubmit = async (data: CorrelationFormValues) => {
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setRenderedImageSize(null);

    const formData = new FormData();
    if (data.csvFile && data.csvFile.length > 0) {
      formData.append('file', data.csvFile[0]);
    } else {
      setError('CSV não localizado');
      setIsLoading(false);
      toast({
        title: "Erro",
        description: "Arquivo CSV não localizado. Por favor, submeta um arquivo.",
        variant: "destructive",
      });
      return;
    }
    
    formData.append('x_column', data.xColumn);
    formData.append('y_column', data.yColumn);
    formData.append('x_label', data.xLabel);
    formData.append('y_label', data.yLabel);
    formData.append('image_width', String(data.imageWidth));
    formData.append('image_height', String(data.imageHeight));
    if (data.filterCondition && data.filterCondition.trim() !== '') {
      formData.append('filter_condition', data.filterCondition);
    }

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorDetail = `Erro HTTP | status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorDetail;
        } catch (e) {
          const textError = await response.text();
          errorDetail = textError || errorDetail;
        }
        throw new Error(errorDetail);
      }

      const imageBlob = await response.blob();
      if (imageBlob.type.startsWith('image/')) {
        setImageUrl(URL.createObjectURL(imageBlob));
        setRenderedImageSize({ width: data.imageWidth, height: data.imageHeight });
        toast({
            title: "Successo!",
            description: "Gráfico renderizado",
        });
      } else {
        const errorText = await imageBlob.text();
        let parsedError = "API não proveu uma imagem válida.";
        try {
            const jsonError = JSON.parse(errorText);
            if (jsonError && jsonError.detail) {
                parsedError = jsonError.detail;
            }
        } catch (e) {
            // Not a JSON error
            if(errorText.length > 0 && errorText.length < 200) parsedError = errorText;
        }
        throw new Error(parsedError);
      }
    } catch (e: any) {
      const errorMessage = e.message || 'Erro inesperado ao processar a solicitação.';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Parâmetros da análise</CardTitle>
            <CardDescription>Informe o arquivo CSV e os parâmetros do gráfico</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            <fieldset className="space-y-6 border p-4 rounded-md">
              <legend className="text-lg font-medium text-primary px-1 -ml-1">Dados do CSV</legend>
              <FormField
                control={form.control}
                name="csvFile"
                render={({ field }) => ( 
                  <FormItem>
                    <FormLabel>Arquivo CSV</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".csv,application/vnd.ms-excel"
                        onChange={(e) => field.onChange(e.target.files)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className="file:text-primary file:font-semibold hover:file:bg-primary/10 focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormDescription>
                      Upload do arquivo CSV para análise. Max 5MB.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="xColumn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da coluna do Eixo X</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., atltura" {...field} className="focus-visible:ring-primary"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yColumn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da coluna do Eixo Y</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., pe" {...field} className="focus-visible:ring-primary"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="filterCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faixa de restrição (coluna do Eixo X)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., altura < 1.20" {...field} className="focus-visible:ring-primary"/>
                    </FormControl>
                     <FormDescription>
                      Exemplo: &quot;peso &gt; 100&quot; ou &quot;categoria == &apos;A&apos;&quot;. Opcional.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>
            
            <fieldset className="space-y-6 border p-4 rounded-md">
              <legend className="text-lg font-medium text-primary px-1 -ml-1">Configurações do gráfico</legend>
              <FormField
                control={form.control}
                name="xLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Eixo X</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Altura (m)" {...field} className="focus-visible:ring-primary"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Eixo Y</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Tamanho do pé (m)" {...field} className="focus-visible:ring-primary"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="imageWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largura da imagem (px)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1000" {...field} onChange={(e) => field.onChange(parseInt(e.target.value,10) || 0)} className="focus-visible:ring-primary"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altura da imagem(px)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 600" {...field} onChange={(e) => field.onChange(parseInt(e.target.value,10) || 0)} className="focus-visible:ring-primary"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full min-w-[100px] transition-all duration-300 ease-in-out hover:shadow-md">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Por favor, aguarde...' : 'Enviar'}
            </Button>
          </CardFooter>
        </Card>

        {isLoading && (
          <div className="flex flex-col justify-center items-center p-8 border rounded-lg shadow-sm bg-card mt-8 h-96 transition-opacity duration-300 ease-in-out">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-xl text-foreground/80">Por favor, aguarde</p>
            <p className="text-muted-foreground">Isto pode demorar um pouco.</p>
          </div>
        )}

        {error && !isLoading && (
          <Alert variant="destructive" className="mt-8 transition-opacity duration-300 ease-in-out">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ocorreu uma falha</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {imageUrl && !isLoading && renderedImageSize && (
          <Card className="mt-8 shadow-lg transition-all duration-500 ease-in-out transform hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="text-2xl">Resultado</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-4 bg-muted/30 rounded-b-lg">
              <Image 
                src={imageUrl} 
                alt="Generated Correlation Plot" 
                width={renderedImageSize.width} 
                height={renderedImageSize.height}
                className="rounded-md border-2 border-primary/20 shadow-xl object-contain max-w-full h-auto"
                data-ai-hint="data chart"
              />
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && !imageUrl && (
           <Card className="mt-8 border-dashed border-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-muted-foreground">Gráfico</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center text-center h-96 min-h-[300px] text-muted-foreground p-8">
                <BarChartBig data-ai-hint="chart graph" className="w-24 h-24 stroke-1 text-muted-foreground/50 mb-6" />
                <p className="text-xl mb-2">O gráfico resultante aparecerá aqui.</p>
                <p className="text-sm ">Preencha os campos e clique em &quot;Enviar&quot;</p>
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}


    
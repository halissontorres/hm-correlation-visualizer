
import CorrelationForm from '@/components/correlation-form';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { Toaster } from "@/components/ui/toaster";

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12 min-h-screen flex flex-col items-center">
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
        <ThemeToggleButton />
      </div>
      <div className="w-full max-w-5xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-3 tracking-tight">
            HM Correlation Visualizer
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
          Correlação em amostras restritas | fórmula de Hindemburg Melão Jr.
          </p>
        </header>
        <CorrelationForm />
      </div>
      <Toaster />
    </main>
  );
}

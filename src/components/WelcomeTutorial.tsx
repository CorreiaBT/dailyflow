"use client";

import { useEffect, useState } from "react";

const ONBOARD_KEY = "dailyflow_onboarded";
export const SHOW_TUTORIAL_EVENT = "dailyflow:show-tutorial";

const STEPS = [
  {
    title: "Configure Renda & Fixos",
    body: 'Toque em "Fixos & Renda" para informar sua renda mensal e suas contas fixas.',
  },
  {
    title: "Defina sua Meta",
    body: 'Na aba "Projeção", toque em "Configurar" para criar seu objetivo de economia.',
  },
  {
    title: "Registre Gastos Diários",
    body: "Na tela inicial, toque num atalho de categoria para lançar um gasto em segundos.",
  },
  {
    title: "Acompanhe Insights",
    body: "A aba Projeção mostra sua curva de acúmulo e dicas automáticas com base no seu ritmo de gastos.",
  },
];

export function WelcomeTutorial() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Roda só no cliente: evita mismatch de hidratação, já que o valor
    // depende do localStorage do navegador.
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!localStorage.getItem(ONBOARD_KEY)) {
      timer = setTimeout(() => setOpen(true), 450);
    }

    const reopen = () => setOpen(true);
    window.addEventListener(SHOW_TUTORIAL_EVENT, reopen);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener(SHOW_TUTORIAL_EVENT, reopen);
    };
  }, []);

  function close() {
    setOpen(false);
    localStorage.setItem(ONBOARD_KEY, "1");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
      <div className="animate-sheet-in w-full max-w-md rounded-t-3xl bg-surface p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:rounded-3xl">
        <div className="mb-5 text-center">
          <h2 className="text-lg font-bold text-white">Bem-vindo ao DailyFlow!</h2>
          <p className="mt-1 text-xs text-gray-400">
            Seu app começa zerado. Veja como configurar tudo em 4 passos rápidos:
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3.5">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="animate-fade-up flex items-start gap-3"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p className="text-xs leading-relaxed text-gray-400">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={close}
          className="w-full rounded-2xl bg-primary py-3.5 font-semibold text-black transition-transform hover:brightness-110 active:scale-[0.98]"
        >
          Entendi, vamos começar!
        </button>
      </div>
    </div>
  );
}

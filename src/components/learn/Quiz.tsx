import { useState } from 'react'
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QUIZ } from '@/content/quiz'
import { cn } from '@/lib/utils'

export function Quiz() {
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = QUIZ[index]
  const answered = chosen !== null

  const restart = () => {
    setIndex(0)
    setChosen(null)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <div className="space-y-3 rounded-xl border bg-card p-5" data-testid="quiz-result">
        <h3 className="text-lg font-bold">Resultado</h3>
        <p className="text-sm">
          Você acertou <strong>{score}</strong> de <strong>{QUIZ.length}</strong>{' '}
          perguntas.{' '}
          {score === QUIZ.length
            ? 'Excelente! Que tal provocar um deadlock e explicá-lo com suas palavras?'
            : 'Revise o glossário e repita o experimento com o modo passo a passo; depois tente novamente.'}
        </p>
        <Button onClick={restart}>
          <RotateCcw aria-hidden="true" />
          Refazer quiz
        </Button>
      </div>
    )
  }

  const select = (i: number) => {
    if (answered) return
    setChosen(i)
    if (i === question.correct) setScore((s) => s + 1)
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Pergunta {index + 1} de {QUIZ.length}
        </span>
        <span>Acertos: {score}</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Progresso do quiz"
        aria-valuemin={0}
        aria-valuemax={QUIZ.length}
        aria-valuenow={index + (answered ? 1 : 0)}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${((index + (answered ? 1 : 0)) / QUIZ.length) * 100}%` }}
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-base font-bold">{question.prompt}</legend>
        {question.options.map((o, i) => {
          const isCorrect = i === question.correct
          const isChosen = i === chosen
          return (
            <div key={o.text}>
              <button
                type="button"
                onClick={() => select(i)}
                disabled={answered}
                aria-pressed={isChosen}
                className={cn(
                  'flex w-full items-start gap-2 rounded-xl border-2 bg-card p-3 text-left text-sm transition-colors enabled:hover:border-primary',
                  answered && isCorrect && 'border-eating bg-eating-soft',
                  answered && isChosen && !isCorrect && 'border-blocked bg-blocked-soft',
                  answered && !isChosen && !isCorrect && 'opacity-70',
                )}
              >
                {answered && isCorrect && (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-eating" aria-label="Resposta correta" />
                )}
                {answered && isChosen && !isCorrect && (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-blocked" aria-label="Resposta incorreta" />
                )}
                <span>{o.text}</span>
              </button>
              {answered && (isChosen || isCorrect) && (
                <p
                  className="mt-1 rounded-lg bg-muted px-3 py-2 text-sm"
                  data-testid="quiz-feedback"
                >
                  <strong>
                    {isCorrect
                      ? isChosen
                        ? 'Correto. '
                        : 'Resposta certa: '
                      : 'Não é bem assim. '}
                  </strong>
                  {o.explanation}
                </p>
              )}
            </div>
          )
        })}
      </fieldset>

      {answered && (
        <Button
          onClick={() => {
            if (index + 1 >= QUIZ.length) setFinished(true)
            else {
              setIndex(index + 1)
              setChosen(null)
            }
          }}
        >
          {index + 1 >= QUIZ.length ? 'Ver resultado' : 'Próxima pergunta'}
        </Button>
      )}
    </div>
  )
}

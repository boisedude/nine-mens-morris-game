/**
 * Tutorial Component
 * A short walkthrough of Nine Men's Morris, opened from "How to play"
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'

interface TutorialProps {
  open: boolean
  opponentName: string
  onClose: () => void
}

interface TutorialStep {
  title: string
  description: string
  tip?: string
}

function getSteps(opponent: string): TutorialStep[] {
  return [
    {
      title: 'The goal',
      description: `Nine Men's Morris is played on 24 points. You are white and ${opponent} is black. Each side has nine pieces. Win by reducing ${opponent} to two pieces, or by leaving them with no legal move.`,
    },
    {
      title: 'Placing pieces',
      description:
        'The game starts with a placement phase. Take turns putting one piece at a time on any empty point until all nine of each colour are down.',
      tip: 'Pieces still in hand show under your count above the board.',
    },
    {
      title: 'Forming a mill',
      description:
        'Three of your pieces in a straight line along a side of a square, or across the middle of a side, make a mill. Each time you form one you remove an opposing piece.',
      tip: 'Pieces already in a mill are safe unless every opposing piece is in a mill.',
    },
    {
      title: 'Moving pieces',
      description:
        'Once all pieces are placed, select one of yours and move it along a line to an adjacent empty point. Marked points show where it can go.',
    },
    {
      title: 'Flying',
      description: `When you are down to three pieces you may move any piece to any empty point. ${opponent} gets the same power at three pieces.`,
      tip: 'Click "How to play" any time to see this again.',
    },
  ]
}

export function Tutorial({ open, opponentName, onClose }: TutorialProps) {
  const steps = getSteps(opponentName)
  const [currentStep, setCurrentStep] = useState(0)
  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{step.title}</DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {steps.length}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-muted-foreground">{step.description}</p>
          {step.tip && (
            <p className="rounded-md border bg-secondary p-3 text-sm text-muted-foreground">{step.tip}</p>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:space-x-0">
          <Button variant="ghost" onClick={onClose} className="h-11 sm:w-auto">
            Skip
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={() => setCurrentStep((n) => n - 1)} className="h-11">
                Back
              </Button>
            )}
            <Button onClick={isLastStep ? onClose : () => setCurrentStep((n) => n + 1)} className="h-11">
              {isLastStep ? 'Play' : 'Next'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

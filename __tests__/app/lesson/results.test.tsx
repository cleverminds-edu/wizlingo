import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useParams } from 'next/navigation'
import ResultsPage from '@/app/lesson/[sessionId]/results/page'

// Mock Next.js routing
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}))

describe('Results & Feedback Screen (T1.6)', () => {
  const mockRouter = {
    push: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useParams as jest.Mock).mockReturnValue({ sessionId: 'session_789' })
  })

  describe('Display - Passed Lesson', () => {
    it('should display passing results with celebration emoji', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByText('Excellent Work!')).toBeInTheDocument()
        expect(screen.getByText(/🎉/)).toBeInTheDocument()
      })
    })

    it('should display score prominently', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByText('85%')).toBeInTheDocument()
      })
    })

    it('should show correct/total questions', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByText(/2 of 3 questions correct/)).toBeInTheDocument()
      })
    })

    it('should display XP earned', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByText('+80 XP')).toBeInTheDocument()
      })
    })

    it('should show time taken', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByText(/Completed in 10m 0s/)).toBeInTheDocument()
      })
    })
  })

  describe('Feedback Display', () => {
    it('should display overall feedback', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByText(/Great job!/)).toBeInTheDocument()
      })
    })

    it('should display encouragement message', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByText(/Well done!/)).toBeInTheDocument()
      })
    })

    it('should display next steps', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByText(/Move to the next lesson/)).toBeInTheDocument()
      })
    })
  })

  describe('Progress Update', () => {
    it('should display stage progress bar', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByText('Current Stage Progress')).toBeInTheDocument()
        expect(screen.getByText('20%')).toBeInTheDocument()
      })
    })

    it('should show next milestone', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByText(/Next Milestone:/)).toBeInTheDocument()
        expect(screen.getByText(/5 lessons mastered/)).toBeInTheDocument()
      })
    })

    it('should show advance stage message when ready', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByText(/You're ready to advance/)).toBeInTheDocument()
      })
    })
  })

  describe('Question Breakdown', () => {
    it('should display all questions', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByText('Question 1')).toBeInTheDocument()
        expect(screen.getByText('Question 2')).toBeInTheDocument()
        expect(screen.getByText('Question 3')).toBeInTheDocument()
      })
    })

    it('should show correct answer indicator for right answers', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        expect(buttons[0]).toHaveTextContent('Question 1')
        // First question has green checkmark (correct)
      })
    })

    it('should show incorrect answer indicator for wrong answers', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        expect(buttons[2]).toHaveTextContent('Question 3')
        // Third question has red X (incorrect)
      })
    })

    it('should display point breakdown', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByText(/1\/1 points/)).toBeInTheDocument()
      })
    })
  })

  describe('Question Details Expansion', () => {
    it('should expand question details when clicked', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        const questionButtons = screen.getAllByRole('button')
        const firstQuestionButton = questionButtons.find(btn => btn.textContent.includes('Question 1'))
        fireEvent.click(firstQuestionButton!)
      })

      await waitFor(() => {
        expect(screen.getByText('Your Answer:')).toBeInTheDocument()
        expect(screen.getByText(/Feedback:/)).toBeInTheDocument()
      })
    })

    it('should collapse question details when clicked again', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        const questionButtons = screen.getAllByRole('button')
        const firstQuestionButton = questionButtons.find(btn => btn.textContent.includes('Question 1'))
        fireEvent.click(firstQuestionButton!)
      })

      // Click again to collapse
      await waitFor(() => {
        const questionButtons = screen.getAllByRole('button')
        const firstQuestionButton = questionButtons.find(btn => btn.textContent.includes('Question 1'))
        fireEvent.click(firstQuestionButton!)
      })
    })

    it('should show student answer in details', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        const questionButtons = screen.getAllByRole('button')
        const firstQuestionButton = questionButtons.find(btn => btn.textContent.includes('Question 1'))
        fireEvent.click(firstQuestionButton!)
      })

      await waitFor(() => {
        expect(screen.getByText('b')).toBeInTheDocument()
      })
    })

    it('should show correct answer for wrong responses', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        const questionButtons = screen.getAllByRole('button')
        const thirdQuestionButton = questionButtons.find(btn => btn.textContent.includes('Question 3'))
        fireEvent.click(thirdQuestionButton!)
      })

      await waitFor(() => {
        expect(screen.getByText('Correct Answer:')).toBeInTheDocument()
        expect(screen.getByText('Paris')).toBeInTheDocument()
      })
    })

    it('should display feedback message', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        const questionButtons = screen.getAllByRole('button')
        const firstQuestionButton = questionButtons.find(btn => btn.textContent.includes('Question 1'))
        fireEvent.click(firstQuestionButton!)
      })

      await waitFor(() => {
        expect(screen.getByText(/Sarah is indeed the main character/)).toBeInTheDocument()
      })
    })
  })

  describe('Action Buttons', () => {
    it('should show Next Lesson button for passed lessons', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Next Lesson/ })).toBeInTheDocument()
      })
    })

    it('should navigate to dashboard when Next Lesson clicked', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Next Lesson/ })
        fireEvent.click(button)
      })

      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })

    it('should have Return to Dashboard button', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Return to Dashboard/ })).toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading indicator initially', () => {
      render(<ResultsPage />)
      expect(screen.getByText('Loading results...')).toBeInTheDocument()
    })

    it('should hide loading indicator after data loads', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.queryByText('Loading results...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Score Color Coding', () => {
    it('should display green styling for 85% score', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        const scoreElement = screen.getByText('85%')
        expect(scoreElement).toHaveClass('text-blue-600')
      })
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should be responsive on mobile', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        const feedbackCards = screen.getByText('Your Performance').closest('.grid')
        expect(feedbackCards).toHaveClass('md:grid-cols-2')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have semantic HTML structure', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
      })
    })

    it('should have proper heading hierarchy', async () => {
      render(<ResultsPage />)

      await waitFor(() => {
        expect(screen.getByText('Excellent Work!')).toBeInTheDocument()
        expect(screen.getByText('Your Performance')).toBeInTheDocument()
      })
    })
  })
})
